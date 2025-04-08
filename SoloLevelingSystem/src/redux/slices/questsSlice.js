// redux/slices/questsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dailyQuests: [],
  weeklyMissions: [],
  longTermGoals: [],
  completedQuests: [],
  loading: false,
  error: null,
};

export const questsSlice = createSlice({
  name: "quests",
  initialState,
  reducers: {
    fetchQuestsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchQuestsSuccess: (state, action) => {
      const { dailyQuests, weeklyMissions, longTermGoals, completedQuests } =
        action.payload;
      state.dailyQuests = dailyQuests || [];
      state.weeklyMissions = weeklyMissions || [];
      state.longTermGoals = longTermGoals || [];
      state.completedQuests = completedQuests || [];
      state.loading = false;
    },
    fetchQuestsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addQuest: (state, action) => {
      const { questType, quest } = action.payload;
      if (questType === "daily") {
        state.dailyQuests.push(quest);
      } else if (questType === "weekly") {
        state.weeklyMissions.push(quest);
      } else if (questType === "longTerm") {
        state.longTermGoals.push(quest);
      }
    },
    updateQuest: (state, action) => {
      const { questType, questId, updates } = action.payload;

      if (questType === "daily") {
        const index = state.dailyQuests.findIndex((q) => q.id === questId);
        if (index !== -1) {
          state.dailyQuests[index] = {
            ...state.dailyQuests[index],
            ...updates,
          };
        }
      } else if (questType === "weekly") {
        const index = state.weeklyMissions.findIndex((q) => q.id === questId);
        if (index !== -1) {
          state.weeklyMissions[index] = {
            ...state.weeklyMissions[index],
            ...updates,
          };
        }
      } else if (questType === "longTerm") {
        const index = state.longTermGoals.findIndex((q) => q.id === questId);
        if (index !== -1) {
          state.longTermGoals[index] = {
            ...state.longTermGoals[index],
            ...updates,
          };
        }
      }
    },
    completeQuest: (state, action) => {
      const { questType, questId } = action.payload;

      let quest = null;

      if (questType === "daily") {
        const index = state.dailyQuests.findIndex((q) => q.id === questId);
        if (index !== -1) {
          quest = {
            ...state.dailyQuests[index],
            completedAt: new Date().toISOString(),
          };
          state.dailyQuests.splice(index, 1);
        }
      } else if (questType === "weekly") {
        const index = state.weeklyMissions.findIndex((q) => q.id === questId);
        if (index !== -1) {
          quest = {
            ...state.weeklyMissions[index],
            completedAt: new Date().toISOString(),
          };
          state.weeklyMissions.splice(index, 1);
        }
      } else if (questType === "longTerm") {
        const index = state.longTermGoals.findIndex((q) => q.id === questId);
        if (index !== -1) {
          quest = {
            ...state.longTermGoals[index],
            completedAt: new Date().toISOString(),
          };
          state.longTermGoals.splice(index, 1);
        }
      }

      if (quest) {
        state.completedQuests.push(quest);
      }
    },
    removeQuest: (state, action) => {
      const { questType, questId } = action.payload;

      if (questType === "daily") {
        state.dailyQuests = state.dailyQuests.filter((q) => q.id !== questId);
      } else if (questType === "weekly") {
        state.weeklyMissions = state.weeklyMissions.filter(
          (q) => q.id !== questId
        );
      } else if (questType === "longTerm") {
        state.longTermGoals = state.longTermGoals.filter(
          (q) => q.id !== questId
        );
      } else if (questType === "completed") {
        state.completedQuests = state.completedQuests.filter(
          (q) => q.id !== questId
        );
      }
    },
  },
});

export const {
  fetchQuestsStart,
  fetchQuestsSuccess,
  fetchQuestsFailure,
  addQuest,
  updateQuest,
  completeQuest,
  removeQuest,
} = questsSlice.actions;

export default questsSlice.reducer;
