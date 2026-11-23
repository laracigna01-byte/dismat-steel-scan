/** DISMAT Steel Scan - model and normalization rules (schema v1). */
import { interpretMarkers } from './reading.mjs';

export const FIELDS = Object.freeze(['site','date','steel','diameter','ddt','location','producer','certificate','outcome','notes']);
export const DB_NAME = 'dismat-steel-scan-v1'; // Existing IndexedDB name - do not change without a migration.
export const STORE_NAME = 'scans';
export const BACKUP_APP = 'DISMAT Steel Scan';
export const BACKUP_VERSION = 1;

export function validPhotoUrl(value) {
  return typeof value === 'string' && /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value);
}
export function todayLocal() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
export function makeId() {
  return (globalThis.crypto?.randomUUID?.() ?? `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`);
}
export function normalizeImportedScan(s) {
  if (!s || typeof s.id !== 'string' || !s.id || s.id.length > 128 || !validPhotoUrl(s.photo)
      || !s.fields || typeof s.fields !== 'object' || !Array.isArray(s.markers)) return null;
  const fields = Object.fromEntries(FIELDS.map(k=>[k,String(s.fields[k]??'').slice(0,k==='notes'?4000:300)]));
  const markers = s.markers.filter(m=>m && ['large','normal'].includes(m.type) && Number.isFinite(m.x)
      && Number.isFinite(m.y) && m.x>=0 && m.x<=1 && m.y>=0 && m.y<=1)
    .slice(0,500).map(m=>({x:m.x,y:m.y,type:m.type}));
  const reversed = !!s.reversed;
  const timestamp = new Date().toISOString();
  return {
    id:s.id, fields, photo:s.photo,
    annotatedPhoto:validPhotoUrl(s.annotatedPhoto)?s.annotatedPhoto:'', markers,
    code:interpretMarkers(markers,reversed).code,
    rotation:[0,90,180,270].includes(s.rotation)?s.rotation:0,
    reversed, contrast:Math.max(100,Math.min(200,Number(s.contrast)||100)),
    createdAt:typeof s.createdAt==='string'?s.createdAt:timestamp,
    updatedAt:typeof s.updatedAt==='string'?s.updatedAt:timestamp
  };
}
