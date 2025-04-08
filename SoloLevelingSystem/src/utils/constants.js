// constants.js - Shared constants across the Solo Leveling System

// App Configuration
export const APP_VERSION = "1.0.0";
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRY_ATTEMPTS = 3;

// Categories for quests and skills
export const CATEGORIES = {
  PHYSICAL: "physical",
  CODING: "coding",
  DISCIPLINE: "discipline",
  LEARNING: "learning",
  SPECIAL: "special",
  DAILY: "daily",
};

// Difficulty levels
export const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  EXTREME: "extreme",
};

// Experience points rewards based on difficulty
export const XP_REWARDS = {
  [DIFFICULTY.EASY]: 50,
  [DIFFICULTY.MEDIUM]: 100,
  [DIFFICULTY.HARD]: 200,
  [DIFFICULTY.EXTREME]: 500,
};

// Experience bonus multipliers
export const BONUS_MULTIPLIERS = {
  STREAK_DAILY: 0.1, // +10% per day, caps at +100%
  COMBO_COMPLETION: 0.5, // +50% for completing related quests
  SPECIAL_EVENT: 2.0, // 2x for special event quests
};

// User stats and attributes
export const ATTRIBUTES = {
  STRENGTH: "strength",
  INTELLIGENCE: "intelligence",
  DISCIPLINE: "discipline",
  CREATIVITY: "creativity",
  FOCUS: "focus",
  CONSISTENCY: "consistency",
};

// Default attribute starting values
export const DEFAULT_ATTRIBUTES = {
  [ATTRIBUTES.STRENGTH]: 10,
  [ATTRIBUTES.INTELLIGENCE]: 10,
  [ATTRIBUTES.DISCIPLINE]: 10,
  [ATTRIBUTES.CREATIVITY]: 10,
  [ATTRIBUTES.FOCUS]: 10,
  [ATTRIBUTES.CONSISTENCY]: 10,
};

// Skills that can be leveled up
export const SKILLS = {
  // Physical skills
  ENDURANCE: "endurance",
  FLEXIBILITY: "flexibility",
  STRENGTH: "strength",

  // Coding skills
  FRONTEND: "frontendDev",
  BACKEND: "backendDev",
  ALGORITHMS: "algorithms",
  AI_ML: "aiMl",

  // Mental skills
  FOCUS: "focus",
  TIME_MANAGEMENT: "timeManagement",
  CONSISTENCY: "consistency",
  PROBLEM_SOLVING: "problemSolving",
};

// Quest status states
export const QUEST_STATUS = {
  AVAILABLE: "available",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
  FAILED: "failed",
  LOCKED: "locked",
};

// Time intervals in milliseconds
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 300,
  NORMAL: 500,
  SLOW: 800,
  LEVEL_UP: 1500,
};

// Local storage keys
export const STORAGE_KEYS = {
  USER_DATA: "solo_leveling_user",
  QUESTS: "solo_leveling_quests",
  STATS: "solo_leveling_stats",
  SETTINGS: "solo_leveling_settings",
  AUTH_TOKEN: "solo_leveling_auth",
  THEME: "solo_leveling_theme",
  STREAK: "solo_leveling_streak",
  LAST_ACTIVE: "solo_leveling_last_active",
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection.",
  AUTH: "Authentication failed. Please login again.",
  GENERAL: "Something went wrong. Please try again later.",
  VALIDATION: "Please check your inputs and try again.",
  QUEST_LOCKED:
    "This quest is currently locked. Complete prerequisite quests first.",
  QUEST_EXPIRED: "This quest has expired. Check for new quests.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  QUEST_COMPLETE: "Quest completed! Experience gained.",
  LEVEL_UP: "Level up! New abilities unlocked.",
  STREAK_MILESTONE: "Streak milestone reached! Bonus multiplier increased.",
  SKILL_IMPROVED: "Skill improved! New quests available.",
};

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

// Default quest templates
export const DEFAULT_QUESTS = {
  PHYSICAL: [
    {
      id: "phys_1",
      title: "Morning Workout",
      description: "Complete your morning exercise routine",
      category: CATEGORIES.PHYSICAL,
      difficulty: DIFFICULTY.MEDIUM,
      xp: XP_REWARDS[DIFFICULTY.MEDIUM],
      duration: 30, // minutes
      attribute: ATTRIBUTES.STRENGTH,
    },
    // Add more physical quests
  ],
  CODING: [
    {
      id: "code_1",
      title: "Coding Challenge",
      description: "Complete today's coding challenge",
      category: CATEGORIES.CODING,
      difficulty: DIFFICULTY.MEDIUM,
      xp: XP_REWARDS[DIFFICULTY.MEDIUM],
      duration: 60,
      attribute: ATTRIBUTES.INTELLIGENCE,
    },
    // Add more coding quests
  ],
  DISCIPLINE: [
    {
      id: "disc_1",
      title: "Early Rise",
      description: "Wake up at 5:30 AM",
      category: CATEGORIES.DISCIPLINE,
      difficulty: DIFFICULTY.HARD,
      xp: XP_REWARDS[DIFFICULTY.HARD],
      duration: 15,
      attribute: ATTRIBUTES.DISCIPLINE,
    },
    // Add more discipline quests
  ],
};

// Achievement thresholds
export const ACHIEVEMENTS = {
  STREAK: {
    BRONZE: 7, // 7 days
    SILVER: 30, // 30 days
    GOLD: 100, // 100 days
    PLATINUM: 365, // 365 days
  },
  QUESTS: {
    BRONZE: 10, // 10 quests
    SILVER: 50, // 50 quests
    GOLD: 200, // 200 quests
    PLATINUM: 1000, // 1000 quests
  },
  LEVEL: {
    BRONZE: 10, // Level 10
    SILVER: 25, // Level 25
    GOLD: 50, // Level 50
    PLATINUM: 100, // Level 100
  },
};

// Progression milestones (unlocks new features)
export const PROGRESSION_MILESTONES = {
  AI_COACH: 10, // Level 10 unlocks AI coach
  ADVANCED_QUESTS: 15, // Level 15 unlocks advanced quests
  SKILL_SPECIALIZATION: 20, // Level 20 unlocks skill specialization
  QUEST_CREATION: 25, // Level 25 unlocks custom quest creation
  ACHIEVEMENTS: 5, // Level 5 unlocks achievements system
};

// App routes
export const ROUTES = {
  LOGIN: "Login",
  REGISTER: "Register",
  ONBOARDING: "Onboarding",
  DASHBOARD: "Dashboard",
  QUESTS: "Quests",
  STATS: "Stats",
  SETTINGS: "Settings",
  AI_COACH: "AiCoach",
  SCHEDULE: "Schedule",
};
