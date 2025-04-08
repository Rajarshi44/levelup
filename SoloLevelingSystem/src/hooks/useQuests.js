// src/hooks/useQuests.js

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDailyQuests,
  fetchWeeklyQuests,
  completeQuest,
  failQuest,
  abandonQuest,
  addCustomQuest,
} from "../redux/slices/questsSlice";
import { addExperience, levelUp } from "../redux/slices/userSlice";
import {
  getDailyQuestRefreshTime,
  getWeeklyQuestRefreshTime,
  setQuestRefreshTime,
} from "../services/progressService";

/**
 * Custom hook for managing quests
 * Handles logic for quest management, completion, and rewards
 *
 * @returns {Object} Quest methods and data
 */
const useQuests = () => {
  const dispatch = useDispatch();
  const { dailyQuests, weeklyQuests, customQuests } = useSelector(
    (state) => state.quests
  );
  const { level, experience, experienceToNextLevel } = useSelector(
    (state) => state.user
  );

  const [isLoading, setIsLoading] = useState(true);
  const [refreshingDaily, setRefreshingDaily] = useState(false);
  const [refreshingWeekly, setRefreshingWeekly] = useState(false);

  // Quest difficulty multipliers
  const DIFFICULTY_MULTIPLIERS = {
    EASY: 1,
    MEDIUM: 1.5,
    HARD: 2.5,
    EPIC: 4,
  };

  // Quest type multipliers
  const TYPE_MULTIPLIERS = {
    DAILY: 1,
    WEEKLY: 2.5,
    CUSTOM: 1.2,
  };

  /**
   * Check if quests need to be refreshed on app start
   */
  useEffect(() => {
    const checkQuestRefreshes = async () => {
      setIsLoading(true);
      try {
        // Check daily quests
        const dailyRefreshTime = await getDailyQuestRefreshTime();
        const now = new Date().getTime();

        // If no refresh time exists or refresh time has passed
        if (!dailyRefreshTime || now > dailyRefreshTime) {
          await refreshDailyQuests();
        }

        // Check weekly quests
        const weeklyRefreshTime = await getWeeklyQuestRefreshTime();

        // If no refresh time exists or refresh time has passed
        if (!weeklyRefreshTime || now > weeklyRefreshTime) {
          await refreshWeeklyQuests();
        }
      } catch (error) {
        console.error("Error checking quest refreshes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkQuestRefreshes();
  }, []);

  /**
   * Refresh daily quests and set next refresh time
   */
  const refreshDailyQuests = useCallback(async () => {
    setRefreshingDaily(true);
    try {
      // Set next refresh time to tomorrow at midnight
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      await setQuestRefreshTime("daily", tomorrow.getTime());
      dispatch(fetchDailyQuests(level));
    } catch (error) {
      console.error("Error refreshing daily quests:", error);
    } finally {
      setRefreshingDaily(false);
    }
  }, [dispatch, level]);

  /**
   * Refresh weekly quests and set next refresh time
   */
  const refreshWeeklyQuests = useCallback(async () => {
    setRefreshingWeekly(true);
    try {
      // Set next refresh time to next Monday at midnight
      const today = new Date();
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7; // If today is Monday, set to next Monday

      const nextMonday = new Date();
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);

      await setQuestRefreshTime("weekly", nextMonday.getTime());
      dispatch(fetchWeeklyQuests(level));
    } catch (error) {
      console.error("Error refreshing weekly quests:", error);
    } finally {
      setRefreshingWeekly(false);
    }
  }, [dispatch, level]);

  /**
   * Handle quest completion and reward experience
   * @param {string} questId - The ID of the completed quest
   * @param {string} questType - The type of quest (DAILY, WEEKLY, CUSTOM)
   */
  const handleCompleteQuest = useCallback(
    (questId, questType) => {
      // Find the quest by ID and type
      let quest;

      switch (questType) {
        case "DAILY":
          quest = dailyQuests.find((q) => q.id === questId);
          break;
        case "WEEKLY":
          quest = weeklyQuests.find((q) => q.id === questId);
          break;
        case "CUSTOM":
          quest = customQuests.find((q) => q.id === questId);
          break;
        default:
          console.error("Unknown quest type:", questType);
          return;
      }

      if (!quest) {
        console.error("Quest not found:", questId);
        return;
      }

      // Calculate experience reward based on difficulty and type
      const difficultyMultiplier =
        DIFFICULTY_MULTIPLIERS[quest.difficulty] || 1;
      const typeMultiplier = TYPE_MULTIPLIERS[questType] || 1;
      const baseExp = 10 * level; // Scale with level

      const expReward = Math.round(
        baseExp * difficultyMultiplier * typeMultiplier
      );

      // Complete the quest in the store
      dispatch(completeQuest({ questId, questType }));

      // Add experience
      dispatch(addExperience(expReward));

      // Check if leveled up
      if (experience + expReward >= experienceToNextLevel) {
        dispatch(levelUp());
      }

      return {
        quest,
        expReward,
      };
    },
    [
      dailyQuests,
      weeklyQuests,
      customQuests,
      dispatch,
      level,
      experience,
      experienceToNextLevel,
    ]
  );

  /**
   * Handle quest failure
   * @param {string} questId - The ID of the failed quest
   * @param {string} questType - The type of quest (DAILY, WEEKLY, CUSTOM)
   */
  const handleFailQuest = useCallback(
    (questId, questType) => {
      dispatch(failQuest({ questId, questType }));
    },
    [dispatch]
  );

  /**
   * Handle quest abandonment
   * @param {string} questId - The ID of the abandoned quest
   * @param {string} questType - The type of quest (DAILY, WEEKLY, CUSTOM)
   */
  const handleAbandonQuest = useCallback(
    (questId, questType) => {
      dispatch(abandonQuest({ questId, questType }));
    },
    [dispatch]
  );

  /**
   * Create a new custom quest
   * @param {Object} questData - The quest data object
   */
  const createCustomQuest = useCallback(
    (questData) => {
      const newQuest = {
        ...questData,
        id: `custom-${Date.now()}`, // Generate unique ID
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      dispatch(addCustomQuest(newQuest));
      return newQuest;
    },
    [dispatch]
  );

  /**
   * Get all active quests
   * @returns {Array} Array of all active quests
   */
  const getActiveQuests = useCallback(() => {
    const active = [
      ...dailyQuests.filter((q) => q.status === "ACTIVE"),
      ...weeklyQuests.filter((q) => q.status === "ACTIVE"),
      ...customQuests.filter((q) => q.status === "ACTIVE"),
    ];

    return active;
  }, [dailyQuests, weeklyQuests, customQuests]);

  /**
   * Calculate completion rate for quest statistics
   * @param {string} [periodFilter='ALL'] - Filter for time period
   * @returns {Object} Completion statistics
   */
  const getQuestCompletionStats = useCallback(
    (periodFilter = "ALL") => {
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      // Combine all quests
      const allQuests = [...dailyQuests, ...weeklyQuests, ...customQuests];

      // Filter by period if needed
      const filteredQuests =
        periodFilter === "WEEK"
          ? allQuests.filter((q) => {
              const createdAt = new Date(q.createdAt);
              return createdAt >= oneWeekAgo;
            })
          : allQuests;

      // Count completed and total
      const completed = filteredQuests.filter(
        (q) => q.status === "COMPLETED"
      ).length;
      const failed = filteredQuests.filter((q) => q.status === "FAILED").length;
      const total = filteredQuests.length;

      // Calculate statistics
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      const failureRate = total > 0 ? (failed / total) * 100 : 0;

      return {
        completed,
        failed,
        abandoned: total - completed - failed,
        total,
        completionRate: Math.round(completionRate),
        failureRate: Math.round(failureRate),
      };
    },
    [dailyQuests, weeklyQuests, customQuests]
  );

  return {
    dailyQuests,
    weeklyQuests,
    customQuests,
    isLoading,
    refreshingDaily,
    refreshingWeekly,
    refreshDailyQuests,
    refreshWeeklyQuests,
    completeQuest: handleCompleteQuest,
    failQuest: handleFailQuest,
    abandonQuest: handleAbandonQuest,
    createCustomQuest,
    getActiveQuests,
    getQuestCompletionStats,
  };
};

export default useQuests;
