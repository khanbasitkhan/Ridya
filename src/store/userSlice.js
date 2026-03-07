import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    isLoggedIn: false,
    rememberMe: false,
    isFirstTime: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.userData = action.payload;
      state.isLoggedIn = true;
      state.isFirstTime = false;
      
      if (state.rememberMe) {
        AsyncStorage.setItem('user_data', JSON.stringify(action.payload));
      }
    },
    logout: state => {
      state.userData = null;
      state.isLoggedIn = false;
      state.rememberMe = false;
      AsyncStorage.removeItem('user_data');
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
      AsyncStorage.setItem('remember_me', JSON.stringify(action.payload));
    },
    setFirstTime: (state, action) => {
      state.isFirstTime = action.payload;
    },
    
    rehydrateUser: (state, action) => {
        state.userData = action.payload.userData;
        state.isLoggedIn = action.payload.isLoggedIn;
        state.rememberMe = action.payload.rememberMe;
    }
  },
});

export const { setUser, logout, setRememberMe, setFirstTime, rehydrateUser } = userSlice.actions;
export default userSlice.reducer;