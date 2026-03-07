import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import AuthStack from './AuthStack';
import RiderHome from '../screens/main/rider/RiderHome';
import DriverHome from '../screens/main/driver/DriverHome';
import SplashScreen from '../screens/auth/SplashScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { isLoggedIn, userData } = useSelector(state => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Splash" component={SplashScreen} />

        
        <Stack.Screen name="Auth" component={AuthStack} />

        
    
        <Stack.Screen name="RiderHome" component={RiderHome} />
        <Stack.Screen name="DriverHome" component={DriverHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
