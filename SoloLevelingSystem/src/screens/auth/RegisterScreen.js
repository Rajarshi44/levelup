import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ThemedButton } from "../../components/ThemedButton";
import { ThemedCard } from "../../components/ThemedCard";
import { GlowText } from "../../components/GlowText";
import { StatusBar } from "../../components/StatusBar";
import { TextInput, TouchableOpacity, Text } from "react-native";
import { firebase } from "../../services/firebase";
import { progressService } from "../../services/progressService";
import { colors } from "../../theme/colors";
import { globalStyles } from "../../theme/globalStyles";
import { validateEmail, validatePassword } from "../../utils/validation";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    // Input validation
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters with a number and special character"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create user account
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      // Update user profile
      await userCredential.user.updateProfile({
        displayName: username,
      });

      // Create user profile in Firestore
      await firebase
        .firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .set({
          username,
          email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          photoURL: null,
        });

      // Initialize user progress
      await progressService.initializeUserProgress();

      // Auth state change will trigger navigation in AppNavigator
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <StatusBar />

        <View style={styles.headerContainer}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <GlowText style={styles.title}>CREATE ACCOUNT</GlowText>
          <Text style={styles.subtitle}>Join the solo leveling journey</Text>
        </View>

        <ThemedCard style={styles.card}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <ThemedButton
              title="REGISTER"
              onPress={handleRegister}
              style={styles.button}
              loading={loading}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedCard>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.accent,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  card: {
    width: "100%",
    padding: 20,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.accent,
    fontWeight: "bold",
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default RegisterScreen;
