import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  WarningCircle,
  ArrowLeft,
  ArrowSquareOut,
  Lock,
  User,
} from '@phosphor-icons/react';
import { useCurrentAccount } from '@mysten/dapp-kit';

import { Button, Badge, Skeleton } from '@/components/ui';
import { FormFieldRenderer } from '@/components/FormFieldRenderer';
import { fetchFromWalrus, uploadToWalrus } from '@/lib/walrus';
import { sealEncrypt } from '@/lib/seal';
import { addSubmissionToIndex } from '@/lib/idb';
import { useToastStore, useDashboardStore } from '@/stores/appStore';
import type { FormSchema } from '@/types';

type PageState = 'loading' | 'ready' | 'submitting' | 'success' | 'error';

export function FormViewPage() {
  const { blobId } = useParams<{ blobId: string }>();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submittedBlobId, setSubmittedBlobId] = useState<string | null>(null);
  const { addToast, removeToast } = useToastStore();
  const currentAccount = useCurrentAccount();

  // ─── Explorer Utility ───
  const getExplorerUrl = (id: string) => `https://explorer.walrus.xyz/#/objects/${id}`;

  // ─── Fetch Schema ───
  useEffect(() => {
    async function fetchSchema() {
      if (!blobId) return;
      setPageState('loading');
      try {
        const data = await fetchFromWalrus<FormSchema>(blobId);
        if (!data || !data.fields) {
          throw new Error('Invalid form schema structure');
        }
        setSchema(data);
        setPageState('ready');
      } catch (err) {
        console.error('Failed to fetch form:', err);
        setLoadError(err instanceof Error ? err.message : 'Unknown error');
        setPageState('error');
      }
    }
    fetchSchema();
  }, [blobId]);

  // ─── Validation ───
  const validate = useCallback(() => {
    if (!schema) return false;
    const newErrors: Record<string, string> = {};
    schema.fields.forEach((field) => {
      if (field.required && !values[field.id]) {
        newErrors[field.id] = 'This field is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [schema, values]);

  // ─── Submission ───
  const handleSubmit = useCallback(async () => {
    if (!validate() || !schema || !blobId) return;

    setPageState('submitting');
    const loadingId = addToast({
      type: 'loading',
      title: 'Packaging submission...',
      description: 'Your data is being encrypted and staged for Walrus.',
    });

    try {
      let payloadToUpload: any = {
        formBlobId: blobId,
        values,
        timestamp: Date.now(),
        submittedBy: currentAccount?.address || 'anonymous',
      };

      // Apply zero-trust threshold encryption if the form requires privacy
      if (schema.sensitive) {
        addToast({
          type: 'loading',
          title: 'Applying Threshold Encryption...',
          description: 'Securing payload via Mysten Seal Network.',
        });
        
        const stringifiedPayload = JSON.stringify(payloadToUpload);
        const encryptedCiphertext = await sealEncrypt(
          stringifiedPayload,
          schema.creatorAddress || '0x0000000000000000000000000000000000000000000000000000000000000000',
          blobId
        );
        
        payloadToUpload = {
          encrypted: true,
          payload: encryptedCiphertext,
          submittedAt: Date.now()
        };
      }

      const subBlobId = await uploadToWalrus(payloadToUpload);

      // Aggressively cache the submission locally via IndexedDB 
      // This bypasses Walrus propagation latency, making the Dashboard instantly aware of the submission
      try {
        await addSubmissionToIndex(blobId, subBlobId);
        
        // Keep Dashboard global state updated dynamically
        const currentCount = useDashboardStore.getState().forms.find(f => f.formBlobId === blobId)?.submissionCount || 0;
        useDashboardStore.getState().updateForm(blobId, {
          submissionCount: currentCount + 1,
        });
      } catch (err) {
        console.warn('Local cache update failed, but payload is safely on Walrus', err);
      }

      removeToast(loadingId);
      setSubmittedBlobId(subBlobId);
      setPageState('success');

      addToast({
        type: 'success',
        title: 'Submission stored on Walrus',
        blobId: subBlobId,
      });
    } catch (err) {
      removeToast(loadingId);
      setPageState('ready');
      addToast({
        type: 'error',
        title: 'Submission failed',
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [schema, blobId, values, validate, addToast, removeToast, currentAccount]);

  // ─── Loading State ───
  if (pageState === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (pageState === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-danger-dim border border-danger/20 flex items-center justify-center mx-auto mb-6">
            <WarningCircle weight="fill" className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-bold mb-2">Form Not Found</h2>
          <p className="text-text-muted text-[1rem] max-w-[40ch] mx-auto mb-6">
            {loadError || 'This form could not be loaded from Walrus. The blob ID may be invalid.'}
          </p>
          <Link to="/">
            <Button variant="secondary" size="md" icon={<ArrowLeft weight="bold" className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Success State ───
  if (pageState === 'success' && submittedBlobId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-[#fcfaf7] min-h-screen relative overflow-hidden">
        {/* Subtle decorative background element */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[100px]" />
        
        <div className="max-w-[480px] w-full text-center relative z-10 animate-fade-in">
          <div className="bg-white rounded-[3rem] border border-black/[0.04] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12">
            <div className="w-20 h-20 rounded-[2rem] bg-[#faf9f6] border border-black/[0.03] flex items-center justify-center mx-auto mb-8 shadow-sm">
              <CheckCircle weight="light" className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-[2.25rem] font-bold tracking-tight text-black mb-4">Transmission Success</h2>
            <p className="text-[1rem] text-black/40 font-medium mb-10 leading-relaxed px-4">
              Your data has been permanently integrated into the decentralized storage fabric.
            </p>

            {/* Blob ID Display */}
            <div className="bg-[#faf9f6] rounded-[2rem] border border-black/[0.03] p-8 mb-10 text-left">
              <div className="text-[0.75rem] uppercase tracking-widest text-black/20 font-bold mb-3">
                Network Identifier
              </div>
              <p className="font-mono text-[0.875rem] text-black/60 break-all leading-relaxed font-medium">
                {submittedBlobId}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={getExplorerUrl(submittedBlobId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowSquareOut weight="light" className="w-5 h-5" />}
                  className="w-full h-16 !rounded-lg !bg-black !text-white shadow-xl shadow-black/10"
                >
                  Inspect Object
                </Button>
              </a>
              <Link to="/">
                <button className="text-[0.875rem] font-bold text-black/30 hover:text-black transition-colors py-2">
                  Return to Studio
                </button>
              </Link>
            </div>

            {schema?.sensitive && (
              <div className="mt-8 pt-8 border-t border-black/[0.03] flex items-center justify-center gap-3 text-[0.75rem] text-black/20 font-bold uppercase tracking-widest">
                <Lock weight="fill" className="w-3.5 h-3.5" />
                Threshold Encrypted
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Form Ready State ───
  if (!schema) return null;

  return (
    <div className="flex-1 px-4 pt-32 pb-20 bg-[#fcfaf7] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="animate-fade-in space-y-8">
          
          <div className="bg-white rounded-[3rem] border border-black/[0.04] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="bg-white p-0 overflow-hidden">
              
              {/* Form Header Area */}
              <div className="p-10 md:p-16 border-b border-black/[0.03] bg-[#faf9f6]/50">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  {schema.sensitive && (
                    <Badge variant="accent" className="!bg-emerald-50 !text-emerald-600 !border-emerald-100/50">
                      <Lock weight="fill" className="w-3.5 h-3.5 mr-2" />
                      Encrypted Stream
                    </Badge>
                  )}
                  <Badge variant="default" className="!bg-black/[0.03] !text-black/40 !border-black/5">Verified Collection</Badge>
                  {schema.creatorAddress && (
                    <Badge variant="default" className="!bg-black/[0.02] !text-black/50 !border-black/5 font-mono">
                      Creator: {schema.creatorAddress.slice(0, 6)}...{schema.creatorAddress.slice(-4)}
                    </Badge>
                  )}
                  {currentAccount ? (
                    <Badge variant="default" className="!bg-blue-50 !text-blue-600 !border-blue-100/50 font-mono flex items-center gap-1.5">
                      <User weight="bold" className="w-3 h-3" />
                      Connected: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                    </Badge>
                  ) : (
                    <Badge variant="default" className="!bg-amber-50 !text-amber-600 !border-amber-100/50">
                      Wallet Disconnected
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-[2.75rem] font-bold tracking-tight text-black leading-tight mb-4">
                  {schema.title || 'Untitled Stream'}
                </h1>
                
                {schema.description && (
                  <p className="text-[1.125rem] text-black/50 leading-relaxed max-w-[50ch] font-medium">
                    {schema.description}
                  </p>
                )}
              </div>

              {/* Form Body Area */}
              <div className="p-10 md:p-16">
                <div className="space-y-12 field-stagger">
                  {schema.fields.map((field) => (
                    <FormFieldRenderer
                      key={field.id}
                      field={field}
                      value={values[field.id]}
                      error={errors[field.id]}
                      accentColor={schema.accentColor}
                      onChange={(val) =>
                        setValues((prev) => ({ ...prev, [field.id]: val }))
                      }
                    />
                  ))}
                </div>

                {/* Submit Section */}
                <div className="mt-16 pt-12 border-t border-black/[0.03]">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    loading={pageState === 'submitting'}
                    className="w-full h-16 !rounded-lg text-[1.125rem] font-bold shadow-2xl shadow-black/10 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: schema.accentColor,
                    }}
                  >
                    {pageState === 'submitting' ? 'Synchronizing with Network...' : 'Confirm Submission'}
                  </Button>
                  
                  <div className="mt-12 text-center">
                    <span className="text-[0.6875rem] font-bold text-black/10 uppercase tracking-[0.4em]">
                      End of Stream Architecture
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
