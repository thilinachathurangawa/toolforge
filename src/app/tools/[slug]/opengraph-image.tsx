import { ImageResponse } from 'next/og';
import { getTool, CATEGORIES } from '@/lib/constants/tools';

export const alt = 'ToolForge — Free Online Tool';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface OgImageParams {
  params: { slug: string };
}

export default function Image({ params }: OgImageParams) {
  const tool = getTool(params.slug);
  const categoryLabel = tool
    ? CATEGORIES.find((c) => c.value === tool.category)?.label
    : undefined;

  const name = tool?.name ?? 'Free Online Tool';
  const description = tool?.shortDescription ?? '';
  // Long tool names ("Percentage Increase Calculator") need a smaller size to fit.
  const nameFontSize = name.length > 24 ? 56 : 72;

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
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#6366f1',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '26px',
            }}
          >
            ⚒
          </div>
          <div style={{ display: 'flex', fontSize: '32px', color: '#ffffff' }}>
            ToolForge
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {categoryLabel && (
            <div
              style={{
                display: 'flex',
                fontSize: '24px',
                color: '#818cf8',
                textTransform: 'uppercase',
                letterSpacing: '4px',
              }}
            >
              {categoryLabel}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              fontSize: `${nameFontSize}px`,
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
          {description && (
            <div
              style={{
                display: 'flex',
                fontSize: '28px',
                color: '#9ca3af',
                lineHeight: 1.4,
                maxWidth: '980px',
              }}
            >
              {description}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', fontSize: '24px', color: '#818cf8' }}>
            toolforge.website
          </div>
          <div style={{ display: 'flex', fontSize: '24px', color: '#6b7280' }}>
            Free · Private · Runs in your browser
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
