import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, Check, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Set worker path for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const SPLIT_MODES = [
  { id: 'extract', label: 'Extract Pages', description: 'Select pages to keep' },
  { id: 'remove', label: 'Remove Pages', description: 'Select pages to delete' },
  { id: 'every', label: 'Split Every N', description: 'Split into chunks of N pages' },
  { id: 'single', label: 'Single Pages', description: 'Each page as separate PDF' },
];

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState('extract');
  const [splitEveryN, setSplitEveryN] = useState(1);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Load PDF and generate thumbnails
  const loadPdf = useCallback(async (pdfFile) => {
    setLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      const pageCount = pdf.numPages;

      const thumbnails = [];
      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const scale = 0.3;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        thumbnails.push({
          pageNum: i,
          dataUrl: canvas.toDataURL(),
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPages(thumbnails);
      setSelectedPages(new Set());
    } catch (error) {
      toast.error(`Failed to load PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load high-res preview for a specific page
  const loadPreview = useCallback(
    async (pageNum) => {
      if (!pdfDoc) return;

      setPreviewLoading(true);
      try {
        const page = await pdfDoc.getPage(pageNum);
        const scale = 2; // Higher resolution for preview
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        setPreviewImage(canvas.toDataURL());
      } catch (error) {
        toast.error(`Failed to load preview: ${error.message}`);
      } finally {
        setPreviewLoading(false);
      }
    },
    [pdfDoc]
  );

  // Open preview modal
  const openPreview = (pageNum, e) => {
    e.stopPropagation();
    setPreviewPage(pageNum);
    setPreviewOpen(true);
    loadPreview(pageNum);
  };

  // Navigate preview
  const navigatePreview = useCallback(
    (direction) => {
      const newPage = previewPage + direction;
      if (newPage >= 1 && newPage <= pages.length) {
        setPreviewPage(newPage);
        setPreviewImage(null);
        loadPreview(newPage);
      }
    },
    [previewPage, pages.length, loadPreview]
  );

  // Keyboard navigation for preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!previewOpen) return;
      if (e.key === 'ArrowLeft') navigatePreview(-1);
      if (e.key === 'ArrowRight') navigatePreview(1);
      if (e.key === 'Escape') setPreviewOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewOpen, navigatePreview]);

  // Handle file drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer?.files[0] || e.target.files?.[0];
      if (droppedFile && droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        loadPdf(droppedFile);
      }
    },
    [loadPdf]
  );

  // Handle page click with shift support
  const handlePageClick = (index, event) => {
    if (mode !== 'extract' && mode !== 'remove') return;

    const newSelected = new Set(selectedPages);
    const pageNum = index + 1;

    if (event.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      for (let i = start; i <= end; i++) {
        newSelected.add(i + 1);
      }
    } else {
      if (newSelected.has(pageNum)) {
        newSelected.delete(pageNum);
      } else {
        newSelected.add(pageNum);
      }
    }

    setSelectedPages(newSelected);
    setLastClickedIndex(index);
  };

  // Select all / none
  const selectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map((_, i) => i + 1)));
    }
  };

  // Process and download
  const handleSplit = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDocument.getPageCount();
      const [baseName] = file.name.split('.');

      if (mode === 'extract') {
        const newPdf = await PDFDocument.create();
        const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);

        for (const pageNum of sortedPages) {
          const [copiedPage] = await newPdf.copyPages(pdfDocument, [pageNum - 1]);
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        downloadPdf(pdfBytes, `${baseName}_extracted.pdf`);
        toast.success(`Extracted ${sortedPages.length} pages`);
      } else if (mode === 'remove') {
        const newPdf = await PDFDocument.create();
        const pagesToKeep = [];

        for (let i = 1; i <= totalPages; i++) {
          if (!selectedPages.has(i)) {
            pagesToKeep.push(i);
          }
        }

        for (const pageNum of pagesToKeep) {
          const [copiedPage] = await newPdf.copyPages(pdfDocument, [pageNum - 1]);
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        downloadPdf(pdfBytes, `${baseName}_modified.pdf`);
        toast.success(`Removed ${selectedPages.size} pages, kept ${pagesToKeep.length}`);
      } else if (mode === 'single') {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDocument, [i]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          downloadPdf(pdfBytes, `${baseName}_page${i + 1}.pdf`);
        }
        toast.success(`Created ${totalPages} separate PDFs`);
      } else if (mode === 'every') {
        const chunks = Math.ceil(totalPages / splitEveryN);
        for (let chunk = 0; chunk < chunks; chunk++) {
          const newPdf = await PDFDocument.create();
          const start = chunk * splitEveryN;
          const end = Math.min(start + splitEveryN, totalPages);

          for (let i = start; i < end; i++) {
            const [copiedPage] = await newPdf.copyPages(pdfDocument, [i]);
            newPdf.addPage(copiedPage);
          }

          const pdfBytes = await newPdf.save();
          downloadPdf(pdfBytes, `${baseName}_part${chunk + 1}.pdf`);
        }
        toast.success(`Split into ${chunks} PDFs`);
      }

      setFile(null);
      setPages([]);
      setPdfDoc(null);
      setSelectedPages(new Set());
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const downloadPdf = (bytes, filename) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canSplit =
    file &&
    ((mode === 'extract' && selectedPages.size > 0) ||
      (mode === 'remove' && selectedPages.size > 0 && selectedPages.size < pages.length) ||
      mode === 'single' ||
      (mode === 'every' && splitEveryN > 0));

  const isRemoveMode = mode === 'remove';
  const isSelectable = mode === 'extract' || mode === 'remove';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Split PDF</h2>
        <p className="mt-1 text-muted-foreground">Extract pages or split into multiple documents</p>
      </div>

      {/* Mode selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SPLIT_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'rounded-xl border p-4 text-left transition-all duration-200',
              'hover:shadow-md hover:-translate-y-0.5',
              mode === m.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'hover:border-primary/50'
            )}
          >
            <div className="font-medium">{m.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{m.description}</div>
          </button>
        ))}
      </div>

      {/* Split every N input */}
      {mode === 'every' && (
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm">Split every</span>
          <input
            type="number"
            min="1"
            max={pages.length || 100}
            value={splitEveryN}
            onChange={(e) => setSplitEveryN(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 rounded-lg border bg-background px-3 py-2 text-center text-sm"
          />
          <span className="text-sm">page(s)</span>
        </div>
      )}

      {/* Dropzone / PDF preview */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12',
            'cursor-pointer transition-all duration-300',
            'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleDrop}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer text-center">
            <Upload className="h-10 w-10 mb-4 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">Drop a PDF here, or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF files only</p>
          </label>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">Loading PDF...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File info & actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium">{file.name}</span>
              <span className="text-sm text-muted-foreground">({pages.length} pages)</span>
            </div>
            <div className="flex items-center gap-2">
              {isSelectable && (
                <>
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    {selectedPages.size === pages.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className={cn('text-sm', isRemoveMode ? 'text-destructive' : 'text-muted-foreground')}>
                    {selectedPages.size} {isRemoveMode ? 'to remove' : 'selected'}
                  </span>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setPdfDoc(null);
                  setSelectedPages(new Set());
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {/* Page thumbnails */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {pages.map((page, index) => {
              const isSelected = selectedPages.has(page.pageNum);

              return (
                <div
                  key={page.pageNum}
                  onClick={(e) => handlePageClick(index, e)}
                  className={cn(
                    'group relative rounded-lg border overflow-hidden transition-all duration-200',
                    isSelectable && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5',
                    isSelected && !isRemoveMode && 'ring-2 ring-primary border-primary',
                    isSelected && isRemoveMode && 'ring-2 ring-destructive border-destructive',
                    !isSelectable && 'cursor-default'
                  )}
                >
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNum}`}
                    className={cn('w-full h-auto transition-all', isSelected && isRemoveMode && 'opacity-40')}
                  />

                  {/* Strikethrough overlay for remove mode */}
                  {isSelected && isRemoveMode && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <X className="h-8 w-8 text-destructive" />
                    </div>
                  )}

                  {/* Zoom button */}
                  <button
                    onClick={(e) => openPreview(page.pageNum, e)}
                    className={cn(
                      'absolute top-1 left-1 h-6 w-6 rounded-full flex items-center justify-center',
                      'bg-background/90 backdrop-blur-sm border shadow-sm',
                      'opacity-0 group-hover:opacity-100 transition-all duration-200',
                      'hover:bg-primary hover:text-primary-foreground hover:scale-110'
                    )}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </button>

                  {/* Selection indicator */}
                  {isSelectable && (
                    <div
                      className={cn(
                        'absolute top-1 right-1 h-5 w-5 rounded-full flex items-center justify-center transition-all',
                        isSelected && !isRemoveMode && 'bg-primary text-primary-foreground',
                        isSelected && isRemoveMode && 'bg-destructive text-destructive-foreground',
                        !isSelected && 'bg-background/80 border opacity-0 group-hover:opacity-100'
                      )}
                    >
                      {isSelected && !isRemoveMode && <Check className="h-3 w-3" />}
                      {isSelected && isRemoveMode && <X className="h-3 w-3" />}
                    </div>
                  )}

                  {/* Page number */}
                  <div className="absolute bottom-0 inset-x-0 bg-background/90 backdrop-blur-sm text-center text-xs py-1">
                    {page.pageNum}
                  </div>
                </div>
              );
            })}
          </div>

          {isSelectable && (
            <p className={cn('text-xs text-center', isRemoveMode ? 'text-destructive/70' : 'text-muted-foreground')}>
              Click to {isRemoveMode ? 'mark pages for removal' : 'select pages'}. Hold Shift for range. Click <ZoomIn className="h-3 w-3 inline" /> to preview.
            </p>
          )}
        </div>
      )}

      {/* Action button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          disabled={!canSplit || processing}
          onClick={handleSplit}
          className="min-w-[200px] transition-all hover:scale-105 hover:shadow-lg"
        >
          {processing ? (
            <span className="flex items-center gap-3">
              <Spinner size="sm" />
              Processing...
            </span>
          ) : mode === 'extract' ? (
            `Extract ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`
          ) : mode === 'remove' ? (
            `Remove ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`
          ) : mode === 'single' ? (
            `Split into ${pages.length} PDFs`
          ) : (
            `Split into ${Math.ceil(pages.length / splitEveryN)} PDFs`
          )}
        </Button>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-medium">
                Page {previewPage} of {pages.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigatePreview(-1)}
                  disabled={previewPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigatePreview(1)}
                  disabled={previewPage >= pages.length}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview image */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/30">
              {previewLoading ? (
                <Spinner size="lg" />
              ) : previewImage ? (
                <img
                  src={previewImage}
                  alt={`Page ${previewPage}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              ) : null}
            </div>

            {/* Footer hint */}
            <div className="p-2 border-t text-center text-xs text-muted-foreground">
              Use arrow keys to navigate
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SplitPDF;
