// src/components/shared/ShareButton.tsx
'use client';

import React, { useState } from 'react';
import { Share2, X, Check, Copy, Twitter, Facebook, Linkedin, MessageCircle, Send, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

interface Platform {
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (url: string, title: string, description?: string) => string;
  action?: (url: string) => Promise<void>;
}

export function ShareButton({ url, title, description, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const platforms: Platform[] = [
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      color: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30',
      getUrl: (url, title) => 
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      color: 'hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30',
      getUrl: (url) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      color: 'hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/30',
      getUrl: (url, title) => 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      color: 'hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30',
      getUrl: (url, title) => 
        `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      name: 'Reddit',
      icon: <Send size={20} />,
      color: 'hover:bg-[#FF4500]/10 hover:text-[#FF4500] hover:border-[#FF4500]/30',
      getUrl: (url, title) => 
        `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
      name: 'Email',
      icon: <Mail size={20} />,
      color: 'hover:bg-gray-500/10 hover:text-gray-600 hover:border-gray-500/30',
      getUrl: (url, title) => 
        `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this tool: ${url}`)}`,
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
        // Track GA4 event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'share_platform', {
            platform: 'native',
            page_url: url,
            page_title: title,
          });
        }
        return true;
      } catch (err) {
        // User cancelled or error - fall back to modal
        return false;
      }
    }
    return false;
  };

  const handlePlatformClick = async (platform: Platform) => {
    // Track GA4 event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share_platform', {
        platform: platform.name.toLowerCase(),
        page_url: url,
        page_title: title,
      });
    }

    const shareUrl = platform.getUrl(url, title, description);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track GA4 event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share_copy_link', {
          page_url: url,
          page_title: title,
        });
      }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleButtonClick = async () => {
    // Track GA4 event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share_button_click', {
        page_url: url,
        page_title: title,
      });
    }

    // Try native share first (mobile)
    const nativeShareSuccess = await handleNativeShare();
    if (!nativeShareSuccess) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleButtonClick}
        aria-label="Share this page"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-violet-500 text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:shadow-xl hover:shadow-accent/30 hover:scale-105",
          className
        )}
      >
        <Share2 size={20} className="text-white" />
        <span className="text-sm font-semibold text-white hidden sm:inline">Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
              <span className="text-sm font-semibold text-text-primary">Share to</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-text-primary transition-colors"
                aria-label="Close share menu"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handlePlatformClick(platform)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/50 transition-all duration-200",
                    platform.color
                  )}
                  aria-label={`Share on ${platform.name}`}
                >
                  <div className="text-text-primary">{platform.icon}</div>
                  <span className="text-[10px] font-medium text-text-secondary">{platform.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border/50">
              <button
                onClick={handleCopyLink}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/50 transition-all duration-200",
                  copied
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "hover:bg-gray-500/10 hover:text-gray-600 hover:border-gray-500/30 text-text-primary"
                )}
                aria-label={copied ? "Link copied" : "Copy link"}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
