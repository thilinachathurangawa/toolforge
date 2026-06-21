'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Footprints } from 'lucide-react';

export function ShoeSizeConverter() {
  const [gender, setGender] = useState<'men' | 'women' | 'kids'>('men');
  const [size, setSize] = useState<string>('10');
  const [region, setRegion] = useState<'US' | 'EU' | 'UK' | 'CM'>('US');
  const [conversions, setConversions] = useState<{
    US: number;
    EU: number;
    UK: number;
    CM: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const sizeToCM = useCallback((sizeNum: number, fromRegion: 'US' | 'EU' | 'UK' | 'CM', gender: 'men' | 'women' | 'kids'): number => {
    switch (fromRegion) {
      case 'CM':
        return sizeNum;
      
      case 'US':
        if (gender === 'men') {
          return (sizeNum + 1) * 2.54 + 1.5;
        } else if (gender === 'women') {
          return (sizeNum + 1.5) * 2.54 + 1.5;
        } else {
          return (sizeNum + 12) * 2.54 + 0.8;
        }
      
      case 'EU':
        return (sizeNum - 2) / 1.5;
      
      case 'UK':
        if (gender === 'men') {
          return (sizeNum + 1) * 2.54 + 1.5;
        } else if (gender === 'women') {
          return (sizeNum + 1.5) * 2.54 + 1.5;
        } else {
          return (sizeNum + 12) * 2.54 + 0.8;
        }
      
      default:
        return sizeNum;
    }
  }, []);

  const cmToSize = useCallback((cm: number, toRegion: 'US' | 'EU' | 'UK' | 'CM', gender: 'men' | 'women' | 'kids'): number => {
    switch (toRegion) {
      case 'CM':
        return cm;
      
      case 'US':
        if (gender === 'men') {
          return (cm - 1.5) / 2.54 - 1;
        } else if (gender === 'women') {
          return (cm - 1.5) / 2.54 - 1.5;
        } else {
          return (cm - 0.8) / 2.54 - 12;
        }
      
      case 'EU':
        return Math.round(1.5 * cm + 2);
      
      case 'UK':
        if (gender === 'men') {
          return (cm - 1.5) / 2.54 - 1;
        } else if (gender === 'women') {
          return (cm - 1.5) / 2.54 - 1.5;
        } else {
          return (cm - 0.8) / 2.54 - 12;
        }
      
      default:
        return cm;
    }
  }, []);

  const convertToAllRegions = useCallback((sizeNum: number, fromRegion: 'US' | 'EU' | 'UK' | 'CM', gender: 'men' | 'women' | 'kids') => {
    const cm = sizeToCM(sizeNum, fromRegion, gender);
    
    return {
      US: cmToSize(cm, 'US', gender),
      EU: cmToSize(cm, 'EU', gender),
      UK: cmToSize(cm, 'UK', gender),
      CM: cm
    };
  }, [sizeToCM, cmToSize]);

  const handleConvert = useCallback(() => {
    const sizeNum = parseFloat(size) || 0;
    if (sizeNum <= 0) {
      setConversions(null);
      return;
    }
    
    const result = convertToAllRegions(sizeNum, region, gender);
    setConversions(result);
  }, [size, region, gender, convertToAllRegions]);

  React.useEffect(() => {
    handleConvert();
  }, [handleConvert]);

  const handleCopy = () => {
    if (conversions) {
      const result = `US: ${conversions.US}\nEU: ${conversions.EU}\nUK: ${conversions.UK}\nCM: ${conversions.CM.toFixed(1)}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Gender */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Gender</label>
        <div className="flex gap-2">
          {(['men', 'women', 'kids'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                gender === g
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Size Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Enter Size</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="10"
            min="0"
            step="0.5"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as 'US' | 'EU' | 'UK' | 'CM')}
            className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            <option value="US">US</option>
            <option value="EU">EU</option>
            <option value="UK">UK</option>
            <option value="CM">CM</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {conversions && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Footprints className="w-4 h-4" />
            Conversions
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">US:</span>
              <span className="text-foreground font-semibold">{conversions.US}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">EU:</span>
              <span className="text-foreground font-semibold">{conversions.EU}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">UK:</span>
              <span className="text-foreground font-semibold">{conversions.UK}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">CM:</span>
              <span className="text-foreground font-semibold">{conversions.CM.toFixed(1)}</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full mt-3 px-3 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Results'}
          </button>
        </div>
      )}

      {/* Size Chart Reference */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-medium text-foreground">Size Chart Reference</h3>
        <div className="text-xs text-foreground/60">
          <p>• Men's sizes are typically 1 size larger than women's</p>
          <p>• EU sizes are approximately 33-34 larger than US sizes</p>
          <p>• UK sizes are approximately 1 size smaller than US sizes</p>
          <p>• CM represents the length of the foot in centimeters</p>
        </div>
      </div>
    </div>
  );
}
