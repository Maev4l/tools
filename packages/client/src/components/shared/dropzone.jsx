import { useMemo, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X, GripVertical, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const FILES_LIMIT = 20;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Sortable file item component
const SortableFileItem = ({ id, preview, index, showPreviews, onRemove, isNew }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-muted/50 transition-all duration-300 hover:bg-muted hover:shadow-md hover:-translate-y-0.5',
        showPreviews ? 'aspect-square' : 'flex items-center gap-2 p-2',
        isDragging && 'opacity-50 ring-2 ring-primary scale-105 rotate-2',
        isNew && 'animate-bounce-in'
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className={cn(
          'cursor-grab touch-none text-muted-foreground hover:text-foreground transition-all active:cursor-grabbing',
          showPreviews
            ? 'absolute top-1 left-1 z-10 rounded-md bg-background/90 backdrop-blur-sm p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm'
            : 'shrink-0 hover:scale-110'
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {showPreviews && preview.url ? (
        <img
          src={preview.url}
          alt={preview.file.name}
          className="h-full w-full rounded-lg object-cover"
        />
      ) : (
        <span className={cn('text-sm truncate', showPreviews ? 'absolute bottom-1 left-1 right-1 text-xs bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md' : 'flex-1')}>
          {preview.file.name}
        </span>
      )}

      <Button
        variant="destructive"
        size="icon"
        className={cn(
          'h-6 w-6 shrink-0 transition-all hover:scale-110',
          showPreviews && 'absolute top-1 right-1 opacity-0 group-hover:opacity-100 shadow-sm'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const Dropzone = ({ files, onFilesChange, accept, maxFiles = FILES_LIMIT, showPreviews = false }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [newFileIds, setNewFileIds] = useState(new Set());
  const filesRef = useRef(files);
  filesRef.current = files;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const currentFiles = filesRef.current;
      const newFiles = [...currentFiles, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(newFiles);

      // Track new file IDs for animation
      const newIds = new Set(
        acceptedFiles.map((f, i) => `${f.name}-${f.lastModified}-${currentFiles.length + i}`)
      );
      setNewFileIds(newIds);

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setNewFileIds(new Set());
      }, 800);
    },
    accept,
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  // Create stable IDs for each file
  const fileIds = useMemo(
    () => files.map((file, index) => `${file.name}-${file.lastModified}-${index}`),
    [files]
  );

  // Memoize object URLs
  const previews = useMemo(
    () =>
      files.map((file, index) => ({
        id: fileIds[index],
        file,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      })),
    [files, fileIds]
  );

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });
    };
  }, [previews]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fileIds.indexOf(active.id);
      const newIndex = fileIds.indexOf(over.id);
      const newFiles = arrayMove(files, oldIndex, newIndex);
      onFilesChange(newFiles);
    }
  };

  const acceptedTypes = accept ? Object.keys(accept).join(', ') : 'any files';

  return (
    <div className="w-full space-y-4">
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-300 cursor-pointer overflow-hidden',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
        )}
      >
        <input {...getInputProps()} />

        {/* Animated background gradient on drag */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 animate-pulse" />
        )}

        {/* Success checkmark overlay */}
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="animate-bounce-in">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            </div>
          </div>
        )}

        <div className={cn('transition-transform duration-300', isDragActive && 'scale-110')}>
          <Upload className={cn('h-10 w-10 mb-4 transition-colors', isDragActive ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {acceptedTypes} - Max {MAX_FILE_SIZE / 1024 / 1024}MB per file
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.length} file(s) selected
              <span className="text-muted-foreground font-normal ml-2">(drag to reorder)</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilesChange([])}
              className="transition-all hover:scale-105"
            >
              Clear all
            </Button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fileIds} strategy={rectSortingStrategy}>
              <div className={cn('grid gap-3', showPreviews ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6' : '')}>
                {previews.map((preview, index) => (
                  <SortableFileItem
                    key={preview.id}
                    id={preview.id}
                    preview={preview}
                    index={index}
                    showPreviews={showPreviews}
                    onRemove={removeFile}
                    isNew={newFileIds.has(preview.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
