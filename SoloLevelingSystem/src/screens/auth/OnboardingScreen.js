import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { ThemedButton } from "../../components/ThemedButton";
import { GlowText } from "../../components/GlowText";
import { StatusBar } from "../../components/StatusBar";
import { colors } from "../../theme/colors";
import { globalStyles } from "../../theme/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "PERSONAL TRANSFORMATION",
    description:
      "Level up your life with a gamified approach to fitness, programming, and discipline",
    image: require("../../../assets/images/onboarding1.png"),
  },
  {
    id: "2",
    title: "TRACK YOUR PROGRESS",
    description:
      "Complete quests, earn experience, and watch your stats increase in real-time",
    image: require("../../../assets/images/onboarding2.png"),
  },
  {
    id: "3",
    title: "AI COACH",
    description:
      "Get personalized guidance and adaptive challenges to maximize your growth",
    image: require("../../../assets/images/onboarding3.png"),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("onboardingCompleted", "true");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <GlowText style={styles.title}>{item.title}</GlowText>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex ? colors.accent : colors.border,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar />

      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {renderDots()}

      <View style={styles.bottomContainer}>
        <ThemedButton
          title={
            currentIndex < onboardingData.length - 1 ? "NEXT" : "GET STARTED"
          }
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  skipContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  slide: {
    width,
    height: height * 0.7,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.accent,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  button: {
    width: "100%",
  },
});

export default OnboardingScreen;
