export type OutputFormat =
  | 'original'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/avif';

export type CompressMode = 'quality' | 'targetSize';

export type ItemStatus = 'queued' | 'processing' | 'done' | 'skipped' | 'failed';

export interface CompressSettings {
  mode: CompressMode;
  /** 0.01 – 1.00 */
  quality: number;
  targetSizeKB: number;
  format: OutputFormat;
  /** null means "don't resize" */
  maxDimension: number | null;
  stripMetadata: boolean;
  /** fall back to the original bytes when compression makes the file bigger */
  neverLarger: boolean;
}

export interface QueueItem {
  id: string;
  file: File;
  originalUrl: string;
  width?: number;
  height?: number;
  isAnimatedGif?: boolean;
}

export interface CompressionResult {
  id: string;
  status: ItemStatus;
  outputName: string;
  outputType: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  outputWidth?: number;
  outputHeight?: number;
  blob?: Blob;
  compressedUrl?: string;
  /** 0 – 100, driven by the library's onProgress callback */
  progress: number;
  error?: string;
}

export interface Preset {
  id: string;
  label: string;
  hint: string;
  settings: Partial<CompressSettings>;
}
