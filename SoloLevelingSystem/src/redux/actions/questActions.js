import { createSlice } from "@reduxjs/toolkit";
import { firebase } from "../../services/firebase";
import { progressService } from "../../services/progressService";
import { notificationService } from "../../services/notificationService";

// Action Types
export const FETCH_QUESTS_REQUEST = "FETCH_QUESTS_REQUEST";
export const FETCH_QUESTS_SUCCESS = "FETCH_QUESTS_SUCCESS";
export const FETCH_QUESTS_FAILURE = "FETCH_QUESTS_FAILURE";
export const ACCEPT_QUEST = "ACCEPT_QUEST";
export const COMPLETE_QUEST = "COMPLETE_QUEST";
export const ABANDON_QUEST = "ABANDON_QUEST";
export const UPDATE_QUEST_PROGRESS = "UPDATE_QUEST_PROGRESS";
export const GENERATE_DAILY_QUESTS = "GENERATE_DAILY_QUESTS";
export const CLAIM_QUEST_REWARD = "CLAIM_QUEST_REWARD";

/**
 * Fetch all available quests for the user
 */
export const fetchQuests = () => {
  return async (dispatch, getState) => {
    const { user } = getState();

    dispatch({ type: FETCH_QUESTS_REQUEST });

    try {
      // Get user's level and stats to determine appropriate quests
      const { level, stats } = user;

      // Fetch quests from Firebase or local storage
      const questsRef = firebase.firestore().collection("quests");

      // Query for quests appropriate for user's level
      let questsQuery = questsRef
        .where("minLevel", "<=", level)
        .where("maxLevel", ">=", level);

      // Execute the query
      const questsSnapshot = await questsQuery.get();

      let quests = [];
      questsSnapshot.forEach((doc) => {
        quests.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Add the active quests from user data
      const userQuestsRef = firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("activeQuests");

      const activeQuestsSnapshot = await userQuestsRef.get();

      let activeQuests = [];
      activeQuestsSnapshot.forEach((doc) => {
        activeQuests.push({
          id: doc.id,
          ...doc.data(),
          active: true,
        });
      });

      // Combine available and active quests
      const allQuests = [...quests, ...activeQuests];

      // Filter out duplicates (quests that are both in the available pool and active)
      const uniqueQuests = allQuests.filter(
        (quest, index, self) =>
          index === self.findIndex((q) => q.id === quest.id)
      );

      dispatch({
        type: FETCH_QUESTS_SUCCESS,
        payload: uniqueQuests,
      });
    } catch (error) {
      console.error("Error fetching quests:", error);

      dispatch({
        type: FETCH_QUESTS_FAILURE,
        payload: error.message,
      });
    }
  };
};

/**
 * Accept a quest and add it to user's active quests
 * @param {string} questId - ID of the quest to accept
 */
export const acceptQuest = (questId) => {
  return async (dispatch, getState) => {
    const { user, quests } = getState();

    try {
      // Find the quest in available quests
      const quest = quests.available.find((q) => q.id === questId);

      if (!quest) {
        throw new Error("Quest not found");
      }

      // Check if user has reached maximum active quests
      if (quests.active.length >= 5) {
        throw new Error("Maximum active quests reached (5)");
      }

      // Add to user's active quests in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("activeQuests")
        .doc(questId)
        .set({
          ...quest,
          acceptedAt: new Date().toISOString(),
          progress: 0,
          completed: false,
        });

      // Update local state
      dispatch({
        type: ACCEPT_QUEST,
        payload: {
          questId,
          quest: {
            ...quest,
            acceptedAt: new Date().toISOString(),
            progress: 0,
            completed: false,
            active: true,
          },
        },
      });

      // Show notification
      notificationService.showSuccess("Quest accepted! Good luck, adventurer!");
    } catch (error) {
      console.error("Error accepting quest:", error);
      notificationService.showError(`Failed to accept quest: ${error.message}`);
    }
  };
};

/**
 * Update the progress of an active quest
 * @param {string} questId - ID of the quest
 * @param {number} progress - New progress value (0-100)
 */
export const updateQuestProgress = (questId, progress) => {
  return async (dispatch, getState) => {
    const { user, quests } = getState();

    try {
      // Find the quest in active quests
      const quest = quests.active.find((q) => q.id === questId);

      if (!quest) {
        throw new Error("Quest not found in active quests");
      }

      // Validate progress value
      const validProgress = Math.max(0, Math.min(100, progress));

      // Update in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("activeQuests")
        .doc(questId)
        .update({
          progress: validProgress,
          lastUpdated: new Date().toISOString(),
        });

      // Update local state
      dispatch({
        type: UPDATE_QUEST_PROGRESS,
        payload: {
          questId,
          progress: validProgress,
        },
      });

      // If progress reaches 100%, mark as completed
      if (validProgress >= 100) {
        dispatch(completeQuest(questId));
      }
    } catch (error) {
      console.error("Error updating quest progress:", error);
    }
  };
};

/**
 * Mark a quest as completed
 * @param {string} questId - ID of the completed quest
 */
export const completeQuest = (questId) => {
  return async (dispatch, getState) => {
    const { user, quests } = getState();

    try {
      // Find the quest in active quests
      const quest = quests.active.find((q) => q.id === questId);

      if (!quest) {
        throw new Error("Quest not found in active quests");
      }

      // Update in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("activeQuests")
        .doc(questId)
        .update({
          completed: true,
          completedAt: new Date().toISOString(),
          progress: 100,
        });

      // Also add to completed quests collection
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("completedQuests")
        .doc(questId)
        .set({
          ...quest,
          completed: true,
          completedAt: new Date().toISOString(),
          progress: 100,
        });

      // Update local state
      dispatch({
        type: COMPLETE_QUEST,
        payload: {
          questId,
          completedAt: new Date().toISOString(),
        },
      });

      // Show notification and update user's streak
      notificationService.showSuccess(
        "Quest completed! Rewards awaiting claim."
      );

      // Update user's streak
      progressService.updateDailyStreak(user.uid);
    } catch (error) {
      console.error("Error completing quest:", error);
      notificationService.showError(
        `Failed to complete quest: ${error.message}`
      );
    }
  };
};

/**
 * Abandon an active quest
 * @param {string} questId - ID of the quest to abandon
 */
export const abandonQuest = (questId) => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Remove from user's active quests in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("activeQuests")
        .doc(questId)
        .delete();

      // Update local state
      dispatch({
        type: ABANDON_QUEST,
        payload: {
          questId,
        },
      });

      notificationService.showInfo("Quest abandoned. New adventures await!");
    } catch (error) {
      console.error("Error abandoning quest:", error);
      notificationService.showError(
        `Failed to abandon quest: ${error.message}`
      );
    }
  };
};

/**
 * Claim rewards for a completed quest
 * @param {string} questId - ID of the completed quest
 */
export const claimQuestReward = (questId) => {
  return async (dispatch, getState) => {
    const { user, quests } = getState();

    try {
      // Find the quest in completed quests
      const quest = quests.completed.find((q) => q.id === questId);

      if (!quest) {
        throw new Error("Completed quest not found");
      }

      if (quest.rewardClaimed) {
        throw new Error("Reward already claimed");
      }

      // Process rewards
      const rewards = quest.rewards || {
        experience: 50,
        stats: {
          strength: 1,
          intelligence: 1,
          discipline: 1,
        },
      };

      // Apply rewards to user
      await progressService.applyRewards(user.uid, rewards);

      // Mark reward as claimed
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("completedQuests")
        .doc(questId)
        .update({
          rewardClaimed: true,
          claimedAt: new Date().toISOString(),
        });

      // Update local state
      dispatch({
        type: CLAIM_QUEST_REWARD,
        payload: {
          questId,
          rewards,
          claimedAt: new Date().toISOString(),
        },
      });

      // Show notification with obtained rewards
      notificationService.showReward("Rewards claimed!", rewards);
    } catch (error) {
      console.error("Error claiming quest reward:", error);
      notificationService.showError(`Failed to claim reward: ${error.message}`);
    }
  };
};

/**
 * Generate daily quests for the user
 */
export const generateDailyQuests = () => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Call the Firebase function to generate daily quests
      const result = await firebase.functions().httpsCallable("questGenerator")(
        {
          userId: user.uid,
          level: user.level,
          stats: user.stats,
        }
      );

      if (result.data && result.data.success) {
        // Refresh quests to get the newly generated ones
        dispatch(fetchQuests());

        notificationService.showSuccess("New daily quests generated!");
      } else {
        throw new Error(result.data.error || "Failed to generate daily quests");
      }
    } catch (error) {
      console.error("Error generating daily quests:", error);
      notificationService.showError(
        `Failed to generate daily quests: ${error.message}`
      );
    }
  };
};
