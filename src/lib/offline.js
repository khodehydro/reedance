const DB_NAME = "reedance-offline-demo";
const STORE = "song-packs";
const DEMO_ID = "midnight-avenue";

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Offline storage is not supported by this browser."));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getDownloadedPack(id = DEMO_ID) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function savePack(pack) {
  const db = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(pack);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function removeDownloadedPack(id = DEMO_ID) {
  const db = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).delete(id);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function downloadDemoPack(onProgress = () => {}) {
  const lessonResponse = await fetch("/content/midnight-avenue.json");
  if (!lessonResponse.ok) throw new Error("Could not download the lesson.");
  const lesson = await lessonResponse.json();
  onProgress(12);

  const audioResponse = await fetch("/audio/midnight-avenue-demo.wav");
  if (!audioResponse.ok) throw new Error("Could not download the demo audio.");
  const total =
    Number(audioResponse.headers.get("content-length")) || 2_048_044;
  const chunks = [];
  let received = 0;

  if (audioResponse.body) {
    const reader = audioResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      onProgress(Math.min(94, Math.round(12 + (received / total) * 82)));
    }
  } else {
    const buffer = await audioResponse.arrayBuffer();
    chunks.push(buffer);
    onProgress(94);
  }

  const pack = {
    id: DEMO_ID,
    lesson,
    audio: new Blob(chunks, { type: "audio/wav" }),
    downloadedAt: Date.now(),
  };
  await savePack(pack);
  onProgress(100);
  return pack;
}
