import type { WalrusUploadResponse } from '@/types';

const PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';
const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

export const WALRUS_EXPLORER_BASE = 'https://walruscan.com/testnet/blob';

export function getExplorerUrl(blobId: string): string {
  return `${WALRUS_EXPLORER_BASE}/${blobId}`;
}

export async function uploadToWalrus(data: unknown): Promise<string> {
  const body =
    typeof data === 'string' ? data : JSON.stringify(data);

  const response = await fetch(`${PUBLISHER}/v1/blobs`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Walrus upload failed (${response.status}): ${text}`);
  }

  const result: WalrusUploadResponse = await response.json();

  if (result.newlyCreated) {
    return result.newlyCreated.blobObject.blobId;
  }
  if (result.alreadyCertified) {
    return result.alreadyCertified.blobId;
  }

  throw new Error('Unexpected Walrus response format');
}

export async function fetchFromWalrus<T>(blobId: string): Promise<T> {
  const response = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);

  if (!response.ok) {
    throw new Error(`Walrus fetch failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}
