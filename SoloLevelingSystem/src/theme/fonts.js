// src/theme/fonts.js

/**
 * Typography definitions for the Solo Leveling System application
 * Designed to support the futuristic gaming aesthetic
 */

import { Platform } from "react-native";

// Base font families
const fontFamilies = {
  // Primary font - used for most text
  primary: Platform.select({
    ios: "Rajdhani",
    android: "Rajdhani-Regular",
    default: "Rajdhani, sans-serif",
  }),

  // Primary font medium weight
  primaryMedium: Platform.select({
    ios: "Rajdhani-Medium",
    android: "Rajdhani-Medium",
    default: "Rajdhani-Medium, sans-serif",
  }),

  // Primary font semibold weight
  primarySemiBold: Platform.select({
    ios: "Rajdhani-SemiBold",
    android: "Rajdhani-SemiBold",
    default: "Rajdhani-SemiBold, sans-serif",
  }),

  // Primary font bold weight
  primaryBold: Platform.select({
    ios: "Rajdhani-Bold",
    android: "Rajdhani-Bold",
    default: "Rajdhani-Bold, sans-serif",
  }),

  // Secondary font - used for headings and emphasis
  secondary: Platform.select({
    ios: "Orbitron",
    android: "Orbitron-Regular",
    default: "Orbitron, sans-serif",
  }),

  // Secondary font medium weight
  secondaryMedium: Platform.select({
    ios: "Orbitron-Medium",
    android: "Orbitron-Medium",
    default: "Orbitron-Medium, sans-serif",
  }),

  // Secondary font bold weight
  secondaryBold: Platform.select({
    ios: "Orbitron-Bold",
    android: "Orbitron-Bold",
    default: "Orbitron-Bold, sans-serif",
  }),

  // Monospace font - used for code, stats, numbers
  mono: Platform.select({
    ios: "RobotoMono",
    android: "RobotoMono-Regular",
    default: "Roboto Mono, monospace",
  }),
};

// Font sizes
const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
  "4xl": 28,
  "5xl": 32,
  "6xl": 36,
  "7xl": 42,
  "8xl": 48,
  "9xl": 64,
};

// Line heights
const lineHeights = {
  xs: 1.2, // Tighter
  sm: 1.4, // Tight
  md: 1.5, // Normal
  lg: 1.8, // Relaxed
  xl: 2, // Loose
};

// Font weights
const fontWeights = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
};

// Letter spacing
const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
};

// Text variants
const textVariants = {
  // Headings
  h1: {
    fontFamily: fontFamilies.secondaryBold,
    fontSize: fontSizes["6xl"],
    lineHeight: fontSizes["6xl"] * lineHeights.sm,
    letterSpacing: letterSpacing.wide,
  },
  h2: {
    fontFamily: fontFamilies.secondaryBold,
    fontSize: fontSizes["5xl"],
    lineHeight: fontSizes["5xl"] * lineHeights.sm,
    letterSpacing: letterSpacing.wide,
  },
  h3: {
    fontFamily: fontFamilies.secondaryBold,
    fontSize: fontSizes["4xl"],
    lineHeight: fontSizes["4xl"] * lineHeights.sm,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontFamily: fontFamilies.secondaryMedium,
    fontSize: fontSizes["3xl"],
    lineHeight: fontSizes["3xl"] * lineHeights.md,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamilies.secondaryMedium,
    fontSize: fontSizes["2xl"],
    lineHeight: fontSizes["2xl"] * lineHeights.md,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamilies.secondaryMedium,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.md,
    letterSpacing: letterSpacing.normal,
  },

  // Body text
  body1: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.lg,
    letterSpacing: letterSpacing.normal,
  },
  body2: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.lg,
    letterSpacing: letterSpacing.normal,
  },

  // Special text styles
  caption: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.md,
    letterSpacing: letterSpacing.normal,
  },
  button: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.md,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  },
  overline: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.md,
    letterSpacing: letterSpacing.widest,
    textTransform: "uppercase",
  },

  // Special elements
  stats: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.sm,
    letterSpacing: letterSpacing.tight,
  },
  level: {
    fontFamily: fontFamilies.secondaryBold,
    fontSize: fontSizes["3xl"],
    lineHeight: fontSizes["3xl"] * lineHeights.xs,
    letterSpacing: letterSpacing.normal,
  },
  glowText: {
    fontFamily: fontFamilies.secondaryBold,
    fontSize: fontSizes["2xl"],
    lineHeight: fontSizes["2xl"] * lineHeights.xs,
    letterSpacing: letterSpacing.wide,
  },
};

export default {
  fontFamilies,
  fontSizes,
  lineHeights,
  fontWeights,
  letterSpacing,
  textVariants,
};
