import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string | null;
  email: string | null;
  username: string | null;
  userType: "admin" | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const defaultUser: User = {
  id: null,
  email: null,
  username: null,
  userType: null,
};


// Helper function to safely parse JSON with better type checking
const safeJsonParse = (json: string | null): User => {
  if (!json) return defaultUser;
  try {
    const parsed = JSON.parse(json);
    // Validate the parsed object has the expected shape
    if (typeof parsed === "object" && parsed !== null) {
      return {
        id: parsed.id ?? null,
        email: parsed.email ?? null,
        username: parsed.username ?? null,
        userType: parsed.role ?? null,
      };
    }
    return defaultUser;
  } catch (error) {
    console.error("Error parsing stored user data:", error);
    return defaultUser;
  }
};
const initialState: AuthState = {
  isAuthenticated: false,
  user: safeJsonParse(localStorage.getItem("user")),
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

// Initialize state from localStorage if available
const getInitialState = (): AuthState => {
  try {
    const storedToken = localStorage.getItem("token");
    const storedUser = safeJsonParse(localStorage.getItem("user"));

    if (storedToken && storedUser.id) {
      return {
        ...initialState,
        isAuthenticated: true,
        user: storedUser,
        token: storedToken,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error("Error loading initial state:", error);
  }

  // Return default initial state if no stored data or error
  // return {
  //   isAuthenticated: false,
  //   user: defaultUser,
  //   token: null,
  //   loading: false,
  //   error: null,
  // };
  return initialState;
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;

      // Store in localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.user = defaultUser;
      state.token = null;
      state.loading = false;
      state.error = action.payload;

      // Clear localStorage on login failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = defaultUser;
      state.token = null;
      state.loading = false;
      state.error = null;

      // Clear localStorage on logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      state.user = { ...state.user, ...action.payload };
      // Update localStorage with new user data
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    // Add a reducer to handle state rehydration
    rehydrateState: (state) => {
      const storedToken = localStorage.getItem("token");
      const storedUser = safeJsonParse(localStorage.getItem("user"));

      if (storedToken && storedUser.id) {
        state.isAuthenticated = true;
        state.user = storedUser;
        state.token = storedToken;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  //rehydrateState,
} = authSlice.actions;

// Selector that includes rehydration check
export const selectAuth = (state: { auth: AuthState }): AuthState => {
    const storedToken = localStorage.getItem("token");
    const storedUser = safeJsonParse(localStorage.getItem("user"));

    if (storedToken && storedUser.id) {
      return {
        ...state.auth,
        isAuthenticated: true,
        token: storedToken,
        user: storedUser,
      };
    }
  
  return state.auth;
};

export default authSlice.reducer;
