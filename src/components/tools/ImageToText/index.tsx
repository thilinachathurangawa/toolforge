'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Download, Copy, Check, X, ScanText, AlertCircle } from 'lucide-react';

type TesseractModule = typeof import('tesseract.js');
type TesseractWorker = Awaited<ReturnType<TesseractModule['createWorker']>>;
type TesseractPage = Awaited<ReturnType<TesseractWorker['recognize']>>['data'];

type OcrStatus = 'idle' | 'ready' | 'loading' | 'recognizing' | 'done' | 'error';

const LANGS = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'por', label: 'Portuguese' },
  { code: 'ita', label: 'Italian' },
  { code: 'hin', label: 'Hindi' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
];

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp'];

// Rebuild the text from Tesseract's block → paragraph → line tree so paragraph
// spacing survives; data.text alone flattens some of that structure.
function buildLayoutText(page: TesseractPage): string {
  if (page.blocks && page.blocks.length > 0) {
    const paragraphs: string[] = [];
    for (const block of page.blocks) {
      for (const para of block.paragraphs ?? []) {
        const lines = (para.lines ?? [])
          .map((line) => line.text.replace(/\s+$/, ''))
          .filter((line) => line.length > 0);
        if (lines.length > 0) paragraphs.push(lines.join('\n'));
      }
    }
    if (paragraphs.length > 0) return paragraphs.join('\n\n');
  }
  return (page.text ?? '').trim();
}

export function ImageToText() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState('eng');
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<TesseractWorker | null>(null);
  const workerLangRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate().catch(() => undefined);
    workerRef.current = null;
    workerLangRef.current = null;
  }, []);

  useEffect(() => terminateWorker, [terminateWorker]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const acceptFile = useCallback((candidate: File | null | undefined) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError('That file type is not supported. Please use a PNG, JPG, WebP, or BMP image.');
      return;
    }
    setFile(candidate);
    setPreviewUrl(URL.createObjectURL(candidate));
    setStatus('ready');
    setText('');
    setConfidence(null);
    setError(null);
  }, []);

  // Let the user paste a screenshot straight from the clipboard (Ctrl+V).
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith('image/')
      );
      if (item) acceptFile(item.getAsFile());
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [acceptFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      acceptFile(e.dataTransfer.files?.[0]);
    },
    [acceptFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const extractText = async () => {
    if (!file || busyRef.current) return;
    busyRef.current = true;
    setError(null);
    setText('');
    setConfidence(null);
    setProgress(0);
    setStatus('loading');
    setStage('Loading OCR engine…');

    try {
      const { createWorker } = await import('tesseract.js');

      if (workerRef.current && workerLangRef.current !== language) {
        terminateWorker();
      }
      if (!workerRef.current) {
        workerRef.current = await createWorker(language, 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setStatus('recognizing');
              setStage('Recognizing text…');
              setProgress(Math.round(m.progress * 100));
            } else {
              setStatus('loading');
              setStage('Loading OCR engine and language data…');
            }
          },
        });
        workerLangRef.current = language;
      }

      setStatus('recognizing');
      setStage('Recognizing text…');
      const { data } = await workerRef.current.recognize(file, {}, { text: true, blocks: true });
      const result = buildLayoutText(data);

      setText(result);
      setConfidence(Number.isFinite(data.confidence) ? Math.round(data.confidence) : null);
      setProgress(100);
      setStatus('done');
    } catch (err) {
      console.error('OCR failed:', err);
      terminateWorker();
      setStatus('error');
      setError(
        'Text recognition failed. The image may be unreadable, or the OCR engine could not be downloaded — check your connection and try again.'
      );
    } finally {
      busyRef.current = false;
    }
  };

  const clearAll = () => {
    terminateWorker();
    setFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setStage('');
    setProgress(0);
    setText('');
    setConfidence(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const base = file ? file.name.replace(/\.[^/.]+$/, '') : 'extracted-text';
    a.download = `${base}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isBusy = status === 'loading' || status === 'recognizing';

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          id="ocr-image-upload"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />
        <div onDrop={handleDrop} onDragOver={handleDragOver}>
          <label
            htmlFor="ocr-image-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drop an image here, paste a screenshot (Ctrl+V), or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, BMP supported</p>
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <button
              onClick={clearAll}
              className="p-1 hover:bg-background rounded transition-colors shrink-0"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      {file && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="ocr-language" className="text-sm font-medium text-foreground shrink-0">
              Language of the text:
            </label>
            <select
              id="ocr-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isBusy}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={extractText}
            disabled={isBusy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ScanText size={18} />
            {isBusy ? stage : 'Extract Text'}
          </button>

          {isBusy && (
            <div className="space-y-1">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${status === 'recognizing' ? progress : 5}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {status === 'loading'
                  ? 'First run downloads the OCR engine (~10–15 MB); later runs start instantly.'
                  : `${progress}%`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {status === 'done' && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-foreground">Extracted Text</h3>
            {confidence !== null && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  confidence >= 80
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-600'
                }`}
              >
                Confidence: {confidence}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Image</p>
              <div className="border rounded-lg p-2 bg-background">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Uploaded for text extraction"
                    className="w-full h-auto object-contain max-h-80"
                  />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Text (editable)</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="No text was found in this image."
                className="w-full h-80 p-3 bg-background border border-border rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {text.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No text was detected. Try a sharper, higher-resolution image, or check that the
              selected language matches the text.
            </p>
          )}

          {confidence !== null && confidence < 80 && text.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Low confidence — review the output for misread words. Sharper, well-lit images of
              printed text give the best results.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={copyText}
              disabled={text.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button
              onClick={downloadTxt}
              disabled={text.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Download .txt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
