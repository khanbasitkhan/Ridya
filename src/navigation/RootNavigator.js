// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import {createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useSelector } from 'react-redux';

// import AuthStack from './AuthStack';
// import RiderHomeScreen from '../screens/main/Rider/RiderHomeScreen';
// import DriverHomeScreen from '../screens/main/Driver/DriverHomeScreen'
// import SplashScreen from '../screens/auth/SplashScreen';

// const Stack = createNativeStackNavigator();

// const RootNavigator = () => {
//   const { isLoggedIn, userData } = useSelector(state => state.user);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
        
//         <Stack.Screen name="Splash" component={SplashScreen} />

        
//         <Stack.Screen name="Auth" component={AuthStack} />

        
    
//         <Stack.Screen name="RiderHome" component={RiderHomeScreen} />
//         <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default RootNavigator;


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import AuthStack from './AuthStack';
import RiderHomeScreen from '../screens/main/Rider/RiderHomeScreen';
import DriverHomeScreen from '../screens/main/Driver/DriverHomeScreen';
import SplashScreen from '../screens/auth/SplashScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isLoggedIn, userData, isFirstTime } = useSelector(state => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstTime ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !isLoggedIn ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            {userData?.role === 'driver' ? (
              <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
            ) : (
              <Stack.Screen name="RiderHome" component={RiderHomeScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;