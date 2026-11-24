/**
 * Offline CLI: Node.js 22+, no external dependencies or cloud upload.
 * node training/prepare-dataset.mjs ./esempi_ia ./dataset_ia
 * Extracts JPEG + JSON keypoints and creates deterministic train/val/test splits.
 */
import { readdir,readFile,mkdir,writeFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { validateTrainingExample } from '../src/services/training-sample.mjs';

export async function prepareDataset(inputDir,outputDir) {
  if(resolve(inputDir)===resolve(outputDir))throw new Error('Input e output devono essere cartelle diverse.');
  const names=(await readdir(inputDir)).filter(name=>name.toLowerCase().endsWith('.json')).sort();
  if(!names.length)throw new Error('Nessuna annotazione JSON presente nella cartella di input.');
  if(names.length>2000)throw new Error('Troppi file per una singola elaborazione.');
  await mkdir(outputDir,{recursive:true});
  if((await readdir(outputDir)).length)throw new Error('La cartella di output deve essere vuota per evitare mescolamenti tra dataset.');
  for(const split of ['train','val','test']){
    await mkdir(join(outputDir,split,'images'),{recursive:true});
    await mkdir(join(outputDir,split,'annotations'),{recursive:true});
  }
  const seen=new Set();const counts={train:0,val:0,test:0};
  for(const name of names){
    const raw=await readFile(join(inputDir,name),'utf8');
    if(raw.length>12_000_000)throw new Error('File troppo grande: '+name);
    let item;try{item=validateTrainingExample(JSON.parse(raw));}
    catch(error){throw new Error(name+': '+error.message);}
    const jpeg=Buffer.from(item.image.dataUrl.split(',')[1],'base64');
    if(jpeg.length<20||jpeg[0]!==255||jpeg[1]!==216||jpeg[2]!==255){
      throw new Error(name+': immagine JPEG non valida.');
    }
    const id=createHash('sha256').update(jpeg).digest('hex');
    if(seen.has(id))continue; // No duplicates or leakage between train/val/test.
    seen.add(id);
    const partition=parseInt(id.slice(0,8),16)%10;
    const split=partition<8?'train':partition===8?'val':'test';
    await writeFile(join(outputDir,split,'images',id+'.jpg'),jpeg);
    await writeFile(join(outputDir,split,'annotations',id+'.json'),
      JSON.stringify({id,split,markers:item.annotations.markers,
        reversed:item.annotations.reversed,code:item.annotations.code,
        width:item.image.width,height:item.image.height,
        format:'dismat-rib-keypoints-v1'},null,2));
    counts[split]++;
  }
  if(!seen.size)throw new Error('Nessuna foto valida.');
  const manifest={
    format:'dismat-rib-keypoints-dataset-v1',createdAt:new Date().toISOString(),
    counts,total:seen.size,
    classes:['large','normal'],
    coordinateSystem:'normalized [0,1], aligned to each saved JPEG',
    source:'opt-in operator-reviewed DISMAT Steel Scan exports',
    note:'No site, client, project fields or original EXIF. Not an AI model.'
  };
  await writeFile(join(outputDir,'manifest.json'),JSON.stringify(manifest,null,2));
  return manifest;
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const [source,target]=process.argv.slice(2);
  if(!source||!target){console.error('Uso: node training/prepare-dataset.mjs CARTELLA_ESEMPI CARTELLA_OUTPUT');process.exitCode=2;}
  else try{console.log(await prepareDataset(source,target));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
