import { useState } from 'react';
import { toast } from 'sonner';
import PDFMerger from 'pdf-merger-js/browser';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Dropzone from '@/components/shared/dropzone';

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleMerge = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    try {
      const merger = new PDFMerger();

      for (const file of files) {
        await merger.add(file);
      }

      const [firstFile] = files;
      const [name] = firstFile.name.split('.');
      await merger.save(name);

      toast.success(`Merged ${files.length} files into ${name}.pdf`);
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
        <h2 className="text-2xl font-bold">Merge PDF Files</h2>
        <p className="mt-1 text-muted-foreground">
          Combine multiple PDF files into a single document
        </p>
      </div>

      {/* Dropzone */}
      <Dropzone
        files={files}
        onFilesChange={setFiles}
        accept={{
          'application/pdf': ['.pdf'],
        }}
      />

      {/* Action button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          disabled={files.length < 2 || processing}
          onClick={handleMerge}
          className="min-w-[200px] transition-all hover:scale-105 hover:shadow-lg"
        >
          {processing ? (
            <span className="flex items-center gap-3">
              <Spinner size="sm" />
              Merging...
            </span>
          ) : (
            `Merge ${files.length} PDF${files.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </div>

      {files.length === 1 && (
        <p className="text-center text-sm text-muted-foreground">
          Add at least 2 files to merge
        </p>
      )}
    </div>
  );
};

export default MergePDF;
