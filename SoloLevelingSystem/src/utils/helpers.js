// helpers.js - Common utility functions for the Solo Leveling System

/**
 * Formats experience points with appropriate suffixes (K, M, etc.)
 * @param {number} experience - The raw experience points number
 * @return {string} Formatted experience string
 */
export const formatExperience = (experience) => {
  if (experience >= 1000000) {
    return `${(experience / 1000000).toFixed(1)}M`;
  } else if (experience >= 1000) {
    return `${(experience / 1000).toFixed(1)}K`;
  }
  return experience.toString();
};

/**
 * Calculates level based on total experience points
 * @param {number} experience - Total experience points
 * @return {number} Current level
 */
export const calculateLevel = (experience) => {
  // Logarithmic level scaling (gets harder to level up as you progress)
  return Math.floor(1 + Math.sqrt(experience / 100));
};

/**
 * Calculates experience required for the next level
 * @param {number} currentLevel - User's current level
 * @return {number} Experience points needed for next level
 */
export const experienceForNextLevel = (currentLevel) => {
  return Math.pow(currentLevel + 1, 2) * 100;
};

/**
 * Calculates experience progress percentage towards next level
 * @param {number} experience - Total experience points
 * @return {number} Percentage (0-100) progress to next level
 */
export const calculateLevelProgress = (experience) => {
  const currentLevel = calculateLevel(experience);
  const currentLevelExp = Math.pow(currentLevel, 2) * 100;
  const nextLevelExp = experienceForNextLevel(currentLevel);
  const levelDiff = nextLevelExp - currentLevelExp;
  const currentExp = experience - currentLevelExp;

  return Math.min(100, Math.max(0, (currentExp / levelDiff) * 100));
};

/**
 * Formats time duration from minutes to human-readable format
 * @param {number} minutes - Duration in minutes
 * @return {string} Formatted time string (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Calculates streak bonus multiplier
 * @param {number} streakDays - Current streak in days
 * @return {number} Multiplier for experience points
 */
export const calculateStreakBonus = (streakDays) => {
  // Bonus caps at 2x after 30 consecutive days
  return 1 + Math.min(1, streakDays / 30);
};

/**
 * Generates a unique ID for new quests or tasks
 * @return {string} Unique identifier
 */
export const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Groups quests by category
 * @param {Array} quests - Array of quest objects
 * @return {Object} Quests organized by category
 */
export const groupQuestsByCategory = (quests) => {
  return quests.reduce((acc, quest) => {
    if (!acc[quest.category]) {
      acc[quest.category] = [];
    }
    acc[quest.category].push(quest);
    return acc;
  }, {});
};

/**
 * Calculates completion percentage for a skill or category
 * @param {Array} items - Array of quest or skill objects
 * @return {number} Percentage completion (0-100)
 */
export const calculateCompletionPercentage = (items) => {
  if (!items.length) return 0;

  const completed = items.filter((item) => item.completed).length;
  return Math.round((completed / items.length) * 100);
};

/**
 * Gets appropriate color based on difficulty level
 * @param {string} difficulty - Difficulty level (easy, medium, hard, extreme)
 * @param {Object} colors - Theme colors object
 * @return {string} Color code for the difficulty
 */
export const getDifficultyColor = (difficulty, colors) => {
  const difficultyMap = {
    easy: colors.success,
    medium: colors.warning,
    hard: colors.danger,
    extreme: colors.purple,
  };

  return difficultyMap[difficulty.toLowerCase()] || colors.text;
};

/**
 * Formats date to relative time (e.g., "2 days ago", "just now")
 * @param {Date|string|number} date - Date to format
 * @return {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  return targetDate.toLocaleDateString();
};

/**
 * Shuffles array items (for random quest selection)
 * @param {Array} array - Array to shuffle
 * @return {Array} Shuffled array
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Debounce function to limit frequent function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @return {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clones an object
 * @param {Object} obj - Object to clone
 * @return {Object} Deep cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @return {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculates difficulty level based on user stats and quest requirements
 * @param {Object} userStats - User's current stats
 * @param {Object} questRequirements - Quest's difficulty parameters
 * @return {string} Calculated difficulty (easy, medium, hard, extreme)
 */
export const calculateQuestDifficulty = (userStats, questRequirements) => {
  // Sample algorithm - customize based on your game mechanics
  const userPower =
    (userStats.strength + userStats.intelligence + userStats.discipline) / 3;
  const questPower =
    (questRequirements.strength +
      questRequirements.intelligence +
      questRequirements.discipline) /
    3;

  const ratio = questPower / userPower;

  if (ratio < 0.7) return "easy";
  if (ratio < 1.0) return "medium";
  if (ratio < 1.3) return "hard";
  return "extreme";
};
