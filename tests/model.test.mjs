import assert from 'node:assert/strict';
import { normalizeImportedScan, DB_NAME } from '../src/domain/scan-model.mjs';
import { makeBackup, parseBackup } from '../src/services/backup-service.mjs';
import { html } from '../src/views/html.mjs';
assert.equal(DB_NAME,'dismat-steel-scan-v1'); // Storage continuity
const pic='data:image/jpeg;base64,aGVsbG8=';
const record={id:'abc',photo:pic,fields:{site:'TEST', notes:'ok'},markers:[{x:.1,y:.4,type:'large'},{x:.2,y:.4,type:'normal'},{x:.3,y:.4,type:'large'}]};
const one=normalizeImportedScan(record);
assert.equal(one.id,'abc');
assert.equal(one.code,'1');
assert.equal(parseBackup(JSON.stringify(makeBackup([record]))).length,1);
assert.equal(normalizeImportedScan({...record,photo:'javascript:alert(1)'}),null);
assert.equal(html('<img src="x">'),'&lt;img src=&quot;x&quot;&gt;');
assert.throws(()=>parseBackup(JSON.stringify({application:'Fake',schemaVersion:1,records:[record]})));
console.log('TEST MODEL / BACKUP: 6/6 OK');
