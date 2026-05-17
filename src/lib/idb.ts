import { get, set, update } from 'idb-keyval';

export async function addSubmissionToIndex(formBlobId: string, subBlobId: string) {
  const key = `formseal-submissions-${formBlobId}`;
  try {
    await update(key, (val: any) => {
      const list = Array.isArray(val) ? val : [];
      if (!list.includes(subBlobId)) {
        list.push(subBlobId);
      }
      return list;
    });
  } catch (err) {
    // Fallback if update fails
    const list = (await get(key)) || [];
    if (!list.includes(subBlobId)) {
      list.push(subBlobId);
      await set(key, list);
    }
  }
}

export async function getSubmissionsFromIndex(formBlobId: string): Promise<string[]> {
  const key = `formseal-submissions-${formBlobId}`;
  const list = await get(key);
  return Array.isArray(list) ? list : [];
}

export async function getAllFormKeys(): Promise<string[]> {
  const keys = await import('idb-keyval').then(m => m.keys());
  return keys.filter(k => typeof k === 'string' && k.startsWith('formseal-submissions-')) as string[];
}
