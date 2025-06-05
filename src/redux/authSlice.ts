import { User } from "@/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthState {
  login: {
    currentUser: User | null;
    isFetching: boolean;
    error: boolean;
  };
}

const initialState: AuthState = {
  login: {
    currentUser: null,
    isFetching: false,
    error: false,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.login.isFetching = true;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.login.currentUser = action.payload;
      state.login.isFetching = false;
      state.login.error = false;
    },
    loginFail: (state) => {
      state.login.error = true;
      state.login.isFetching = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFail } = authSlice.actions;
export default authSlice.reducer;
