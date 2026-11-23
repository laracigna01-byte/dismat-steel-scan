/** IndexedDB CRUD repository; preserves storage name and schema version 1. */
import { DB_NAME, STORE_NAME } from '../domain/scan-model.mjs';

function fromRequest(request) {
  return new Promise((resolve,reject)=>{
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export function createScanRepository() {
  let database = null;
  function requireOpen() {
    if (!database) throw new Error('Archivio non aperto');
    return database;
  }
  return {
    open() {
      if (database) return Promise.resolve(database);
      return new Promise((resolve,reject)=>{
        const request=indexedDB.open(DB_NAME,1);
        request.onupgradeneeded=()=>{
          const db=request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME,{keyPath:'id'});
        };
        request.onsuccess=()=>{database=request.result;database.onversionchange=()=>{database.close();database=null;};resolve(database);};
        request.onerror=()=>reject(request.error);
        request.onblocked=()=>reject(new Error('Archivio occupato da una scheda aperta'));
      });
    },
    getAll() {return fromRequest(requireOpen().transaction(STORE_NAME,'readonly').objectStore(STORE_NAME).getAll());},
    get(id) {return fromRequest(requireOpen().transaction(STORE_NAME,'readonly').objectStore(STORE_NAME).get(id));},
    put(scan) {return fromRequest(requireOpen().transaction(STORE_NAME,'readwrite').objectStore(STORE_NAME).put(scan));},
    delete(id) {return fromRequest(requireOpen().transaction(STORE_NAME,'readwrite').objectStore(STORE_NAME).delete(id));}
  };
}
