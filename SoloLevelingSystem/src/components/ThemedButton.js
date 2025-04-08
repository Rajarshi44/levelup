import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";

const ThemedButton = ({
  title,
  onPress,
  style = {},
  textStyle = {},
  disabled = false,
  loading = false,
  variant = "primary", // primary, secondary, outline, danger
  icon = null,
  iconPosition = "left", // left, right
  size = "medium", // small, medium, large
}) => {
  const getButtonColors = () => {
    switch (variant) {
      case "primary":
        return [colors.primaryLight, colors.primary, colors.primaryDark];
      case "secondary":
        return ["#3A3F5F", "#323755", "#2A2E47"];
      case "danger":
        return ["#FF6B6B", "#FF3B30", "#CC2F26"];
      default:
        return [colors.primaryLight, colors.primary, colors.primaryDark];
    }
  };

  const getButtonStyle = () => {
    let baseStyle = {};

    switch (size) {
      case "small":
        baseStyle = { paddingVertical: 8, paddingHorizontal: 16 };
        break;
      case "large":
        baseStyle = { paddingVertical: 16, paddingHorizontal: 32 };
        break;
      default: // medium
        baseStyle = { paddingVertical: 12, paddingHorizontal: 24 };
    }

    if (variant === "outline") {
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: colors.primary,
      };
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    let baseStyle = { color: "#FFFFFF" };

    switch (size) {
      case "small":
        baseStyle = { ...baseStyle, fontSize: 14 };
        break;
      case "large":
        baseStyle = { ...baseStyle, fontSize: 18 };
        break;
      default: // medium
        baseStyle = { ...baseStyle, fontSize: 16 };
    }

    if (variant === "outline") {
      baseStyle = { ...baseStyle, color: colors.primary };
    }

    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? colors.primary : "#FFFFFF"}
        />
      );
    }

    const textComponent = (
      <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
    );

    if (!icon) return textComponent;

    const iconComponent =
      typeof icon === "string" ? (
        <Ionicons
          name={icon}
          size={size === "small" ? 16 : size === "large" ? 24 : 20}
          color={variant === "outline" ? colors.primary : "#FFFFFF"}
          style={iconPosition === "left" ? styles.iconLeft : styles.iconRight}
        />
      ) : (
        <View
          style={iconPosition === "left" ? styles.iconLeft : styles.iconRight}
        >
          {icon}
        </View>
      );

    return (
      <View style={styles.contentContainer}>
        {iconPosition === "left" && iconComponent}
        {textComponent}
        {iconPosition === "right" && iconComponent}
      </View>
    );
  };

  if (variant === "outline") {
    return (
      <TouchableOpacity
        style={[styles.button, getButtonStyle(), style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.touchable, style]}
    >
      <LinearGradient
        colors={getButtonColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, getButtonStyle()]}
      >
        {renderContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
    overflow: "hidden",
  },
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default ThemedButton;
