'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
  'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
  'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna',
  'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis',
  'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
  'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat',
  'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu',
  'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
  'cupidatat', 'non', 'proident', 'sunt', 'in', 'culpa',
  'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum', 'sed', 'ut', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'sit', 'voluptatem',
  'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
  'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'et', 'quasi', 'architecto',
  'beatae', 'vitae', 'dicta', 'sunt', 'explicabo',
  'nemo', 'enim', 'ipsam', 'voluptatem', 'quia', 'voluptas',
  'sit', 'aspernatur', 'aut', 'odit', 'aut', 'fugit',
  'sed', 'quia', 'consequuntur', 'magni', 'dolores', 'eos',
  'qui', 'ratione', 'voluptatem', 'sequi', 'nesciunt',
  'neque', 'porro', 'quisquam', 'est', 'qui', 'dolorem',
  'ipsum', 'quia', 'dolor', 'sit', 'amet', 'consectetur',
  'adipisci', 'velit', 'sed', 'quia', 'non', 'numquam',
  'eius', 'modi', 'tempora', 'incidunt', 'ut', 'labore',
  'et', 'dolore', 'magnam', 'aliquam', 'quaerat', 'voluptatem',
  'ut', 'enim', 'ad', 'minim', 'veniam', 'quis',
  'nostrum', 'exercitationem', 'ullam', 'corporis', 'suscipit',
  'laboriosam', 'nisi', 'ut', 'aliquid', 'ex', 'ea',
  'commodi', 'consequatur', 'quis', 'autem', 'vel', 'eum',
  'iure', 'reprehenderit', 'qui', 'in', 'ea', 'voluptate',
  'velit', 'esse', 'quam', 'nihil', 'molestiae',
  'et', 'iusto', 'odio', 'dignissimos', 'ducimus', 'qui',
  'blanditiis', 'praesentium', 'voluptatum', 'deleniti', 'atque',
  'corrupti', 'quos', 'dolores', 'et', 'quas', 'molestias',
  'excepturi', 'sint', 'occaecati', 'cupiditate', 'non', 'provident',
  'similique', 'sunt', 'in', 'culpa', 'qui', 'officia',
  'deserunt', 'mollitia', 'animi', 'id', 'est', 'laborum',
  'et', 'pain', 'rum', 'fuga', 'et', 'harum',
  'quidem', 'rerum', 'facilis', 'est', 'et', 'expedita',
  'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta',
  'nobis', 'est', 'eligendi', 'optio', 'cumque', 'nihil',
  'impedit', 'quo', 'minus', 'id', 'quod', 'maxime',
  'placeat', 'facere', 'possimus', 'omnis', 'voluptas', 'assumenda',
  'est', 'omnis', 'dolor', 'repellendus', 'temporibus', 'autem',
  'quibusdam', 'et', 'aut', 'officiis', 'debitis', 'aut',
  'rerum', 'necessitatibus', 'saepe', 'eveniet', 'ut', 'et',
  'voluptates', 'repudiandae', 'sint', 'et', 'molestiae', 'non',
  'recusandae', 'itaque', 'earum', 'rerum', 'hic', 'tenetur',
  'a', 'sapiente', 'delectus', 'ut', 'aut', 'reiciendis',
  'voluptatibus', 'maiores', 'alias', 'consequatur', 'aut', 'perferendis',
  'doloribus', 'asperiores', 'repellat',
];

interface LoremOptions {
  outputType: 'words' | 'sentences' | 'paragraphs';
  amount: number;
  startWithLorem: boolean;
  sentenceLength: 'short' | 'medium' | 'long';
}

export function LoremIpsum() {
  const [options, setOptions] = useState<LoremOptions>({
    outputType: 'paragraphs',
    amount: 3,
    startWithLorem: true,
    sentenceLength: 'medium',
  });
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const getSentenceLengthRange = () => {
    switch (options.sentenceLength) {
      case 'short': return { min: 4, max: 8 };
      case 'medium': return { min: 8, max: 15 };
      case 'long': return { min: 15, max: 25 };
    }
  };

  const generateRandomWord = useCallback(() => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  }, []);

  const generateSentence = useCallback((startWithLorem: boolean, isFirst: boolean) => {
    const { min, max } = getSentenceLengthRange();
    const wordCount = Math.floor(Math.random() * (max - min + 1)) + min;
    
    let sentence = '';
    for (let i = 0; i < wordCount; i++) {
      if (isFirst && i === 0 && startWithLorem) {
        sentence += 'Lorem ipsum';
      } else if (i === 0) {
        sentence += generateRandomWord();
      } else {
        sentence += ' ' + generateRandomWord();
      }
    }
    
    // Capitalize first letter
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    // Add period at end
    sentence += '.';
    
    return sentence;
  }, [options.sentenceLength, generateRandomWord]);

  const generateParagraph = useCallback((startWithLorem: boolean, isFirstParagraph: boolean) => {
    const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences per paragraph
    let paragraph = '';
    
    for (let i = 0; i < sentenceCount; i++) {
      if (i > 0) paragraph += ' ';
      paragraph += generateSentence(startWithLorem && isFirstParagraph && i === 0, isFirstParagraph && i === 0);
    }
    
    return paragraph;
  }, [generateSentence]);

  const generateText = useCallback(() => {
    let text = '';
    
    switch (options.outputType) {
      case 'words':
        for (let i = 0; i < options.amount; i++) {
          if (i > 0) text += ' ';
          if (i === 0 && options.startWithLorem) {
            text += 'Lorem ipsum';
          } else {
            text += generateRandomWord();
          }
        }
        break;
        
      case 'sentences':
        for (let i = 0; i < options.amount; i++) {
          if (i > 0) text += ' ';
          text += generateSentence(options.startWithLorem && i === 0, i === 0);
        }
        break;
        
      case 'paragraphs':
        for (let i = 0; i < options.amount; i++) {
          if (i > 0) text += '\n\n';
          text += generateParagraph(options.startWithLorem && i === 0, i === 0);
        }
        break;
    }
    
    setGeneratedText(text);
  }, [options, generateRandomWord, generateSentence, generateParagraph]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setGeneratedText('');
  };

  useEffect(() => {
    generateText();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Output Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Output Type</label>
          <select
            value={options.outputType}
            onChange={(e) => setOptions({ ...options, outputType: e.target.value as any })}
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="words">Words</option>
            <option value="sentences">Sentences</option>
            <option value="paragraphs">Paragraphs</option>
          </select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Amount ({options.outputType})
            </label>
            <span className="text-sm font-mono text-accent">{options.amount}</span>
          </div>
          <input
            type="range"
            min="1"
            max={options.outputType === 'paragraphs' ? 20 : 100}
            value={options.amount}
            onChange={(e) => setOptions({ ...options, amount: parseInt(e.target.value) })}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={options.startWithLorem}
              onChange={(e) => setOptions({ ...options, startWithLorem: e.target.checked })}
              className="rounded accent-accent"
            />
            Start with "Lorem ipsum"
          </label>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sentence Length</label>
            <select
              value={options.sentenceLength}
              onChange={(e) => setOptions({ ...options, sentenceLength: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>

        {/* Generate and Regenerate Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateText}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            <RefreshCw size={18} />
            Generate
          </button>
          <button
            onClick={generateText}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
          >
            <RefreshCw size={18} />
            Regenerate
          </button>
        </div>
      </div>

      {/* Output Area */}
      {generatedText && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Output</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Trash2 size={16} />
                Clear
              </button>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {generatedText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
