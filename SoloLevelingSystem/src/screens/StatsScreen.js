// screens/StatsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { ThemedCard } from "../components/ThemedCard";
import { GlowText } from "../components/GlowText";
import { LevelProgress } from "../components/LevelProgress";
import { useSelector } from "react-redux";

const StatsScreen = () => {
  const [fitnessData, setFitnessData] = useState([]);
  const [codingData, setCodingData] = useState([]);
  const [disciplineData, setDisciplineData] = useState([]);
  const user = useSelector((state) => state.user);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch fitness stats
        const fitnessQuery = query(
          collection(db, "progress"),
          where("userId", "==", user.uid),
          where("domain", "==", "fitness")
        );
        const fitnessSnapshot = await getDocs(fitnessQuery);
        const fitnessResults = [];
        fitnessSnapshot.forEach((doc) => {
          fitnessResults.push(doc.data());
        });
        setFitnessData(fitnessResults.sort((a, b) => a.date - b.date));

        // Fetch coding stats
        const codingQuery = query(
          collection(db, "progress"),
          where("userId", "==", user.uid),
          where("domain", "==", "coding")
        );
        const codingSnapshot = await getDocs(codingQuery);
        const codingResults = [];
        codingSnapshot.forEach((doc) => {
          codingResults.push(doc.data());
        });
        setCodingData(codingResults.sort((a, b) => a.date - b.date));

        // Fetch discipline stats
        const disciplineQuery = query(
          collection(db, "progress"),
          where("userId", "==", user.uid),
          where("domain", "==", "discipline")
        );
        const disciplineSnapshot = await getDocs(disciplineQuery);
        const disciplineResults = [];
        disciplineSnapshot.forEach((doc) => {
          disciplineResults.push(doc.data());
        });
        setDisciplineData(disciplineResults.sort((a, b) => a.date - b.date));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user.uid]);

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientTo: "#08130D",
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderDomainStats = (domain, data) => {
    if (!data.length) return null;

    const labels = data.slice(-7).map((item) => item.label);
    const values = data.slice(-7).map((item) => item.value);

    const chartData = {
      labels,
      datasets: [{ data: values }],
    };

    return (
      <ThemedCard style={styles.card}>
        <GlowText style={styles.cardTitle}>{domain} Progress</GlowText>
        <LineChart
          data={chartData}
          width={screenWidth - 50}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </ThemedCard>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <GlowText style={styles.header}>Your Stats</GlowText>

      <ThemedCard style={styles.summaryCard}>
        <View style={styles.levelInfo}>
          <GlowText style={styles.levelText}>Level {user.level}</GlowText>
          <LevelProgress
            currentXP={user.currentXP}
            requiredXP={user.requiredXP}
          />
          <Text style={styles.xpText}>
            {user.currentXP}/{user.requiredXP} XP
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Fitness</Text>
            <Text style={styles.statValue}>Lv. {user.fitnessLevel}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Coding</Text>
            <Text style={styles.statValue}>Lv. {user.codingLevel}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Discipline</Text>
            <Text style={styles.statValue}>Lv. {user.disciplineLevel}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Daily Streak</Text>
            <Text style={styles.statValue}>{user.streak} days</Text>
          </View>
        </View>
      </ThemedCard>

      {renderDomainStats("Fitness", fitnessData)}
      {renderDomainStats("Coding", codingData)}
      {renderDomainStats("Discipline", disciplineData)}

      <ThemedCard style={styles.card}>
        <GlowText style={styles.cardTitle}>Completion Rate</GlowText>
        <BarChart
          data={{
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [
              {
                data: [
                  user.weeklyCompletionRates[0] || 0,
                  user.weeklyCompletionRates[1] || 0,
                  user.weeklyCompletionRates[2] || 0,
                  user.weeklyCompletionRates[3] || 0,
                ],
              },
            ],
          }}
          width={screenWidth - 50}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
        />
      </ThemedCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  summaryCard: {
    marginBottom: 20,
    padding: 15,
  },
  levelInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  levelText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#50fa7b",
    marginBottom: 10,
  },
  xpText: {
    color: "#bd93f9",
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: "rgba(40, 42, 54, 0.8)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statLabel: {
    color: "#8be9fd",
    fontSize: 14,
  },
  statValue: {
    color: "#f8f8f2",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  card: {
    marginBottom: 20,
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff79c6",
    marginBottom: 15,
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
});

export default StatsScreen;
