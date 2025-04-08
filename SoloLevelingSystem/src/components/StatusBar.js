// components/StatusBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const StatusBar = ({ label, currentValue, maxValue, color = '#30CFD0', height = 20 }) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((currentValue / maxValue) * 100, 0), 100);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${percentage}%`, { duration: 1000 }),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{currentValue}/{maxValue}</Text>
      </View>
      <View style={[styles.barBackground, { height }]}>
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: color },
            animatedStyle
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  valueText: {
    color: '#CCCCCC',
  },
  barBackground: {
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default StatusBar;

// components/QuestItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuestItem = ({ quest, onComplete, onFail }) => {
  const { id, title, description, difficulty, expReward, completed, failed, deadline } = quest;
  
  // Calculate time remaining
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const timeRemaining = deadlineDate - now;
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
  
  // Determine quest status color
  let statusColor = '#30CFD0'; // Default blue
  if (completed) statusColor = '#4CAF50'; // Green
  else if (failed) statusColor = '#F44336'; // Red
  else if (hoursRemaining < 2) statusColor = '#FF9800'; // Orange - urgent
  
  return (
    <View style={[styles.container, { borderLeftColor: statusColor }]}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.difficultyContainer}>
            <Text style={styles.infoLabel}>DIFFICULTY:</Text>
            <View style={styles.difficultyStars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons 
                  key={i}
                  name={i < difficulty ? "star" : "star-outline"} 
                  size={12} 
                  color="#FFD700" 
                />
              ))}
            </View>
          </View>
          <View style={styles.rewardContainer}>
            <Text style={styles.infoLabel}>REWARD:</Text>
            <Text style={styles.rewardText}>{expReward} EXP</Text>
          </View>
        </View>
        {!completed && !failed && (
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={hoursRemaining < 2 ? "#FF9800" : "#CCCCCC"} />
            <Text style={[styles.timeText, hoursRemaining < 2 && styles.urgentText]}>
              {hoursRemaining} HOURS REMAINING
            </Text>
          </View>
        )}
      </View>
      
      {!completed && !failed && (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => onComplete(id)}
          >
            <Ionicons name="checkmark" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.failButton]}
            onPress={() => onFail(id)}
          >
            <Ionicons name="close" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>
      )}
      
      {completed && (
        <View style={styles.statusContainer}>
          <Ionicons name="trophy" size={24} color="#4CAF50" />
          <Text style={styles.statusText}>COMPLETED</Text>
        </View>
      )}
      
      {failed && (
        <View style={styles.statusContainer}>
          <Ionicons name="alert-circle" size={24} color="#F44336" />
          <Text style={[styles.statusText, { color: '#F44336' }]}>FAILED</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderLeftWidth: 4,
    marginVertical: 8,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#CCCCCC',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyStars: {
    flexDirection: 'row',
  },
  infoLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginRight: 4,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginLeft: 4,
  },
  urgentText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  completeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  failButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default QuestItem;

// components/LevelUpModal.js
import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LevelUpModal = ({ visible, level, onClose }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const shineAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start shine animation
      Animated.loop(
        Animated.timing(shineAnim, {
          toValue: 400,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearTimeout(timer);
        pulseAnim.stopAnimation();
        shineAnim.stopAnimation();
      };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.pulseContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Ionicons name="trophy" size={60} color="#FFD700" />
                <Animated.View
                  style={[
                    styles.shine,
                    {
                      transform: [{ translateX: shineAnim }],
                    },
                  ]}
                />
              </Animated.View>
            </View>

            <Text style={styles.levelUpText}>LEVEL UP!</Text>
            <Text style={styles.levelText}>Level {level}</Text>
            <Text style={styles.congratsText}>
              You have overcome your limits and reached a new level of power.
            </Text>
            <Text style={styles.newAbilitiesText}>
              New abilities and quests have been unlocked.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#121212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#30CFD0',
    overflow: 'hidden',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: '300%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ rotate: '45deg' }],
  },
  levelUpText: {
    color: '#30CFD0',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  congratsText: {
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 8,
  },
  newAbilitiesText: {
    color: '#FFD700',
    textAlign: 'center',
  },
});

export default LevelUpModal;