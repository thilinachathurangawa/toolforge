'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Download, RefreshCw } from 'lucide-react';

const FIRST = ['Ava', 'Liam', 'Mia', 'Noah', 'Emma', 'Ethan', 'Olivia', 'Lucas', 'Sophia', 'Mason', 'Isabella', 'Logan', 'Amelia', 'James', 'Harper', 'Benjamin', 'Ella', 'Jacob', 'Aria', 'Henry', 'Grace', 'Leo', 'Chloe', 'Daniel', 'Zoe', 'Owen', 'Lily', 'Caleb', 'Nora', 'Ruby'];
const LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'King'];
const STREETS = ['Maple', 'Oak', 'Cedar', 'Pine', 'Elm', 'Washington', 'Lake', 'Hill', 'Park', 'Sunset', 'River', 'Spring', 'Highland', 'Forest', 'Ridge', 'Meadow', 'Birch', 'Willow'];
const SUFFIX = ['St', 'Ave', 'Blvd', 'Ln', 'Dr', 'Ct', 'Way', 'Pl'];
const CITIES = ['Austin', 'Denver', 'Seattle', 'Portland', 'Boston', 'Chicago', 'Phoenix', 'Atlanta', 'Dallas', 'Miami', 'Madison', 'Boulder', 'Raleigh', 'Tucson'];
const STATES = ['CA', 'TX', 'NY', 'WA', 'CO', 'IL', 'FL', 'GA', 'AZ', 'MA', 'OR', 'NC'];
const DOMAINS = ['example.com', 'mailinator.com', 'testmail.io', 'demo.dev', 'sample.org'];
const JOBS = ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst', 'Marketing Lead', 'QA Engineer', 'DevOps Engineer', 'Account Executive', 'Support Specialist', 'Content Writer', 'Project Manager', 'Solutions Architect'];

const FIELDS = [
  { key: 'name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'uuid', label: 'UUID' },
  { key: 'job', label: 'Job Title' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const num = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function makeRow(fields: FieldKey[]): Record<string, string> {
  const first = pick(FIRST);
  const last = pick(LAST);
  const row: Record<string, string> = {};
  for (const f of fields) {
    switch (f) {
      case 'name': row.name = `${first} ${last}`; break;
      case 'email': row.email = `${first.toLowerCase()}.${last.toLowerCase()}@${pick(DOMAINS)}`; break;
      case 'phone': row.phone = `(${num(200, 989)}) ${num(200, 989)}-${String(num(0, 9999)).padStart(4, '0')}`; break;
      case 'address': row.address = `${num(10, 9999)} ${pick(STREETS)} ${pick(SUFFIX)}, ${pick(CITIES)}, ${pick(STATES)} ${String(num(10000, 99999))}`; break;
      case 'uuid': row.uuid = uuid(); break;
      case 'job': row.job = pick(JOBS); break;
    }
  }
  return row;
}

export function FakeDataGenerator() {
  const [selected, setSelected] = useState<Record<FieldKey, boolean>>({
    name: true, email: true, phone: false, address: false, uuid: true, job: false,
  });
  const [count, setCount] = useState(10);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [copied, setCopied] = useState(false);

  const activeFields = FIELDS.filter((f) => selected[f.key]).map((f) => f.key);

  const generate = useCallback(() => {
    const fields = FIELDS.filter((f) => selected[f.key]).map((f) => f.key) as FieldKey[];
    if (fields.length === 0) return;
    const n = Math.max(1, Math.min(100, count));
    setRows(Array.from({ length: n }, () => makeRow(fields)));
  }, [selected, count]);

  const toggle = (key: FieldKey) => {
    setSelected((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // never let all fields turn off
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  };

  const downloadFile = (content: string, name: string, type: string) => {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportJson = () => downloadFile(JSON.stringify(rows, null, 2), 'mock-data.json', 'application/json');

  const exportCsv = () => {
    if (rows.length === 0) return;
    const headers = activeFields;
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h] ?? '')).join(','))];
    downloadFile(lines.join('\n'), 'mock-data.csv', 'text/csv');
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-5 border border-border rounded-xl bg-card space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Fields</label>
          <div className="flex flex-wrap gap-3">
            {FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={selected[f.key]} onChange={() => toggle(f.key)} className="accent-accent" />
                {f.label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Rows (1–100)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-28 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <button onClick={generate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
            <RefreshCw size={16} /> Generate
          </button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={exportJson} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              <Download size={16} /> Export JSON
            </button>
            <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={copyJson} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>

          <div className="border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-left">
                  {activeFields.map((f) => (
                    <th key={f} className="px-3 py-2 font-medium text-foreground capitalize whitespace-nowrap">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    {activeFields.map((f) => (
                      <td key={f} className="px-3 py-2 text-muted-foreground whitespace-nowrap font-mono text-xs">{r[f]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
