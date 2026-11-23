import assert from 'node:assert/strict';
import {interpretMarkers, rotateMarkersClockwise} from '../src/domain/reading.mjs';
const sample=[{x:0.1,y:.5,type:'large'}, {x:.18,y:.5,type:'large'},
  ...[.25,.30,.35,.40].map(x=>({x,y:.5,type:'normal'})),{x:.48,y:.5,type:'large'},
  ...[.54,.60,.66,.72,.78].map(x=>({x,y:.5,type:'normal'})),{x:.84,y:.5,type:'large'}];
assert.equal(interpretMarkers(sample).code,'0 · 4 · 5');
assert.equal(interpretMarkers(sample,true).code,'5 · 4 · 0');
const slope=sample.map(m=>({...m,y:.2+m.x*.4}));
assert.equal(interpretMarkers(slope).code,'0 · 4 · 5');
assert.equal(interpretMarkers(rotateMarkersClockwise(sample)).code,'0 · 4 · 5');
assert.equal(interpretMarkers([{x:.1,y:.2,type:'large'}]).code,'');
console.log('TEST LETTURA: 5/5 OK');
