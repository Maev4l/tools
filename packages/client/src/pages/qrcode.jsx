import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { Download, Copy, Link, Type, Mail, Wifi, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const QR_TYPES = [
  { id: 'url', label: 'URL', icon: Link, placeholder: 'https://example.com' },
  { id: 'text', label: 'Text', icon: Type, placeholder: 'Enter any text...' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'user@example.com' },
  { id: 'phone', label: 'Phone', icon: Phone, placeholder: '+1234567890' },
  { id: 'wifi', label: 'WiFi', icon: Wifi, placeholder: '' },
];

const SIZE_OPTIONS = [128, 256, 512, 1024];

const QRCodeGenerator = () => {
  const [type, setType] = useState('url');
  const [input, setInput] = useState('');
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [emailData, setEmailData] = useState({ address: '', subject: '', body: '' });
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const canvasRef = useRef(null);

  // Generate QR code when content changes
  useEffect(() => {
    // Build QR content based on type
    const getContent = () => {
      switch (type) {
        case 'url':
        case 'text':
          return input;
        case 'email': {
          const { address, subject, body } = emailData;
          if (!address) return '';
          let mailto = `mailto:${address}`;
          const params = [];
          if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
          if (body) params.push(`body=${encodeURIComponent(body)}`);
          if (params.length) mailto += `?${params.join('&')}`;
          return mailto;
        }
        case 'phone':
          return input ? `tel:${input}` : '';
        case 'wifi': {
          const { ssid, password, encryption } = wifiData;
          if (!ssid) return '';
          return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
        }
        default:
          return input;
      }
    };

    const content = getContent();
    if (!content) {
      setQrDataUrl('');
      setQrSvg('');
      return;
    }

    const options = {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    };

    // Generate PNG data URL
    QRCode.toDataURL(content, options)
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));

    // Generate SVG string
    QRCode.toString(content, { ...options, type: 'svg' })
      .then(setQrSvg)
      .catch(() => setQrSvg(''));
  }, [input, type, wifiData, emailData, size, fgColor, bgColor]);

  const downloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataUrl;
    link.click();
    toast.success('PNG downloaded');
  };

  const downloadSVG = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'qrcode.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded');
  };

  const copyToClipboard = async () => {
    if (!qrDataUrl) return;
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const hasContent = !!qrDataUrl;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">QR Code Generator</h2>
        <p className="mt-1 text-muted-foreground">Create QR codes for URLs, text, WiFi, and more</p>
      </div>

      {/* Type selection */}
      <div className="flex flex-wrap justify-center gap-2">
        {QR_TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setType(t.id);
                setInput('');
              }}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                'hover:shadow-md hover:-translate-y-0.5',
                type === t.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'hover:border-primary/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input section */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="font-medium">Content</h3>

            {/* Simple text input for url, text, phone */}
            {(type === 'url' || type === 'text' || type === 'phone') && (
              <input
                type={type === 'url' ? 'url' : type === 'phone' ? 'tel' : 'text'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={QR_TYPES.find((t) => t.id === type)?.placeholder}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}

            {/* Email fields */}
            {type === 'email' && (
              <div className="space-y-3">
                <input
                  type="email"
                  value={emailData.address}
                  onChange={(e) => setEmailData({ ...emailData, address: e.target.value })}
                  placeholder="Email address"
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Subject (optional)"
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  placeholder="Body (optional)"
                  rows={3}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            )}

            {/* WiFi fields */}
            {type === 'wifi' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={wifiData.ssid}
                  onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                  placeholder="Network name (SSID)"
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="password"
                  value={wifiData.password}
                  onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                  placeholder="Password"
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={wifiData.encryption}
                  onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No password</option>
                </select>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="font-medium">Options</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Size */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}x{s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Foreground color */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border p-1"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Background color */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm text-muted-foreground">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border p-1"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview section */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="font-medium">Preview</h3>

            <div className="flex items-center justify-center min-h-[280px] rounded-lg bg-muted/30 p-4">
              {qrDataUrl ? (
                <img
                  ref={canvasRef}
                  src={qrDataUrl}
                  alt="QR Code"
                  className="max-w-full rounded-lg shadow-lg transition-all"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm">Enter content to generate QR code</p>
                </div>
              )}
            </div>
          </div>

          {/* Download buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={downloadPNG}
              disabled={!hasContent}
              className="transition-all hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              PNG
            </Button>
            <Button
              variant="outline"
              onClick={downloadSVG}
              disabled={!hasContent}
              className="transition-all hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              SVG
            </Button>
            <Button
              variant="outline"
              onClick={copyToClipboard}
              disabled={!hasContent}
              className="transition-all hover:scale-105"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
