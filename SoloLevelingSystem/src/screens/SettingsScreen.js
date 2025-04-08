// screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ThemedCard } from '../components/ThemedCard';
import { GlowText } from '../components/GlowText';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Slider from '@react-native-community/slider';
import { clearAllNotifications, scheduleMotivationalNotifications } from '../services/notificationService';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/userSlice';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    darkMode: true,
    notificationsEnabled: true,
    soundEffects: true,
    hapticFeedback: true,
    wakeUpTime: '06:00',
    sleepTime: '22:00',
    penaltyLevel: 'moderate',
    motivationalFrequency: 3,
    aiCoachEnabled: true
  });
  
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('wakeUp');
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSettings = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().settings) {
          setSettings(userDoc.data().settings);
        }
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        settings: newSettings
      });
    }
    
    // Handle special cases
    if (key === 'notificationsEnabled') {
      if (newSettings.notificationsEnabled) {
        scheduleMotivationalNotifications(newSettings);
      } else {
        clearAllNotifications();
      }
    }
  };

  const showDatePicker = (mode) => {
    setDatePickerMode(mode);
    setDatePickerVisible(true);
  };

  const handleConfirmDate = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const newSettings = { 
      ...settings, 
      [datePickerMode === 'wakeUp' ? 'wakeUpTime' : 'sleepTime']: timeString 
    };
    
    setSettings(newSettings);
    setDatePickerVisible(false);
    
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(userRef, {
        settings: newSettings
      });
    }
    
    // Reschedule notifications if enabled
    if (settings.notificationsEnabled) {
      scheduleMotivationalNotifications(newSettings);
    }
  };

  const handleSliderChange = (value) => {
    const newSettings = { ...settings, motivationalFrequency: Math.round(value) };
    setSettings(newSettings);
  };

  const handleSliderComplete = async (value) => {
    const newSettings = { ...settings, motivationalFrequency: Math.round(value) };
    
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        settings: newSettings
      });
    }
    
    // Reschedule notifications if enabled
    if (settings.notificationsEnabled) {
      scheduleMotivationalNotifications(newSettings);
    }
  };

  const handlePenaltyChange = async (level) => {
    const newSettings = { ...settings, penaltyLevel: level };
    setSettings(newSettings);
    
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        settings: newSettings
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await clearAllNotifications();
              await signOut(auth);
              dispatch(logoutUser());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure? This will reset ALL your progress and cannot be undone!',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              // Reset user progress in Firestore
              if (auth.currentUser) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userRef, {
                  level: 1,
                  currentXP: 0,
                  requiredXP: 100,
                  fitnessLevel: 1,
                  codingLevel: 1,
                  disciplineLevel: 1,
                  streak: 0,
                  completedQuests: [],
                  weeklyCompletionRates: [0, 0, 0, 0]
                });
              }
              
              Alert.alert('Success', 'All progress has been reset. Time to start your journey again!');
              navigation.navigate('Dashboard');
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <GlowText style={styles.header}>Settings</GlowText>
      
      <ThemedCard style={styles.card}>
        <GlowText style={styles.cardTitle}>App Preferences</GlowText>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={() => handleToggle('darkMode')}
            trackColor={{ false: '#3e3e3e', true: '#50fa7b' }}
            thumbColor={settings.darkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Switch
            value={settings.soundEffects}
            onValueChange={() => handleToggle('soundEffects')}
            trackColor={{ false: '#3e3e3e', true: '#50fa7b' }}
            thumbColor={settings.soundEffects ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <Switch
            value={settings.hapticFeedback}
            onValueChange={() => handleToggle('hapticFeedback')}
            trackColor={{ false: '#3e3e3e', true: '#50fa7b' }}
            thumbColor={settings.hapticFeedback ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </ThemedCard>
      
      <ThemedCard style={styles.card}>
        <GlowText style={styles.cardTitle}>Schedule & Notifications</GlowText>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={() => handleToggle('notificationsEnabled')}
            trackColor={{ false: '#3e3e3e', true: '#50fa7b' }}
            thumbColor={settings.notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.timeSetting}
          onPress={() => showDatePicker('wakeUp')}
        >
          <Text style={styles.settingLabel}>Wake-up Time</Text>
          <Text style={styles.timeValue}>{settings.wakeUpTime}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.timeSetting}
          onPress={() => showDatePicker('sleep')}
        >
          <Text style={styles.settingLabel}>Sleep Time</Text>
          <Text style={styles.timeValue}>{settings.sleepTime}</Text>
        </TouchableOpacity>
        
        <View style={styles.sliderContainer}>
          <Text style={styles.settingLabel}>
            Motivational Messages: {settings.motivationalFrequency}/day
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={settings.motivationalFrequency}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor="#50fa7b"
            maximumTrackTintColor="#3e3e3e"
            thumbTintColor="#f5dd4b"
          />
        </View>
      </ThemedCard>
      
      <ThemedCard style={styles.card}>
        <GlowText style={styles.cardTitle}>Challenge Settings</GlowText>
        
        <Text style={styles.settingLabel}>Penalty Severity</Text>
        <View style={styles.penaltyOptions}>
          <TouchableOpacity
            style={[
              styles.penaltyOption,
              settings.penaltyLevel === 'gentle' && styles.selectedPenalty
            ]}
            onPress={() => handlePenaltyChange('gentle')}
          >
            <Text style={styles.penaltyText}>Gentle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.penaltyOption,
              settings.penaltyLevel === 'moderate' && styles.selectedPenalty
            ]}
            onPress={() => handlePenaltyChange('moderate')}
          >
            <Text style={styles.penaltyText}>Moderate</Text>
          </TouchableOpacity>
          
          <TouchableOpacitystyle={[
              styles.penaltyOption,
              settings.penaltyLevel === 'strict' && styles.selectedPenalty
            ]}
            onPress={() => handlePenaltyChange('strict')}
          >
            <Text style={styles.penaltyText}>Strict</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>AI Coach</Text>
          <Switch
            value={settings.aiCoachEnabled}
            onValueChange={() => handleToggle('aiCoachEnabled')}
            trackColor={{ false: '#3e3e3e', true: '#50fa7b' }}
            thumbColor={settings.aiCoachEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </ThemedCard>
      
      <ThemedCard style={styles.card}>
        <GlowText style={styles.cardTitle}>Account</GlowText>
        
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleResetProgress}
        >
          <Text style={styles.dangerButtonText}>Reset All Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ThemedCard>
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff79c6',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    color: '#f8f8f2',
    fontSize: 16,
  },
  timeSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeValue: {
    color: '#8be9fd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  slider: {
    height: 40,
    marginTop: 10,
  },
  penaltyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  penaltyOption: {
    backgroundColor: 'rgba(40, 42, 54, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  selectedPenalty: {
    backgroundColor: '#50fa7b',
  },
  penaltyText: {
    color: '#f8f8f2',
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#ff5555',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButtonText: {
    color: '#f8f8f2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#6272a4',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#f8f8f2',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;