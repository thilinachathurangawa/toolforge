'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type DateSystem = 'excel' | 'google-sheets';

const EXCEL_EPOCH = new Date(1900, 0, 1); // January 1, 1900
const GOOGLE_SHEETS_OFFSET = 1; // Google Sheets is 1 day ahead

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ExcelDateConverter() {
  const [dateSystem, setDateSystem] = useState<DateSystem>('excel');
  const [serialInput, setSerialInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [result, setResult] = useState<{
    serial: number | null;
    date: Date | null;
    dayOfWeek: string;
  }>({ serial: null, date: null, dayOfWeek: '' });
  const [copied, setCopied] = useState(false);

  // Serial to Date
  const serialToDate = (serial: number, system: DateSystem): Date => {
    let adjustedSerial = serial;
    
    if (system === 'google-sheets') {
      adjustedSerial -= GOOGLE_SHEETS_OFFSET;
    }
    
    // Excel incorrectly treats 1900 as a leap year (includes Feb 29, 1900)
    // We need to adjust for this bug for serial numbers >= 60
    if (adjustedSerial >= 60) {
      adjustedSerial -= 1;
    }
    
    const date = new Date(EXCEL_EPOCH);
    date.setDate(date.getDate() + adjustedSerial - 1);
    
    return date;
  };

  // Date to Serial
  const dateToSerial = (date: Date, system: DateSystem): number => {
    const excelEpoch = new Date(1900, 0, 1);
    const diffTime = date.getTime() - excelEpoch.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    let serial = diffDays;
    
    // Adjust for Excel's leap year bug (add 1 for dates after Feb 28, 1900)
    if (serial >= 60) {
      serial += 1;
    }
    
    if (system === 'google-sheets') {
      serial += GOOGLE_SHEETS_OFFSET;
    }
    
    return serial;
  };

  // Get day of week
  const getDayOfWeek = (date: Date): string => {
    return DAYS_OF_WEEK[date.getDay()];
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle serial input
  useEffect(() => {
    if (serialInput) {
      const serial = parseFloat(serialInput);
      if (!isNaN(serial)) {
        try {
          const date = serialToDate(serial, dateSystem);
          setResult({
            serial: serial,
            date: date,
            dayOfWeek: getDayOfWeek(date),
          });
        } catch (e) {
          setResult({ serial: null, date: null, dayOfWeek: '' });
        }
      } else {
        setResult({ serial: null, date: null, dayOfWeek: '' });
      }
    } else {
      setResult({ serial: null, date: null, dayOfWeek: '' });
    }
  }, [serialInput, dateSystem]);

  // Handle date input
  useEffect(() => {
    if (dateInput) {
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        try {
          const serial = dateToSerial(date, dateSystem);
          setResult({
            serial: serial,
            date: date,
            dayOfWeek: getDayOfWeek(date),
          });
        } catch (e) {
          setResult({ serial: null, date: null, dayOfWeek: '' });
        }
      } else {
        setResult({ serial: null, date: null, dayOfWeek: '' });
      }
    }
  }, [dateInput, dateSystem]);

  const handleCopy = () => {
    let text = '';
    if (result.serial !== null && result.date) {
      text = `Serial: ${result.serial}\nDate: ${formatDate(result.date)}\nDay: ${result.dayOfWeek}`;
    }
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setSerialInput('');
    setDateInput('');
    setResult({ serial: null, date: null, dayOfWeek: '' });
  };

  return (
    <div className="w-full space-y-6">
      {/* Date System Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Date System</label>
        <div className="flex gap-2">
          <button
            onClick={() => setDateSystem('excel')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              dateSystem === 'excel'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            Excel (1900 system)
          </button>
          <button
            onClick={() => setDateSystem('google-sheets')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              dateSystem === 'google-sheets'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            Google Sheets (+1 day)
          </button>
        </div>
      </div>

      {/* Serial Number Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Serial Number</label>
        <input
          type="number"
          value={serialInput}
          onChange={(e) => {
            setSerialInput(e.target.value);
            setDateInput('');
          }}
          placeholder="e.g., 45352"
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono"
        />
      </div>

      {/* Calendar Date Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Calendar Date</label>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => {
            setDateInput(e.target.value);
            setSerialInput('');
          }}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      {/* Result Display */}
      {result.serial !== null && result.date && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-accent" />
            <h3 className="text-sm font-medium text-foreground">Conversion Result</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Serial Number:</span>
              <span className="text-sm font-mono font-medium">{result.serial}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Calendar Date:</span>
              <span className="text-sm font-medium">{formatDate(result.date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Day of Week:</span>
              <span className="text-sm font-medium">{result.dayOfWeek}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {dateSystem === 'excel' 
                ? 'Using Excel date system (Serial 1 = January 1, 1900)'
                : 'Using Google Sheets date system (Serial 1 = December 31, 1899)'
              }
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={!result.serial}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          <X size={16} />
          Clear
        </button>
      </div>

      {/* Examples */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h3 className="text-sm font-medium text-foreground">Common Dates (Excel System)</h3>
        <ul className="space-y-1">
          <li className="text-xs text-muted-foreground">• Serial 1 = January 1, 1900</li>
          <li className="text-xs text-muted-foreground">• Serial 44927 = January 1, 2023</li>
          <li className="text-xs text-muted-foreground">• Serial 45352 = January 15, 2024</li>
          <li className="text-xs text-muted-foreground">• Serial 46000 = February 5, 2026</li>
        </ul>
      </div>
    </div>
  );
}
