import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import { ActivityIndicator, View } from "react-native";
import { selectUser } from "../redux/slices/userSlice";

const AppNavigator = () => {
  const { user, isLoading } = useSelector(selectUser);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate checking auth state
    setTimeout(() => {
      setIsAppReady(true);
    }, 1000);
  }, []);

  if (!isAppReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
