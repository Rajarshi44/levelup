// src/theme/globalStyles.js

/**
 * Global style definitions for the Solo Leveling System application
 * Provides consistent styling across the application
 */

import { StyleSheet } from "react-native";
import colors from "./colors";
import fonts from "./fonts";

// Shadow styles for different elevation levels
const shadows = {
  small: {
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.effects.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  levelUpGlow: {
    shadowColor: colors.effects.levelUp,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
};

// Border styles
const borders = {
  thin: {
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  medium: {
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  thick: {
    borderWidth: 3,
    borderColor: colors.ui.border,
  },
  accent: {
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  secondary: {
    borderWidth: 2,
    borderColor: colors.secondary.main,
  },
  dashed: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderStyle: "dashed",
  },
};

// Border radius
const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

// Spacing scale
const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
};

// Layout styles
const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  content: {
    flex: 1,
    padding: spacing["4"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
};

// Card styles
const cards = {
  base: {
    backgroundColor: colors.ui.card,
    borderRadius: borderRadius.lg,
    padding: spacing["4"],
    ...shadows.medium,
  },
  elevated: {
    backgroundColor: colors.ui.card,
    borderRadius: borderRadius.lg,
    padding: spacing["4"],
    ...shadows.large,
  },
  quest: {
    backgroundColor: colors.ui.card,
    borderRadius: borderRadius.md,
    padding: spacing["3"],
    borderLeftWidth: 4,
    ...shadows.small,
  },
  stats: {
    backgroundColor: colors.primary.faded,
    borderRadius: borderRadius.md,
    padding: spacing["3"],
    ...borders.thin,
    ...shadows.small,
  },
};

// Button styles
const buttons = {
  primary: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["6"],
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  secondary: {
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["6"],
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  outline: {
    backgroundColor: "transparent",
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["6"],
    borderRadius: borderRadius.md,
    ...borders.medium,
  },
  text: {
    backgroundColor: "transparent",
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["4"],
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.ui.secondaryBackground,
    ...shadows.small,
  },
  disabled: {
    opacity: 0.5,
  },
};

// Animation properties
const animations = {
  timing: {
    fast: 200,
    medium: 400,
    slow: 800,
  },
  easing: {
    // To be used with Animated.Easing
    default: "easeInOut",
    bounce: "bounce",
    elastic: "elastic",
  },
};

// Progress bar and level indicators
const progressIndicators = {
  container: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.ui.secondaryBackground,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  levelCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary.main,
    ...shadows.glow,
  },
};

// Form input styles
const inputs = {
  base: {
    backgroundColor: colors.ui.secondaryBackground,
    borderRadius: borderRadius.md,
    padding: spacing["3"],
    color: colors.text.primary,
    ...fonts.textVariants.body2,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  focused: {
    borderColor: colors.primary.main,
    ...shadows.small,
  },
  error: {
    borderColor: colors.status.error,
  },
  label: {
    ...fonts.textVariants.caption,
    color: colors.text.secondary,
    marginBottom: spacing["1"],
  },
  errorText: {
    ...fonts.textVariants.caption,
    color: colors.status.error,
    marginTop: spacing["1"],
  },
};

// Tab navigation styles
const tabs = {
  indicator: {
    backgroundColor: colors.primary.main,
    height: 3,
    borderRadius: borderRadius.full,
  },
  tabBar: {
    backgroundColor: colors.ui.secondaryBackground,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tabLabel: {
    ...fonts.textVariants.caption,
  },
  active: {
    ...shadows.glow,
  },
};

// Global styles object
const globalStyles = StyleSheet.create({
  // Text styles
  h1: fonts.textVariants.h1,
  h2: fonts.textVariants.h2,
  h3: fonts.textVariants.h3,
  h4: fonts.textVariants.h4,
  h5: fonts.textVariants.h5,
  h6: fonts.textVariants.h6,
  body1: fonts.textVariants.body1,
  body2: fonts.textVariants.body2,
  caption: fonts.textVariants.caption,
  button: fonts.textVariants.button,
  overline: fonts.textVariants.overline,
  stats: fonts.textVariants.stats,
  level: fonts.textVariants.level,
  glowText: fonts.textVariants.glowText,

  // Text colors
  textPrimary: {
    color: colors.text.primary,
  },
  textSecondary: {
    color: colors.text.secondary,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
  textHint: {
    color: colors.text.hint,
  },
  textLink: {
    color: colors.text.link,
  },
  textSuccess: {
    color: colors.status.success,
  },
  textWarning: {
    color: colors.status.warning,
  },
  textError: {
    color: colors.status.error,
  },
  textInfo: {
    color: colors.status.info,
  },

  // Layout styles
  container: layout.container,
  safeArea: layout.safeArea,
  content: layout.content,
  row: layout.row,
  column: layout.column,
  centered: layout.centered,
  spaceBetween: layout.spaceBetween,

  // Margin utility classes
  mt1: { marginTop: spacing["1"] },
  mt2: { marginTop: spacing["2"] },
  mt3: { marginTop: spacing["3"] },
  mt4: { marginTop: spacing["4"] },
  mb1: { marginBottom: spacing["1"] },
  mb2: { marginBottom: spacing["2"] },
  mb3: { marginBottom: spacing["3"] },
  mb4: { marginBottom: spacing["4"] },
  ml1: { marginLeft: spacing["1"] },
  ml2: { marginLeft: spacing["2"] },
  ml3: { marginLeft: spacing["3"] },
  ml4: { marginLeft: spacing["4"] },
  mr1: { marginRight: spacing["1"] },
  mr2: { marginRight: spacing["2"] },
  mr3: { marginRight: spacing["3"] },
  mr4: { marginRight: spacing["4"] },
  mx1: { marginHorizontal: spacing["1"] },
  mx2: { marginHorizontal: spacing["2"] },
  mx3: { marginHorizontal: spacing["3"] },
  mx4: { marginHorizontal: spacing["4"] },
  my1: { marginVertical: spacing["1"] },
  my2: { marginVertical: spacing["2"] },
  my3: { marginVertical: spacing["3"] },
  my4: { marginVertical: spacing["4"] },
  m1: { margin: spacing["1"] },
  m2: { margin: spacing["2"] },
  m3: { margin: spacing["3"] },
  m4: { margin: spacing["4"] },

  // Padding utility classes
  pt1: { paddingTop: spacing["1"] },
  pt2: { paddingTop: spacing["2"] },
  pt3: { paddingTop: spacing["3"] },
  pt4: { paddingTop: spacing["4"] },
  pb1: { paddingBottom: spacing["1"] },
  pb2: { paddingBottom: spacing["2"] },
  pb3: { paddingBottom: spacing["3"] },
  pb4: { paddingBottom: spacing["4"] },
  pl1: { paddingLeft: spacing["1"] },
  pl2: { paddingLeft: spacing["2"] },
  pl3: { paddingLeft: spacing["3"] },
  pl4: { paddingLeft: spacing["4"] },
  pr1: { paddingRight: spacing["1"] },
  pr2: { paddingRight: spacing["2"] },
  pr3: { paddingRight: spacing["3"] },
  pr4: { paddingRight: spacing["4"] },
  px1: { paddingHorizontal: spacing["1"] },
  px2: { paddingHorizontal: spacing["2"] },
  px3: { paddingHorizontal: spacing["3"] },
  px4: { paddingHorizontal: spacing["4"] },
  py1: { paddingVertical: spacing["1"] },
  py2: { paddingVertical: spacing["2"] },
  py3: { paddingVertical: spacing["3"] },
  py4: { paddingVertical: spacing["4"] },
  p1: { padding: spacing["1"] },
  p2: { padding: spacing["2"] },
  p3: { padding: spacing["3"] },
  p4: { padding: spacing["4"] },
});

export default {
  colors,
  fonts,
  shadows,
  borders,
  borderRadius,
  spacing,
  layout,
  cards,
  buttons,
  animations,
  progressIndicators,
  inputs,
  tabs,
  globalStyles,
};
