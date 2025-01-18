import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./userSlice"; // Existing slice
import authReducer from "./authSlice";
import channelReducer from "./channelSlice";

const store = configureStore({
  reducer: {
    user: userReducer, // Existing reducer
    auth: authReducer, // New auth reducer
    channels: channelReducer, // Channel reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
 