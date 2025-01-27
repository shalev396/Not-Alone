import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/api";

const initialState = {
  _id: "",
  firstName: "",
  lastName: "",
  passport: "",
  email: "",
  phone: "",
  type: "",
  approvalStatus: "",
  preferences: {
    language: "",
    notifications: false,
  },
  receiveNotifications: false, 
  nickname: "",
  bio: "",
  profileImage: "",
  visibility: "",
  isLoading: false,
  error: null as string | null,
};

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/me");
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user data"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },

    updateUser: (state, action) => {
      console.log("[Redux - updateUser Payload]:", action.payload); 

      Object.keys(action.payload).forEach((key) => {
        if (key in state && action.payload[key] !== undefined) {
          (state as any)[key as keyof typeof state] = action.payload[key];
        }
      });
      console.log("[Redux - Updated State]:", state); 

    },
    resetUser: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        return { ...state, ...action.payload };
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, updateUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
