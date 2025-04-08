import { firebase } from "../../services/firebase";
import { aiService } from "../../services/aiService";
import { notificationService } from "../../services/notificationService";

// Action Types
export const FETCH_USER_REQUEST = "FETCH_USER_REQUEST";
export const FETCH_USER_SUCCESS = "FETCH_USER_SUCCESS";
export const FETCH_USER_FAILURE = "FETCH_USER_FAILURE";
export const UPDATE_USER_STATS = "UPDATE_USER_STATS";
export const INCREASE_LEVEL = "INCREASE_LEVEL";
export const UPDATE_STREAK = "UPDATE_STREAK";
export const FETCH_SCHEDULE_REQUEST = "FETCH_SCHEDULE_REQUEST";
export const FETCH_SCHEDULE_SUCCESS = "FETCH_SCHEDULE_SUCCESS";
export const FETCH_SCHEDULE_FAILURE = "FETCH_SCHEDULE_FAILURE";
export const ADD_TASK = "ADD_TASK";
export const UPDATE_TASK = "UPDATE_TASK";
export const DELETE_TASK = "DELETE_TASK";
export const COMPLETE_TASK = "COMPLETE_TASK";
export const FETCH_COACH_SUGGESTIONS = "FETCH_COACH_SUGGESTIONS";
export const SEND_MESSAGE = "SEND_MESSAGE";
export const RECEIVE_MESSAGE = "RECEIVE_MESSAGE";
export const LEVEL_UP_NOTIFICATION = "LEVEL_UP_NOTIFICATION";

/**
 * Fetch current user data
 */
export const fetchUser = () => {
  return async (dispatch, getState) => {
    dispatch({ type: FETCH_USER_REQUEST });

    try {
      // Get current Firebase auth user
      const currentUser = firebase.auth().currentUser;

      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      // Get user document from Firestore
      const userDoc = await firebase
        .firestore()
        .collection("users")
        .doc(currentUser.uid)
        .get();

      if (!userDoc.exists) {
        throw new Error("User document not found");
      }

      const userData = userDoc.data();

      // Fetch user's streak data
      const streakDoc = await firebase
        .firestore()
        .collection("users")
        .doc(currentUser.uid)
        .collection("stats")
        .doc("streak")
        .get();

      let streakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
      };

      if (streakDoc.exists) {
        streakData = streakDoc.data();
      }

      // Dispatch success with combined user data
      dispatch({
        type: FETCH_USER_SUCCESS,
        payload: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || userData.displayName,
          photoURL: currentUser.photoURL || userData.photoURL,
          ...userData,
          streak: streakData,
        },
      });

      // Check if user needs to level up
      const { level, experience } = userData;
      const requiredExp = calculateRequiredExp(level);

      if (experience >= requiredExp) {
        dispatch(increaseLevel());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);

      dispatch({
        type: FETCH_USER_FAILURE,
        payload: error.message,
      });
    }
  };
};

/**
 * Update user stats
 * @param {Object} statsUpdates - Object containing stat updates
 */
export const updateUserStats = (statsUpdates) => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Get current stats
      const currentStats = user.stats || {};

      // Calculate new stats by applying updates
      const newStats = {
        ...currentStats,
      };

      // Update each provided stat
      Object.keys(statsUpdates).forEach((stat) => {
        if (typeof newStats[stat] === "number") {
          newStats[stat] += statsUpdates[stat];
        } else {
          newStats[stat] = statsUpdates[stat];
        }
      });

      // Update in Firebase
      await firebase.firestore().collection("users").doc(user.uid).update({
        stats: newStats,
      });

      // Update local state
      dispatch({
        type: UPDATE_USER_STATS,
        payload: newStats,
      });
    } catch (error) {
      console.error("Error updating user stats:", error);
      notificationService.showError(`Failed to update stats: ${error.message}`);
    }
  };
};

/**
 * Increase user level
 */
export const increaseLevel = () => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Calculate new level and remaining experience
      const currentLevel = user.level;
      const currentExp = user.experience;
      const requiredExp = calculateRequiredExp(currentLevel);
      const remainingExp = currentExp - requiredExp;

      // New level and stats
      const newLevel = currentLevel + 1;

      // Update in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          level: newLevel,
          experience: remainingExp,
          // Give stat points on level up
          statPoints: (user.statPoints || 0) + 3,
          lastLevelUp: new Date().toISOString(),
        });

      // Update local state
      dispatch({
        type: INCREASE_LEVEL,
        payload: {
          level: newLevel,
          experience: remainingExp,
          statPoints: (user.statPoints || 0) + 3,
        },
      });

      // Show level up notification
      dispatch({
        type: LEVEL_UP_NOTIFICATION,
        payload: {
          show: true,
          level: newLevel,
        },
      });

      notificationService.showLevelUp(
        "Level Up!",
        `You've reached level ${newLevel}!`
      );
    } catch (error) {
      console.error("Error increasing level:", error);
    }
  };
};

/**
 * Update user streak
 */
export const updateStreak = () => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      const now = new Date();
      const lastCheckIn = user.streak.lastCheckIn
        ? new Date(user.streak.lastCheckIn)
        : null;

      let currentStreak = user.streak.currentStreak || 0;
      let longestStreak = user.streak.longestStreak || 0;

      // If this is the first check-in or last check-in was yesterday
      if (!lastCheckIn) {
        currentStreak = 1;
      } else {
        // Calculate difference in days
        const diffTime = Math.abs(now - lastCheckIn);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          currentStreak += 1;
        } else if (diffDays === 0) {
          // Already checked in today, do nothing
          return;
        } else {
          // Streak broken
          currentStreak = 1;
        }
      }

      // Update longest streak if needed
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      const streakData = {
        currentStreak,
        longestStreak,
        lastCheckIn: now.toISOString(),
      };

      // Update in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("stats")
        .doc("streak")
        .set(streakData);

      // Update local state
      dispatch({
        type: UPDATE_STREAK,
        payload: streakData,
      });

      // Show notification if streak increased
      if (currentStreak > 1) {
        notificationService.showSuccess(
          `${currentStreak} Day Streak! Keep it up!`
        );
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };
};

/**
 * Fetch user's schedule
 * @param {string} dateStart - Start date in ISO format (optional)
 * @param {string} dateEnd - End date in ISO format (optional)
 */
export const fetchSchedule = (dateStart, dateEnd) => {
  return async (dispatch, getState) => {
    const { user } = getState();

    dispatch({ type: FETCH_SCHEDULE_REQUEST });

    try {
      // Set default date range to current month if not provided
      const now = new Date();
      const start = dateStart
        ? new Date(dateStart)
        : new Date(now.getFullYear(), now.getMonth(), 1);
      const end = dateEnd
        ? new Date(dateEnd)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Format dates for Firestore query
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];

      // Query tasks within date range
      const tasksRef = firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("tasks")
        .where("date", ">=", startStr)
        .where("date", "<=", endStr);

      const tasksSnapshot = await tasksRef.get();

      // Organize tasks by date
      const schedule = {};

      tasksSnapshot.forEach((doc) => {
        const task = {
          id: doc.id,
          ...doc.data(),
        };

        const date = task.date;

        if (!schedule[date]) {
          schedule[date] = [];
        }

        schedule[date].push(task);
      });

      dispatch({
        type: FETCH_SCHEDULE_SUCCESS,
        payload: schedule,
      });
    } catch (error) {
      console.error("Error fetching schedule:", error);

      dispatch({
        type: FETCH_SCHEDULE_FAILURE,
        payload: error.message,
      });
    }
  };
};

/**
 * Add a task to schedule
 * @param {Object} task - Task object
 */
export const addTask = (task) => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Validate task object
      if (!task.title || !task.date) {
        throw new Error("Task title and date are required");
      }

      // Add to Firebase
      const taskRef = await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("tasks")
        .add({
          ...task,
          completed: false,
          createdAt: new Date().toISOString(),
        });

      const newTask = {
        id: taskRef.id,
        ...task,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      // Update local state
      dispatch({
        type: ADD_TASK,
        payload: newTask,
      });

      notificationService.showSuccess("Task added to schedule");

      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      notificationService.showError(`Failed to add task: ${error.message}`);
      return null;
    }
  };
};

/**
 * Update a task
 * @param {string} taskId - ID of the task to update
 * @param {Object} updates - Updates to apply to the task
 */
export const updateTask = (taskId, updates) => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Update in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("tasks")
        .doc(taskId)
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        });

      // Update local state
      dispatch({
        type: UPDATE_TASK,
        payload: {
          taskId,
          updates: {
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      notificationService.showError(`Failed to update task: ${error.message}`);
      return false;
    }
  };
};

/**
 * Complete a task
 * @param {string} taskId - ID of the task to complete
 */
export const completeTask = (taskId) => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Update in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("tasks")
        .doc(taskId)
        .update({
          completed: true,
          completedAt: new Date().toISOString(),
        });

      // Update local state
      dispatch({
        type: COMPLETE_TASK,
        payload: {
          taskId,
          completedAt: new Date().toISOString(),
        },
      });

      // Update streak
      dispatch(updateStreak());

      // Apply rewards based on task category
      const { schedule } = getState().user;

      // Find the completed task
      let completedTask = null;
      Object.values(schedule).forEach((dayTasks) => {
        const task = dayTasks.find((t) => t.id === taskId);
        if (task) {
          completedTask = task;
        }
      });

      if (completedTask) {
        const category = completedTask.category || "default";
        const statsUpdate = {};

        // Apply stat rewards based on category
        switch (category) {
          case "physical":
            statsUpdate.strength = 2;
            statsUpdate.endurance = 1;
            break;
          case "coding":
            statsUpdate.intelligence = 2;
            statsUpdate.problem_solving = 1;
            break;
          case "learning":
            statsUpdate.intelligence = 1;
            statsUpdate.wisdom = 1;
            break;
          case "discipline":
            statsUpdate.discipline = 2;
            statsUpdate.consistency = 1;
            break;
          default:
            statsUpdate.discipline = 1;
        }

        // Add experience for all task completions
        statsUpdate.experience = 5;

        // Update user stats with rewards
        dispatch(updateUserStats(statsUpdate));
      }

      notificationService.showSuccess("Task completed! Experience gained.");

      return true;
    } catch (error) {
      console.error("Error completing task:", error);
      notificationService.showError(
        `Failed to complete task: ${error.message}`
      );
      return false;
    }
  };
};

/**
 * Delete a task
 * @param {string} taskId - ID of the task to delete
 */
export const deleteTask = (taskId) => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Delete from Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("tasks")
        .doc(taskId)
        .delete();

      // Update local state
      dispatch({
        type: DELETE_TASK,
        payload: {
          taskId,
        },
      });

      notificationService.showInfo("Task removed from schedule");

      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      notificationService.showError(`Failed to delete task: ${error.message}`);
      return false;
    }
  };
};

/**
 * Fetch AI coach conversation suggestions
 */
export const fetchCoachSuggestions = () => {
  return async (dispatch) => {
    try {
      // Get suggestions from AI service
      const suggestions = await aiService.getCoachSuggestions();

      dispatch({
        type: FETCH_COACH_SUGGESTIONS,
        payload: suggestions,
      });
    } catch (error) {
      console.error("Error fetching coach suggestions:", error);
    }
  };
};

/**
 * Send message to AI coach
 * @param {string} message - Message to send
 */
export const sendMessage = (message) => {
  return async (dispatch, getState) => {
    const { user } = getState();

    try {
      // Add user message to conversation
      const userMessage = {
        sender: "user",
        text: message,
        timestamp: new Date().toISOString(),
      };

      // Update local state with user message
      dispatch({
        type: SEND_MESSAGE,
        payload: userMessage,
      });

      // Get AI response
      const response = await aiService.getCoachResponse(message, {
        level: user.level,
        stats: user.stats,
        schedule: user.schedule,
      });

      // Format AI response
      const aiMessage = {
        sender: "coach",
        text: response.message,
        timestamp: new Date().toISOString(),
      };

      // Add delay to simulate AI thinking
      setTimeout(() => {
        // Update local state with AI response
        dispatch({
          type: RECEIVE_MESSAGE,
          payload: aiMessage,
        });

        // Apply any suggested stat changes from AI
        if (response.statChanges) {
          dispatch(updateUserStats(response.statChanges));
        }
      }, 1000);

      // Store conversation in Firebase
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("conversations")
        .add({
          userMessage,
          aiMessage,
          createdAt: new Date().toISOString(),
        });
    } catch (error) {
      console.error("Error in AI coach conversation:", error);

      // Send a fallback message if AI service fails
      const fallbackMessage = {
        sender: "coach",
        text: "I'm having trouble connecting right now. Let's continue our conversation a bit later when my systems are back online.",
        timestamp: new Date().toISOString(),
      };

      dispatch({
        type: RECEIVE_MESSAGE,
        payload: fallbackMessage,
      });
    }
  };
};

/**
 * Calculate required experience points for level up
 * @param {number} level - Current level
 * @returns {number} Required experience points
 */
const calculateRequiredExp = (level) => {
  // Experience formula: 100 * (level^1.5)
  return Math.floor(100 * Math.pow(level, 1.5));
};
