'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function AgeCalculator() {
  const [birthdate, setBirthdate] = useState<string>('2000-01-01');
  const [copied, setCopied] = useState(false);

  const dob = new Date(birthdate);
  const now = new Date();
  
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Age: ${years} years, ${months} months, ${days} days`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Age Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Select Date of Birth</label>
        <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
      </div>

      {!isNaN(years) && years >= 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Your Current Age</div>
          <div className="text-2xl font-extrabold">{years} Years, {months} Months, {days} Days</div>
        </div>
      )}
    </div>
  );
}