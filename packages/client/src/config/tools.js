import { FileImage, Files, Scissors, QrCode } from 'lucide-react';

// Tool categories with accent colors
export const TOOL_CATEGORIES = [
  {
    id: 'pdf',
    label: 'PDF Tools',
    color: 'rose',
    tools: [
      {
        id: 'convert2pdf',
        path: '/convert2pdf',
        label: 'Images to PDF',
        description: 'Convert PNG and JPEG images to PDF',
        icon: FileImage,
      },
      {
        id: 'mergepdf',
        path: '/mergepdf',
        label: 'Merge PDFs',
        description: 'Combine multiple PDF files into one',
        icon: Files,
      },
      {
        id: 'splitpdf',
        path: '/splitpdf',
        label: 'Split PDF',
        description: 'Extract pages or split into multiple PDFs',
        icon: Scissors,
      },
    ],
  },
  {
    id: 'generators',
    label: 'Generators',
    color: 'violet',
    tools: [
      {
        id: 'qrcode',
        path: '/qrcode',
        label: 'QR Code',
        description: 'Generate QR codes for URLs, WiFi, and more',
        icon: QrCode,
      },
    ],
  },
];

// Color mappings for categories
export const CATEGORY_COLORS = {
  rose: {
    bg: 'bg-rose-500/10',
    bgHover: 'hover:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
    gradient: 'from-rose-500 to-pink-500',
  },
  blue: {
    bg: 'bg-blue-500/10',
    bgHover: 'hover:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    gradient: 'from-blue-500 to-cyan-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    bgHover: 'hover:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    gradient: 'from-amber-500 to-orange-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    bgHover: 'hover:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    gradient: 'from-emerald-500 to-teal-500',
  },
  violet: {
    bg: 'bg-violet-500/10',
    bgHover: 'hover:bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20',
    gradient: 'from-violet-500 to-purple-500',
  },
};

// Flat list of all tools for search
export const ALL_TOOLS = TOOL_CATEGORIES.flatMap((category) =>
  category.tools.map((tool) => ({
    ...tool,
    category: category.label,
    color: category.color,
  }))
);
