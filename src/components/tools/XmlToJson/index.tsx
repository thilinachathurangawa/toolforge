'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

function xmlNodeToJson(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').trim();
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as Element;
  const obj: Record<string, unknown> = {};

  // Attributes
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    obj[`@${attr.name}`] = attr.value;
  }

  // Children
  const children = Array.from(el.childNodes).filter(n => {
    if (n.nodeType === Node.TEXT_NODE) return (n.textContent ?? '').trim() !== '';
    return n.nodeType === Node.ELEMENT_NODE;
  });

  if (children.length === 0) {
    const text = (el.textContent ?? '').trim();
    if (Object.keys(obj).length === 0) return text;
    obj['#text'] = text;
    return obj;
  }

  // Group by tag name for arrays
  const tagGroups: Record<string, Node[]> = {};
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = (child as Element).tagName;
      if (!tagGroups[tag]) tagGroups[tag] = [];
      tagGroups[tag].push(child);
    }
  }

  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      obj['#text'] = (child.textContent ?? '').trim();
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = (child as Element).tagName;
      const group = tagGroups[tag];
      if (group.length > 1) {
        if (!obj[tag]) obj[tag] = group.map(xmlNodeToJson);
      } else {
        obj[tag] = xmlNodeToJson(child);
      }
    }
  }

  return obj;
}

export function XmlToJson() {
  const [xmlInput, setXmlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');
  const [beautify, setBeautify] = useState(true);
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    if (!xmlInput.trim()) { setJsonOutput(''); setError(''); return; }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlInput, 'text/xml');
      const errEl = doc.querySelector('parsererror');
      if (errEl) {
        const msg = errEl.textContent?.split('\n')[0] ?? 'Invalid XML';
        setError(msg.replace(/error on line \d+ at column \d+:\s*/i, '').trim());
        setJsonOutput('');
        return;
      }
      setError('');
      const root = doc.documentElement;
      const result: Record<string, unknown> = { [root.tagName]: xmlNodeToJson(root) };
      setJsonOutput(beautify ? JSON.stringify(result, null, 2) : JSON.stringify(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
      setJsonOutput('');
    }
  }, [xmlInput, beautify]);

  useEffect(() => { convert(); }, [convert]);

  const copy = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textareaCls = 'w-full h-full min-h-[280px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">XML Input</label>
          <textarea
            value={xmlInput}
            onChange={e => setXmlInput(e.target.value)}
            placeholder={'<root>\n  <name>Alice</name>\n  <age>30</age>\n</root>'}
            className={textareaCls}
          />
          {error && (
            <div className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle size={14} className="text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive font-mono break-all">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">JSON Output</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={beautify}
                  onChange={e => setBeautify(e.target.checked)}
                  className="rounded accent-accent"
                />
                Beautify
              </label>
              <button
                onClick={copy}
                disabled={!jsonOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={jsonOutput}
            className={`${textareaCls} bg-muted`}
            placeholder="JSON output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
