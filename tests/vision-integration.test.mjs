import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const [controller,html,sw,css]=await Promise.all([
  read('src/controllers/app-controller.mjs'),read('index.html'),read('sw.js'),read('style.css')
]);
for(const id of ['suggestNormalsButton','undoSuggestionsButton']){
  assert.ok(html.includes(`id="${id}"`),`Missing ${id} in HTML`);
  assert.ok(controller.includes(`$('${id}')`),`Missing ${id} wiring`);
}
assert.ok(controller.includes('imageDataForRibAssist(photo,rotation)'));
assert.ok(controller.includes('const prediction=suggestNormalRibs(image,markers)'));
assert.ok(controller.includes('lastSuggestedMarkers=[]'));
assert.ok(controller.includes('if(!confirm('));
assert.ok(sw.includes('./src/vision/vision-image.mjs'));
assert.ok(sw.includes('./src/vision/rib-assist.mjs'));
assert.ok(css.includes('.vision-assist'));
console.log('VISION INTEGRATION: UI wiring verified');
