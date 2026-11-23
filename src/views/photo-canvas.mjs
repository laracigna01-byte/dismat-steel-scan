/** Pure canvas renderer, independent of storage and form behavior. */
export function drawAnnotatedPhoto({canvas,stageElement,photo,markers,rotation,zoom,contrast}) {
  const can=canvas;
  const swap=rotation%180!==0;
  const w=swap?photo.naturalHeight:photo.naturalWidth;
  const h=swap?photo.naturalWidth:photo.naturalHeight;
  can.width=w;can.height=h;
  const stage=stageElement;const base=Math.max(260,Math.min(w,stage.clientWidth-2));
  can.style.width=`${Math.round(base*(zoom/100))}px`;
  const ctx=can.getContext('2d');ctx.fillStyle='#111';ctx.fillRect(0,0,w,h);
  ctx.save();ctx.filter=`contrast(${contrast}%)`;
  if(rotation===90){ctx.translate(w,0);ctx.rotate(Math.PI/2);ctx.drawImage(photo,0,0,h,w);}
  else if(rotation===180){ctx.translate(w,h);ctx.rotate(Math.PI);ctx.drawImage(photo,0,0,w,h);}
  else if(rotation===270){ctx.translate(0,h);ctx.rotate(-Math.PI/2);ctx.drawImage(photo,0,0,h,w);}
  else ctx.drawImage(photo,0,0,w,h);
  ctx.restore();
  const visualWidth=Math.max(1,base*zoom/100);const radius=Math.min(28,Math.max(9,9*w/visualWidth));
  markers.forEach((m,i)=>{
    const x=m.x*w,y=m.y*h;ctx.save();ctx.beginPath();ctx.arc(x,y,radius+2,0,Math.PI*2);ctx.fillStyle='#080808a8';ctx.fill();ctx.lineWidth=Math.max(3,radius*.32);ctx.strokeStyle=m.type==='large'?'#ffde64':'#ff645c';ctx.stroke();
    ctx.beginPath();ctx.arc(x,y,radius*.23,0,Math.PI*2);ctx.fillStyle=m.type==='large'?'#fff3b9':'#ffaba5';ctx.fill();ctx.restore();
  });
 }
