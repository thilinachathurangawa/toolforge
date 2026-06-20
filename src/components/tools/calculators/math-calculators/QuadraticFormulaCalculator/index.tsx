'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, FunctionSquare } from 'lucide-react';

type RootType = 'twoReal' | 'oneReal' | 'complex';

function QuadraticFormulaCalculator() {
  const [a, setA] = useState<string>('1');
  const [b, setB] = useState<string>('-5');
  const [c, setC] = useState<string>('6');
  const [discriminant, setDiscriminant] = useState<number | null>(null);
  const [rootType, setRootType] = useState<RootType>('twoReal');
  const [root1, setRoot1] = useState<number | string>('');
  const [root2, setRoot2] = useState<number | string>('');
  const [vertex, setVertex] = useState<{ x: number; y: number } | null>(null);
  const [axisOfSymmetry, setAxisOfSymmetry] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate discriminant
  const calculateDiscriminant = (aVal: number, bVal: number, cVal: number): number => {
    return Math.pow(bVal, 2) - 4 * aVal * cVal;
  };

  // Determine root type
  const getRootType = (disc: number): RootType => {
    if (disc > 0) return 'twoReal';
    if (disc === 0) return 'oneReal';
    return 'complex';
  };

  // Calculate roots
  const calculateRoots = (aVal: number, bVal: number, cVal: number): { root1: number | string; root2: number | string } => {
    const disc = calculateDiscriminant(aVal, bVal, cVal);
    const type = getRootType(disc);
    
    if (type === 'twoReal') {
      const sqrtD = Math.sqrt(disc);
      const r1 = (-bVal + sqrtD) / (2 * aVal);
      const r2 = (-bVal - sqrtD) / (2 * aVal);
      return { root1: r1, root2: r2 };
    } else if (type === 'oneReal') {
      const root = -bVal / (2 * aVal);
      return { root1: root, root2: root };
    } else {
      // Complex roots
      const realPart = (-bVal / (2 * aVal)).toFixed(4);
      const imaginaryPart = (Math.sqrt(Math.abs(disc)) / (2 * aVal)).toFixed(4);
      return {
        root1: `${realPart} + ${imaginaryPart}i`,
        root2: `${realPart} - ${imaginaryPart}i`
      };
    }
  };

  // Calculate vertex
  const calculateVertex = (aVal: number, bVal: number, cVal: number): { x: number; y: number } => {
    const x = -bVal / (2 * aVal);
    const y = aVal * Math.pow(x, 2) + bVal * x + cVal;
    return { x, y };
  };

  // Calculate axis of symmetry
  const calculateAxisOfSymmetry = (aVal: number, bVal: number): number => {
    return -bVal / (2 * aVal);
  };

  const calculate = useCallback(() => {
    const aVal = parseFloat(a);
    const bVal = parseFloat(b);
    const cVal = parseFloat(c);

    if (isNaN(aVal) || aVal === 0 || isNaN(bVal) || isNaN(cVal)) {
      setDiscriminant(null);
      setRootType('twoReal');
      setRoot1('');
      setRoot2('');
      setVertex(null);
      setAxisOfSymmetry(null);
      return;
    }

    const disc = calculateDiscriminant(aVal, bVal, cVal);
    const type = getRootType(disc);
    const { root1: r1, root2: r2 } = calculateRoots(aVal, bVal, cVal);
    const vert = calculateVertex(aVal, bVal, cVal);
    const axis = calculateAxisOfSymmetry(aVal, bVal);

    setDiscriminant(disc);
    setRootType(type);
    setRoot1(r1);
    setRoot2(r2);
    setVertex(vert);
    setAxisOfSymmetry(axis);
  }, [a, b, c]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (discriminant !== null) {
      const typeLabel = rootType === 'twoReal' ? 'Two real and distinct roots' : rootType === 'oneReal' ? 'One real repeated root' : 'Complex conjugate roots';
      const resultText = `Equation: ${a}x² + ${b}x + ${c} = 0\n\nDiscriminant: ${discriminant}\nType: ${typeLabel}\n\nRoots:\nx₁ = ${root1}\nx₂ = ${root2}\n\nVertex: (${vertex?.x.toFixed(4)}, ${vertex?.y.toFixed(4)})\nAxis of Symmetry: x = ${axisOfSymmetry?.toFixed(4)}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setA('');
    setB('');
    setC('');
    setDiscriminant(null);
    setRootType('twoReal');
    setRoot1('');
    setRoot2('');
    setVertex(null);
    setAxisOfSymmetry(null);
  };

  const getSteps = () => {
    const aVal = parseFloat(a) || 0;
    const bVal = parseFloat(b) || 0;
    const cVal = parseFloat(c) || 0;

    return [
      `Identify coefficients: a=${aVal}, b=${bVal}, c=${cVal}`,
      `Calculate discriminant: b² - 4ac`,
      `Discriminant = (${bVal})² - 4(${aVal})(${cVal}) = ${discriminant || 0}`,
      discriminant !== null && discriminant > 0 ? 'Since discriminant > 0: 2 real roots' : discriminant === 0 ? 'Since discriminant = 0: 1 real repeated root' : 'Since discriminant < 0: complex conjugate roots',
      'Apply quadratic formula: x = (-b ± √(b² - 4ac)) / 2a',
      `x = (${-bVal} ± √${discriminant || 0}) / ${2 * aVal}`,
      `x₁ = ${root1}`,
      `x₂ = ${root2}`,
    ];
  };

  const getFormulaDisplay = () => {
    const aVal = parseFloat(a) || 0;
    const bVal = parseFloat(b) || 0;
    const cVal = parseFloat(c) || 0;

    return [
      `x = (-b ± √(b² - 4ac)) / 2a`,
      `x = (${-bVal} ± √(${bVal * bVal} - ${4 * aVal * cVal})) / ${2 * aVal}`,
      discriminant !== null && discriminant >= 0 ? `x = (${-bVal} ± √${discriminant}) / ${2 * aVal}` : `x = (${-bVal} ± √${discriminant}) / ${2 * aVal}`,
      discriminant !== null && discriminant >= 0 ? `x₁ = (${-bVal} + ${Math.sqrt(discriminant).toFixed(2)}) / ${2 * aVal} = ${root1}` : `x₁ = ${root1}`,
      discriminant !== null && discriminant >= 0 ? `x₂ = (${-bVal} - ${Math.sqrt(discriminant).toFixed(2)}) / ${2 * aVal} = ${root2}` : `x₂ = ${root2}`,
    ];
  };

  return (
    <div className="w-full space-y-6">
      {/* Equation Display */}
      <div className="text-center py-2">
        <p className="text-lg font-mono text-foreground">
          {a}x² + {b}x + {c} = 0
        </p>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-foreground/60">a</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="1"
            step="0.01"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-foreground/60">b</label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="-5"
            step="0.01"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-foreground/60">c</label>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="6"
            step="0.01"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FunctionSquare className="w-4 h-4" />
          Results
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Discriminant</p>
            <p className="text-2xl font-semibold text-foreground">
              {discriminant !== null ? discriminant : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Type</p>
            <p className="text-lg font-semibold text-foreground">
              {rootType === 'twoReal' ? 'Two real roots' : rootType === 'oneReal' ? 'One real root' : 'Complex roots'}
            </p>
          </div>
        </div>

        {/* Roots */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-2">Roots:</p>
          <div className="space-y-1 text-sm text-foreground">
            <p>x₁ = {root1}</p>
            <p>x₂ = {root2}</p>
          </div>
        </div>

        {/* Vertex and Axis */}
        {vertex !== null && axisOfSymmetry !== null && (
          <div className="pt-3 border-t border-input">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground/60">Vertex</p>
                <p className="text-lg font-semibold text-foreground">
                  ({vertex.x.toFixed(4)}, {vertex.y.toFixed(4)})
                </p>
              </div>
              <div>
                <p className="text-foreground/60">Axis of Symmetry</p>
                <p className="text-lg font-semibold text-foreground">
                  x = {axisOfSymmetry.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formula */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Formula:</p>
          <div className="space-y-1 text-sm font-mono text-foreground">
            {getFormulaDisplay().map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        {/* Step-by-step */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-2">Step-by-step:</p>
          <ol className="space-y-1 text-sm text-foreground">
            {getSteps().map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-foreground/60">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default QuadraticFormulaCalculator;
