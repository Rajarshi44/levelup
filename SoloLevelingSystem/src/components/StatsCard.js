import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../theme/colors";

const StatsCard = ({
  title,
  value,
  icon,
  iconColor = colors.primary,
  trend = null,
  style = {},
}) => {
  const renderIcon = () => {
    if (typeof icon === "string") {
      // Check if it's a MaterialCommunityIcons icon
      if (icon.includes("material-")) {
        const materialIcon = icon.replace("material-", "");
        return (
          <MaterialCommunityIcons
            name={materialIcon}
            size={24}
            color={iconColor}
          />
        );
      }
      // Default to Ionicons
      return <Ionicons name={icon} size={24} color={iconColor} />;
    }

    // If custom icon component is provided
    return icon;
  };

  const renderTrend = () => {
    if (trend === null) return null;

    const isPositive = trend > 0;
    const trendColor = isPositive ? "#4CD964" : "#FF3B30";
    const trendIcon = isPositive ? "arrow-up" : "arrow-down";

    return (
      <View
        style={[styles.trendContainer, { backgroundColor: `${trendColor}20` }]}
      >
        <Ionicons name={trendIcon} size={12} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {Math.abs(trend)}%
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>{renderIcon()}</View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {renderTrend()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1A1F38",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#252A47",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#8D8FAD",
    fontSize: 14,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
});

export default StatsCard;
