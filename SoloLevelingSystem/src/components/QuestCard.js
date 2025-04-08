import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../theme/colors";

const QuestCard = ({ quest, onPress, onComplete, style = {} }) => {
  const {
    title,
    description,
    xpReward,
    difficulty,
    category,
    isComplete,
    deadline,
    progress = 0,
  } = quest;

  const getDifficultyColor = () => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "#4CD964";
      case "medium":
        return "#FFCC00";
      case "hard":
        return "#FF3B30";
      default:
        return "#4CD964";
    }
  };

  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case "coding":
        return (
          <MaterialCommunityIcons name="code-tags" size={22} color="#61DAFB" />
        );
      case "fitness":
        return (
          <MaterialCommunityIcons name="dumbbell" size={22} color="#F5A623" />
        );
      case "learning":
        return <Ionicons name="book" size={22} color="#A66EFC" />;
      case "productivity":
        return (
          <MaterialCommunityIcons name="clock-fast" size={22} color="#5AC8FA" />
        );
      default:
        return <Ionicons name="flag" size={22} color="#FFFFFF" />;
    }
  };

  const getDeadlineText = () => {
    if (!deadline) return null;

    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days left`;
  };

  const deadlineText = getDeadlineText();
  const difficultyColor = getDifficultyColor();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          {getCategoryIcon()}
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <View style={styles.reward}>
          <Text style={styles.xpText}>{xpReward} XP</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.footer}>
        <View style={styles.difficultyContainer}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColor },
            ]}
          >
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>

          {deadlineText && (
            <View style={styles.deadlineContainer}>
              <Ionicons name="time-outline" size={14} color="#8D8FAD" />
              <Text style={styles.deadlineText}>{deadlineText}</Text>
            </View>
          )}
        </View>

        {!isComplete && progress > 0 && progress < 1 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}

        {!isComplete ? (
          <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CD964" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1F38",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252A47",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 5,
  },
  reward: {
    backgroundColor: colors.primaryTransparent,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  xpText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  description: {
    color: "#8D8FAD",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  difficultyText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  deadlineText: {
    color: "#8D8FAD",
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: "#252A47",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    color: "#8D8FAD",
    fontSize: 12,
    marginLeft: 8,
    width: 30,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 217, 100, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completedText: {
    color: "#4CD964",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default QuestCard;
