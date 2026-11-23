/** Backup file schema and import validation. UI confirmation and storage live in controller. */
import { BACKUP_APP, BACKUP_VERSION, normalizeImportedScan } from '../domain/scan-model.mjs';
export function makeBackup(records, exportedAt=new Date().toISOString()) {
  return {application:BACKUP_APP, schemaVersion:BACKUP_VERSION, exportedAt, records};
}
export function parseBackup(raw) {
  const data=JSON.parse(raw);
  if (data?.application!==BACKUP_APP || data?.schemaVersion!==BACKUP_VERSION || !Array.isArray(data.records)) {
    throw new Error('Il file non è un backup DISMAT Steel Scan compatibile.');
  }
  if (data.records.length>3000) throw new Error('Troppi record nel backup.');
  const records=data.records.map(normalizeImportedScan).filter(Boolean);
  if (!records.length) throw new Error('Nessuna scheda valida trovata.');
  return records;
}
