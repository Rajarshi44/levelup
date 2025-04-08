// screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import StatusBar from '../components/StatusBar';
import QuestItem from '../components/QuestItem';
import LevelUpModal from '../components/LevelUpModal';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [quests, setQuests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  // Load user data and quests
  useEffect(() => {
    loadUserData();
    loadTodayQuests();
  }, []);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadTodayQuests = async () => {
    try {
      setRefreshing(true);

      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Query for today's quests
      const questsRef = collection(db, "quests");
      const q = query(
        questsRef,
        where("userId", "==", auth.currentUser.uid),
        where("deadline", ">=", today),
        where("deadline", "<", tomorrow)
      );

      const querySnapshot = await getDocs(q);
      const questsList = [];

      querySnapshot.forEach((doc) => {
        questsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setQuests(questsList);
    } catch (error) {
      console.error("Error loading quests:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadUserData();
    loadTodayQuests();
  };

  // Calculate XP needed for next level
  const getXpForNextLevel = (level) => {
    return 100 * Math.pow(level, 1.5);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>LOADING SYSTEM...</Text>
      </View>
    );
  }

  const completedQuests = quests.filter((q) => q.completed).length;
  const totalQuests = quests.length;
  const questCompletionRate =
    totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#30CFD0"
          />
        }
      >
        {/* Header section with user info */}
        <View style={styles.headerContainer}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>LEVEL {user.level}</Text>
              <View style={styles.classContainer}>
                <Text style={styles.classText}>{user.characterClass}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{user.username.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Status bars section */}
        <View style={styles.statusSection}>
          <StatusBar
            label="HP"
            currentValue={user.currentHP}
            maxValue={user.maxHP}
            color="#F44336"
          />
          <StatusBar
            label="ENERGY"
            currentValue={user.currentEnergy}
            maxValue={user.maxEnergy}
            color="#4CAF50"
          />
          <StatusBar
            label="XP"
            currentValue={user.currentXP}
            maxValue={getXpForNextLevel(user.level)}
            color="#30CFD0"
          />
        </View>

        {/* Daily progress section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DAILY PROGRESS</Text>
            <StatusBar
              label=""
              currentValue={completedQuests}
              maxValue={totalQuests}
              color="#FFD700"
              height={10}
            />
            <Text style={styles.progressText}>
              {completedQuests}/{totalQuests} QUESTS COMPLETED
            </Text>
          </View>
        </View>

        {/* Main menu buttons */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("Quests")}
          >
            <Ionicons name="list" size={24} color="#30CFD0" />
            <Text style={styles.menuButtonText}>QUESTS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("SkillTree")}
          >
            <Ionicons name="git-branch" size={24} color="#30CFD0" />
            <Text style={styles.menuButtonText}>SKILLS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("Statistics")}
          >
            <Ionicons name="stats-chart" size={24} color="#30CFD0" />
            <Text style={styles.menuButtonText}>STATS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings" size={24} color="#30CFD0" />
            <Text style={styles.menuButtonText}>SYSTEM</Text>
          </TouchableOpacity>
        </View>

        {/* Recent quests section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACTIVE QUESTS</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("Quests")}
            >
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {quests.length > 0 ? (
            <View style={styles.questsList}>
              {quests
                .filter((q) => !q.completed && !q.failed)
                .slice(0, 3)
                .map((quest) => (
                  <QuestItem
                    key={quest.id}
                    quest={quest}
                    onComplete={(id) => {
                      // Handle completion
                      // Handle quest completion
                      console.log(`Completed quest: ${id}`);
                      // In a real implementation, you would update Firestore here
                      // and then reload quests

                      // For demo purposes, let's update the local state
                      setQuests(
                        quests.map((q) =>
                          q.id === id ? { ...q, completed: true } : q
                        )
                      );

                      // Simulate XP gain and potential level up
                      const completedQuest = quests.find((q) => q.id === id);
                      if (completedQuest) {
                        const newXP = user.currentXP + completedQuest.expReward;
                        const xpForNextLevel = getXpForNextLevel(user.level);

                        if (newXP >= xpForNextLevel) {
                          // Level up!
                          setNewLevel(user.level + 1);
                          setShowLevelUp(true);

                          // Update user object (in real app, update Firestore)
                          setUser({
                            ...user,
                            level: user.level + 1,
                            currentXP: newXP - xpForNextLevel,
                            maxHP: user.maxHP + 10,
                            currentHP: user.maxHP + 10,
                            maxEnergy: user.maxEnergy + 5,
                            currentEnergy: user.maxEnergy + 5,
                          });
                        } else {
                          // Just update XP
                          setUser({
                            ...user,
                            currentXP: newXP,
                          });
                        }
                      }
                    }}
                    onFail={(id) => {
                      // Handle failure
                      console.log(`Failed quest: ${id}`);
                      // In a real implementation, you would update Firestore here

                      // For demo purposes, let's update the local state
                      setQuests(
                        quests.map((q) =>
                          q.id === id ? { ...q, failed: true } : q
                        )
                      );

                      // Simulate HP loss
                      const newHP = Math.max(1, user.currentHP - 10);
                      setUser({
                        ...user,
                        currentHP: newHP,
                      });
                    }}
                  />
                ))}

              {quests.filter((q) => !q.completed && !q.failed).length === 0 && (
                <View style={styles.emptyQuestsContainer}>
                  <Text style={styles.emptyQuestsText}>
                    ALL QUESTS COMPLETED
                  </Text>
                  <Text style={styles.emptyQuestsSubtext}>
                    Check back tomorrow for new quests
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyQuestsContainer}>
              <Text style={styles.emptyQuestsText}>NO ACTIVE QUESTS</Text>
              <Text style={styles.emptyQuestsSubtext}>
                Create new quests to begin leveling up
              </Text>
            </View>
          )}
        </View>

        {/* Skills progress section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SKILL PROGRESS</Text>
          </View>

          <View style={styles.skillsList}>
            <View style={styles.skillItem}>
              <Text style={styles.skillName}>Web Development</Text>
              <StatusBar
                label=""
                currentValue={user.skills?.webDev || 0}
                maxValue={100}
                color="#FF9800"
                height={8}
              />
            </View>

            <View style={styles.skillItem}>
              <Text style={styles.skillName}>Physical Training</Text>
              <StatusBar
                label=""
                currentValue={user.skills?.physicalTraining || 0}
                maxValue={100}
                color="#4CAF50"
                height={8}
              />
            </View>

            <View style={styles.skillItem}>
              <Text style={styles.skillName}>AI/ML</Text>
              <StatusBar
                label=""
                currentValue={user.skills?.aiML || 0}
                maxValue={100}
                color="#7B1FA2"
                height={8}
              />
            </View>

            <View style={styles.skillItem}>
              <Text style={styles.skillName}>Discipline</Text>
              <StatusBar
                label=""
                currentValue={user.skills?.discipline || 0}
                maxValue={100}
                color="#F44336"
                height={8}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Level up modal */}
      <LevelUpModal
        visible={showLevelUp}
        level={newLevel}
        onClose={() => setShowLevelUp(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#30CFD0",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelText: {
    color: "#30CFD0",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  classContainer: {
    backgroundColor: "rgba(48, 207, 208, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  classText: {
    color: "#30CFD0",
    fontSize: 12,
    fontWeight: "bold",
  },
  profileButton: {
    marginLeft: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#30CFD0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#121212",
    fontSize: 20,
    fontWeight: "bold",
  },
  statusSection: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressText: {
    color: "#CCCCCC",
    fontSize: 12,
    marginTop: 4,
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  menuButton: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  menuButtonText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontSize: 12,
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    color: "#30CFD0",
    fontSize: 12,
  },
  questsList: {
    marginTop: 8,
  },
  emptyQuestsContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyQuestsText: {
    color: "#AAAAAA",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyQuestsSubtext: {
    color: "#777777",
    marginTop: 8,
    textAlign: "center",
  },
  skillsList: {
    marginTop: 8,
  },
  skillItem: {
    marginBottom: 12,
  },
  skillName: {
    color: "#CCCCCC",
    marginBottom: 4,
  },
});

export default DashboardScreen;