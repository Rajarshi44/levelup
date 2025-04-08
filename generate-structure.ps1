# Create root folder and navigate into it
New-Item -Path "SoloLevelingSystem" -ItemType Directory -Force
Set-Location -Path "SoloLevelingSystem"

# Create root files
New-Item -Path "App.js", "index.js", "package.json", "app.json", "babel.config.js", "metro.config.js" -ItemType File -Force

# Create directories and files
# Assets
New-Item -Path "assets/fonts" -ItemType Directory -Force
New-Item -Path "assets/images" -ItemType Directory -Force
New-Item -Path "assets/sounds" -ItemType Directory -Force

# Components
New-Item -Path "src/components" -ItemType Directory -Force
New-Item -Path "src/components/GlowText.js", 
          "src/components/LevelProgress.js", 
          "src/components/QuestCard.js", 
          "src/components/StatsCard.js", 
          "src/components/ThemedButton.js", 
          "src/components/ThemedCard.js", 
          "src/components/AnimatedLevelUp.js", 
          "src/components/StatusBar.js" -ItemType File -Force

# Screens
New-Item -Path "src/screens/auth" -ItemType Directory -Force
New-Item -Path "src/screens/auth/LoginScreen.js", 
          "src/screens/auth/RegisterScreen.js", 
          "src/screens/auth/OnboardingScreen.js" -ItemType File -Force

New-Item -Path "src/screens/DashboardScreen.js", 
          "src/screens/QuestsScreen.js", 
          "src/screens/StatsScreen.js", 
          "src/screens/SettingsScreen.js", 
          "src/screens/AiCoachScreen.js", 
          "src/screens/ScheduleScreen.js" -ItemType File -Force

# Navigation
New-Item -Path "src/navigation" -ItemType Directory -Force
New-Item -Path "src/navigation/AppNavigator.js", 
          "src/navigation/AuthNavigator.js", 
          "src/navigation/TabNavigator.js" -ItemType File -Force

# Redux
New-Item -Path "src/redux/slices" -ItemType Directory -Force
New-Item -Path "src/redux/actions" -ItemType Directory -Force
New-Item -Path "src/redux/store.js" -ItemType File -Force
New-Item -Path "src/redux/slices/userSlice.js", 
          "src/redux/slices/questsSlice.js" -ItemType File -Force
New-Item -Path "src/redux/actions/userActions.js", 
          "src/redux/actions/questActions.js" -ItemType File -Force

# Services
New-Item -Path "src/services" -ItemType Directory -Force
New-Item -Path "src/services/firebase.js", 
          "src/services/aiService.js", 
          "src/services/notificationService.js", 
          "src/services/progressService.js" -ItemType File -Force

# Utils
New-Item -Path "src/utils" -ItemType Directory -Force
New-Item -Path "src/utils/helpers.js", 
          "src/utils/constants.js", 
          "src/utils/animations.js", 
          "src/utils/validation.js" -ItemType File -Force

# Hooks
New-Item -Path "src/hooks" -ItemType Directory -Force
New-Item -Path "src/hooks/useStreak.js", 
          "src/hooks/useQuests.js", 
          "src/hooks/useStats.js" -ItemType File -Force

# Theme
New-Item -Path "src/theme" -ItemType Directory -Force
New-Item -Path "src/theme/colors.js", 
          "src/theme/fonts.js", 
          "src/theme/globalStyles.js" -ItemType File -Force

# Firebase
New-Item -Path "firebase/functions" -ItemType Directory -Force
New-Item -Path "firebase/functions/index.js", 
          "firebase/functions/questGenerator.js", 
          "firebase/functions/streakManagement.js" -ItemType File -Force
New-Item -Path "firebase/firestore.rules" -ItemType File -Force

Write-Host "File structure created successfully!" -ForegroundColor Green
# Navigate back to the original directory
Set-Location -Path ".."