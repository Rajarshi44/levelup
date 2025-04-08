import firebase from "../firebase";
import { notificationService } from "./notificationService";

/**
 * Service to handle user progress tracking, stats calculations, and milestones
 */
class ProgressService {
  constructor() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
  }

  /**
   * Get the current user's progress data
   * @returns {Promise} User progress data
   */
  async getUserProgress() {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const progressDoc = await this.db
        .collection("userProgress")
        .doc(userId)
        .get();
      return progressDoc.exists
        ? progressDoc.data()
        : this.initializeUserProgress();
    } catch (error) {
      console.error("Error getting user progress:", error);
      throw error;
    }
  }

  /**
   * Initialize a new user's progress data structure
   * @returns {Promise} Newly created progress data
   */
  async initializeUserProgress() {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const initialProgress = {
        userId,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        stats: {
          strength: 10,
          intelligence: 10,
          discipline: 10,
          vitality: 10,
          agility: 10,
        },
        skills: {
          coding: { level: 1, experience: 0 },
          fitness: { level: 1, experience: 0 },
          productivity: { level: 1, experience: 0 },
        },
        streak: {
          current: 0,
          longest: 0,
          lastCheckedIn: null,
        },
        achievements: [],
        milestones: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await this.db.collection("userProgress").doc(userId).set(initialProgress);
      return initialProgress;
    } catch (error) {
      console.error("Error initializing user progress:", error);
      throw error;
    }
  }

  /**
   * Update user progress after completing a quest or action
   * @param {Object} progressUpdate - Progress update data
   * @returns {Promise} Updated progress with new calculations
   */
  async updateProgress(progressUpdate) {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      // Get current progress
      const progressDoc = await this.db
        .collection("userProgress")
        .doc(userId)
        .get();
      const currentProgress = progressDoc.exists
        ? progressDoc.data()
        : await this.initializeUserProgress();

      // Apply updates
      const updatedProgress = this.calculateProgressUpdates(
        currentProgress,
        progressUpdate
      );

      // Check for level up
      const didLevelUp = currentProgress.level < updatedProgress.level;

      // Save to database
      await this.db
        .collection("userProgress")
        .doc(userId)
        .update({
          ...updatedProgress,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

      // Handle level up notification if needed
      if (didLevelUp) {
        await notificationService.sendLevelUpNotification(
          updatedProgress.level
        );

        // Log level up event
        await this.db.collection("userEvents").add({
          userId,
          type: "LEVEL_UP",
          data: {
            newLevel: updatedProgress.level,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          },
        });
      }

      return updatedProgress;
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  }

  /**
   * Calculate new progress values based on updates
   * @param {Object} currentProgress - Current progress data
   * @param {Object} update - Update data
   * @returns {Object} Calculated progress with new values
   */
  calculateProgressUpdates(currentProgress, update) {
    // Create a copy to avoid mutation
    const progress = { ...currentProgress };

    // Add experience
    if (update.experience) {
      progress.experience += update.experience;

      // Check for level up
      while (progress.experience >= progress.experienceToNextLevel) {
        progress.experience -= progress.experienceToNextLevel;
        progress.level += 1;

        // Increase experience requirement for next level
        progress.experienceToNextLevel = Math.floor(
          progress.experienceToNextLevel * 1.2
        );
      }
    }

    // Update stats
    if (update.stats) {
      Object.keys(update.stats).forEach((statKey) => {
        if (progress.stats[statKey] !== undefined) {
          progress.stats[statKey] += update.stats[statKey];
        }
      });
    }

    // Update skills
    if (update.skills) {
      Object.keys(update.skills).forEach((skillKey) => {
        if (progress.skills[skillKey]) {
          progress.skills[skillKey].experience += update.skills[skillKey];

          // Check for skill level up
          const experienceNeeded = progress.skills[skillKey].level * 50;
          if (progress.skills[skillKey].experience >= experienceNeeded) {
            progress.skills[skillKey].experience -= experienceNeeded;
            progress.skills[skillKey].level += 1;
          }
        }
      });
    }

    // Handle achievements and milestones
    if (update.achievement) {
      progress.achievements.push({
        id: update.achievement.id,
        name: update.achievement.name,
        unlockedAt: new Date().toISOString(),
      });
    }

    if (update.milestone) {
      progress.milestones.push({
        id: update.milestone.id,
        name: update.milestone.name,
        completedAt: new Date().toISOString(),
      });
    }

    return progress;
  }

  /**
   * Check and update user streak
   * @returns {Promise} Updated streak data
   */
  async updateStreak() {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const progressDoc = await this.db
        .collection("userProgress")
        .doc(userId)
        .get();
      if (!progressDoc.exists) await this.initializeUserProgress();

      const currentProgress = progressDoc.data();
      const lastCheckin =
        currentProgress.streak.lastCheckedIn?.toDate() || new Date(0);
      const today = new Date();

      // Reset timezone for accurate day comparison
      lastCheckin.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      // Calculate days between checkins
      const diffTime = Math.abs(today - lastCheckin);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = { ...currentProgress.streak };

      if (diffDays === 1) {
        // Consecutive day - increase streak
        newStreak.current += 1;
        newStreak.longest = Math.max(newStreak.current, newStreak.longest);
      } else if (diffDays > 1) {
        // Streak broken - reset
        newStreak.current = 1;
      } else if (diffDays === 0) {
        // Already checked in today - no change
        return currentProgress.streak;
      }

      // Update the last check-in date
      newStreak.lastCheckedIn = firebase.firestore.FieldValue.serverTimestamp();

      // Update streak in database
      await this.db.collection("userProgress").doc(userId).update({
        streak: newStreak,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Check for streak achievements
      await this.checkStreakAchievements(newStreak.current);

      return newStreak;
    } catch (error) {
      console.error("Error updating streak:", error);
      throw error;
    }
  }

  /**
   * Check for streak-based achievements
   * @param {number} currentStreak - Current streak count
   */
  async checkStreakAchievements(currentStreak) {
    const streakMilestones = [3, 7, 14, 30, 60, 90];

    for (const milestone of streakMilestones) {
      if (currentStreak === milestone) {
        await this.unlockAchievement({
          id: `streak_${milestone}`,
          name: `${milestone} Day Streak`,
          description: `Maintained a ${milestone}-day streak!`,
        });

        // Only handle one milestone at a time
        break;
      }
    }
  }

  /**
   * Unlock a new achievement
   * @param {Object} achievement - Achievement data
   */
  async unlockAchievement(achievement) {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      // Add to user achievements
      await this.db
        .collection("userProgress")
        .doc(userId)
        .update({
          achievements: firebase.firestore.FieldValue.arrayUnion({
            ...achievement,
            unlockedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

      // Send achievement notification
      await notificationService.sendAchievementNotification(achievement);
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      throw error;
    }
  }

  /**
   * Get summary of user progress trends
   * @param {string} timeframe - Time period for analysis (day, week, month)
   * @returns {Promise} Progress summary and trends
   */
  async getProgressSummary(timeframe = "week") {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      // Get user progress history
      const progressSnapshot = await this.db
        .collection("userEvents")
        .where("userId", "==", userId)
        .where("timestamp", ">=", this.getTimeframeDate(timeframe))
        .orderBy("timestamp", "asc")
        .get();

      // Get current progress
      const currentProgress = await this.getUserProgress();

      // Calculate stats
      const activities = progressSnapshot.docs.map((doc) => doc.data());

      // Process activities to extract trends
      const summary = {
        experienceGained: activities.reduce(
          (sum, activity) => sum + (activity.data.experience || 0),
          0
        ),
        questsCompleted: activities.filter((a) => a.type === "QUEST_COMPLETED")
          .length,
        skillProgress: this.calculateSkillProgressTrends(
          activities,
          currentProgress
        ),
        streakStatus: currentProgress.streak,
        recentAchievements: currentProgress.achievements
          .slice(-5)
          .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)),
      };

      return summary;
    } catch (error) {
      console.error("Error getting progress summary:", error);
      throw error;
    }
  }

  /**
   * Calculate skill progress trends from activity history
   * @param {Array} activities - User activities
   * @param {Object} currentProgress - Current progress data
   * @returns {Object} Skill progress trends
   */
  calculateSkillProgressTrends(activities, currentProgress) {
    const skillTrends = {};

    // Initialize with current skills
    Object.keys(currentProgress.skills).forEach((skillKey) => {
      skillTrends[skillKey] = {
        currentLevel: currentProgress.skills[skillKey].level,
        progressToNext: this.calculateProgressPercentage(
          currentProgress.skills[skillKey].experience,
          currentProgress.skills[skillKey].level * 50
        ),
        growth: 0, // To be calculated
      };
    });

    // Calculate growth from activities
    activities.forEach((activity) => {
      if (activity.type === "SKILL_PROGRESS" && activity.data.skill) {
        const skillKey = activity.data.skill;
        if (skillTrends[skillKey]) {
          skillTrends[skillKey].growth += activity.data.amount || 0;
        }
      }
    });

    return skillTrends;
  }

  /**
   * Calculate percentage progress
   * @param {number} current - Current value
   * @param {number} target - Target value
   * @returns {number} Percentage (0-100)
   */
  calculateProgressPercentage(current, target) {
    return Math.min(100, Math.round((current / target) * 100));
  }

  /**
   * Get date for timeframe calculations
   * @param {string} timeframe - Timeframe (day, week, month)
   * @returns {Date} Date object for start of timeframe
   */
  getTimeframeDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case "day":
        now.setHours(0, 0, 0, 0);
        return now;
      case "week":
        now.setDate(now.getDate() - 7);
        return now;
      case "month":
        now.setMonth(now.getMonth() - 1);
        return now;
      default:
        now.setDate(now.getDate() - 7); // Default to week
        return now;
    }
  }
}

export const progressService = new ProgressService();
