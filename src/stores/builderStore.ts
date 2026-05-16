import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FormSchema, FormField, FieldOption } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface BuilderState {
  form: FormSchema;
  activeFieldId: string | null;
  isDirty: boolean;
  isPublishing: boolean;
  publishedBlobId: string | null;

  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setAccentColor: (color: string) => void;
  setSensitive: (sensitive: boolean) => void;
  setHasCover: (hasCover: boolean) => void;
  setCoverUrl: (url: string) => void;
  setLogoUrl: (url: string) => void;
  setShowIcon: (showIcon: boolean) => void;
  setActiveField: (id: string | null) => void;

  addField: (type: FormField['type']) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  reorderFields: (oldIndex: number, newIndex: number) => void;

  addFieldOption: (fieldId: string) => void;
  updateFieldOption: (fieldId: string, optionId: string, label: string) => void;
  removeFieldOption: (fieldId: string, optionId: string) => void;

  setPublishing: (v: boolean) => void;
  setPublishedBlobId: (id: string | null) => void;
  resetBuilder: () => void;
  saveHistory: () => void;
  undoHistory: () => void;
  setForm: (form: FormSchema) => void;
  previousForm: FormSchema | null;
}

const DEFAULT_FIELD_LABELS: Record<FormField['type'], string> = {
  short_text: 'Short Answer',
  long_text: 'Long Answer',
  email: 'Email Address',
  dropdown: 'Dropdown Selection',
  checkbox_group: 'Checkbox Group',
  star_rating: 'Rating',
  file_upload: 'File Upload',
  url: 'URL',
};

const DEFAULT_PLACEHOLDERS: Record<FormField['type'], string> = {
  short_text: 'Type your answer here...',
  long_text: 'Write your detailed response...',
  email: 'hello@example.com',
  dropdown: 'Select an option',
  checkbox_group: '',
  star_rating: '',
  file_upload: '',
  url: 'https://example.com',
};

function createDefaultForm(): FormSchema {
  return {
    id: uuidv4(),
    title: '',
    description: '',
    accentColor: '#34d399',
    sensitive: false,
    fields: [],
    creatorAddress: '',
    createdAt: Date.now(),
    version: 1,
    hasCover: false,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    logoUrl: '',
    showIcon: false,
  };
}

function createField(type: FormField['type']): FormField {
  const field: FormField = {
    id: uuidv4(),
    type,
    label: '',
    labelPlaceholder: DEFAULT_FIELD_LABELS[type],
    placeholder: DEFAULT_PLACEHOLDERS[type],
    required: false,
  };

  if (type === 'dropdown' || type === 'checkbox_group') {
    field.options = [
      { id: uuidv4(), label: 'Option 1' },
      { id: uuidv4(), label: 'Option 2' },
    ];
  }

  if (type === 'file_upload') {
    field.accept = 'image/*,video/*';
  }

  return field;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      form: createDefaultForm(),
      activeFieldId: null,
      isDirty: false,
      isPublishing: false,
      publishedBlobId: null,
      previousForm: null,

      setTitle: (title) =>
        set((s) => ({ form: { ...s.form, title }, isDirty: true })),

      setDescription: (description) =>
        set((s) => ({ form: { ...s.form, description }, isDirty: true })),

      setAccentColor: (accentColor) =>
        set((s) => ({ form: { ...s.form, accentColor }, isDirty: true })),

      setSensitive: (sensitive) =>
        set((s) => ({ form: { ...s.form, sensitive }, isDirty: true })),

      setHasCover: (hasCover) =>
        set((s) => ({ form: { ...s.form, hasCover }, isDirty: true })),

      setCoverUrl: (coverUrl) =>
        set((s) => ({ form: { ...s.form, coverUrl }, isDirty: true })),
      
      setLogoUrl: (logoUrl) =>
        set((s) => ({ form: { ...s.form, logoUrl }, isDirty: true })),

      setShowIcon: (showIcon) =>
        set((s) => ({ form: { ...s.form, showIcon }, isDirty: true })),

      setActiveField: (id) => set({ activeFieldId: id }),

      addField: (type) =>
        set((s) => {
          const field = createField(type);
          return {
            form: { ...s.form, fields: [...s.form.fields, field] },
            activeFieldId: field.id,
            isDirty: true,
          };
        }),

      removeField: (id) =>
        set((s) => ({
          form: {
            ...s.form,
            fields: s.form.fields.filter((f) => f.id !== id),
          },
          activeFieldId:
            s.activeFieldId === id ? null : s.activeFieldId,
          isDirty: true,
        })),

      updateField: (id, updates) =>
        set((s) => ({
          form: {
            ...s.form,
            fields: s.form.fields.map((f) =>
              f.id === id ? { ...f, ...updates } : f
            ),
          },
          isDirty: true,
        })),

      reorderFields: (oldIndex, newIndex) =>
        set((s) => {
          const fields = [...s.form.fields];
          const [removed] = fields.splice(oldIndex, 1);
          fields.splice(newIndex, 0, removed);
          return { form: { ...s.form, fields }, isDirty: true };
        }),

      addFieldOption: (fieldId) =>
        set((s) => ({
          form: {
            ...s.form,
            fields: s.form.fields.map((f) => {
              if (f.id !== fieldId) return f;
              const newOption: FieldOption = {
                id: uuidv4(),
                label: `Option ${(f.options?.length ?? 0) + 1}`,
              };
              return {
                ...f,
                options: [...(f.options ?? []), newOption],
              };
            }),
          },
          isDirty: true,
        })),

      updateFieldOption: (fieldId, optionId, label) =>
        set((s) => ({
          form: {
            ...s.form,
            fields: s.form.fields.map((f) => {
              if (f.id !== fieldId) return f;
              return {
                ...f,
                options: f.options?.map((o) =>
                  o.id === optionId ? { ...o, label } : o
                ),
              };
            }),
          },
          isDirty: true,
        })),

      removeFieldOption: (fieldId, optionId) =>
        set((s) => ({
          form: {
            ...s.form,
            fields: s.form.fields.map((f) => {
              if (f.id !== fieldId) return f;
              return {
                ...f,
                options: f.options?.filter((o) => o.id !== optionId),
              };
            }),
          },
          isDirty: true,
        })),

      setPublishing: (isPublishing) => set({ isPublishing }),
      setPublishedBlobId: (publishedBlobId) => set({ publishedBlobId }),
      resetBuilder: () =>
        set({
          form: createDefaultForm(),
          activeFieldId: null,
          isDirty: false,
          isPublishing: false,
          publishedBlobId: null,
        }),
      saveHistory: () => set({ previousForm: JSON.parse(JSON.stringify(get().form)) }),
      undoHistory: () => {
        const prev = get().previousForm;
        if (prev) {
          set({ form: prev, previousForm: null, isDirty: true });
        } else {
          get().resetBuilder();
        }
      },
      setForm: (form) => set({ form, isDirty: true }),
    }),
    {
      name: 'formseal-builder',
      partialize: (state) => ({
        form: state.form,
      }),
    }
  )
);
