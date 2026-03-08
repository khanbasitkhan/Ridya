// import React, { useEffect, useRef } from 'react';
// import {
//   Animated,
//   Dimensions,
//   Image,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import { useDispatch } from 'react-redux';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { COLORS } from '../../constants/theme';
// import { rehydrateUser } from '../../store/userSlice';

// const SplashScreen = ({ navigation }) => {
//   const dispatch = useDispatch();

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;
//   const slideAnim = useRef(new Animated.Value(20)).current;

//   useEffect(() => {

//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     const checkStatus = async () => {
//       try {
//         const rememberMeStr = await AsyncStorage.getItem('remember_me');
//         const userDataStr = await AsyncStorage.getItem('user_data');

//         const rememberMe = rememberMeStr ? JSON.parse(rememberMeStr) : false;
//         const userData = userDataStr ? JSON.parse(userDataStr) : null;

//         setTimeout(() => {
//           if (rememberMe && userData) {
//             dispatch(
//               rehydrateUser({ userData, isLoggedIn: true, rememberMe: true }),
//             );

//             if (userData.role === 'rider') {
//               navigation.replace('RiderHome');
//             } else {
//               navigation.replace('DriverHome');
//             }
//           } else {
//             navigation.replace('Login');
//           }
//         }, 3000);
//       } catch (e) {
//         console.error('Storage Error:', e);
//         navigation.replace('Login');
//       }
//     };

//     checkStatus();

//   }, [dispatch, fadeAnim, navigation, scaleAnim, slideAnim]);

//   return (
//     <View style={styles.container}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="dark-content"
//       />

//       <Animated.View
//         style={[
//           styles.logoContainer,
//           { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
//         ]}
//       >
//         <Image
//           source={require('../../assets/Ridya.png')}
//           style={styles.logo}
//           resizeMode="contain"
//         />
//       </Animated.View>

//       <Animated.View
//         style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
//       >
//         <Text style={styles.brandName}>RIDYA</Text>
//         <View style={styles.line} />
//         <Text style={styles.tagline}>FAST • SECURE • SMART</Text>
//       </Animated.View>

//       <View style={styles.footer}>
//         <Text style={styles.versionText}>Version 1.0</Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoContainer: {
//     width: 180,
//     height: 180,
//     marginBottom: 20,
//   },
//   logo: {
//     width: '100%',
//     height: '100%',
//   },
//   brandName: {
//     fontSize: 42,
//     fontWeight: '900',
//     color: COLORS.primary,
//     letterSpacing: 5,
//     textAlign: 'center',
//   },
//   line: {
//     height: 3,
//     width: 40,
//     backgroundColor: COLORS.secondary,
//     alignSelf: 'center',
//     marginVertical: 10,
//     borderRadius: 2,
//   },
//   tagline: {
//     fontSize: 12,
//     color: COLORS.textGrey,
//     fontWeight: '600',
//     letterSpacing: 2,
//     textAlign: 'center',
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 50,
//   },
//   versionText: {
//     fontSize: 12,
//     color: COLORS.border,
//     fontWeight: '500',
//   },
// });

// export default SplashScreen;

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import { rehydrateUser, setFirstTime } from '../../store/userSlice';

const SplashScreen = () => {
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const checkStatus = async () => {
      try {
        const rememberMeStr = await AsyncStorage.getItem('remember_me');
        const userDataStr = await AsyncStorage.getItem('user_data');

        const rememberMe = rememberMeStr ? JSON.parse(rememberMeStr) : false;
        const userData = userDataStr ? JSON.parse(userDataStr) : null;

        setTimeout(() => {
          if (rememberMe && userData) {
            dispatch(
              rehydrateUser({ userData, isLoggedIn: true, rememberMe: true }),
            );
          } else {
            dispatch(setFirstTime(false));
          }
        }, 3000);
      } catch (e) {
        dispatch(setFirstTime(false));
      }
    };

    checkStatus();
  }, [dispatch, fadeAnim, scaleAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require('../../assets/Ridya.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <Text style={styles.brandName}>RIDYA</Text>
        <View style={styles.line} />
        <Text style={styles.tagline}>FAST • SECURE • SMART</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 5,
    textAlign: 'center',
  },
  line: {
    height: 3,
    width: 40,
    backgroundColor: COLORS.secondary,
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.textGrey,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.border,
    fontWeight: '500',
  },
});

export default SplashScreen;
