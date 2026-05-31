'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, QrCode, Wifi, Mail, Phone, MessageSquare, Link, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi';

interface QROptions {
  type: QRType;
  input: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

interface WiFiConfig {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export function QRGenerator() {
  const [options, setOptions] = useState<QROptions>({
    type: 'url',
    input: '',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    size: 256,
    errorCorrectionLevel: 'M',
  });

  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false,
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRData = () => {
    switch (options.type) {
      case 'url':
        return options.input;
      case 'text':
        return options.input;
      case 'email':
        return `mailto:${options.input}`;
      case 'phone':
        return `tel:${options.input}`;
      case 'sms':
        const [phone, message] = options.input.split('|');
        return message ? `sms:${phone}?body=${encodeURIComponent(message)}` : `sms:${phone}`;
      case 'wifi':
        const wifiString = `WIFI:T:${wifiConfig.security};S:${wifiConfig.ssid};P:${wifiConfig.password};H:${wifiConfig.hidden};;`;
        return wifiString;
      default:
        return options.input;
    }
  };

  const generateQR = async () => {
    const data = generateQRData();
    if (!data) {
      setQrDataUrl('');
      setQrSvg('');
      return;
    }

    try {
      // Generate PNG
      const dataUrl = await QRCode.toDataURL(data, {
        width: options.size,
        margin: 2,
        color: {
          dark: options.foregroundColor,
          light: options.backgroundColor,
        },
        errorCorrectionLevel: options.errorCorrectionLevel,
      });
      setQrDataUrl(dataUrl);

      // Generate SVG
      const svg = await QRCode.toString(data, {
        type: 'svg',
        width: options.size,
        margin: 2,
        color: {
          dark: options.foregroundColor,
          light: options.backgroundColor,
        },
        errorCorrectionLevel: options.errorCorrectionLevel,
      });
      setQrSvg(svg);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  useEffect(() => {
    generateQR();
  }, [options, wifiConfig]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qrcode-${options.type}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleDownloadSVG = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode-${options.type}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const getTypeIcon = () => {
    switch (options.type) {
      case 'url': return <Link size={20} />;
      case 'text': return <Type size={20} />;
      case 'email': return <Mail size={20} />;
      case 'phone': return <Phone size={20} />;
      case 'sms': return <MessageSquare size={20} />;
      case 'wifi': return <Wifi size={20} />;
    }
  };

  const getTypeLabel = () => {
    switch (options.type) {
      case 'url': return 'URL';
      case 'text': return 'Plain Text';
      case 'email': return 'Email';
      case 'phone': return 'Phone';
      case 'sms': return 'SMS';
      case 'wifi': return 'WiFi';
    }
  };

  const getInputPlaceholder = () => {
    switch (options.type) {
      case 'url': return 'https://example.com';
      case 'text': return 'Enter your text';
      case 'email': return 'user@example.com';
      case 'phone': return '+1234567890';
      case 'sms': return '+1234567890|Your message';
      case 'wifi': return 'SSID entered below';
    }
  };

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-4">
          {/* Type Selector */}
          <div className="p-4 border border-border rounded-xl bg-card">
            <label className="text-sm font-medium text-foreground mb-3 block">QR Code Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['url', 'text', 'email', 'phone', 'sms', 'wifi'] as QRType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setOptions({ ...options, type })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                    options.type === type
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {type === 'url' && <Link size={20} />}
                  {type === 'text' && <Type size={20} />}
                  {type === 'email' && <Mail size={20} />}
                  {type === 'phone' && <Phone size={20} />}
                  {type === 'sms' && <MessageSquare size={20} />}
                  {type === 'wifi' && <Wifi size={20} />}
                  <span className="text-xs font-medium capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Field */}
          {options.type !== 'wifi' && (
            <div className="p-4 border border-border rounded-xl bg-card">
              <label className="text-sm font-medium text-foreground mb-2 block">
                {getTypeLabel()}
              </label>
              <input
                type="text"
                value={options.input}
                onChange={(e) => setOptions({ ...options, input: e.target.value })}
                placeholder={getInputPlaceholder()}
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              {options.type === 'sms' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Format: phone|message (e.g., +1234567890|Hello)
                </p>
              )}
            </div>
          )}

          {/* WiFi Config */}
          {options.type === 'wifi' && (
            <div className="p-4 border border-border rounded-xl bg-card space-y-3">
              <label className="text-sm font-medium text-foreground">WiFi Configuration</label>
              <input
                type="text"
                value={wifiConfig.ssid}
                onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                placeholder="Network Name (SSID)"
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <input
                type="password"
                value={wifiConfig.password}
                onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                placeholder="Password"
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <select
                value={wifiConfig.security}
                onChange={(e) => setWifiConfig({ ...wifiConfig, security: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={wifiConfig.hidden}
                  onChange={(e) => setWifiConfig({ ...wifiConfig, hidden: e.target.checked })}
                  className="rounded accent-accent"
                />
                Hidden Network
              </label>
            </div>
          )}

          {/* Colors */}
          <div className="p-4 border border-border rounded-xl bg-card">
            <label className="text-sm font-medium text-foreground mb-3 block">Colors</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Foreground</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.foregroundColor}
                    onChange={(e) => setOptions({ ...options, foregroundColor: e.target.value })}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={options.foregroundColor}
                    onChange={(e) => setOptions({ ...options, foregroundColor: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm border border-border rounded bg-muted/50 text-foreground font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.backgroundColor}
                    onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={options.backgroundColor}
                    onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm border border-border rounded bg-muted/50 text-foreground font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Size & Error Correction */}
          <div className="p-4 border border-border rounded-xl bg-card space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Size</label>
                <span className="text-sm font-mono text-accent">{options.size}px</span>
              </div>
              <input
                type="range"
                min="128"
                max="1024"
                step="32"
                value={options.size}
                onChange={(e) => setOptions({ ...options, size: parseInt(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Error Correction</label>
              <div className="grid grid-cols-4 gap-2">
                {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setOptions({ ...options, errorCorrectionLevel: level })}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                      options.errorCorrectionLevel === level
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                L: Low (7%), M: Medium (15%), Q: Quartile (25%), H: High (30%)
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-xl bg-card space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <QrCode size={18} />
              QR Preview
            </div>
            
            <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg min-h-[280px]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code Preview"
                  className="max-w-full h-auto"
                  style={{ maxWidth: `${options.size}px` }}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enter data to generate QR code</p>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-muted-foreground">
              {options.size} × {options.size} pixels
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadPNG}
                disabled={!qrDataUrl}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                PNG
              </button>
              <button
                onClick={handleDownloadSVG}
                disabled={!qrSvg}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                SVG
              </button>
            </div>

            <button
              onClick={handleCopy}
              disabled={!qrDataUrl}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80",
                !qrDataUrl && "opacity-50 cursor-not-allowed"
              )}
            >
              {copied ? <Copy size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
