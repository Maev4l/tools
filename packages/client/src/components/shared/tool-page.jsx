import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Dropzone from './dropzone';

const ToolPage = ({ title, description, accept, actionLabel, onAction, showPreviews = false }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleAction = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    try {
      await onAction(files);
      toast.success('Done!');
      setFiles([]);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>

      {/* Dropzone */}
      <Dropzone files={files} onFilesChange={setFiles} accept={accept} showPreviews={showPreviews} />

      {/* Action button */}
      <div className="flex justify-center">
        <Button size="lg" disabled={files.length === 0 || processing} onClick={handleAction}>
          {processing ? 'Processing...' : actionLabel}
        </Button>
      </div>
    </div>
  );
};

export default ToolPage;
