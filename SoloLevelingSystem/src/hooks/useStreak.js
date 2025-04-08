// src/hooks/useStreak.js

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { format, differenceInDays, isYesterday, isToday } from "date-fns";
import {
  updateStreak,
  resetStreak,
  unlockStreakAchievement,
} from "../redux/slices/userSlice";
import {
  getLastLoginTimestamp,
  setLastLoginTimestamp,
} from "../services/progressService";

/**
 * Custom hook for managing user streaks
 * Handles logic for calculating, maintaining and rewarding streaks
 *
 * @returns {Object} Streak methods and data
 */
const useStreak = () => {
  const dispatch = useDispatch();
  const { streak, maxStreak } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [streakUpdated, setStreakUpdated] = useState(false);

  // Streak thresholds for achievements
  const STREAK_ACHIEVEMENTS = {
    NOVICE: 3,
    CONSISTENT: 7,
    DEDICATED: 14,
    COMMITTED: 30,
    UNSTOPPABLE: 60,
    LEGENDARY: 100,
  };

  /**
   * Initialize and check streaks when the app is opened
   */
  useEffect(() => {
    const checkLoginStreak = async () => {
      setIsLoading(true);
      try {
        const lastLogin = await getLastLoginTimestamp();
        const today = new Date();

        // First time user
        if (!lastLogin) {
          await setLastLoginTimestamp(today.getTime());
          dispatch(updateStreak(1));
          setStreakUpdated(true);
          return;
        }

        const lastLoginDate = new Date(lastLogin);

        // User already logged in today
        if (isToday(lastLoginDate)) {
          // Streak already counted for today
          setStreakUpdated(false);
          return;
        }

        // User logged in yesterday - continue streak
        if (isYesterday(lastLoginDate)) {
          await setLastLoginTimestamp(today.getTime());
          dispatch(updateStreak(streak + 1));
          checkStreakAchievements(streak + 1);
          setStreakUpdated(true);
          return;
        }

        // User missed a day or more - reset streak
        const daysSinceLastLogin = differenceInDays(today, lastLoginDate);
        if (daysSinceLastLogin > 1) {
          await setLastLoginTimestamp(today.getTime());
          dispatch(resetStreak());
          setStreakUpdated(true);
          return;
        }
      } catch (error) {
        console.error("Error checking login streak:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStreak();
  }, [dispatch, streak]);

  /**
   * Check if user has reached streak achievement thresholds
   * @param {number} currentStreak - The user's current streak count
   */
  const checkStreakAchievements = (currentStreak) => {
    // Check each achievement threshold
    Object.entries(STREAK_ACHIEVEMENTS).forEach(([achievement, threshold]) => {
      if (currentStreak === threshold) {
        dispatch(
          unlockStreakAchievement({
            type: achievement,
            days: threshold,
          })
        );
      }
    });
  };

  /**
   * Get a description of the next streak achievement
   * @returns {Object} Next achievement details
   */
  const getNextStreakGoal = () => {
    // Find next achievement threshold
    const nextThreshold = Object.values(STREAK_ACHIEVEMENTS).find(
      (threshold) => threshold > streak
    );

    if (!nextThreshold) {
      return {
        days: streak,
        nextGoal: null,
        daysToGo: 0,
        description: "You've reached legendary status!",
      };
    }

    const daysToGo = nextThreshold - streak;
    const nextAchievementName = Object.keys(STREAK_ACHIEVEMENTS).find(
      (key) => STREAK_ACHIEVEMENTS[key] === nextThreshold
    );

    return {
      days: streak,
      nextGoal: nextThreshold,
      daysToGo,
      description: `${daysToGo} days until ${nextAchievementName.toLowerCase()} status!`,
    };
  };

  /**
   * Format streak for display
   * @returns {string} Formatted streak string
   */
  const getFormattedStreak = () => {
    return `${streak} day${streak !== 1 ? "s" : ""}`;
  };

  /**
   * Calculate streak progress percentage to next milestone
   * @returns {number} Percentage complete to next milestone
   */
  const getStreakProgress = () => {
    const { nextGoal } = getNextStreakGoal();
    if (!nextGoal) return 100;

    // Find previous threshold
    const thresholds = Object.values(STREAK_ACHIEVEMENTS).sort((a, b) => a - b);
    const prevThreshold = [...thresholds, 0].filter((t) => t < streak).pop();

    // Calculate progress percentage
    const totalDays = nextGoal - prevThreshold;
    const daysCompleted = streak - prevThreshold;
    return Math.round((daysCompleted / totalDays) * 100);
  };

  return {
    streak,
    maxStreak,
    isLoading,
    streakUpdated,
    getNextStreakGoal,
    getFormattedStreak,
    getStreakProgress,
    resetStreak: () => dispatch(resetStreak()),
  };
};

export default useStreak;
