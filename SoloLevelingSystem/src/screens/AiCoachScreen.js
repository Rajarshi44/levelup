import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ThemedCard from "../components/ThemedCard";
import ThemedButton from "../components/ThemedButton";
import StatusBar from "../components/StatusBar";
import GlowText from "../components/GlowText";
import {
  fetchCoachSuggestions,
  sendMessage,
} from "../redux/actions/userActions";
import { colors } from "../theme/colors";
import { globalStyles } from "../theme/globalStyles";
import { useStreak } from "../hooks/useStreak";
import { useStats } from "../hooks/useStats";

const AiCoachScreen = () => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const inputAnimatedValue = useRef(new Animated.Value(0)).current;

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { level, experience } = useSelector((state) => state.user.stats);
  const { conversations, suggestions, loading } = useSelector(
    (state) => state.user.coach
  );
  const { currentStreak } = useStreak();
  const { increaseIntelligence } = useStats();

  // Animation for coach thinking
  const dotAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(fetchCoachSuggestions());

    // Start the typing dots animation when AI is "thinking"
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      dotAnimation.setValue(0);
    }

    // Handle input field animation (shrink/expand)
    Animated.timing(inputAnimatedValue, {
      toValue: message.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [dispatch, isTyping, message]);

  // Scroll to bottom whenever conversations change
  useEffect(() => {
    if (scrollViewRef.current && conversations.length > 0) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversations]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // Simulate the AI thinking
    setIsTyping(true);

    dispatch(sendMessage(message));
    setMessage("");

    // Wait for animation before "getting" response
    setTimeout(() => {
      setIsTyping(false);

      // Simulate gaining intelligence from the interaction
      increaseIntelligence(2);
    }, 2000);
  };

  const handleSuggestionPress = (suggestion) => {
    setMessage(suggestion);

    // Focus on text input (in real app, you'd use a ref)
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.sender === "user";
    return (
      <View
        key={`msg-${index}`}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.coachMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.coachAvatar}>
            <Icon name="robot" size={20} color={colors.primary} />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.coachMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.coachMessageText,
            ]}
          >
            {msg.text}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Icon name="account" size={20} color={colors.text} />
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    return (
      <View style={styles.messageContainer}>
        <View style={styles.coachAvatar}>
          <Icon name="robot" size={20} color={colors.primary} />
        </View>

        <View style={[styles.messageBubble, styles.coachMessageBubble]}>
          <View style={styles.typingContainer}>
            <Animated.View
              style={[styles.typingDot, { opacity: dotAnimation }]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                { opacity: Animated.multiply(dotAnimation, 0.7) },
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                { opacity: Animated.multiply(dotAnimation, 0.4) },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const inputWidth = inputAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["85%", "80%"],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar level={level} exp={experience} />

      <View style={styles.header}>
        <GlowText style={styles.headerText}>AI Coach</GlowText>
        <ThemedCard style={styles.streakCard}>
          <Icon name="fire" size={18} color={colors.warning} />
          <Text style={styles.streakText}>{currentStreak} Day Streak</Text>
        </ThemedCard>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="robot-outline" size={60} color={colors.primary} />
            <Text style={styles.emptyText}>
              Your personal AI coach is here to guide you through your solo
              leveling journey.
            </Text>
            <Text style={styles.emptySubtext}>
              Ask questions about your training, programming exercises, or how
              to maintain discipline.
            </Text>
          </View>
        ) : (
          <>
            {conversations.map((msg, index) => renderMessage(msg, index))}
            {isTyping && renderTypingIndicator()}
          </>
        )}
      </ScrollView>

      <View style={styles.suggestionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContent}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={`sugg-${index}`}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <Animated.View
          style={[styles.textInputContainer, { width: inputWidth }]}
        >
          <TextInput
            style={styles.textInput}
            placeholder="Ask your AI coach..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </Animated.View>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={message.trim() === ""}
        >
          <Icon
            name="send"
            size={24}
            color={
              message.trim() === "" ? colors.textSecondary : colors.primary
            }
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
  },
  streakText: {
    color: colors.text,
    marginLeft: 6,
    fontWeight: "bold",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  coachMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "75%",
  },
  userMessageBubble: {
    backgroundColor: colors.secondary,
    marginRight: 8,
    borderTopRightRadius: 4,
  },
  coachMessageBubble: {
    backgroundColor: colors.cardBg,
    marginLeft: 8,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: colors.darkBg,
  },
  coachMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textSecondary,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  typingContainer: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestionsContent: {
    paddingVertical: 8,
  },
  suggestionChip: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  suggestionText: {
    color: colors.text,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: `${colors.text}20`,
  },
  textInputContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    maxHeight: 100,
  },
  textInput: {
    color: colors.text,
    fontSize: 16,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default AiCoachScreen;
