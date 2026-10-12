'use client'

import { useState, useRef, useCallback, useId } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile, UploadFolder } from '@/lib/api/admin/upload-api';
import { toast } from 'sonner';

interface ImageUploadInputProps {
  /** Currently saved URL (from DB). Shown as preview on load. */
  value?: string;
  /** Called with the new public URL after a successful upload, or '' when cleared. */
  onChange: (url: string) => void;
  /** Subfolder on the backend storage (e.g. 'merchants', 'avatars') */
  folder?: UploadFolder;
  /** Label shown above the drop zone */
  label?: string;
  /** Short hint text shown inside the drop zone */
  hint?: string;
  /** Shape of the preview: 'square' or 'circle' */
  shape?: 'square' | 'circle';
  /** Maximum file size in MB (default: 5) */
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export function ImageUploadInput({
  value,
  onChange,
  folder = 'general',
  label,
  hint,
  shape = 'square',
  maxSizeMB = 5,
  className,
  disabled = false,
}: ImageUploadInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');

  // Keep local preview in sync when the parent clears the value externally
  // (e.g. when the dialog is reset)
  if (value !== undefined && value !== previewUrl && !isUploading) {
    setPreviewUrl(value);
  }

  const processFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Invalid file type. Allowed: JPEG, PNG, WEBP, GIF, SVG.`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File too large. Max size is ${maxSizeMB}MB.`);
        return;
      }

      // Optimistic local preview
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      setIsUploading(true);

      try {
        const result = await uploadFile(file, folder);
        // Revoke the blob URL to free memory
        URL.revokeObjectURL(localUrl);
        setPreviewUrl(result.url);
        onChange(result.url);
        toast.success('Image uploaded successfully');
      } catch (err: any) {
        // Roll back the preview on error
        setPreviewUrl(value || '');
        toast.error(err?.message || 'Image upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMB, onChange, value],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-selected if cleared
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    onChange('');
  };

  const isCircle = shape === 'circle';
  const hasImage = Boolean(previewUrl);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label || 'Upload image'}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center overflow-hidden',
          'border-2 border-dashed transition-colors duration-200',
          'cursor-pointer select-none',
          isCircle ? 'rounded-full w-24 h-24' : 'rounded-xl w-full min-h-[140px]',
          isDragging
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
            : hasImage
            ? 'border-transparent'
            : 'border-muted-foreground/30 bg-muted/40 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/10',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        {/* Image preview */}
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Preview"
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              isCircle ? 'rounded-full' : 'rounded-xl',
            )}
          />
        )}

        {/* Upload overlay (shown when no image or uploading) */}
        {(!hasImage || isUploading) && (
          <div className={cn(
            'flex flex-col items-center justify-center gap-2 p-4 text-center',
            hasImage && isUploading && 'absolute inset-0 bg-black/40 rounded-xl',
          )}>
            {isUploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {hasImage ? (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                {!isCircle && (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      {isDragging ? 'Drop to upload' : 'Click or drag to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hint || `PNG, JPG, WEBP up to ${maxSizeMB}MB`}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Clear button */}
        {hasImage && !isUploading && !disabled && (
          <button
            type="button"
            aria-label="Remove image"
            onClick={handleClear}
            className={cn(
              'absolute top-1.5 right-1.5 z-10',
              'flex h-6 w-6 items-center justify-center rounded-full',
              'bg-black/60 text-white hover:bg-black/80 transition-colors',
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
