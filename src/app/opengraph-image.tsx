import { ImageResponse } from 'next/og';
import { TOOLS } from '@/lib/constants/tools';

export const alt = 'ToolForge — Free Online Tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  const toolCount = Math.floor(TOOLS.length / 10) * 10;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0b0d14',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.25) 0%, transparent 45%)',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#6366f1',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '28px',
            }}
          >
            ⚒
          </div>
          <div style={{ display: 'flex', fontSize: '36px', color: '#ffffff' }}>
            ToolForge
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '68px',
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            {`${toolCount}+ Free Online Tools`}
          </div>
          <div style={{ display: 'flex', fontSize: '30px', color: '#9ca3af' }}>
            Image, text, developer &amp; calculator utilities — all in your browser.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', fontSize: '24px', color: '#818cf8' }}>
            toolforge.website
          </div>
          <div style={{ display: 'flex', fontSize: '24px', color: '#6b7280' }}>
            Free · Private · No sign-up
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
