import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlowText from "./GlowText";
import ThemedButton from "./ThemedButton";
import colors from "../theme/colors";

const { width, height } = Dimensions.get("window");

const AnimatedLevelUp = ({
  visible = false,
  onClose,
  level = 2,
  rewards = [],
  newAbilities = [],
}) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  // Lottie ref
  const lottieRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      rotateAnim.setValue(0);
      particleAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.elastic(1)),
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();

      // Play lottie animation
      if (lottieRef.current) {
        lottieRef.current.play();
      }
    }
  }, [visible, fadeAnim, scaleAnim, rotateAnim, particleAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={["rgba(10, 14, 33, 0.95)", "rgba(20, 24, 53, 0.95)"]}
          style={styles.gradientBackground}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Level badge */}
            <Animated.View
              style={[
                styles.levelBadgeContainer,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <View style={styles.levelBadgeInner}>
                <GlowText
                  text={`LV.${level}`}
                  fontSize={32}
                  glowColor={colors.primary}
                  style={styles.levelText}
                />
              </View>

              <LottieView
                ref={lottieRef}
                source={require("../../assets/animations/level-up.json")}
                style={styles.lottieAnimation}
                autoPlay={false}
                loop={false}
              />
            </Animated.View>

            {/* Congratulation text */}
            <View style={styles.textContainer}>
              <GlowText
                text="LEVEL UP!"
                fontSize={36}
                fontWeight="800"
                glowColor={colors.primary}
                style={styles.titleText}
                gradientColors={["#F5A623", "#F93AF9", "#6C5CE7"]}
              />
              <Text style={styles.subtitleText}>
                You've reached level {level}
              </Text>
            </View>

            {/* Rewards section */}
            <View style={styles.rewardsContainer}>
              <Text style={styles.sectionTitle}>Rewards Unlocked</Text>

              {rewards.map((reward, index) => (
                <View key={`reward-${index}`} style={styles.rewardItem}>
                  <View style={styles.rewardIcon}>
                    <MaterialCommunityIcons
                      name={reward.icon || "star"}
                      size={22}
                      color="#F5A623"
                    />
                  </View>
                  <View style={styles.rewardTextContainer}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>
                      {reward.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* New abilities section */}
            {newAbilities.length > 0 && (
              <View style={styles.abilitiesContainer}>
                <Text style={styles.sectionTitle}>New Abilities</Text>

                {newAbilities.map((ability, index) => (
                  <View key={`ability-${index}`} style={styles.abilityItem}>
                    <View style={styles.abilityIcon}>
                      <MaterialCommunityIcons
                        name={ability.icon || "lightning-bolt"}
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.abilityTextContainer}>
                      <Text style={styles.abilityTitle}>{ability.title}</Text>
                      <Text style={styles.abilityDescription}>
                        {ability.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Continue button */}
            <ThemedButton
              title="Continue"
              onPress={onClose}
              variant="primary"
              size="large"
              style={styles.continueButton}
              icon="arrow-forward"
              iconPosition="right"
            />
          </Animated.View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: width * 0.9,
    backgroundColor: "#1A1F38",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primaryTransparent,
    maxHeight: height * 0.8,
  },
  levelBadgeContainer: {
    width: 100,
    height: 100,
    marginTop: -50,
    marginBottom: 16,
  },
  levelBadgeInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#252A47",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
  },
  levelText: {
    color: "#FFFFFF",
  },
  lottieAnimation: {
    position: "absolute",
    width: 200,
    height: 200,
    top: -50,
    left: -50,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  titleText: {
    marginBottom: 8,
  },
  subtitleText: {
    color: "#8D8FAD",
    fontSize: 16,
  },
  rewardsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252A47",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(245, 166, 35, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  rewardDescription: {
    color: "#8D8FAD",
    fontSize: 14,
  },
  abilitiesContainer: {
    width: "100%",
    marginBottom: 24,
  },
  abilityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252A47",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  abilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(108, 92, 231, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  abilityTextContainer: {
    flex: 1,
  },
  abilityTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  abilityDescription: {
    color: "#8D8FAD",
    fontSize: 14,
  },
  continueButton: {
    width: "100%",
  },
});

export default AnimatedLevelUp;
