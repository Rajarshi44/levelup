import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../theme/colors";

const ThemedCard = ({
  children,
  title,
  subtitle,
  onPress,
  style = {},
  contentStyle = {},
  headerStyle = {},
  variant = "default", // default, gradient, outline, highlight
  borderHighlight = false,
  rightHeaderComponent = null,
}) => {
  const getBorderStyle = () => {
    if (variant === "outline") {
      return {
        borderWidth: 1,
        borderColor: "#323755",
      };
    }

    if (borderHighlight) {
      return {
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
      };
    }

    return {};
  };

  const getBackgroundStyle = () => {
    switch (variant) {
      case "highlight":
        return { backgroundColor: colors.primaryTransparent };
      default:
        return { backgroundColor: "#1A1F38" };
    }
  };

  const renderHeader = () => {
    if (!title && !subtitle && !rightHeaderComponent) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerTextContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightHeaderComponent && (
          <View style={styles.rightHeader}>{rightHeaderComponent}</View>
        )}
      </View>
    );
  };

  const renderGradientCard = () => {
    return (
      <LinearGradient
        colors={["#252A47", "#1A1F38"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.card, getBorderStyle(), style]}
      >
        {renderHeader()}
        <View style={[styles.content, contentStyle]}>{children}</View>
      </LinearGradient>
    );
  };

  const renderDefaultCard = () => {
    return (
      <View
        style={[styles.card, getBackgroundStyle(), getBorderStyle(), style]}
      >
        {renderHeader()}
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {variant === "gradient" ? renderGradientCard() : renderDefaultCard()}
      </TouchableOpacity>
    );
  }

  return variant === "gradient" ? renderGradientCard() : renderDefaultCard();
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: subtitle ? 4 : 0,
  },
  subtitle: {
    color: "#8D8FAD",
    fontSize: 13,
  },
  rightHeader: {
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
});

export default ThemedCard;
