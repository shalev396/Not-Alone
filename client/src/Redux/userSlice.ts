import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/api";

const initialState = {
  _id: "",
  firstName: "",
  lastName: "",
  nickname: "",
  bio: "",
  profileImage: "",
  passport: "",
  email: "",
  password: "",
  phone: "",
  personalIdentificationNumber: "",
  media: "",
  type: "",
  receiveNotifications: false,
  isLoading: false,
  error: null as string | null,
};

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/me");
      return response.data;
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
    setFirstName: (state, action) => {
      state.firstName = action.payload;
    },
    setLastName: (state, action) => {
      state.lastName = action.payload;
    },
    setNickname: (state, action) => {
      state.nickname = action.payload;
    },
    setBio: (state, action) => {
      state.bio = action.payload;
    },
    setProfileImage: (state, action) => {
      state.profileImage = action.payload;
    },
    setReceiveNotifications: (state, action) => {
      state.receiveNotifications = action.payload;
    },
    setPassport: (state, action) => {
      state.passport = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setPhoneNumber: (state, action) => {
      state.phone = action.payload;
    },
    setPersonalIdentificationNumber: (state, action) => {
      state.personalIdentificationNumber = action.payload;
    },
    setMedia: (state, action) => {
      state.media = action.payload;
    },
    setType: (state, action) => {
      state.type = action.payload;
    },
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateUser: (state, action) => {
      Object.keys(action.payload).forEach((key) => {
        if (key in state) {
          (state as any)[key as keyof typeof state] = action.payload[key];
        }
      });
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

export const {
  setFirstName,
  setLastName,
  setNickname,
  setBio,
  setProfileImage,
  setReceiveNotifications,
  setPassport,
  setEmail,
  setPhoneNumber,
  setPersonalIdentificationNumber,
  setMedia,
  setType,
  setUser,
  updateUser,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
