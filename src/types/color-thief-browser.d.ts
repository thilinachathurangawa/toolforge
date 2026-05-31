declare module 'color-thief-browser' {
  export default class ColorThief {
    constructor();
    getPalette(image: HTMLImageElement, colorCount: number): [number, number, number][];
    getColor(image: HTMLImageElement): [number, number, number];
  }
}
