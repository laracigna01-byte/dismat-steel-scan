/**
 * Opt-in, offline-only export of operator-reviewed rib markers.
 * No site, DDT, producer, dates of work or other job information is exported.
 * This is training DATA, not a trained AI model or inference service.
 */
import { interpretMarkers } from '../domain/reading.mjs';

export const TRAINING_FORMAT='dismat-rib-training-example';
export const TRAINING_VERSION=1;
const DATA_URL=/^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/;

export function validateTrainingExample(record) {
  if (!record || record.format!==TRAINING_FORMAT || record.schemaVersion!==TRAINING_VERSION
      || record.consent?.operatorConfirmed!==true || record.consent?.automaticUpload!==false) {
    throw new Error('File di annotazioni non compatibile o senza conferma dell’operatore.');
  }
  const image=record.image;
  if (!image || typeof image.dataUrl!=='string' || !DATA_URL.test(image.dataUrl)
      || image.dataUrl.length>12_000_000 || !Number.isInteger(image.width)
      || !Number.isInteger(image.height) || image.width<16 || image.height<16
      || image.width>3200 || image.height>3200
      || image.orientation!=='display-aligned') {
    throw new Error('Immagine di addestramento non valida.');
  }
  const markers=record.annotations?.markers;
  if (!Array.isArray(markers) || markers.length>500 || markers.length<3) {
    throw new Error('Sono necessari almeno tre marcatori verificati.');
  }
  for(const m of markers){
    if (!m || !['large','normal'].includes(m.type) || !Number.isFinite(m.x)
        || !Number.isFinite(m.y) || m.x<0 || m.x>1 || m.y<0 || m.y>1){
      throw new Error('Un marcatore non è valido.');
    }
  }
  const reversed=record.annotations.reversed===true;
  const reading=interpretMarkers(markers,reversed);
  if (!reading.complete)throw new Error('Annotazione incompleta: servono almeno tre nervature ingrossate.');
  if (record.annotations.code!==reading.code)throw new Error('Il codice non corrisponde ai marcatori.');
  if (typeof record.createdAt!=='string' || !Number.isFinite(Date.parse(record.createdAt))) {
    throw new Error('Data di esportazione non valida.');
  }
  return record;
}

export function makeTrainingExample({dataUrl,width,height,markers,reversed=false,operatorConfirmed=false,createdAt=new Date().toISOString()}) {
  const points=(markers??[]).map(m=>({x:m.x,y:m.y,type:m.type}));
  const result=interpretMarkers(points,reversed);
  const record={
    format:TRAINING_FORMAT,schemaVersion:TRAINING_VERSION,createdAt,
    consent:{operatorConfirmed,automaticUpload:false},
    image:{dataUrl,width,height,orientation:'display-aligned'},
    annotations:{classes:['large','normal'],markers:points,reversed:!!reversed,code:result.code}
  };
  return validateTrainingExample(record);
}
