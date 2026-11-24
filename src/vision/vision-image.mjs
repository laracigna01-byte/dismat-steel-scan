/** Rotate + downsample the original photo into a local RGBA buffer. No network. */
export function imageDataForRibAssist(photo,rotation=0,maxDimension=1100){
  if(!photo || ![0,90,180,270].includes(rotation))throw new Error('Fotografia non disponibile.');
  const width0=photo.naturalWidth,height0=photo.naturalHeight;
  if(!width0||!height0)throw new Error('Fotografia non leggibile.');
  const scale=Math.min(1,maxDimension/Math.max(width0,height0));
  const sourceWidth=Math.max(1,Math.round(width0*scale));
  const sourceHeight=Math.max(1,Math.round(height0*scale));
  const swapped=rotation%180!==0;
  const canvas=document.createElement('canvas');
  canvas.width=swapped?sourceHeight:sourceWidth;
  canvas.height=swapped?sourceWidth:sourceHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('Elaborazione fotografia non disponibile.');
  if(rotation===90){ctx.translate(canvas.width,0);ctx.rotate(Math.PI/2);}
  else if(rotation===180){ctx.translate(canvas.width,canvas.height);ctx.rotate(Math.PI);}
  else if(rotation===270){ctx.translate(0,canvas.height);ctx.rotate(-Math.PI/2);}
  ctx.drawImage(photo,0,0,sourceWidth,sourceHeight);
  return ctx.getImageData(0,0,canvas.width,canvas.height);
}
