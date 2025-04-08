// screens/QuestsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import QuestItem from "../components/QuestItem";

const QuestsScreen = () => {
  const [quests, setQuests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: "",
    description: "",
    difficulty: 3,
    expReward: 20,
    deadline: new Date(new Date().setHours(23, 59, 59, 999)),
    completed: false,
    failed: false,
    category: "coding", // Default category
  });
  const [activeFilter, setActiveFilter] = useState("all");

  // Load quests
  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setRefreshing(true);

      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Query for today's quests
      const questsRef = collection(db, "quests");
      const q = query(
        questsRef,
        where("userId", "==", auth.currentUser.uid),
        where("deadline", ">=", today)
      );

      const querySnapshot = await getDocs(q);
      const questsList = [];

      querySnapshot.forEach((doc) => {
        questsList.push({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().deadline.toDate(), // Convert Firestore timestamp to JS Date
        });
      });

      // Sort by deadline (ascending)
      questsList.sort((a, b) => a.deadline - b.deadline);

      setQuests(questsList);
    } catch (error) {
      console.error("Error loading quests:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const createQuest = async () => {
    try {
      // Validate fields
      if (!newQuest.title || !newQuest.description) {
        alert("Please fill in all required fields");
        return;
      }

      // Calculate XP reward based on difficulty
      const expReward = newQuest.difficulty * 10;

      // Prepare quest object
      const questData = {
        userId: auth.currentUser.uid,
        title: newQuest.title,
        description: newQuest.description,
        difficulty: newQuest.difficulty,
        expReward: expReward,
        deadline: Timestamp.fromDate(newQuest.deadline),
        completed: false,
        failed: false,
        category: newQuest.category,
        createdAt: Timestamp.now(),
      };

      // Add to Firestore
      await addDoc(collection(db, "quests"), questData);

      // Reset form and close modal
      setNewQuest({
        title: "",
        description: "",
        difficulty: 3,
        expReward: 20,
        deadline: new Date(new Date().setHours(23, 59, 59, 999)),
        completed: false,
        failed: false,
        category: "coding",
      });
      setModalVisible(false);

      // Reload quests
      loadQuests();
    } catch (error) {
      console.error("Error creating quest:", error);
      alert("Failed to create quest");
    }
  };

  const handleCompleteQuest = async (id) => {
    try {
      // Update in Firestore
      await updateDoc(doc(db, "quests", id), {
        completed: true,
        completedAt: Timestamp.now(),
      });

      // Update local state
      setQuests(
        quests.map((q) => (q.id === id ? { ...q, completed: true } : q))
      );

      // In a real app, you would also:
      // 1. Award XP to the user
      // 2. Check for level up
      // 3. Update user stats
    } catch (error) {
      console.error("Error completing quest:", error);
      alert("Failed to complete quest");
    }
  };

  const handleFailQuest = async (id) => {
    try {
      // Update in Firestore
      await updateDoc(doc(db, "quests", id), {
        failed: true,
        failedAt: Timestamp.now(),
      });

      // Update local state
      setQuests(quests.map((q) => (q.id === id ? { ...q, failed: true } : q)));

      // In a real app, you would also:
      // 1. Reduce HP or apply penalties
      // 2. Update user stats
    } catch (error) {
      console.error("Error failing quest:", error);
      alert("Failed to update quest");
    }
  };

  const deleteQuest = async (id) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "quests", id));

      // Update local state
      setQuests(quests.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting quest:", error);
      alert("Failed to delete quest");
    }
  };

  // Filter quests based on active filter
  const filteredQuests = quests.filter((quest) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return !quest.completed && !quest.failed;
    if (activeFilter === "completed") return quest.completed;
    if (activeFilter === "failed") return quest.failed;
    if (activeFilter === "coding") return quest.category === "coding";
    if (activeFilter === "fitness") return quest.category === "fitness";
    if (activeFilter === "discipline") return quest.category === "discipline";
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "all" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "all" && styles.activeFilterText,
            ]}
          >
            ALL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "active" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("active")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "active" && styles.activeFilterText,
            ]}
          >
            ACTIVE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "completed" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("completed")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "completed" && styles.activeFilterText,
            ]}
          >
            COMPLETED
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "failed" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("failed")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "failed" && styles.activeFilterText,
            ]}
          >
            FAILED
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "coding" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("coding")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "coding" && styles.activeFilterText,
            ]}
          >
            CODING
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "fitness" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("fitness")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "fitness" && styles.activeFilterText,
            ]}
          >
            FITNESS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "discipline" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("discipline")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "discipline" && styles.activeFilterText,
            ]}
          >
            DISCIPLINE
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Quests list */}
      <ScrollView
        style={styles.questsContainer}
        contentContainerStyle={styles.questsContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadQuests}
            tintColor="#30CFD0"
          />
        }
      >
        {filteredQuests.length > 0 ? (
          filteredQuests.map((quest) => (
            <QuestItem
              key={quest.id}
              quest={quest}
              onComplete={handleCompleteQuest}
              onFail={handleFailQuest}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>NO QUESTS FOUND</Text>
            <Text style={styles.emptySubtext}>
              Create new quests to start leveling up
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add quest button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add quest modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CREATE NEW QUEST</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>QUEST TITLE</Text>
              <TextInput
                style={styles.input}
                value={newQuest.title}
                onChangeText={(text) =>
                  setNewQuest({ ...newQuest, title: text })
                }
                placeholder="Enter quest title"
                placeholderTextColor="#777777"
              />

              <Text style={styles.inputLabel}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newQuest.description}
                onChangeText={(text) =>
                  setNewQuest({ ...newQuest, description: text })
                }
                placeholder="Enter quest description"
                placeholderTextColor="#777777"
                multiline
              />

              <Text style={styles.inputLabel}>DIFFICULTY</Text>
              <View style={styles.difficultyContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      newQuest.difficulty === level && styles.activeDifficulty,
                    ]}
                    onPress={() =>
                      setNewQuest({ ...newQuest, difficulty: level })
                    }
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        newQuest.difficulty === level &&
                          styles.activeDifficultyText,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>CATEGORY</Text>
              <View style={styles.categoryContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newQuest.category === "coding" && styles.activeCategory,
                  ]}
                  onPress={() =>
                    setNewQuest({ ...newQuest, category: "coding" })
                  }
                >
                  <Ionicons
                    name="code-slash"
                    size={18}
                    color={
                      newQuest.category === "coding" ? "#30CFD0" : "#FFFFFF"
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      newQuest.category === "coding" &&
                        styles.activeCategoryText,
                    ]}
                  >
                    CODING
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newQuest.category === "fitness" && styles.activeCategory,
                  ]}
                  onPress={() =>
                    setNewQuest({ ...newQuest, category: "fitness" })
                  }
                >
                  <Ionicons
                    name="fitness"
                    size={18}
                    color={
                      newQuest.category === "fitness" ? "#30CFD0" : "#FFFFFF"
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      newQuest.category === "fitness" &&
                        styles.activeCategoryText,
                    ]}
                  >
                    FITNESS
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newQuest.category === "discipline" && styles.activeCategory,
                  ]}
                  onPress={() =>
                    setNewQuest({ ...newQuest, category: "discipline" })
                  }
                >
                  <Ionicons
                    name="hourglass"
                    size={18}
                    color={
                      newQuest.category === "discipline" ? "#30CFD0" : "#FFFFFF"
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      newQuest.category === "discipline" &&
                        styles.activeCategoryText,
                    ]}
                  >
                    DISCIPLINE
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={createQuest}
              >
                <Text style={styles.createButtonText}>CREATE QUEST</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  filtersContainer: {
    maxHeight: 50,
    backgroundColor: "#1A1A1A",
  },
  filtersContent: {
    paddingHorizontal: 8,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeFilter: {
    borderBottomColor: "#30CFD0",
  },
  filterText: {
    color: "#AAAAAA",
    fontWeight: "bold",
  },
  activeFilterText: {
    color: "#30CFD0",
  },
  questsContainer: {
    flex: 1,
  },
  questsContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#AAAAAA",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptySubtext: {
    color: "#777777",
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#30CFD0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#30CFD0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalForm: {
    paddingHorizontal: 20,
  },
  inputLabel: {
    color: "#AAAAAA",
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  difficultyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  difficultyButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  activeDifficulty: {
    backgroundColor: "rgba(48, 207, 208, 0.2)",
    borderWidth: 1,
    borderColor: "#30CFD0",
  },
  difficultyText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  activeDifficultyText: {
    color: "#30CFD0",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  categoryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeCategory: {
    backgroundColor: "rgba(48, 207, 208, 0.2)",
    borderWidth: 1,
    borderColor: "#30CFD0",
  },
  categoryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 6,
  },
  activeCategoryText: {
    color: "#30CFD0",
  },
  createButton: {
    backgroundColor: "#30CFD0",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  createButtonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default QuestsScreen;
// screens/QuestsScreen.js