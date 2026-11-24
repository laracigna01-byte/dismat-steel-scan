import assert from 'node:assert/strict';
import {findNormalRibsBetween,suggestNormalRibs} from '../src/vision/rib-assist.mjs';

function synthetic({width=600,height=110,bright=false,noise=0,stripes=[70,130,190,250,310,370,430,490,550]}={}){
  const data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const center=120+(y-height/2)*.13;
    const onRib=stripes.some(p=>Math.abs(x-p)<4);
    const v=Math.max(0,Math.min(255,Math.round(center+(onRib?(bright?70:-70):0)+noise*Math.sin(x*.137+y*.181))));
    const off=(y*width+x)*4;
    data[off]=data[off+1]=data[off+2]=v;data[off+3]=255;
  }
  return {width,height,data};
}
const img=synthetic();
const large=[{x:70/600,y:.5,type:'large'},{x:550/600,y:.5,type:'large'}];
let res=findNormalRibsBetween(img,large[0],large[1]);
assert.ok(res.points.length>=5,`Expected multiple ribs, got ${res.points.length}`);
assert.ok(res.points.every(p=>p.type==='normal'));
assert.ok(res.points.every(p=>p.x>large[0].x&&p.x<large[1].x));
assert.ok(res.confidence>0);
res=suggestNormalRibs(img,large);
assert.ok(res.points.length>=5);
const withExisting=suggestNormalRibs(img,[...large,{x:190/600,y:.5,type:'normal'}]);
assert.ok(withExisting.points.length<res.points.length,'Manual normal rib should not be duplicated');
const rotated=synthetic({width:600,height:110,bright:true});
const bright=findNormalRibsBetween(rotated,large[0],large[1]);
assert.ok(bright.points.length>=5,'Bright ribs should be handled');
assert.deepEqual(suggestNormalRibs(img,[]).points,[]);
assert.deepEqual(suggestNormalRibs(img,[large[0]]).points,[]);
assert.deepEqual(findNormalRibsBetween(img,{x:.3,y:.5},{x:.31,y:.5}).points,[]);
const blank=synthetic({stripes:[]});
assert.deepEqual(findNormalRibsBetween(blank,large[0],large[1]).points,[]);
assert.throws(()=>findNormalRibsBetween({width:600,height:110,data:new Uint8ClampedArray(10)},large[0],large[1]));
console.log('VISION: local rib suggestion tests passed');

// A sloped bar produces rib locations on its axis, not horizontal guesses.
const diag=synthetic({width:600,height:110,noise:6});
const slopes=suggestNormalRibs(diag,[{x:70/600,y:.4,type:'large'},{x:550/600,y:.6,type:'large'}]);
assert.ok(slopes.points.every(p=>p.y>.3&&p.y<.7));
const noisy=suggestNormalRibs(synthetic({noise:12}),large);
assert.ok(noisy.points.length>=4,`Expected ribs in moderate noise, got ${noisy.points.length}`);
// The algorithm must never label a discovered point as a reference (large) rib.
assert.ok(noisy.points.every(p=>p.type==='normal'));
// Existing manual reading is a separate, unchanged domain function.
const {interpretMarkers}=await import('../src/domain/reading.mjs');
assert.equal(interpretMarkers(large).code,'0');
assert.equal(interpretMarkers([...large,...noisy.points]).largeCount,2);
