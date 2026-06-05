'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MetaTagGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [ogUrl, setOgUrl] = useState('');
  const [ogType, setOgType] = useState('website');
  
  const [twitterCardType, setTwitterCardType] = useState('summary');
  const [twitterTitle, setTwitterTitle] = useState('');
  const [twitterDescription, setTwitterDescription] = useState('');
  const [twitterImage, setTwitterImage] = useState('');
  
  const [includeViewport, setIncludeViewport] = useState(true);
  const [charset, setCharset] = useState('UTF-8');
  const [language, setLanguage] = useState('en');
  
  const [generatedTags, setGeneratedTags] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOgSection, setShowOgSection] = useState(false);
  const [showTwitterSection, setShowTwitterSection] = useState(false);

  const generateTags = useCallback(() => {
    let tags = [];
    
    // Basic meta tags
    if (title) tags.push(`<title>${title}</title>`);
    if (description) tags.push(`<meta name="description" content="${description}">`);
    if (keywords) tags.push(`<meta name="keywords" content="${keywords}">`);
    if (author) tags.push(`<meta name="author" content="${author}">`);
    if (canonicalUrl) tags.push(`<link rel="canonical" href="${canonicalUrl}">`);
    tags.push(`<meta name="robots" content="${robotsIndex ? 'index' : 'noindex'}, ${robotsFollow ? 'follow' : 'nofollow'}">`);
    
    // Open Graph tags
    if (showOgSection) {
      tags.push('');
      tags.push('<!-- Open Graph / Facebook -->');
      if (ogTitle || title) tags.push(`<meta property="og:title" content="${ogTitle || title}">`);
      if (ogDescription || description) tags.push(`<meta property="og:description" content="${ogDescription || description}">`);
      if (ogImage) tags.push(`<meta property="og:image" content="${ogImage}">`);
      if (ogUrl || canonicalUrl) tags.push(`<meta property="og:url" content="${ogUrl || canonicalUrl}">`);
      tags.push(`<meta property="og:type" content="${ogType}">`);
    }
    
    // Twitter Card tags
    if (showTwitterSection) {
      tags.push('');
      tags.push('<!-- Twitter -->');
      tags.push(`<meta name="twitter:card" content="${twitterCardType}">`);
      if (twitterTitle || title) tags.push(`<meta name="twitter:title" content="${twitterTitle || title}">`);
      if (twitterDescription || description) tags.push(`<meta name="twitter:description" content="${twitterDescription || description}">`);
      if (twitterImage || ogImage) tags.push(`<meta name="twitter:image" content="${twitterImage || ogImage}">`);
    }
    
    // Additional meta tags
    tags.push('');
    if (includeViewport) tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    tags.push(`<meta charset="${charset}">`);
    if (language) tags.push(`<meta http-equiv="content-language" content="${language}">`);
    
    setGeneratedTags(tags.join('\n'));
  }, [title, description, keywords, author, canonicalUrl, robotsIndex, robotsFollow, ogTitle, ogDescription, ogImage, ogUrl, ogType, twitterCardType, twitterTitle, twitterDescription, twitterImage, includeViewport, charset, language, showOgSection, showTwitterSection]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
    setKeywords('');
    setAuthor('');
    setCanonicalUrl('');
    setRobotsIndex(true);
    setRobotsFollow(true);
    setOgTitle('');
    setOgDescription('');
    setOgImage('');
    setOgUrl('');
    setOgType('website');
    setTwitterCardType('summary');
    setTwitterTitle('');
    setTwitterDescription('');
    setTwitterImage('');
    setIncludeViewport(true);
    setCharset('UTF-8');
    setLanguage('en');
    setGeneratedTags('');
  };

  const getTitleCharCount = () => title.length;
  const getDescCharCount = () => description.length;

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Basic Meta Tags */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Basic Meta Tags</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Title</label>
              <span className={cn("text-xs font-mono", getTitleCharCount() > 60 ? "text-red-500" : getTitleCharCount() > 50 ? "text-yellow-500" : "text-green-500")}>
                {getTitleCharCount()}/60
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your page title (50-60 characters recommended)"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Description</label>
              <span className={cn("text-xs font-mono", getDescCharCount() > 160 ? "text-red-500" : getDescCharCount() > 150 ? "text-yellow-500" : "text-green-500")}>
                {getDescCharCount()}/160
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Your meta description (150-160 characters recommended)"
              rows={3}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Keywords</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Canonical URL</label>
            <input
              type="url"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={robotsIndex}
                onChange={(e) => setRobotsIndex(e.target.checked)}
                className="rounded accent-accent"
              />
              Index
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={robotsFollow}
                onChange={(e) => setRobotsFollow(e.target.checked)}
                className="rounded accent-accent"
              />
              Follow
            </label>
          </div>
        </div>

        {/* Open Graph Section */}
        <div className="space-y-4">
          <button
            onClick={() => setShowOgSection(!showOgSection)}
            className="flex items-center justify-between w-full text-sm font-medium text-foreground"
          >
            <span>Open Graph Tags</span>
            {showOgSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showOgSection && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">OG Title</label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Leave empty to use page title"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">OG Description</label>
                <textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Leave empty to use page description"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">OG Image URL</label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">OG URL</label>
                <input
                  type="url"
                  value={ogUrl}
                  onChange={(e) => setOgUrl(e.target.value)}
                  placeholder="Leave empty to use canonical URL"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">OG Type</label>
                <select
                  value={ogType}
                  onChange={(e) => setOgType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Twitter Card Section */}
        <div className="space-y-4">
          <button
            onClick={() => setShowTwitterSection(!showTwitterSection)}
            className="flex items-center justify-between w-full text-sm font-medium text-foreground"
          >
            <span>Twitter Card Tags</span>
            {showTwitterSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showTwitterSection && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Card Type</label>
                <select
                  value={twitterCardType}
                  onChange={(e) => setTwitterCardType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Twitter Title</label>
                <input
                  type="text"
                  value={twitterTitle}
                  onChange={(e) => setTwitterTitle(e.target.value)}
                  placeholder="Leave empty to use page title"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Twitter Description</label>
                <textarea
                  value={twitterDescription}
                  onChange={(e) => setTwitterDescription(e.target.value)}
                  placeholder="Leave empty to use page description"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Twitter Image URL</label>
                <input
                  type="url"
                  value={twitterImage}
                  onChange={(e) => setTwitterImage(e.target.value)}
                  placeholder="Leave empty to use OG image"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Additional Options */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">Additional Options</h3>
          
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={includeViewport}
              onChange={(e) => setIncludeViewport(e.target.checked)}
              className="rounded accent-accent"
            />
            Include viewport meta tag
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Charset</label>
            <select
              value={charset}
              onChange={(e) => setCharset(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="UTF-8">UTF-8</option>
              <option value="ISO-8859-1">ISO-8859-1</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Language</label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="en"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateTags}
          className="w-full px-4 py-3 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Generate Meta Tags
        </button>
      </div>

      {/* Output Section */}
      {generatedTags && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Generated Meta Tags</h3>
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
            <code className="text-xs text-foreground whitespace-pre-wrap">{generatedTags}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
