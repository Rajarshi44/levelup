// src/theme/colors.js

/**
 * Color palette for the Solo Leveling System application
 * Inspired by gaming interfaces with a futuristic aesthetic
 */

export const colors = {
  // Primary color scheme
  primary: {
    main: "#6C63FF", // Main purple - primary actions, highlights
    light: "#8A84FF", // Lighter shade for hover states
    dark: "#4A43D9", // Darker shade for pressed states
    faded: "rgba(108, 99, 255, 0.15)", // For backgrounds, cards
  },

  // Secondary color scheme
  secondary: {
    main: "#00D9C0", // Teal - secondary actions, accents
    light: "#33FFDF", // For highlights and glows
    dark: "#00A895", // For pressed states
    faded: "rgba(0, 217, 192, 0.15)", // For minor UI elements
  },

  // Experience level colors
  level: {
    beginner: "#4CAF50", // Green for beginner level
    intermediate: "#2196F3", // Blue for intermediate level
    advanced: "#F44336", // Red for advanced level
    master: "#FFD700", // Gold for master level
  },

  // UI element colors
  ui: {
    card: "#1C1A2E", // Card backgrounds
    background: "#121019", // Main app background
    secondaryBackground: "#201C33", // Secondary background
    border: "#352F5B", // Borders for cards and elements
    divider: "#352F5B", // Dividers between sections
  },

  // Text colors
  text: {
    primary: "#FFFFFF", // Main text
    secondary: "#B4B0CF", // Secondary, less emphasized text
    disabled: "#6E6A8A", // Disabled text
    hint: "#85819F", // Hint text
    link: "#8A84FF", // Links
  },

  // Status colors
  status: {
    success: "#4CAF50", // Success messages and completed items
    warning: "#FFC107", // Warning messages
    error: "#F44336", // Error messages
    info: "#2196F3", // Information messages
    inactive: "#6E6A8A", // Inactive items
  },

  // Special effect colors
  effects: {
    glow: "#6C63FF", // Glow effect color
    highlight: "#8A84FF", // Highlight color
    shadow: "rgba(0, 0, 0, 0.5)", // Shadow color
    overlay: "rgba(18, 16, 25, 0.85)", // Overlay color
    levelUp: "#FFD700", // Level up celebration color
  },

  // Quest difficulty colors
  difficulty: {
    easy: "#4CAF50", // Easy quests
    medium: "#FFC107", // Medium difficulty quests
    hard: "#F44336", // Hard quests
    epic: "#9C27B0", // Epic quests
  },

  // Common colors
  common: {
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },
};

export default colors;
