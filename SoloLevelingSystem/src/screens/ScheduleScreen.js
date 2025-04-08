import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Calendar } from "react-native-calendars";
import ThemedCard from "../components/ThemedCard";
import ThemedButton from "../components/ThemedButton";
import StatusBar from "../components/StatusBar";
import GlowText from "../components/GlowText";
import { fetchSchedule } from "../redux/actions/userActions";
import { colors } from "../theme/colors";
import { globalStyles } from "../theme/globalStyles";

const ScheduleScreen = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [markedDates, setMarkedDates] = useState({});
  const [dailyTasks, setDailyTasks] = useState([]);

  // Get user schedule from redux store
  const { schedule, loading } = useSelector((state) => state.user);
  const { level, experience } = useSelector((state) => state.user.stats);

  useEffect(() => {
    dispatch(fetchSchedule());
  }, [dispatch]);

  useEffect(() => {
    if (schedule) {
      // Format dates for the calendar marking
      const marked = {};
      Object.keys(schedule).forEach((date) => {
        const tasksForDay = schedule[date] || [];
        const completedTasks = tasksForDay.filter((task) => task.completed);

        let dotColor = colors.primary;
        if (
          completedTasks.length === tasksForDay.length &&
          tasksForDay.length > 0
        ) {
          dotColor = colors.success;
        } else if (completedTasks.length > 0) {
          dotColor = colors.warning;
        }

        marked[date] = {
          marked: true,
          dotColor: dotColor,
          selected: date === selectedDate,
          selectedColor: colors.secondary,
        };
      });

      setMarkedDates(marked);

      // Set tasks for the selected date
      setDailyTasks(schedule[selectedDate] || []);
    }
  }, [schedule, selectedDate]);

  const handleDateSelect = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
    setDailyTasks(schedule[dateString] || []);

    // Update marked dates to show selected date
    const updatedMarkedDates = { ...markedDates };
    Object.keys(updatedMarkedDates).forEach((date) => {
      if (updatedMarkedDates[date]) {
        updatedMarkedDates[date] = {
          ...updatedMarkedDates[date],
          selected: date === dateString,
          selectedColor: colors.secondary,
        };
      }
    });

    // If the date wasn't previously marked, add it
    if (!updatedMarkedDates[dateString]) {
      updatedMarkedDates[dateString] = {
        selected: true,
        selectedColor: colors.secondary,
      };
    }

    setMarkedDates(updatedMarkedDates);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = dailyTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    setDailyTasks(updatedTasks);

    // In a real app, you'd dispatch an action to update the redux store and backend
    // dispatch(updateTaskCompletion(selectedDate, taskId));
  };

  const renderTimeSlot = (time, tasks) => {
    const tasksForTimeSlot = tasks.filter((task) => task.time === time);

    if (tasksForTimeSlot.length === 0) {
      return null;
    }

    return (
      <View style={styles.timeSlot} key={time}>
        <Text style={styles.timeText}>{time}</Text>
        <View style={styles.tasksContainer}>
          {tasksForTimeSlot.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskItem, task.completed && styles.completedTask]}
              onPress={() => toggleTaskCompletion(task.id)}
            >
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
              </View>
              <View
                style={[
                  styles.taskCategoryIndicator,
                  { backgroundColor: getCategoryColor(task.category) },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      physical: colors.physical,
      coding: colors.coding,
      learning: colors.learning,
      discipline: colors.discipline,
      default: colors.primary,
    };

    return categoryColors[category] || categoryColors.default;
  };

  const timeSlots = [
    "5:30 AM",
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "12:00 PM",
    "1:00 PM",
    "5:00 PM",
    "6:00 PM",
    "8:00 PM",
    "9:30 PM",
  ];

  // Get today's date in the required format
  const today = new Date().toISOString().split("T")[0];

  return (
    <View style={styles.container}>
      <StatusBar level={level} exp={experience} />

      <GlowText style={styles.headerText}>Daily Schedule</GlowText>

      <ThemedCard style={styles.calendarCard}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",
            textSectionTitleColor: colors.text,
            selectedDayBackgroundColor: colors.secondary,
            selectedDayTextColor: colors.darkBg,
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textSecondary,
            dotColor: colors.primary,
            arrowColor: colors.primary,
            monthTextColor: colors.primary,
            indicatorColor: colors.primary,
          }}
          current={today}
        />
      </ThemedCard>

      <GlowText style={styles.dateText}>
        {new Date(selectedDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </GlowText>

      <ScrollView style={styles.scheduleContainer}>
        {timeSlots.map((time) => renderTimeSlot(time, dailyTasks))}

        {dailyTasks.length === 0 && (
          <ThemedCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No tasks scheduled for this day
            </Text>
            <ThemedButton
              title="Add Task"
              onPress={() => {
                /* Navigate to task creation */
              }}
              style={styles.addButton}
            />
          </ThemedCard>
        )}
      </ScrollView>

      {dailyTasks.length > 0 && (
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Add Task"
            onPress={() => {
              /* Navigate to task creation */
            }}
            style={styles.floatingButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.primary,
    textAlign: "center",
  },
  calendarCard: {
    marginBottom: 16,
    padding: 8,
  },
  dateText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  scheduleContainer: {
    flex: 1,
  },
  timeSlot: {
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tasksContainer: {
    marginLeft: 8,
  },
  taskItem: {
    flexDirection: "row",
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: `${colors.success}33`, // 20% opacity
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  taskCategoryIndicator: {
    width: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    marginTop: 8,
  },
});

export default ScheduleScreen;
