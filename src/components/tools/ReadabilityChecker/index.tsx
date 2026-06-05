'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadabilityScores {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  colemanLiau: number;
  smog: number;
  automatedReadability: number;
}

interface TextStatistics {
  words: number;
  sentences: number;
  paragraphs: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  characters: number;
  readingTime: number;
}

export function ReadabilityChecker() {
  const [inputText, setInputText] = useState('');
  const [scores, setScores] = useState<ReadabilityScores | null>(null);
  const [statistics, setStatistics] = useState<TextStatistics | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const countSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const analyzeText = useCallback(() => {
    if (!inputText.trim()) {
      setScores(null);
      setStatistics(null);
      setSuggestions([]);
      return;
    }

    const text = inputText;
    const words = text.match(/\b[\w']+\b/g) || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const characters = text.length;

    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalParagraphs = paragraphs.length;

    if (totalWords === 0 || totalSentences === 0) {
      setScores(null);
      setStatistics(null);
      setSuggestions(['Please enter more text to analyze.']);
      return;
    }

    const avgWordsPerSentence = totalWords / totalSentences;
    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    const avgSyllablesPerWord = totalSyllables / totalWords;

    // Flesch Reading Ease
    const fleschReadingEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;

    // Gunning Fog Index
    const complexWords = words.filter(word => countSyllables(word) >= 3).length;
    const percentageComplexWords = (complexWords / totalWords) * 100;
    const gunningFog = 0.4 * (avgWordsPerSentence + percentageComplexWords);

    // Coleman-Liau Index
    const avgLettersPerWord = characters / totalWords;
    const avgSentencesPerWord = totalSentences / totalWords;
    const colemanLiau = (0.0588 * avgLettersPerWord * 100) - (0.296 * avgSentencesPerWord * 100) - 15.8;

    // SMOG Index
    const polysyllables = words.filter(word => countSyllables(word) >= 3).length;
    const smog = 1.043 * Math.sqrt(polysyllables * (30 / totalSentences)) + 3.1291;

    // Automated Readability Index
    const charactersPerWord = characters / totalWords;
    const automatedReadability = 4.71 * charactersPerWord + 0.5 * avgWordsPerSentence - 21.43;

    const readingTime = Math.ceil(totalWords / 200); // Average reading speed: 200 words per minute

    setScores({
      fleschReadingEase,
      fleschKincaidGrade,
      gunningFog,
      colemanLiau,
      smog,
      automatedReadability,
    });

    setStatistics({
      words: totalWords,
      sentences: totalSentences,
      paragraphs: totalParagraphs,
      avgWordsPerSentence,
      avgSyllablesPerWord,
      characters,
      readingTime,
    });

    // Generate suggestions
    const newSuggestions: string[] = [];
    if (avgWordsPerSentence > 20) {
      newSuggestions.push('Some sentences are too long. Consider breaking them down for better readability.');
    }
    if (percentageComplexWords > 10) {
      newSuggestions.push('Consider simplifying complex words to improve readability.');
    }
    if (totalParagraphs < 2 && totalWords > 200) {
      newSuggestions.push('Use shorter paragraphs for better flow and readability.');
    }
    if (fleschReadingEase < 30) {
      newSuggestions.push('Text is very difficult to read. Consider simplifying language and sentence structure.');
    } else if (fleschReadingEase > 90) {
      newSuggestions.push('Text is very easy to read, which is good for general audiences.');
    }
    if (newSuggestions.length === 0) {
      newSuggestions.push('Your text has good readability characteristics.');
    }
    setSuggestions(newSuggestions);
  }, [inputText]);

  const getFleschReadingEaseLevel = (score: number): { level: string; color: string } => {
    if (score >= 90) return { level: 'Very Easy (5th grade)', color: 'text-green-500' };
    if (score >= 80) return { level: 'Easy (6th grade)', color: 'text-green-500' };
    if (score >= 70) return { level: 'Fairly Easy (7th grade)', color: 'text-green-500' };
    if (score >= 60) return { level: 'Standard (8th-9th grade)', color: 'text-yellow-500' };
    if (score >= 50) return { level: 'Fairly Difficult (10th-12th)', color: 'text-yellow-500' };
    if (score >= 30) return { level: 'Difficult (College)', color: 'text-orange-500' };
    return { level: 'Very Difficult (College grad)', color: 'text-red-500' };
  };

  const handleCopy = () => {
    if (!scores || !statistics) return;
    const text = `Flesch Reading Ease: ${scores.fleschReadingEase.toFixed(1)}\nFlesch-Kincaid Grade: ${scores.fleschKincaidGrade.toFixed(1)}\nGunning Fog: ${scores.gunningFog.toFixed(1)}\nWords: ${statistics.words}\nSentences: ${statistics.sentences}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setScores(null);
    setStatistics(null);
    setSuggestions([]);
  };

  const exportReport = () => {
    if (!scores || !statistics) return;
    const report = `Readability Analysis Report\n========================\n\nScores:\n- Flesch Reading Ease: ${scores.fleschReadingEase.toFixed(1)}\n- Flesch-Kincaid Grade: ${scores.fleschKincaidGrade.toFixed(1)}\n- Gunning Fog Index: ${scores.gunningFog.toFixed(1)}\n- Coleman-Liau Index: ${scores.colemanLiau.toFixed(1)}\n- SMOG Index: ${scores.smog.toFixed(1)}\n- Automated Readability Index: ${scores.automatedReadability.toFixed(1)}\n\nStatistics:\n- Words: ${statistics.words}\n- Sentences: ${statistics.sentences}\n- Paragraphs: ${statistics.paragraphs}\n- Avg Words/Sentence: ${statistics.avgWordsPerSentence.toFixed(1)}\n- Avg Syllables/Word: ${statistics.avgSyllablesPerWord.toFixed(2)}\n- Characters: ${statistics.characters}\n- Reading Time: ${statistics.readingTime} min\n\nSuggestions:\n${suggestions.map(s => `- ${s}`).join('\n')}`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'readability-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Input Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Input Text</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type your text here..."
            rows={10}
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={analyzeText}
            disabled={!inputText.trim()}
            className="flex-1 px-4 py-3 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Analyze
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-3 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Results */}
      {scores && statistics && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Readability Scores</h3>
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
                onClick={exportReport}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-xs text-muted-foreground">Flesch Reading Ease</div>
              <div className="text-2xl font-bold text-foreground">{scores.fleschReadingEase.toFixed(1)}</div>
              <div className={cn("text-xs", getFleschReadingEaseLevel(scores.fleschReadingEase).color)}>
                {getFleschReadingEaseLevel(scores.fleschReadingEase).level}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-xs text-muted-foreground">Flesch-Kincaid Grade</div>
              <div className="text-2xl font-bold text-foreground">{scores.fleschKincaidGrade.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Grade level</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-xs text-muted-foreground">Gunning Fog Index</div>
              <div className="text-2xl font-bold text-foreground">{scores.gunningFog.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Grade level</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-xs text-muted-foreground">Coleman-Liau Index</div>
              <div className="text-2xl font-bold text-foreground">{scores.colemanLiau.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Grade level</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-xs text-muted-foreground">SMOG Index</div>
              <div className="text-2xl font-bold text-foreground">{scores.smog.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Grade level</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-xs text-muted-foreground">Automated Readability</div>
              <div className="text-2xl font-bold text-foreground">{scores.automatedReadability.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Grade level</div>
            </div>
          </div>

          {/* Text Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Text Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">{statistics.words}</div>
                <div className="text-xs text-muted-foreground">Words</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">{statistics.sentences}</div>
                <div className="text-xs text-muted-foreground">Sentences</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">{statistics.paragraphs}</div>
                <div className="text-xs text-muted-foreground">Paragraphs</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">{statistics.readingTime}</div>
                <div className="text-xs text-muted-foreground">Min Read</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Avg words/sentence</span>
                <span className="font-medium text-foreground">{statistics.avgWordsPerSentence.toFixed(1)}</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Avg syllables/word</span>
                <span className="font-medium text-foreground">{statistics.avgSyllablesPerWord.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Suggestions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
