/**
 * Manual marker reading, NOT a vision or manufacturer-identification model.
 * Coordinates must be normalized to [0,1] in the displayed (rotated) photo.
 */
export function interpretMarkers(markers, reversed = false) {
  const valid = (Array.isArray(markers) ? markers : []).filter(m =>
    m && (m.type === 'large' || m.type === 'normal') &&
    Number.isFinite(m.x) && Number.isFinite(m.y));
  const largeCount = valid.filter(m => m.type === 'large').length;
  const normalCount = valid.length - largeCount;
  if (largeCount < 2) return { digits: [], code: '', largeCount, normalCount, complete: false };

  const means = valid.reduce((a,m) => ({x:a.x + m.x / valid.length,y:a.y + m.y / valid.length}), {x:0,y:0});
  let xx=0, yy=0, xy=0;
  for (const m of valid) {
    const x=m.x-means.x, y=m.y-means.y;
    xx+=x*x; yy+=y*y; xy+=x*y;
  }
  // Principal axis: robust to a sloped bar. Horizontal reading defaults left-to-right;
  // nearly vertical reading defaults top-to-bottom. Operator may reverse explicitly.
  let angle = Math.atan2(2*xy, xx-yy)/2;
  let ax = Math.cos(angle), ay = Math.sin(angle);
  if (Math.abs(ax) >= Math.abs(ay)) {
    if (ax < 0) { ax=-ax;ay=-ay; }
  } else if (ay < 0) { ax=-ax;ay=-ay; }
  const arranged = valid.map((m,i)=>({...m, t:(m.x-means.x)*ax+(m.y-means.y)*ay, i})).sort((a,b)=>a.t-b.t);
  if (reversed) arranged.reverse();
  const bigIndices = arranged.flatMap((m,i)=>m.type==='large'?[i]:[]);
  const digits = [];
  for (let i=0; i<bigIndices.length-1; i++) {
    digits.push(arranged.slice(bigIndices[i]+1,bigIndices[i+1]).filter(m=>m.type==='normal').length);
  }
  return { digits, code: digits.join(' · '), largeCount, normalCount, complete: digits.length >= 2 };
}

export function rotateMarkersClockwise(markers) {
  return markers.map(m => ({...m, x:1-m.y, y:m.x}));
}
