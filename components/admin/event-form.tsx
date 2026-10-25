// components/admin/event-form.tsx
'use client';

import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { eventSchema, type EventInput } from '@/schemas/event.schema';
import { slugify } from '@/lib/slugify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { RichTextEditor } from '@/components/admin/rich-text-editor';

interface EventFormProps {
  defaultValues?: Partial<EventInput>;
  onSubmit: (values: EventInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function EventForm({ defaultValues, onSubmit, isSubmitting, submitLabel = 'Simpan' }: EventFormProps) {
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      description: defaultValues?.description ?? '',
      coverImageUrl: defaultValues?.coverImageUrl ?? null,
      eventDate: defaultValues?.eventDate ?? '',
      eventTime: defaultValues?.eventTime ?? '',
      meetingPoint: defaultValues?.meetingPoint ?? '',
      quota: defaultValues?.quota ?? 0,
    } as EventInput,
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field name="coverImageUrl">
        {(field) => (
          <div className="space-y-2">
            <Label>Cover Event</Label>
            <ImageUploadField value={field.state.value ?? null} onChange={(url) => field.handleChange(url)} folder="events" />
          </div>
        )}
      </form.Field>

      <form.Field name="name" validators={{ onChange: eventSchema.shape.name }}>
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="name">Nama Event</Label>
            <Input
              id="name"
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                if (!isSlugEdited) {
                  form.setFieldValue('slug', slugify(e.target.value));
                }
              }}
              onBlur={field.handleBlur}
              placeholder="Pelan Pelan Lari Vol. 16"
            />
            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
          </div>
        )}
      </form.Field>

      <form.Field name="slug" validators={{ onChange: eventSchema.shape.slug }}>
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="slug">Slug URL</Label>
            <Input
              id="slug"
              value={field.state.value}
              onChange={(e) => {
                setIsSlugEdited(true);
                field.handleChange(e.target.value);
              }}
              onBlur={field.handleBlur}
              placeholder="pelan-pelan-lari-vol-16"
            />
            <p className="text-sm text-muted-foreground">URL: /events/{field.state.value || '...'}</p>
            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
          </div>
        )}
      </form.Field>

      <form.Field name="description" validators={{ onChange: eventSchema.shape.description }}>
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <RichTextEditor value={field.state.value} onChange={(html) => field.handleChange(html)} placeholder="Ceritakan tentang event ini..." />
            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="eventDate" validators={{ onChange: eventSchema.shape.eventDate }}>
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="eventDate">Tanggal</Label>
              <Input id="eventDate" type="date" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
              {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
            </div>
          )}
        </form.Field>

        <form.Field name="eventTime" validators={{ onChange: eventSchema.shape.eventTime }}>
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="eventTime">Jam</Label>
              <Input id="eventTime" type="time" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
              {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="meetingPoint" validators={{ onChange: eventSchema.shape.meetingPoint }}>
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="meetingPoint">Meeting Point</Label>
            <Input id="meetingPoint" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="Lapangan Merdeka, Medan" />
            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
          </div>
        )}
      </form.Field>

      <form.Field name="quota" validators={{ onChange: eventSchema.shape.quota }}>
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="quota">Kuota Peserta</Label>
            <Input id="quota" type="number" min={1} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} onBlur={field.handleBlur} placeholder="100" />
            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
          </div>
        )}
      </form.Field>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : submitLabel}
      </Button>
    </form>
  );
}
