'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, RotateCw, AlertCircle } from 'lucide-react';

export function TextToSpeech() {
  const [supported, setSupported] = useState(true);
  const [text, setText] = useState('Hello! This is the ToolForge text to speech reader. Type anything and press play.');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>('');
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      setVoiceURI((prev) => prev || list.find((v) => v.default)?.voiceURI || list[0]?.voiceURI || '');
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const play = useCallback(() => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice) u.voice = voice;
    u.pitch = pitch;
    u.rate = rate;
    u.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    u.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setSpeaking(true);
    setPaused(false);
  }, [supported, text, voices, voiceURI, pitch, rate]);

  const pause = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };
  const resume = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };
  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  if (!supported) {
    return (
      <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <p className="text-sm">
          Your browser does not support the Web Speech Synthesis API. Try the latest Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste the text you want read aloud…"
        rows={8}
        className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Voice</label>
          <select
            value={voiceURI}
            onChange={(e) => setVoiceURI(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {voices.length === 0 && <option>Loading voices…</option>}
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Pitch: {pitch.toFixed(1)}</label>
          <input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(+e.target.value)} className="w-full accent-accent" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Speed: {rate.toFixed(1)}</label>
          <input type="range" min={0.5} max={3} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full accent-accent" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={play} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
          <Play size={16} /> {speaking && !paused ? 'Restart' : 'Play'}
        </button>
        {speaking && !paused && (
          <button onClick={pause} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            <Pause size={16} /> Pause
          </button>
        )}
        {paused && (
          <button onClick={resume} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            <RotateCw size={16} /> Resume
          </button>
        )}
        <button onClick={stop} disabled={!speaking} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors">
          <Square size={16} /> Stop
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Available voices come from your operating system and browser, so the list varies by device. Some voices render on-device; others may use your platform&apos;s online voices.
      </p>
    </div>
  );
}
