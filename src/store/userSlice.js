import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    isLoggedIn: false,
    rememberMe: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.userData = action.payload;
      state.isLoggedIn = true;
    },
    logout: state => {
      state.userData = null;
      state.isLoggedIn = false;
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
  },
});

export const { setUser, logout, setRememberMe } = userSlice.actions;
export default userSlice.reducer;
