import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlowText from "./GlowText";
import colors from "../theme/colors";

const LevelProgress = ({
  level = 1,
  currentXP = 0,
  requiredXP = 100,
  style = {},
}) => {
  const progress = Math.min(currentXP / requiredXP, 1);
  const progressWidth = new Animated.Value(progress);

  const progressPercent = Math.round(progress * 100);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.levelBadge}>
        <GlowText
          text={`LV.${level}`}
          fontSize={16}
          glowColor={colors.primary}
          style={styles.levelText}
        />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.xpText}>
            {currentXP} / {requiredXP} XP
          </Text>
          <Text style={styles.percentText}>{progressPercent}%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1F38",
    borderRadius: 12,
    padding: 10,
    overflow: "hidden",
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#252A47",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  levelText: {
    color: "#FFFFFF",
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  percentText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#252A47",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
});

export default LevelProgress;
