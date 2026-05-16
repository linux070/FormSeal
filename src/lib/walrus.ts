import type { WalrusUploadResponse } from '@/types';

const PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';
const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

export const WALRUS_EXPLORER_BASE = 'https://walruscan.com/testnet/blob';

export interface WalrusMetadata {
  blobId: string;
  suiObjectId?: string;
  newlyCreated: boolean;
}

export interface UploadOptions {
  epochs?: number;
}

export function getExplorerUrl(blobId: string): string {
  return `${WALRUS_EXPLORER_BASE}/${blobId}`;
}

export async function uploadToWalrusWithMetadata(
  data: unknown,
  options?: UploadOptions
): Promise<WalrusMetadata> {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  const url = new URL(`${PUBLISHER}/v1/blobs`);
  
  if (options?.epochs !== undefined) {
    url.searchParams.append('epochs', options.epochs.toString());
  }

  const response = await fetch(url.toString(), {
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
    return {
      blobId: result.newlyCreated.blobObject.blobId,
      suiObjectId: result.newlyCreated.blobObject.id,
      newlyCreated: true,
    };
  }
  if (result.alreadyCertified) {
    return {
      blobId: result.alreadyCertified.blobId,
      newlyCreated: false,
    };
  }

  throw new Error('Unexpected Walrus response format');
}

export async function uploadToWalrus(
  data: unknown,
  options?: UploadOptions
): Promise<string> {
  const metadata = await uploadToWalrusWithMetadata(data, options);
  return metadata.blobId;
}

export async function fetchFromWalrus<T>(blobId: string): Promise<T> {
  const response = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);

  if (!response.ok) {
    throw new Error(`Walrus fetch failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}
