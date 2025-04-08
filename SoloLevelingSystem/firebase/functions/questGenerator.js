// firebase/functions/questGenerator.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Generate daily quests for users
exports.generateDailyQuests = functions.pubsub
  .schedule("0 0 * * *") // Run at midnight every day
  .timeZone("UTC")
  .onRun(async (context) => {
    try {
      // Get all users
      const usersSnapshot = await db.collection("users").get();

      const batch = db.batch();

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;

        // Skip users who haven't completed onboarding
        if (!userData.onboardingCompleted) return;

        // Fitness quests
        const fitnessLevel = userData.fitnessLevel || 1;
        let fitnessQuests = [
          {
            id: `fitness-pushups-${Date.now()}`,
            title: `Complete ${Math.round(10 * fitnessLevel)} push-ups`,
            description: "Focus on proper form and controlled movement",
            type: "daily",
            domain: "fitness",
            xpReward: Math.round(20 * fitnessLevel),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: null,
            userId: userId,
          },
          {
            id: `fitness-squats-${Date.now() + 1}`,
            title: `Complete ${Math.round(15 * fitnessLevel)} squats`,
            description: "Keep your back straight and go as low as you can",
            type: "daily",
            domain: "fitness",
            xpReward: Math.round(20 * fitnessLevel),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: null,
            userId: userId,
          },
        ];

        // Coding quests
        const codingLevel = userData.codingLevel || 1;
        let codingQuests = [
          {
            id: `coding-practice-${Date.now()}`,
            title: `Complete ${Math.round(30 * codingLevel)} minutes of coding`,
            description:
              "Focus on learning new concepts or practicing existing skills",
            type: "daily",
            domain: "coding",
            xpReward: Math.round(25 * codingLevel),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: null,
            userId: userId,
          },
        ];

        // Discipline quests
        const disciplineLevel = userData.disciplineLevel || 1;
        let disciplineQuests = [
          {
            id: `discipline-schedule-${Date.now()}`,
            title: "Follow your daily schedule",
            description: "Stick to your planned schedule for the entire day",
            type: "daily",
            domain: "discipline",
            xpReward: Math.round(30 * disciplineLevel),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: null,
            userId: userId,
          },
        ];

        // Add all quests to the user's quests collection
        const quests = [...fitnessQuests, ...codingQuests, ...disciplineQuests];

        quests.forEach((quest) => {
          const questRef = db.collection("quests").doc(quest.id);
          batch.set(questRef, quest);
        });

        // Update user's active quests
        const userRef = db.collection("users").doc(userId);
        batch.update(userRef, {
          activeDailyQuests: admin.firestore.FieldValue.arrayUnion(
            ...quests.map((q) => q.id)
          ),
        });
      });

      await batch.commit();
      console.log("Daily quests generated successfully");
      return null;
    } catch (error) {
      console.error("Error generating daily quests:", error);
      return null;
    }
  });

// Generate weekly missions for users
exports.generateWeeklyMissions = functions.pubsub
  .schedule("0 0 * * 1") // Run at midnight every Monday
  .timeZone("UTC")
  .onRun(async (context) => {
    try {
      // Get all users
      const usersSnapshot = await db.collection("users").get();

      const batch = db.batch();

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;

        // Skip users who haven't completed onboarding
        if (!userData.onboardingCompleted) return;

        // Fitness missions
        const fitnessLevel = userData.fitnessLevel || 1;
        let fitnessMissions = [
          {
            id: `fitness-weekly-${Date.now()}`,
            title: `Complete ${Math.round(
              3 * fitnessLevel
            )} full workout sessions`,
            description: "Complete your scheduled workouts this week",
            type: "weekly",
            domain: "fitness",
            xpReward: Math.round(100 * fitnessLevel),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: null,
            progress: 0,
            target: Math.round(3 * fitnessLevel),
            userId: userId,
          },
        ];

        // Coding missions
        const codingLevel = userData.codingLevel || 1;
        let codingMissions = [
          {
            id: `coding-weekly-${Date.now()}`,
            title: `Spend ${Math.round(5 * codingLevel)} hours coding`,
            description: "Track your total coding time for the week",
            type: "weekly",
            domain: "coding",
            xpReward: Math.round(120 * codingLevel),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: null,
            progress: 0,
            target: Math.round(5 * codingLevel),
            userId: userId,
          },
        ];

        // Discipline missions
        const disciplineLevel = userData.disciplineLevel || 1;
        let disciplineMissions = [
          {
            id: `discipline-weekly-${Date.now()}`,
            title: "Maintain a consistent sleep schedule",
            description: "Go to bed and wake up at consistent times",
            type: "weekly",
            domain: "discipline",
            xpReward: Math.round(150 * disciplineLevel),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: null,
            progress: 0,
            target: 7,
            userId: userId,
          },
        ];

        // Add all missions to the user's quests collection
        const missions = [
          ...fitnessMissions,
          ...codingMissions,
          ...disciplineMissions,
        ];

        missions.forEach((mission) => {
          const missionRef = db.collection("quests").doc(mission.id);
          batch.set(missionRef, mission);
        });

        // Update user's active missions
        const userRef = db.collection("users").doc(userId);
        batch.update(userRef, {
          activeWeeklyMissions: admin.firestore.FieldValue.arrayUnion(
            ...missions.map((m) => m.id)
          ),
        });
      });

      await batch.commit();
      console.log("Weekly missions generated successfully");
      return null;
    } catch (error) {
      console.error("Error generating weekly missions:", error);
      return null;
    }
  });
