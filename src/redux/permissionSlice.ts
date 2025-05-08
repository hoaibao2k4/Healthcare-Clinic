
import { UserPermission } from "@/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface PermissionState {
  login: {
    currentUser: UserPermission | null;
    isFetching: boolean;
    error: boolean;
  };
}

const initialState: PermissionState = {
  login: {
    currentUser: null,
    isFetching: false,
    error: false,
  },
};

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    permissionStart: (state) => {
      state.login.isFetching = true;
    },
    permissionSuccess: (state, action: PayloadAction<UserPermission>) => {
      state.login.currentUser = action.payload;
      state.login.isFetching = false;
      state.login.error = false;
    },
    permissionFail: (state) => {
      state.login.error = true;
      state.login.isFetching = false;
    },
  },
});

export const { permissionStart, permissionSuccess, permissionFail } = permissionSlice.actions;
export default permissionSlice.reducer;
