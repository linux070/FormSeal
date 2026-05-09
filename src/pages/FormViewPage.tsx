import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFromWalrus, uploadToWalrus, getExplorerUrl } from '@/lib/walrus';
import { sealEncrypt } from '@/lib/seal';
import { useToastStore } from '@/stores/appStore';
import { Button, Skeleton, Badge, ProtocolAttribution } from '@/components/ui';
import { FormFieldRenderer } from '@/components/FormFieldRenderer';
import type { FormSchema, FormIndex, FieldSubmission, FormSubmission } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import {
  CheckCircle,
  ArrowSquareOut,
  Lock,
  WarningCircle,
  ArrowLeft,
} from '@phosphor-icons/react';

type PageState = 'loading' | 'ready' | 'submitting' | 'success' | 'error';

export function FormViewPage() {
  const { blobId } = useParams<{ blobId: string }>();
  const { addToast, removeToast } = useToastStore();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [values, setValues] = useState<Record<string, string | string[] | number | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedBlobId, setSubmittedBlobId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ─── Fetch form schema ───
  useEffect(() => {
    if (!blobId) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchFromWalrus<FormSchema>(blobId!);
        if (cancelled) return;
        setSchema(data);
        // Initialize values
        const initial: Record<string, string | string[] | number | null> = {};
        data.fields.forEach((f) => {
          if (f.type === 'checkbox_group') {
            initial[f.id] = [];
          } else if (f.type === 'star_rating') {
            initial[f.id] = 0;
          } else {
            initial[f.id] = '';
          }
        });
        setValues(initial);
        setPageState('ready');
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load form');
        setPageState('error');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [blobId]);

  // ─── Validation ───
  const validate = useCallback((): boolean => {
    if (!schema) return false;
    const newErrors: Record<string, string> = {};

    schema.fields.forEach((field) => {
      if (!field.required) return;
      const val = values[field.id];

      if (field.type === 'checkbox_group') {
        if (!Array.isArray(val) || val.length === 0) {
          newErrors[field.id] = 'Select at least one option';
        }
      } else if (field.type === 'star_rating') {
        if (!val || val === 0) {
          newErrors[field.id] = 'Please provide a rating';
        }
      } else if (field.type === 'url') {
        if (!val || typeof val !== 'string' || val.trim() === '') {
          newErrors[field.id] = 'This field is required';
        } else {
          try {
            new URL(val);
          } catch {
            newErrors[field.id] = 'Enter a valid URL';
          }
        }
      } else {
        if (!val || (typeof val === 'string' && val.trim() === '')) {
          newErrors[field.id] = 'This field is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [schema, values]);

  // ─── Submit ───
  const handleSubmit = useCallback(async () => {
    if (!schema || !blobId) return;
    if (!validate()) return;

    setPageState('submitting');
    const loadingId = addToast({
      type: 'loading',
      title: 'Uploading to Walrus...',
      description: schema.sensitive
        ? 'Encrypting and storing your submission.'
        : 'Storing your submission as a permanent blob.',
    });

    try {
      const fieldSubmissions: FieldSubmission[] = schema.fields.map((f) => ({
        fieldId: f.id,
        value: values[f.id],
      }));

      const submission: FormSubmission = {
        id: uuidv4(),
        formBlobId: blobId,
        fields: fieldSubmissions,
        submittedAt: Date.now(),
        encrypted: schema.sensitive,
      };

      let dataToUpload: unknown = submission;

      // Encrypt if sensitive
      if (schema.sensitive) {
        const encrypted = await sealEncrypt(
          JSON.stringify(submission),
          schema.creatorAddress
        );
        dataToUpload = {
          encrypted: true,
          payload: encrypted,
          formBlobId: blobId,
          submittedAt: submission.submittedAt,
        };
      }

      const subBlobId = await uploadToWalrus(dataToUpload);

      // Try to update index blob (best-effort)
      try {
        // We need to find the index blob. For demo, we create/update one
        // In production this would be tracked onchain via a Sui object
        const indexKey = `formseal-index-${blobId}`;
        const existingIndexBlobId = localStorage.getItem(indexKey);

        let index: FormIndex;
        if (existingIndexBlobId) {
          try {
            index = await fetchFromWalrus<FormIndex>(existingIndexBlobId);
            index.submissionBlobIds.push(subBlobId);
            index.updatedAt = Date.now();
          } catch {
            index = {
              formBlobId: blobId,
              creatorAddress: schema.creatorAddress,
              submissionBlobIds: [subBlobId],
              updatedAt: Date.now(),
            };
          }
        } else {
          index = {
            formBlobId: blobId,
            creatorAddress: schema.creatorAddress,
            submissionBlobIds: [subBlobId],
            updatedAt: Date.now(),
          };
        }

        const newIndexBlobId = await uploadToWalrus(index);
        localStorage.setItem(indexKey, newIndexBlobId);
      } catch {
        // Index update is best-effort for the hackathon
        console.warn('Index blob update failed — non-critical');
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
  }, [schema, blobId, values, validate, addToast, removeToast]);

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
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center animate-fade-in-scale">
          <div className="doppelrand">
            <div className="doppelrand-inner p-8 md:p-10">
              <div className="w-16 h-16 rounded-full bg-accent-dim border border-accent/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle weight="fill" className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-bold mb-2">Submission Stored</h2>
              <p className="text-text-muted text-[1rem] mb-6">
                Your response has been permanently stored on the Walrus decentralized storage network.
              </p>

              {/* Blob ID Display */}
              <div className="bg-bg-input rounded-[var(--radius-lg)] border border-border-subtle p-4 mb-6">
                <div className="text-[0.6875rem] uppercase tracking-wider text-text-muted font-semibold mb-2">
                  Walrus Blob ID
                </div>
                <p className="font-mono text-[1rem] text-text-secondary break-all leading-relaxed">
                  {submittedBlobId}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={getExplorerUrl(submittedBlobId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="primary"
                    size="md"
                    icon={<ArrowSquareOut weight="bold" className="w-4 h-4" />}
                    className="w-full"
                  >
                    View on Walrus Explorer
                  </Button>
                </a>
                <Link to="/">
                  <Button variant="ghost" size="md" className="w-full">
                    Back to FormSeal
                  </Button>
                </Link>
              </div>

              {schema?.sensitive && (
                <div className="mt-6 flex items-center justify-center gap-2 text-[0.75rem] text-accent">
                  <Lock weight="fill" className="w-3.5 h-3.5" />
                  Encrypted with Seal before storage
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form Ready State ───
  if (!schema) return null;

  return (
    <div className="flex-1 px-4 pt-28 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="animate-fade-in">
          
          <div className="doppelrand">
            <div className="doppelrand-inner bg-white p-0 overflow-hidden shadow-2xl">
              
              {/* Form Header Area */}
              <div className="p-8 md:p-12 border-b border-black/[0.03] bg-black/[0.01]">
                <div className="flex items-center gap-2 mb-6">
                  {schema.sensitive && (
                    <Badge variant="accent">
                      <Lock weight="fill" className="w-3.5 h-3.5 mr-1.5" />
                      Encrypted Submission
                    </Badge>
                  )}
                  <Badge variant="default">Walrus Decentralized</Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary mb-3">
                  {schema.title || 'Untitled Form'}
                </h1>
                
                {schema.description && (
                  <p className="text-[1rem] text-text-secondary leading-relaxed max-w-[55ch]">
                    {schema.description}
                  </p>
                )}
              </div>

              {/* Form Body Area */}
              <div className="p-8 md:p-12">
                <div className="space-y-10 field-stagger">
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
                <div className="mt-12 pt-10 border-t border-black/[0.03]">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    loading={pageState === 'submitting'}
                    className="w-full h-14 !rounded-2xl text-[1.125rem] font-bold shadow-xl shadow-accent/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: schema.accentColor,
                    }}
                  >
                    {pageState === 'submitting' ? 'Uploading to Walrus...' : 'Submit Response'}
                  </Button>
                  
                  <div className="mt-8 flex items-center justify-center gap-3 text-[0.75rem] text-text-muted font-bold uppercase tracking-widest opacity-40">
                    <div className="w-8 h-px bg-current" />
                    Powered by FormSeal
                    <div className="w-8 h-px bg-current" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <ProtocolAttribution />
      </div>
    </div>
  );
}
