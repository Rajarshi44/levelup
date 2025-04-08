// firebase/functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Import other function modules
const questGenerator = require("./questGenerator");
const streakManagement = require("./streakManagement");

// Export all functions
exports.generateDailyQuests = questGenerator.generateDailyQuests;
exports.generateWeeklyMissions = questGenerator.generateWeeklyMissions;
exports.calculateStreak = streakManagement.calculateStreak;
exports.resetMissedQuests = streakManagement.resetMissedQuests;

// Function to calculate and update user level
exports.calculateUserLevel = functions.firestore
  .document("progress/{progressId}")
  .onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;

    if (!data) return null;

    const { userId, domain, value } = data;

    try {
      // Get current user data
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.log("User document does not exist");
        return null;
      }

      const userData = userDoc.data();

      // Calculate new XP
      let xpGain = 0;
      if (domain === "fitness") {
        xpGain = Math.round(value * 2);
      } else if (domain === "coding") {
        xpGain = Math.round(value * 2.5);
      } else if (domain === "discipline") {
        xpGain = Math.round(value * 3);
      }

      let { currentXP, requiredXP, level } = userData;
      currentXP += xpGain;

      // Check for level up
      let leveledUp = false;
      while (currentXP >= requiredXP) {
        level += 1;
        currentXP -= requiredXP;
        requiredXP = Math.floor(requiredXP * 1.5);
        leveledUp = true;
      }

      // Update user data
      const updateData = {
        currentXP,
        requiredXP,
        level,
      };

      // Update domain-specific level if applicable
      if (domain === "fitness") {
        updateData.fitnessLevel = userData.fitnessLevel
          ? userData.fitnessLevel + 0.1
          : 1.1;
      } else if (domain === "coding") {
        updateData.codingLevel = userData.codingLevel
          ? userData.codingLevel + 0.1
          : 1.1;
      } else if (domain === "discipline") {
        updateData.disciplineLevel = userData.disciplineLevel
          ? userData.disciplineLevel + 0.1
          : 1.1;
      }

      await userRef.update(updateData);

      // If user leveled up, create a notification
      if (leveledUp) {
        const notificationsRef = db.collection("notifications").doc(userId);
        await notificationsRef.set(
          {
            notifications: admin.firestore.FieldValue.arrayUnion({
              type: "LEVEL_UP",
              message: `Congratulations! You've reached level ${level}!`,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              read: false,
            }),
          },
          { merge: true }
        );
      }

      return null;
    } catch (error) {
      console.error("Error calculating user level:", error);
      return null;
    }
  });
