'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Copy, Check, Trash2, AlertCircle } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
// The Web Speech Recognition API is not in the standard TS DOM lib, so we type loosely.
type SpeechRecognitionType = any;

const LANGS = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'pt-BR', label: 'Portuguese (BR)' },
  { code: 'ja-JP', label: 'Japanese' },
];

export function SpeechToText() {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [lang, setLang] = useState('en-US');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const recognition: SpeechRecognitionType = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let final = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += chunk;
        else interimText += chunk;
      }
      if (final) setTranscript((prev) => (prev ? prev + ' ' : '') + final.trim());
      setInterim(interimText);
    };
    recognition.onerror = (e: any) => {
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone access was denied. Allow it in your browser settings and try again.',
        'no-speech': 'No speech detected. Try speaking closer to the microphone.',
        'audio-capture': 'No microphone was found on this device.',
      };
      setError(messages[e.error] || `Recognition error: ${e.error}`);
      setRecording(false);
    };
    recognition.onend = () => {
      setInterim('');
      setRecording(false);
    };
    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    recognitionRef.current.lang = lang;
    try {
      recognitionRef.current.start();
      setRecording(true);
    } catch {
      /* already started */
    }
  }, [lang]);

  const stop = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!supported) {
    return (
      <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <p className="text-sm">
          Your browser does not support the Web Speech Recognition API. It works best in Chrome, Edge, and other
          Chromium-based browsers; Firefox does not currently support it.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={recording ? stop : start}
          className={`relative flex items-center justify-center w-28 h-28 rounded-full text-white transition-colors ${
            recording ? 'bg-destructive' : 'bg-accent hover:bg-accent/90'
          }`}
        >
          {recording && <span className="absolute inset-0 rounded-full bg-destructive/40 animate-ping" />}
          {recording ? <Square size={36} className="relative" /> : <Mic size={40} className="relative" />}
        </button>
        <p className="text-sm font-medium text-foreground">
          {recording ? 'Listening… click to stop' : 'Click to start dictating'}
        </p>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={recording}
          className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Transcript</label>
        <div className="min-h-[160px] w-full px-4 py-3 text-sm bg-background border border-input rounded-lg whitespace-pre-wrap">
          {transcript}
          <span className="text-muted-foreground">{interim ? (transcript ? ' ' : '') + interim : ''}</span>
          {!transcript && !interim && <span className="text-muted-foreground">Your spoken words will appear here…</span>}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={copy}
          disabled={!transcript}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Transcript'}
        </button>
        <button
          onClick={() => {
            setTranscript('');
            setInterim('');
          }}
          disabled={!transcript}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
        >
          <Trash2 size={16} /> Clear
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Most browsers transcribe speech using an online service (for example, Chrome sends audio to Google), so your
        audio leaves your device for processing. Avoid dictating sensitive information.
      </p>
    </div>
  );
}
