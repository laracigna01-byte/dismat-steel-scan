import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,readFile,readdir,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makeTrainingExample,validateTrainingExample,TRAINING_FORMAT } from '../src/services/training-sample.mjs';
import { prepareDataset } from '../training/prepare-dataset.mjs';

const dataUrl='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAQABADASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AAA//2Q==';
const markers=[
  {x:0.1,y:0.5,type:'large'},
  {x:0.2,y:0.5,type:'normal'},
  {x:0.3,y:0.5,type:'large'},
  {x:0.4,y:0.5,type:'normal'},
  {x:0.6,y:0.5,type:'large'}
];
const input={dataUrl,width:16,height:16,markers,operatorConfirmed:true,createdAt:'2026-11-24T07:00:00.000Z'};
const record=makeTrainingExample(input);
assert.equal(record.format,TRAINING_FORMAT);
assert.equal(record.annotations.code,'1 · 1');
assert.equal(record.annotations.markers.length,5);
assert.equal(record.consent.automaticUpload,false);
assert.ok(!('fields' in record));
assert.ok(!('site' in JSON.parse(JSON.stringify(record))));
assert.equal(validateTrainingExample(record),record);
assert.throws(()=>makeTrainingExample({...input,operatorConfirmed:false}));
assert.throws(()=>makeTrainingExample({...input,markers:markers.slice(0,3)}));
assert.throws(()=>makeTrainingExample({...input,markers:[...markers,{x:-1,y:0.5,type:'normal'}]}));
assert.throws(()=>makeTrainingExample({...input,dataUrl:'https://invalid/photo.jpg'}));
assert.throws(()=>makeTrainingExample({...input,height:0}));
assert.throws(()=>validateTrainingExample({...record,annotations:{...record.annotations,code:'9 · 9'}}));

const temp=await mkdtemp(join(tmpdir(),'steel-ribs-'));
try {
  const source=join(temp,'input'),output=join(temp,'output');
  await mkdir(source);
  await writeFile(join(source,'example-one.json'),JSON.stringify(record));
  await writeFile(join(source,'duplicate.json'),JSON.stringify({...record,createdAt:'2026-11-24T07:00:01.000Z'}));
  const summary=await prepareDataset(source,output);
  assert.equal(summary.total,1); // duplicated photos excluded
  assert.equal(summary.counts.train+summary.counts.val+summary.counts.test,1);
  assert.equal(summary.format,'dismat-rib-keypoints-dataset-v1');
  const split=['train','val','test'].find(v=>summary.counts[v]===1);
  const names=await readdir(join(output,split,'annotations'));
  assert.equal(names.length,1);
  const label=JSON.parse(await readFile(join(output,split,'annotations',names[0]),'utf8'));
  assert.equal(label.markers.length,5);
  assert.equal(label.code,'1 · 1');
  assert.equal(label.format,'dismat-rib-keypoints-v1');
  assert.ok(!('site' in label));
  assert.equal((await readdir(join(output,split,'images'))).length,1);
  await assert.rejects(()=>prepareDataset(source,output)); // never overwrite existing dataset silently
}finally{await rm(temp,{recursive:true,force:true});}
console.log('TEST TRAINING DATA: PASS');
