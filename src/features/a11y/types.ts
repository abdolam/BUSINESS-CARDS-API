export type ContrastMode = "none" | "high" | "blue" | "yellow";

export type A11yState = {
  largeText: boolean;
  reduceMotion: boolean;
  readingFont: boolean;
  underlineLinks: boolean;
  contrast: ContrastMode;
  fontScale: number;
};
