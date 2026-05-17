import type { WalrusUploadResponse } from '@/types';
import { useWalletStore } from '@/stores/appStore';

export function getExplorerBaseUrl(): string {
  try {
    const currentNetwork = useWalletStore.getState().network;
    const isMainnet = currentNetwork.toLowerCase().includes('mainnet');
    return isMainnet 
      ? 'https://walruscan.com/mainnet/blob'
      : 'https://walruscan.com/testnet/blob';
  } catch {
    return 'https://walruscan.com/testnet/blob';
  }
}

export interface WalrusMetadata {
  blobId: string;
  suiObjectId?: string;
  newlyCreated: boolean;
}

export interface UploadOptions {
  epochs?: number;
}

export function getExplorerUrl(blobId: string): string {
  return `${getExplorerBaseUrl()}/${blobId}`;
}

const PUBLISHERS = [
  import.meta.env.VITE_WALRUS_PUBLISHER,
  'https://publisher.walrus-testnet.walrus.space',
  'https://walrus-testnet-publisher.nodes.guru',
  'https://publisher-t.walrus.blockscope.net',
  'https://sui-walrus-testnet.bwarelabs.com/publisher'
].filter(Boolean) as string[];

export async function uploadToWalrusWithMetadata(
  data: unknown,
  options?: UploadOptions
): Promise<WalrusMetadata> {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  let lastError: any;

  for (const publisher of PUBLISHERS) {
    try {
      const url = new URL(`${publisher}/v1/blobs`);
      
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
        throw new Error(`Walrus upload failed on ${publisher} (${response.status}): ${text}`);
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

      throw new Error(`Unexpected Walrus response format from ${publisher}`);
    } catch (err) {
      console.warn(`[Walrus] Upload failed on ${publisher}, trying next...`, err);
      lastError = err;
    }
  }

  throw new Error(`All Walrus publishers failed to upload blob. Last error: ${lastError}`);
}

export async function uploadToWalrus(
  data: unknown,
  options?: UploadOptions
): Promise<string> {
  const metadata = await uploadToWalrusWithMetadata(data, options);
  return metadata.blobId;
}

const AGGREGATORS = [
  import.meta.env.VITE_WALRUS_AGGREGATOR,
  'https://aggregator.walrus-testnet.walrus.space',
  'https://walrus-testnet-aggregator.nodes.guru',
  'https://aggregator-t.walrus.blockscope.net',
  'https://sui-walrus-testnet.bwarelabs.com/aggregator'
].filter(Boolean) as string[];

export async function fetchFromWalrus<T>(blobId: string): Promise<T> {
  let lastError: any;

  for (const aggregator of AGGREGATORS) {
    try {
      const response = await fetch(`${aggregator}/v1/blobs/${blobId}`);

      if (!response.ok) {
        throw new Error(`Walrus fetch failed on ${aggregator} (${response.status})`);
      }

      // Sometimes data is returned as plain text instead of application/json
      const textData = await response.text();
      try {
        return JSON.parse(textData) as T;
      } catch (parseError) {
        // If it's already a string but not JSON (rare for our app, but possible)
        return textData as unknown as T;
      }
    } catch (err) {
      console.warn(`[Walrus] Fetch failed on ${aggregator}, trying next...`, err);
      lastError = err;
    }
  }

  throw new Error(`All Walrus aggregators failed to fetch blob: ${blobId}. Last error: ${lastError}`);
}
