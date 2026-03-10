import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import Dropzone from '@/components/shared/dropzone';
import { loadImage } from '@/lib/utils';

const ConvertToPDF = () => {
  const [files, setFiles] = useState([]);
  const [mergeIntoOne, setMergeIntoOne] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Create a single PDF page from an image
  const createPdfPage = async (jsPDF, doc, file, isFirst, orientation) => {
    const img = await loadImage(file);
    const isLandscape = img.width > img.height;
    const pageOrientation = orientation || (isLandscape ? 'landscape' : 'portrait');

    const pageWidth = pageOrientation === 'landscape' ? 297 : 210;
    const pageHeight = pageOrientation === 'landscape' ? 210 : 297;

    const imgRatio = img.width / img.height;
    const pageRatio = pageWidth / pageHeight;

    let width, height;
    if (imgRatio > pageRatio) {
      width = pageWidth;
      height = pageWidth / imgRatio;
    } else {
      height = pageHeight;
      width = pageHeight * imgRatio;
    }

    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    const format = file.type.split('/')[1].toUpperCase();

    if (isFirst) {
      doc = new jsPDF({ orientation: pageOrientation, unit: 'mm', format: 'a4' });
    } else {
      doc.addPage('a4', pageOrientation);
    }

    doc.addImage(img.src, format, x, y, width, height);
    return doc;
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    try {
      const { jsPDF } = await import('jspdf');

      if (mergeIntoOne) {
        let doc = null;
        for (let i = 0; i < files.length; i++) {
          doc = await createPdfPage(jsPDF, doc, files[i], i === 0);
        }
        const [firstFile] = files;
        const [name] = firstFile.name.split('.');
        doc.save(`${name}.pdf`);
        toast.success(`Created ${name}.pdf with ${files.length} page(s)`);
      } else {
        for (const file of files) {
          const doc = await createPdfPage(jsPDF, null, file, true);
          const [name] = file.name.split('.');
          doc.save(`${name}.pdf`);
        }
        toast.success(`Created ${files.length} PDF file(s)`);
      }

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
        <h2 className="text-2xl font-bold">Convert Images to PDF</h2>
        <p className="mt-1 text-muted-foreground">
          Convert PNG and JPEG images into PDF documents
        </p>
      </div>

      {/* Options */}
      <div className="flex items-center justify-center gap-3 rounded-xl border bg-muted/30 p-4 backdrop-blur-sm">
        <span className={!mergeIntoOne ? 'font-medium' : 'text-muted-foreground'}>
          Separate PDFs
        </span>
        <Switch checked={mergeIntoOne} onCheckedChange={setMergeIntoOne} />
        <span className={mergeIntoOne ? 'font-medium' : 'text-muted-foreground'}>
          Single PDF
        </span>
      </div>

      {/* Dropzone */}
      <Dropzone
        files={files}
        onFilesChange={setFiles}
        accept={{
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
        }}
        showPreviews
      />

      {/* Action button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          disabled={files.length === 0 || processing}
          onClick={handleConvert}
          className="min-w-[200px] transition-all hover:scale-105 hover:shadow-lg"
        >
          {processing ? (
            <span className="flex items-center gap-3">
              <Spinner size="sm" />
              Processing...
            </span>
          ) : mergeIntoOne ? (
            `Convert to PDF (${files.length} page${files.length !== 1 ? 's' : ''})`
          ) : (
            `Create ${files.length} PDF${files.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConvertToPDF;
