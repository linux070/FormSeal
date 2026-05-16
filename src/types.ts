/* ─── Field Types ─── */
export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'dropdown'
  | 'checkbox_group'
  | 'star_rating'
  | 'file_upload'
  | 'url';

export interface FieldOption {
  id: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  labelPlaceholder?: string;
  required: boolean;
  options?: FieldOption[];
  accept?: string; // for file_upload: 'image/*' | 'video/*' | 'image/*,video/*'
}

/* ─── Form Schema ─── */
export interface FormSchema {
  id: string;
  title: string;
  description: string;
  accentColor: string;
  sensitive: boolean;
  fields: FormField[];
  creatorAddress: string;
  createdAt: number;
  version: number;
  hasCover?: boolean;
  coverUrl?: string;
  logoUrl?: string;
  showIcon?: boolean;
}

/* ─── Submission ─── */
export interface FieldSubmission {
  fieldId: string;
  value: string | string[] | number | null;
}

export interface FormSubmission {
  id: string;
  formBlobId: string;
  fields: FieldSubmission[];
  submittedAt: number;
  encrypted: boolean;
}

/* ─── Index Blob ─── */
export interface FormIndex {
  formBlobId: string;
  creatorAddress: string;
  submissionBlobIds: string[];
  updatedAt: number;
}

/* ─── Dashboard ─── */
export type PriorityTag = 'low' | 'medium' | 'high' | 'critical';

export interface SubmissionMeta {
  blobId: string;
  submission: FormSubmission;
  notes: string;
  priority: PriorityTag;
  decrypted: boolean;
}

/* ─── Walrus ─── */
export interface WalrusUploadResponse {
  newlyCreated?: {
    blobObject: {
      blobId: string;
      id: string;
    };
  };
  alreadyCertified?: {
    blobId: string;
  };
}

/* ─── UI State ─── */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'loading';
  title: string;
  description?: string;
  blobId?: string;
}
