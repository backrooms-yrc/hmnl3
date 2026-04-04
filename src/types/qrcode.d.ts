declare module 'qrcode' {
  interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    maskPattern?: number;
    margin?: number;
    width?: number;
    scale?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    type?: 'image/png' | 'image/jpeg' | 'image/webp';
    quality?: number;
    version?: number;
  }

  function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: QRCodeOptions
  ): Promise<HTMLCanvasElement>;

  function toDataURL(
    text: string,
    options?: QRCodeOptions
  ): Promise<string>;

  function toString(
    text: string,
    options?: QRCodeOptions & { type?: 'utf8' | 'svg' }
  ): Promise<string>;

  function toFile(
    path: string,
    text: string,
    options?: QRCodeOptions
  ): Promise<void>;

  function toFileStream(
    stream: NodeJS.WritableStream,
    text: string,
    options?: QRCodeOptions
  ): void;
}
