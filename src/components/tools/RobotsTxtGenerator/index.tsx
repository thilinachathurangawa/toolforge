'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RobotsRule {
  id: string;
  type: 'allow' | 'disallow';
  path: string;
}

interface UserAgentConfig {
  userAgent: string;
  rules: RobotsRule[];
  crawlDelay?: number;
}

const templates = {
  'allow-all': {
    userAgent: '*',
    rules: [{ id: '1', type: 'allow' as const, path: '/' }],
  },
  'block-all': {
    userAgent: '*',
    rules: [{ id: '1', type: 'disallow' as const, path: '/' }],
  },
  'wordpress': {
    userAgent: '*',
    rules: [
      { id: '1', type: 'disallow' as const, path: '/wp-admin/' },
      { id: '2', type: 'disallow' as const, path: '/wp-includes/' },
      { id: '3', type: 'allow' as const, path: '/wp-content/uploads/' },
    ],
  },
};

export function RobotsTxtGenerator() {
  const [userAgents, setUserAgents] = useState<UserAgentConfig[]>([
    { userAgent: '*', rules: [{ id: '1', type: 'allow', path: '/' }] },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [generatedRobotsTxt, setGeneratedRobotsTxt] = useState('');
  const [template, setTemplate] = useState<string>('custom');
  const [copied, setCopied] = useState(false);

  const generateRobotsTxt = useCallback(() => {
    let lines: string[] = [];
    
    userAgents.forEach(config => {
      lines.push(`User-agent: ${config.userAgent}`);
      config.rules.forEach(rule => {
        lines.push(`${rule.type === 'allow' ? 'Allow' : 'Disallow'}: ${rule.path}`);
      });
      if (config.crawlDelay) {
        lines.push(`Crawl-delay: ${config.crawlDelay}`);
      }
      lines.push('');
    });
    
    if (sitemapUrl) {
      lines.push(`Sitemap: ${sitemapUrl}`);
    }
    
    setGeneratedRobotsTxt(lines.join('\n'));
  }, [userAgents, sitemapUrl]);

  const applyTemplate = useCallback((tmpl: string) => {
    if (tmpl === 'custom') return;
    
    const templateConfig = templates[tmpl as keyof typeof templates];
    setUserAgents([{
      userAgent: templateConfig.userAgent,
      rules: templateConfig.rules.map((r: any) => ({ ...r, id: Math.random().toString(36).substr(2, 9) })),
    }]);
    setTemplate(tmpl);
  }, []);

  const addUserAgent = () => {
    setUserAgents([...userAgents, { userAgent: '', rules: [] }]);
  };

  const removeUserAgent = (index: number) => {
    const newAgents = userAgents.filter((_, i) => i !== index);
    setUserAgents(newAgents);
  };

  const updateUserAgent = (index: number, userAgent: string) => {
    const newAgents = [...userAgents];
    newAgents[index].userAgent = userAgent;
    setUserAgents(newAgents);
  };

  const addRule = (agentIndex: number) => {
    const newAgents = [...userAgents];
    newAgents[agentIndex].rules.push({
      id: Math.random().toString(36).substr(2, 9),
      type: 'disallow',
      path: '',
    });
    setUserAgents(newAgents);
  };

  const removeRule = (agentIndex: number, ruleId: string) => {
    const newAgents = [...userAgents];
    newAgents[agentIndex].rules = newAgents[agentIndex].rules.filter(r => r.id !== ruleId);
    setUserAgents(newAgents);
  };

  const updateRule = (agentIndex: number, ruleId: string, field: keyof RobotsRule, value: any) => {
    const newAgents = [...userAgents];
    const ruleIndex = newAgents[agentIndex].rules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      newAgents[agentIndex].rules[ruleIndex][field] = value;
      setUserAgents(newAgents);
    }
  };

  const moveRule = (agentIndex: number, ruleIndex: number, direction: 'up' | 'down') => {
    const newAgents = [...userAgents];
    const rules = [...newAgents[agentIndex].rules];
    
    if (direction === 'up' && ruleIndex > 0) {
      [rules[ruleIndex], rules[ruleIndex - 1]] = [rules[ruleIndex - 1], rules[ruleIndex]];
    } else if (direction === 'down' && ruleIndex < rules.length - 1) {
      [rules[ruleIndex], rules[ruleIndex + 1]] = [rules[ruleIndex + 1], rules[ruleIndex]];
    }
    
    newAgents[agentIndex].rules = rules;
    setUserAgents(newAgents);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedRobotsTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setUserAgents([{ userAgent: '*', rules: [{ id: '1', type: 'allow', path: '/' }] }]);
    setSitemapUrl('');
    setGeneratedRobotsTxt('');
    setTemplate('custom');
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Template</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTemplate('custom')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                template === 'custom' ? "bg-accent text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              Custom
            </button>
            <button
              onClick={() => applyTemplate('allow-all')}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Allow All
            </button>
            <button
              onClick={() => applyTemplate('block-all')}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Block All
            </button>
            <button
              onClick={() => applyTemplate('wordpress')}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              WordPress
            </button>
          </div>
        </div>

        {/* User-Agents and Rules */}
        {userAgents.map((agent, agentIndex) => (
          <div key={agentIndex} className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={agent.userAgent}
                onChange={(e) => updateUserAgent(agentIndex, e.target.value)}
                placeholder="User-agent (e.g., *, Googlebot)"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              {userAgents.length > 1 && (
                <button
                  onClick={() => removeUserAgent(agentIndex)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Rules</span>
                <button
                  onClick={() => addRule(agentIndex)}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
                >
                  <Plus size={14} />
                  Add Rule
                </button>
              </div>

              {agent.rules.length === 0 ? (
                <p className="text-xs text-muted-foreground">No rules defined</p>
              ) : (
                <div className="space-y-2">
                  {agent.rules.map((rule, ruleIndex) => (
                    <div key={rule.id} className="flex items-center gap-2 p-2 bg-background rounded-md border border-border">
                      <select
                        value={rule.type}
                        onChange={(e) => updateRule(agentIndex, rule.id, 'type', e.target.value)}
                        className="px-2 py-1 bg-muted border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="allow">Allow</option>
                        <option value="disallow">Disallow</option>
                      </select>
                      <input
                        type="text"
                        value={rule.path}
                        onChange={(e) => updateRule(agentIndex, rule.id, 'path', e.target.value)}
                        placeholder="/path"
                        className="flex-1 px-2 py-1 bg-muted border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono"
                      />
                      <button
                        onClick={() => moveRule(agentIndex, ruleIndex, 'up')}
                        disabled={ruleIndex === 0}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveRule(agentIndex, ruleIndex, 'down')}
                        disabled={ruleIndex === agent.rules.length - 1}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => removeRule(agentIndex, rule.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Crawl Delay (seconds)</label>
              <input
                type="number"
                value={agent.crawlDelay || ''}
                onChange={(e) => {
                  const newAgents = [...userAgents];
                  newAgents[agentIndex].crawlDelay = e.target.value ? parseInt(e.target.value) : undefined;
                  setUserAgents(newAgents);
                }}
                placeholder="Optional"
                min="0"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addUserAgent}
          className="w-full px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          + Add User-Agent
        </button>

        {/* Sitemap */}
        <div className="space-y-2 pt-4 border-t border-border">
          <label className="text-sm font-medium text-foreground">Sitemap URL</label>
          <input
            type="url"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateRobotsTxt}
          className="w-full px-4 py-3 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Generate robots.txt
        </button>
      </div>

      {/* Output Section */}
      {generatedRobotsTxt && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">robots.txt Preview</h3>
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
                <X size={16} />
                Clear
              </button>
            </div>
          </div>
          <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto">
            <code className="text-xs text-foreground whitespace-pre-wrap font-mono">{generatedRobotsTxt}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
