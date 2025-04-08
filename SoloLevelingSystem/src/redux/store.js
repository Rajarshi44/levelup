// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import questsReducer from "./slices/questsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    quests: questsReducer,
  },
});
