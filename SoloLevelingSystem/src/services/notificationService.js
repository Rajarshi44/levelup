// services/notificationService.js
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#50fa7b",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save the token to the user's document in Firestore
  if (auth.currentUser) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      expoPushToken: token,
      notificationsEnabled: true,
    });
  }

  // Also save locally
  await AsyncStorage.setItem("expoPushToken", token);

  return true;
};

export const scheduleNotification = async (
  title,
  body,
  triggerTime,
  data = {},
  options = {}
) => {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: options.sound || "default",
      badge: options.badge,
      color: options.color || "#50fa7b",
    },
    trigger: triggerTime,
  });

  return identifier;
};

export const scheduleTaskReminder = async (task) => {
  // Schedule initial reminder 30 minutes before task
  const reminderTime = new Date(task.dueDate);
  reminderTime.setMinutes(reminderTime.getMinutes() - 30);

  const initialId = await scheduleNotification(
    `${task.title} - Coming Up`,
    `Your task "${task.title}" is scheduled to begin in 30 minutes.`,
    { date: reminderTime },
    { taskId: task.id }
  );

  // Schedule urgent reminder at task start time
  const urgentId = await scheduleNotification(
    `⚠️ ${task.title} - Start Now`,
    `It's time to begin "${task.title}". Tap to mark as in-progress.`,
    { date: new Date(task.dueDate) },
    { taskId: task.id, action: "start" },
    { sound: "urgent" }
  );

  // Schedule penalty warning if task is still not done
  const warningTime = new Date(task.dueDate);
  warningTime.setMinutes(warningTime.getMinutes() + 15);

  const warningId = await scheduleNotification(
    `⚠️ PENALTY WARNING - ${task.title}`,
    `You're at risk of missing "${task.title}"! Complete it now to avoid XP penalties.`,
    { date: warningTime },
    { taskId: task.id, action: "warning" },
    { sound: "warning" }
  );

  // Store notification IDs with the task for later cancellation if needed
  const userRef = doc(db, "users", auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  const taskNotifications = userDoc.data().taskNotifications || {};

  await updateDoc(userRef, {
    taskNotifications: {
      ...taskNotifications,
      [task.id]: {
        initialId,
        urgentId,
        warningId,
      },
    },
  });
};

export const cancelTaskNotifications = async (taskId) => {
  const userRef = doc(db, "users", auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  const taskNotifications = userDoc.data().taskNotifications || {};

  if (taskNotifications[taskId]) {
    const { initialId, urgentId, warningId } = taskNotifications[taskId];
    await Notifications.cancelScheduledNotificationAsync(initialId);
    await Notifications.cancelScheduledNotificationAsync(urgentId);
    await Notifications.cancelScheduledNotificationAsync(warningId);

    // Remove from stored notifications
    const updatedNotifications = { ...taskNotifications };
    delete updatedNotifications[taskId];

    await updateDoc(userRef, {
      taskNotifications: updatedNotifications,
    });
  }
};

export const scheduleMotivationalNotifications = async (userPreferences) => {
  const { wakeUpTime, sleepTime, motivationalFrequency } = userPreferences;

  // Parse times into Date objects
  const wakeUp = new Date();
  const [wakeHours, wakeMinutes] = wakeUpTime.split(":").map(Number);
  wakeUp.setHours(wakeHours, wakeMinutes);

  const sleep = new Date();
  const [sleepHours, sleepMinutes] = sleepTime.split(":").map(Number);
  sleep.setHours(sleepHours, sleepMinutes);

  // Calculate active hours
  let activeHours = (sleep - wakeUp) / (1000 * 60 * 60);
  if (activeHours < 0) activeHours += 24; // Handle case when sleep time is on next day

  // Calculate interval between motivational notifications
  const interval = activeHours / motivationalFrequency;

  // Store notification IDs
  const notificationIds = [];

  // Create motivational quotes
  const motivationalQuotes = [
    "Every day is a chance to level up. What will you conquer today?",
    "Your consistency builds your strength. Keep pushing!",
    "Obstacles are just XP waiting to be earned.",
    "The greatest power-ups come after the toughest battles.",
    "Progress is not a straight line. Every small win counts.",
    "You're not just coding - you're building your future skillset.",
    "Physical training isn't just about your body, it's upgrading your entire system.",
    "Discipline is choosing between what you want now and what you want most.",
    "Your past self set these quests. Your future self is waiting for the rewards.",
    "Legendary characters are built through daily grinding.",
  ];

  // Schedule notifications throughout the day
  for (let i = 0; i < motivationalFrequency; i++) {
    const notificationTime = new Date(wakeUp);
    notificationTime.setHours(
      wakeUp.getHours() + i * interval,
      wakeUp.getMinutes()
    );

    // Ensure the time is valid for today
    if (notificationTime > new Date()) {
      const quoteIndex = Math.floor(Math.random() * motivationalQuotes.length);
      const id = await scheduleNotification(
        "Solo Leveling System",
        motivationalQuotes[quoteIndex],
        { date: notificationTime }
      );
      notificationIds.push(id);
    }
  }

  // Store notification IDs
  await AsyncStorage.setItem(
    "motivationalNotificationIds",
    JSON.stringify(notificationIds)
  );

  return notificationIds;
};

export const clearAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Clean up stored notification IDs
  await AsyncStorage.removeItem("motivationalNotificationIds");

  // Update user document
  if (auth.currentUser) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      taskNotifications: {},
    });
  }
};
