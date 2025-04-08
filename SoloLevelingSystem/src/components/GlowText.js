import React from "react";
import { Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import colors from "../theme/colors";

const GlowText = ({
  text,
  fontSize = 24,
  fontWeight = "bold",
  glowColor = colors.primary,
  style = {},
  gradientColors = [colors.primaryLight, colors.primary, colors.primaryDark],
  ...props
}) => {
  return (
    <>
      {/* Shadow/Glow Effect */}
      <Text
        style={[
          styles.glowEffect,
          {
            fontSize,
            fontWeight,
            textShadowColor: glowColor,
            ...style,
          },
        ]}
        {...props}
      >
        {text}
      </Text>

      {/* Gradient Text */}
      <MaskedView
        style={{ position: "absolute" }}
        maskElement={
          <Text
            style={[
              styles.gradientText,
              {
                fontSize,
                fontWeight,
                ...style,
              },
            ]}
            {...props}
          >
            {text}
          </Text>
        }
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <Text
            style={[
              styles.transparentText,
              {
                fontSize,
                fontWeight,
                ...style,
              },
            ]}
          >
            {text}
          </Text>
        </LinearGradient>
      </MaskedView>
    </>
  );
};

const styles = StyleSheet.create({
  glowEffect: {
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  gradientText: {
    backgroundColor: "transparent",
  },
  transparentText: {
    opacity: 0,
  },
});

export default GlowText;
