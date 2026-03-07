import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS } from '../../constants/theme';
import { updateLiveLocation } from '../../services/firebaseService';

const { width, height } = Dimensions.get('window');

const DriverHomeScreen = () => {
  const { userData } = useSelector(state => state.user);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [rideStatus, setRideStatus] = useState('idle'); 
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);


  const startLocationUpdates = useCallback(async () => {
    locationSubscription.current = Geolocation.watchPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });

        
        if (isOnline) {
          await updateLiveLocation(userData.uid, latitude, longitude);
        }
      },
      error => console.log(error),
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000 },
    );
  }, [isOnline, userData.uid]);


  const toggleOnlineStatus = async value => {
    if (value) {
      const granted = await requestLocationPermission();
      if (granted) {
        setIsOnline(true);
        await firestore()
          .collection('Users')
          .doc(userData.uid)
          .update({ status: 'online' });
        startLocationUpdates();
      } else {
        Alert.alert(
          'Permission Required',
          'Location permission is mandatory to go online.',
        );
      }
    } else {
      setIsOnline(false);
      if (locationSubscription.current)
        Geolocation.clearWatch(locationSubscription.current);
      await firestore()
        .collection('Users')
        .doc(userData.uid)
        .update({ status: 'offline' });
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  
  useEffect(() => {
    if (isOnline) {
      const unsubscribe = firestore()
        .collection('Rides')
        .where('status', '==', 'pending')
        .where(
          'vehicleType',
          '==',
          userData.vehicleInfo.vehicleName.toLowerCase() === 'bike'
            ? 'bike'
            : 'car',
        )
        .onSnapshot(querySnapshot => {
          if (!querySnapshot.empty) {
           
            const rideData = querySnapshot.docs[0].data();
            const rideId = querySnapshot.docs[0].id;
            setIncomingRequest({ ...rideData, id: rideId });
          } else {
            setIncomingRequest(null);
          }
        });

      return () => unsubscribe();
    }
  }, [isOnline, userData.vehicleInfo.vehicleName]);

  const handleAcceptRide = async () => {
    try {
      await firestore().collection('Rides').doc(incomingRequest.id).update({
        status: 'accepted',
        driverId: userData.uid,
        driverName: userData.fullName,
        driverPhone: userData.phone,
        vehicleInfo: userData.vehicleInfo,
      });
      setRideStatus('accepted');
      setIncomingRequest(null);
      Alert.alert('Success', 'Ride Accepted! Navigate to Pickup.');
    } catch (error) {
      Alert.alert('Error', 'Could not accept ride.');
    }
  };

  return (
    <View style={styles.container}>
     
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hi, {userData.fullName}</Text>
          <Text
            style={[
              styles.statusIndicator,
              { color: isOnline ? COLORS.primary : COLORS.secondary },
            ]}
          >
            {isOnline ? 'YOU ARE ONLINE' : 'YOU ARE OFFLINE'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnlineStatus}
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: 33.6844,
          longitude: 73.0479,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {currentLocation && isOnline && (
          <Marker coordinate={currentLocation} title="You">
            <Icon name="car-connected" size={40} color={COLORS.primary} />
          </Marker>
        )}
      </MapView>

     
      {incomingRequest && isOnline && rideStatus === 'idle' && (
        <View style={styles.requestPopup}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestTitle}>New Ride Request!</Text>
            <Text style={styles.fareText}>
              Est. Fare: RS {incomingRequest.fare}
            </Text>
          </View>

          <View style={styles.riderDetail}>
            <Icon name="account" size={24} color={COLORS.textGrey} />
            <Text style={styles.riderName}>{incomingRequest.riderName}</Text>
          </View>

          <View style={styles.locationRow}>
            <Icon name="circle-slice-8" size={18} color={COLORS.primary} />
            <Text numberOfLines={1} style={styles.locationText}>
              {incomingRequest.pickupAddress}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={18} color={COLORS.secondary} />
            <Text numberOfLines={1} style={styles.locationText}>
              {incomingRequest.destinationAddress}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => setIncomingRequest(null)}
            >
              <Text style={styles.btnTextWhite}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAcceptRide}
            >
              <Text style={styles.btnTextWhite}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

   
      {rideStatus === 'accepted' && (
        <View style={styles.rideControls}>
          <Text style={FONTS.h3}>Heading to Pickup</Text>
          <TouchableOpacity
            style={styles.startRideBtn}
            onPress={() => setRideStatus('pickedUp')}
          >
            <Text style={styles.btnTextWhite}>START RIDE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    position: 'absolute',
    top: 40,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 15,
    zIndex: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    shadowOpacity: 0.2,
  },
  welcomeText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  statusIndicator: { fontSize: 12, fontWeight: '800' },
  map: { flex: 1 },
  requestPopup: {
    position: 'absolute',
    bottom: 20,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    elevation: 20,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  requestTitle: { ...FONTS.h3, color: COLORS.primary },
  fareText: { ...FONTS.h3, color: COLORS.secondary },
  riderDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  riderName: { marginLeft: 10, fontSize: 16, color: COLORS.textDark },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationText: { marginLeft: 10, color: COLORS.textGrey, flex: 1 },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  rejectBtn: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    flex: 0.45,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#4CD964',
    padding: 15,
    borderRadius: 12,
    flex: 0.45,
    alignItems: 'center',
  },
  btnTextWhite: { color: COLORS.white, fontWeight: 'bold' },
  rideControls: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
  },
  startRideBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
});

export default DriverHomeScreen;
