import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Import screens
import DashboardScreen from "../screens/DashboardScreen";
import QuestsScreen from "../screens/QuestsScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AiCoachScreen from "../screens/AiCoachScreen";
import ScheduleScreen from "../screens/ScheduleScreen";

// Import theme
import colors from "../theme/colors";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === "Quests") {
            iconName = focused ? "trophy" : "trophy-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === "Stats") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === "AI Coach") {
            return (
              <MaterialCommunityIcons
                name={focused ? "robot" : "robot-outline"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Schedule") {
            iconName = focused ? "calendar" : "calendar-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#8D8FAD",
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Quests" component={QuestsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="AI Coach" component={AiCoachScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#161A36",
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
});

export default TabNavigator;
