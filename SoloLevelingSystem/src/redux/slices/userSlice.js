// redux/slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  email: null,
  displayName: null,
  level: 1,
  currentXP: 0,
  requiredXP: 100,
  fitnessLevel: 1,
  codingLevel: 1,
  disciplineLevel: 1,
  streak: 0,
  weeklyCompletionRates: [0, 0, 0, 0],
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      return {
        ...state,
        ...action.payload,
        isLoggedIn: true,
      };
    },
    logoutUser: (state) => {
      return initialState;
    },
    addExperience: (state, action) => {
      const { amount, domain } = action.payload;
      state.currentXP += amount;

      // Check if user should level up
      if (state.currentXP >= state.requiredXP) {
        state.level += 1;
        state.currentXP = state.currentXP - state.requiredXP;
        state.requiredXP = Math.floor(state.requiredXP * 1.5); // Increase XP needed for next level
      }

      // Also increase domain-specific level if specified
      if (domain === "fitness") {
        state.fitnessLevel += 0.1;
      } else if (domain === "coding") {
        state.codingLevel += 0.1;
      } else if (domain === "discipline") {
        state.disciplineLevel += 0.1;
      }
    },
    subtractExperience: (state, action) => {
      const { amount } = action.payload;
      state.currentXP = Math.max(0, state.currentXP - amount);
    },
    updateStreak: (state, action) => {
      state.streak = action.payload;
    },
    updateCompletionRates: (state, action) => {
      state.weeklyCompletionRates = action.payload;
    },
  },
});

export const {
  setUser,
  logoutUser,
  addExperience,
  subtractExperience,
  updateStreak,
  updateCompletionRates,
} = userSlice.actions;

export default userSlice.reducer;
