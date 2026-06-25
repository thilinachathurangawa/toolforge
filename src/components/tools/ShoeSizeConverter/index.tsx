'use client';

import { useState } from 'react';

type SizeSystem = 'us' | 'uk' | 'eu' | 'cm';
type Gender = 'men' | 'women' | 'kids';

interface SizeRow {
  us: string;
  uk: string;
  eu: string;
  cm: string;
}

const MEN_SIZES: SizeRow[] = [
  { us: '6',    uk: '5.5',  eu: '39',   cm: '24' },
  { us: '6.5',  uk: '6',    eu: '39.5', cm: '24.5' },
  { us: '7',    uk: '6.5',  eu: '40',   cm: '25' },
  { us: '7.5',  uk: '7',    eu: '40.5', cm: '25.5' },
  { us: '8',    uk: '7.5',  eu: '41',   cm: '26' },
  { us: '8.5',  uk: '8',    eu: '42',   cm: '26.5' },
  { us: '9',    uk: '8.5',  eu: '42.5', cm: '27' },
  { us: '9.5',  uk: '9',    eu: '43',   cm: '27.5' },
  { us: '10',   uk: '9.5',  eu: '44',   cm: '28' },
  { us: '10.5', uk: '10',   eu: '44.5', cm: '28.5' },
  { us: '11',   uk: '10.5', eu: '45',   cm: '29' },
  { us: '11.5', uk: '11',   eu: '45.5', cm: '29.5' },
  { us: '12',   uk: '11.5', eu: '46',   cm: '30' },
  { us: '13',   uk: '12.5', eu: '47.5', cm: '31' },
];

const WOMEN_SIZES: SizeRow[] = [
  { us: '5',   uk: '2.5', eu: '35',   cm: '22' },
  { us: '5.5', uk: '3',   eu: '35.5', cm: '22.5' },
  { us: '6',   uk: '3.5', eu: '36',   cm: '23' },
  { us: '6.5', uk: '4',   eu: '37',   cm: '23.5' },
  { us: '7',   uk: '4.5', eu: '37.5', cm: '24' },
  { us: '7.5', uk: '5',   eu: '38',   cm: '24.5' },
  { us: '8',   uk: '5.5', eu: '38.5', cm: '25' },
  { us: '8.5', uk: '6',   eu: '39',   cm: '25.5' },
  { us: '9',   uk: '6.5', eu: '40',   cm: '26' },
  { us: '9.5', uk: '7',   eu: '40.5', cm: '26.5' },
  { us: '10',  uk: '7.5', eu: '41',   cm: '27' },
  { us: '11',  uk: '8.5', eu: '42',   cm: '28' },
];

const KIDS_SIZES: SizeRow[] = [
  { us: '1',  uk: '0.5', eu: '16.5', cm: '10.5' },
  { us: '2',  uk: '1',   eu: '17',   cm: '11' },
  { us: '3',  uk: '2',   eu: '18',   cm: '12' },
  { us: '4',  uk: '3',   eu: '19',   cm: '12.5' },
  { us: '5',  uk: '4',   eu: '20',   cm: '13' },
  { us: '6',  uk: '5',   eu: '21.5', cm: '13.5' },
  { us: '7',  uk: '6',   eu: '22.5', cm: '14' },
  { us: '8',  uk: '7',   eu: '24',   cm: '15' },
  { us: '9',  uk: '8',   eu: '25',   cm: '15.5' },
  { us: '10', uk: '9',   eu: '26.5', cm: '16.5' },
  { us: '11', uk: '10',  eu: '28',   cm: '17' },
  { us: '12', uk: '11',  eu: '29.5', cm: '18' },
  { us: '13', uk: '12',  eu: '31',   cm: '19' },
];

const SYSTEM_LABELS: Record<SizeSystem, string> = {
  us: 'US',
  uk: 'UK',
  eu: 'EU',
  cm: 'CM',
};

const SIZES_BY_GENDER: Record<Gender, SizeRow[]> = {
  men: MEN_SIZES,
  women: WOMEN_SIZES,
  kids: KIDS_SIZES,
};

const systems: SizeSystem[] = ['us', 'uk', 'eu', 'cm'];

export function ShoeSizeConverter() {
  const [gender, setGender] = useState<Gender>('men');
  const [selected, setSelected] = useState<{ system: SizeSystem; value: string } | null>(null);

  const sizes = SIZES_BY_GENDER[gender];
  const matchedRow = selected
    ? sizes.find((row) => row[selected.system] === selected.value) ?? null
    : null;

  const handleGenderChange = (g: Gender) => {
    setGender(g);
    setSelected(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Gender tabs */}
      <div className="flex rounded-lg border overflow-hidden">
        {(['men', 'women', 'kids'] as Gender[]).map((g) => (
          <button
            key={g}
            onClick={() => handleGenderChange(g)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              gender === g
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-muted'
            }`}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Select a size from any system to see all equivalents instantly.
      </p>

      {/* System selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {systems.map((system) => {
          const uniqueValues = Array.from(new Set(sizes.map((row) => row[system])));
          return (
            <div key={system} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {SYSTEM_LABELS[system]}
              </label>
              <select
                value={selected?.system === system ? selected.value : ''}
                onChange={(e) => setSelected({ system, value: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  Select {SYSTEM_LABELS[system]}
                </option>
                {uniqueValues.map((val) => (
                  <option key={val} value={val}>
                    {val}{system === 'cm' ? ' cm' : ''}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Result cards */}
      {matchedRow ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 space-y-3">
          <p className="text-sm font-semibold text-primary">
            {gender.charAt(0).toUpperCase() + gender.slice(1)}&apos;s Size Equivalents
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {systems.map((system) => (
              <div
                key={system}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 ${
                  selected?.system === system
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background'
                }`}
              >
                <span className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">
                  {SYSTEM_LABELS[system]}
                </span>
                <span className="text-2xl font-bold leading-none">
                  {matchedRow[system]}
                </span>
                {system === 'cm' && (
                  <span className="text-xs opacity-60 mt-0.5">cm</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed flex items-center justify-center py-10 text-sm text-muted-foreground">
          Select a size above to see all equivalents.
        </div>
      )}

      {/* Full reference table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              {systems.map((system) => (
                <th
                  key={system}
                  className="px-4 py-2.5 text-left font-semibold text-muted-foreground tracking-wide text-xs uppercase"
                >
                  {SYSTEM_LABELS[system]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((row, idx) => {
              const isHighlighted =
                matchedRow != null &&
                matchedRow.us === row.us &&
                matchedRow.eu === row.eu;
              return (
                <tr
                  key={idx}
                  className={`border-b last:border-0 transition-colors ${
                    isHighlighted
                      ? 'bg-primary/10 font-semibold'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  {systems.map((system) => (
                    <td key={system} className="px-4 py-2.5">
                      {row[system]}
                      {system === 'cm' ? ' cm' : ''}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
