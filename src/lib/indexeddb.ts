const DB_NAME = 'BeautyCamDB';
const DB_STORE = 'photos';

export interface PhotoMeta {
  filters: {
    brightness: string;
    contrast: string;
    saturate: string;
    hue: string;
    blur: string;
    scale: string;
  };
}

export interface PhotoItem {
  id: number;
  blob: Blob;
  createdAt: number;
  meta: PhotoMeta;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function savePhoto(blob: Blob, meta: PhotoMeta): Promise<number> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const item = {
      blob,
      createdAt: Date.now(),
      meta,
    };
    const req = store.add(item);
    req.onsuccess = () => {
      res(req.result as number);
      db.close();
    };
    req.onerror = () => {
      rej(req.error);
      db.close();
    };
  });
}

export async function listPhotos(): Promise<PhotoItem[]> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      res(req.result);
      db.close();
    };
    req.onerror = () => {
      rej(req.error);
      db.close();
    };
  });
}

export async function getPhoto(id: number): Promise<PhotoItem | undefined> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const req = store.get(id);
    req.onsuccess = () => {
      res(req.result);
      db.close();
    };
    req.onerror = () => {
      rej(req.error);
      db.close();
    };
  });
}

export async function deletePhoto(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const req = store.delete(id);
    req.onsuccess = () => {
      res();
      db.close();
    };
    req.onerror = () => {
      rej(req.error);
      db.close();
    };
  });
}

export async function clearGallery(): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const req = store.clear();
    req.onsuccess = () => {
      res();
      db.close();
    };
    req.onerror = () => {
      rej(req.error);
      db.close();
    };
  });
}

export async function updatePhoto(
  id: number,
  updates: { cloudinaryUrl?: string; cloudinaryPublicId?: string; meta?: PhotoMeta }
): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (!item) {
        db.close();
        rej(new Error('Photo not found'));
        return;
      }
      const updatedItem = {
        ...item,
        ...(updates.cloudinaryUrl && { cloudinaryUrl: updates.cloudinaryUrl }),
        ...(updates.cloudinaryPublicId && { cloudinaryPublicId: updates.cloudinaryPublicId }),
        ...(updates.meta && { meta: updates.meta }),
      };
      const putReq = store.put(updatedItem);
      putReq.onsuccess = () => {
        res();
        db.close();
      };
      putReq.onerror = () => {
        rej(putReq.error);
        db.close();
      };
    };
    getReq.onerror = () => {
      rej(getReq.error);
      db.close();
    };
  });
}

