'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Database, AlertCircle } from 'lucide-react';

export function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [uppercase, setUppercase] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatSQL = useCallback(() => {
    try {
      setError(null);

      if (!input.trim()) {
        setOutput('');
        return;
      }

      let formatted = input;
      const indent = ' '.repeat(indentSize);

      // Normalize whitespace
      formatted = formatted.replace(/\s+/g, ' ').trim();

      // Split into tokens
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
        'OUTER JOIN', 'ON', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE',
        'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO',
        'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
        'DROP TABLE', 'UNION', 'UNION ALL', 'DISTINCT', 'AS', 'WITH', 'CASE',
        'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC'
      ];

      // Apply case transformation
      if (uppercase) {
        keywords.forEach(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'gi');
          formatted = formatted.replace(regex, kw);
        });
      }

      // Add line breaks and indentation
      let result = '';
      let depth = 0;
      let inParentheses = false;

      const tokens = formatted.split(/(\s+|[(),;])/).filter(t => t.trim());

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        if (!token) continue;

        const upperToken = token.toUpperCase();

        // Handle parentheses
        if (token === '(') {
          result += ' (\n' + indent.repeat(depth + 1);
          depth++;
          inParentheses = true;
          continue;
        }
        if (token === ')') {
          depth--;
          result += '\n' + indent.repeat(depth) + ')';
          inParentheses = false;
          continue;
        }

        // Handle commas
        if (token === ',') {
          result += ',\n' + indent.repeat(depth);
          continue;
        }

        // Handle semicolons
        if (token === ';') {
          result += ';\n';
          depth = 0;
          continue;
        }

        // Handle keywords that need new lines
        const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
          'INNER JOIN', 'OUTER JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT',
          'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE',
          'UNION', 'UNION ALL', 'WITH'];

        if (majorKeywords.includes(upperToken)) {
          if (result && !result.endsWith('\n')) {
            result += '\n' + indent.repeat(depth);
          }
          result += token + '\n' + indent.repeat(depth);
          continue;
        }

        // Handle AND, OR
        if (upperToken === 'AND' || upperToken === 'OR') {
          result += '\n' + indent.repeat(depth + 1) + token + ' ';
          continue;
        }

        // Default: add space
        result += token + ' ';
      }

      setOutput(result.trim());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error formatting SQL';
      setError(errorMessage);
      setOutput('');
    }
  }, [input, indentSize, uppercase]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    formatSQL();
  }, [formatSQL]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">SQL Input</label>
          <textarea
            placeholder="SELECT * FROM users WHERE age > 18"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Indent Size:</label>
            <input
              type="number"
              min="1"
              max="8"
              value={indentSize}
              onChange={(e) => setIndentSize(Math.min(8, Math.max(1, parseInt(e.target.value) || 2)))}
              className="w-16 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="uppercase"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="uppercase" className="text-sm font-medium text-foreground">Uppercase Keywords</label>
          </div>
        </div>

        <button
          onClick={formatSQL}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <Database size={16} />
          Format
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Formatted SQL</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
