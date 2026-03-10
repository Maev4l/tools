import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';
import Layout from '@/components/layout/layout';
import Home from '@/pages/home';
import ConvertToPDF from '@/pages/convert-to-pdf';
import MergePDF from '@/pages/merge-pdf';
import SplitPDF from '@/pages/split-pdf';
import QRCodeGenerator from '@/pages/qrcode';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/convert2pdf" element={<ConvertToPDF />} />
          <Route path="/mergepdf" element={<MergePDF />} />
          <Route path="/splitpdf" element={<SplitPDF />} />
          <Route path="/qrcode" element={<QRCodeGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
