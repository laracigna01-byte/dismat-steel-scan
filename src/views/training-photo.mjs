/**
 * Snapshot matching the visible (rotated) marker coordinate system.
 * Intentionally EXCLUDES markers, contrast filters, zoom and project metadata.
 */
export function captureTrainingPhoto(photo,rotation=0) {
  if(!photo || ![0,90,180,270].includes(rotation))throw new Error('Fotografia non disponibile.');
  const sourceWidth=photo.naturalWidth,sourceHeight=photo.naturalHeight;
  if(!sourceWidth||!sourceHeight)throw new Error('Fotografia non leggibile.');
  const swap=rotation===90||rotation===270;
  const width=swap?sourceHeight:sourceWidth;
  const height=swap?sourceWidth:sourceHeight;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas fotografico non disponibile.');
  if(rotation===90){ctx.translate(width,0);ctx.rotate(Math.PI/2);}
  else if(rotation===180){ctx.translate(width,height);ctx.rotate(Math.PI);}
  else if(rotation===270){ctx.translate(0,height);ctx.rotate(-Math.PI/2);}
  ctx.drawImage(photo,0,0,sourceWidth,sourceHeight);
  return {dataUrl:canvas.toDataURL('image/jpeg',0.88),width,height};
}
