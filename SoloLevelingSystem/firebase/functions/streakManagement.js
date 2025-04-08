// firebase/functions/streakManagement.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Calculate and update user streak
exports.calculateStreak = functions.pubsub
  .schedule("1 0 * * *") // Run at 00:01 every day
  .timeZone("UTC")
  .onRun(async (context) => {
    try {
      // Get all users
      const usersSnapshot = await db.collection("users").get();

      const batch = db.batch();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Format yesterday's date as YYYY-MM-DD
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        const userId = doc.id;

        // Skip users who haven't completed onboarding
        if (!userData.onboardingCompleted) continue;

        // Check if user completed any quests yesterday
        const questsQuery = await db
          .collection("quests")
          .where("userId", "==", userId)
          .where(
            "completedAt",
            ">=",
            admin.firestore.Timestamp.fromDate(
              new Date(`${yesterdayStr}T00:00:00Z`)
            )
          )
          .where(
            "completedAt",
            "<=",
            admin.firestore.Timestamp.fromDate(
              new Date(`${yesterdayStr}T23:59:59Z`)
            )
          )
          .limit(1)
          .get();

        const userRef = db.collection("users").doc(userId);

        if (!questsQuery.empty) {
          // User completed at least one quest yesterday, increase streak
          const newStreak = (userData.streak || 0) + 1;
          batch.update(userRef, { streak: newStreak });

          // If streak milestone reached, add bonus XP
          if (newStreak % 7 === 0) {
            batch.update(userRef, {
              currentXP: admin.firestore.FieldValue.increment(100),
              disciplineLevel: admin.firestore.FieldValue.increment(0.2),
            });

            // Add streak milestone notification
            const notificationsRef = db.collection("notifications").doc(userId);
            batch.set(
              notificationsRef,
              {
                notifications: admin.firestore.FieldValue.arrayUnion({
                  type: "STREAK_MILESTONE",
                  message: `Congratulations! You've maintained a ${newStreak}-day streak. +100 XP bonus!`,
                  timestamp: admin.firestore.FieldValue.serverTimestamp(),
                  read: false,
                }),
              },
              { merge: true }
            );
          }
        } else {
          // User didn't complete any quests yesterday, reset streak
          batch.update(userRef, { streak: 0 });

          // Add streak reset notification
          const notificationsRef = db.collection("notifications").doc(userId);
          batch.set(
            notificationsRef,
            {
              notifications: admin.firestore.FieldValue.arrayUnion({
                type: "STREAK_RESET",
                message:
                  "Your streak has been reset. Complete quests today to start a new streak!",
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                read: false,
              }),
            },
            { merge: true }
          );
        }
      }

      await batch.commit();
      console.log("Streaks calculated successfully");
      return null;
    } catch (error) {
      console.error("Error calculating streaks:", error);
      return null;
    }
  });

// Reset missed quests and apply penalties
exports.resetMissedQuests = functions.pubsub
  .schedule("0 0 * * *") // Run at midnight every day
  .timeZone("UTC")
  .onRun(async (context) => {
    try {
      // Get all users
      const usersSnapshot = await db.collection("users").get();

      const batch = db.batch();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        const userId = doc.id;

        // Skip users who haven't completed onboarding
        if (!userData.onboardingCompleted) continue;

        // Get user's settings to determine penalty level
        const penaltyLevel = userData.settings?.penaltyLevel || "moderate";

        // Get all daily quests that weren't completed yesterday
        const missedQuestsQuery = await db
          .collection("quests")
          .where("userId", "==", userId)
          .where("type", "==", "daily")
          .where("completedAt", "==", null)
          .where("createdAt", "<", today)
          .get();

        if (missedQuestsQuery.empty) continue;

        const missedQuests = [];
        const missedQuestIds = [];

        missedQuestsQuery.forEach((questDoc) => {
          missedQuests.push(questDoc.data());
          missedQuestIds.push(questDoc.id);
        });

        // Calculate XP penalty based on penalty level
        let xpPenaltyMultiplier = 0;
        switch (penaltyLevel) {
          case "gentle":
            xpPenaltyMultiplier = 0.3;
            break;
          case "moderate":
            xpPenaltyMultiplier = 0.5;
            break;
          case "strict":
            xpPenaltyMultiplier = 1.0;
            break;
          default:
            xpPenaltyMultiplier = 0.5;
        }

        const totalPenalty = Math.round(
          missedQuests.reduce((total, quest) => total + quest.xpReward, 0) *
            xpPenaltyMultiplier
        );

        // Update user's XP with penalty
        const userRef = db.collection("users").doc(userId);
        batch.update(userRef, {
          currentXP: admin.firestore.FieldValue.increment(-totalPenalty),
          activeDailyQuests: admin.firestore.FieldValue.arrayRemove(
            ...missedQuestIds
          ),
        });

        // Mark missed quests as expired
        missedQuestIds.forEach((questId) => {
          const questRef = db.collection("quests").doc(questId);
          batch.update(questRef, {
            status: "expired",
            expiredAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

        // Add penalty notification
        if (totalPenalty > 0) {
          const notificationsRef = db.collection("notifications").doc(userId);
          batch.set(
            notificationsRef,
            {
              notifications: admin.firestore.FieldValue.arrayUnion({
                type: "XP_PENALTY",
                message: `You missed ${missedQuests.length} quests yesterday. -${totalPenalty} XP penalty applied.`,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                read: false,
              }),
            },
            { merge: true }
          );
        }
      }

      await batch.commit();
      console.log("Missed quests reset successfully");
      return null;
    } catch (error) {
      console.error("Error resetting missed quests:", error);
      return null;
    }
  });
