/**
 * Experimental local image-analysis aid. NOT a trained neural network.
 * Operator supplies at least two LARGE reference ribs. Suggests only NORMAL
 * candidate ribs between them; does not assert code, producer or compliance.
 * Pure functions keep DOM, storage and deployment out of the detector.
 */

const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));

function luminanceAt(image,x,y){
  const {width:w,height:h,data}=image;
  const ix=clamp(Math.round(x),0,w-1), iy=clamp(Math.round(y),0,h-1);
  const at=4*(iy*w+ix);
  return (0.2126*data[at]+0.7152*data[at+1]+0.0722*data[at+2])/255;
}

function smooth(values,radius){
  const out=new Float64Array(values.length),prefix=new Float64Array(values.length+1);
  for(let i=0;i<values.length;i++)prefix[i+1]=prefix[i]+values[i];
  for(let i=0;i<values.length;i++){
    const a=Math.max(0,i-radius),b=Math.min(values.length,i+radius+1);
    out[i]=(prefix[b]-prefix[a])/(b-a);
  }
  return out;
}

function median(values){
  if(!values.length)return 0;
  const sorted=[...values].sort((a,b)=>a-b);
  const n=sorted.length;
  return n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
}

function peakCandidates(residual,minDistance,threshold,margin){
  const groups=[];let active=null;
  for(let i=margin;i<residual.length-margin;i++){
    if(residual[i]>=threshold){
      if(!active || i>active.last+1){
        active={index:i,strength:residual[i],last:i};groups.push(active);
      }else{
        active.last=i;
        if(residual[i]>active.strength){active.index=i;active.strength=residual[i];}
      }
    }else active=null;
  }
  const byStrength=[...groups].sort((a,b)=>b.strength-a.strength);
  const kept=[];
  for(const p of byStrength){
    if(kept.every(other=>Math.abs(p.index-other.index)>=minDistance))kept.push(p);
  }
  kept.sort((a,b)=>a.index-b.index);
  return kept;
}

function regularityScore(points,span){
  if(points.length<2)return 0;
  const positions=[0,...points.map(x=>x.index),span];
  const gaps=positions.slice(1).map((x,i)=>x-positions[i]);
  const m=median(gaps);
  if(!m)return 0;
  const spread=median(gaps.map(g=>Math.abs(g-m)))/m;
  return clamp(1-spread,0,1);
}

export function findNormalRibsBetween(image,start,end,{polarity='auto',maxCandidates=32}={}){
  if(!image || !Number.isInteger(image.width)||!Number.isInteger(image.height)
    ||image.width<16 ||image.height<16 || !image.data || image.data.length<image.width*image.height*4){
    throw new Error('Immagine non valida.');
  }
  if (![start?.x,start?.y,end?.x,end?.y].every(Number.isFinite))throw new Error('Riferimenti non validi.');
  const width=image.width,height=image.height;
  const x0=start.x*width,y0=start.y*height,x1=end.x*width,y1=end.y*height;
  const dx=x1-x0,dy=y1-y0,length=Math.hypot(dx,dy);
  if(length<45)return {points:[],confidence:0,reason:'Riferimenti troppo vicini'};
  const count=Math.floor(length);
  if(count>4000)return {points:[],confidence:0,reason:'Tratto troppo lungo'};
  const ux=dx/length,uy=dy/length,px=-uy,py=ux;
  // A narrow perpendicular strip minimizes sensitivity to dirt on single pixels.
  const halfWidth=clamp(Math.round(Math.min(width,height)*.012),2,6);
  const profile=new Float64Array(count+1);
  for(let i=0;i<=count;i++){
    const x=x0+ux*i,y=y0+uy*i;
    let sum=0,n=0;
    for(let offset=-halfWidth;offset<=halfWidth;offset+=2){
      const sx=x+px*offset,sy=y+py*offset;
      if(sx>=0&&sy>=0&&sx<width&&sy<height){sum+=luminanceAt(image,sx,sy);n++;}
    }
    if(!n)return {points:[],confidence:0,reason:'Linea fuori dalla fotografia'};
    profile[i]=sum/n;
  }
  const fine=smooth(profile,clamp(Math.round(length/350),1,2));
  const wide=smooth(fine,clamp(Math.round(length/22),9,34));
  const dark=wide.map((v,i)=>v-fine[i]);
  const bright=wide.map((v,i)=>fine[i]-v);
  const margin=clamp(Math.round(length*.035),4,18);
  const minDistance=clamp(Math.round(length*.014),6,16);
  function evaluate(residual){
    const values=[...residual].slice(margin,-margin);
    if(!values.length)return {points:[],score:0};
    const center=median(values);
    const amplitude=median(values.map(v=>Math.abs(v-center)));
    const peak=Math.max(...values);
    const threshold=Math.max(.035,amplitude*2.8,peak*.38);
    if(peak<threshold||!Number.isFinite(peak))return {points:[],score:0};
    const points=peakCandidates(residual,minDistance,threshold,margin);
    if(points.length>maxCandidates || points.length<1)return {points:[],score:0};
    const strength=median(points.map(p=>p.strength));
    const regularity=regularityScore(points,count);
    return {points,score:strength*(.65+.35*regularity),regularity};
  }
  const d=evaluate(dark),b=evaluate(bright);
  const selected=polarity==='dark'?d:polarity==='bright'?b:d.score>=b.score?d:b;
  if(selected.points.length===0)return {points:[],confidence:0,reason:'Contrasto insufficiente o nervature non distinguibili'};
  // Geometric position only; classification as normal ALWAYS requires user review.
  return {
    points:selected.points.map(p=>({x:clamp((x0+ux*p.index)/width,0,1),y:clamp((y0+uy*p.index)/height,0,1),type:'normal'})),
    confidence:clamp(selected.score*5,0,1),
    reason:'Possibili nervature; controllare prima di utilizzare',
    polarity:selected===d?'dark':'bright'
  };
}

function sortedLarge(markers){
  const large=markers.filter(m=>m?.type==='large'&&Number.isFinite(m.x)&&Number.isFinite(m.y));
  if(large.length<2)return [];
  // Same orientation convention as manual reading: horizontal L->R or vertical T->B.
  const minX=Math.min(...large.map(m=>m.x)),maxX=Math.max(...large.map(m=>m.x));
  const minY=Math.min(...large.map(m=>m.y)),maxY=Math.max(...large.map(m=>m.y));
  if(maxX-minX>=maxY-minY)return large.sort((a,b)=>a.x-b.x);
  return large.sort((a,b)=>a.y-b.y);
}

export function suggestNormalRibs(image,markers,options={}){
  const large=sortedLarge(Array.isArray(markers)?markers:[]);
  if(large.length<2)return {points:[],segments:0,reason:'Indica almeno due nervature ingrossate'};
  const existing=(Array.isArray(markers)?markers:[]).filter(m=>m&&Number.isFinite(m.x)&&Number.isFinite(m.y));
  const minDist=clamp(Math.hypot(image.width,image.height)*.007,5,13);
  const candidates=[];let attempted=0;
  for(let i=0;i<large.length-1;i++){
    const res=findNormalRibsBetween(image,large[i],large[i+1],options);
    attempted++;
    for(const m of res.points){
      const near=existing.concat(candidates).some(p=>Math.hypot((m.x-p.x)*image.width,(m.y-p.y)*image.height)<minDist);
      if(!near)candidates.push(m);
    }
  }
  return {points:candidates,segments:attempted,reason:candidates.length?'Suggerimenti da confermare':'Nessun nuovo punto rilevato con sicurezza'};
}
