import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS } from '../../../constants/theme';
import { GOOGLE_MAPS_APIKEY } from '../../../constants/keys';
const { width, height } = Dimensions.get('window');
// const GOOGLE_MAPS_APIKEY = 'AIzaSyCdmIHvKSHu-vKEeN0hcvjQrOtr8row6qE';

const RiderHomeScreen = () => {
  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: 33.6844, 
    longitude: 73.0479,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [rideType, setRideType] = useState('car');
  const [isSearching, setIsSearching] = useState(false);
  const [rideStatus, setRideStatus] = useState('idle');
  const [driverLocation, setDriverLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);


  const getCurrentLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newRegion = { ...region, latitude, longitude };
        setRegion(newRegion);
        setPickup({ latitude, longitude, address: 'Current Location' });

        
        mapRef.current?.animateToRegion(newRegion, 1000);
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, [region]);

 
  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert(
            'Permission Denied',
            'Using default location (Islamabad).',
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      
      getCurrentLocation();
    }
  }, [getCurrentLocation]);


  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const calculateFare = dist => {
    const rates = { car: 50, bike: 20, truck: 120 };
    return (dist * rates[rideType]).toFixed(0);
  };

  const startBooking = () => {
    if (!pickup || !destination)
      return Alert.alert('Error', 'Select both locations');
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      setRideStatus('onWay');
      setDriverLocation({
        latitude: pickup.latitude + 0.002,
        longitude: pickup.longitude + 0.002,
      });
    }, 4000);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {pickup && (
          <Marker coordinate={pickup}>
            <Icon name="map-marker-radius" size={40} color={COLORS.primary} />
          </Marker>
        )}

        {destination && (
          <Marker coordinate={destination}>
            <Icon name="flag-checkered" size={40} color={COLORS.secondary} />
          </Marker>
        )}

        {driverLocation && (
          <Marker coordinate={driverLocation} rotation={90}>
            <Icon
              name={
                rideType === 'car'
                  ? 'car'
                  : rideType === 'bike'
                  ? 'bike'
                  : 'truck'
              }
              size={35}
              color={COLORS.textDark}
            />
          </Marker>
        )}

        {pickup && destination && (
          <MapViewDirections
            origin={pickup}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor={COLORS.primary}
            onReady={result => {
              setDistance(result.distance);
              setDuration(result.duration);
              mapRef.current.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
              });
            }}
          />
        )}
      </MapView>

      
      {rideStatus === 'idle' && (
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            placeholder="Enter Destination"
            fetchDetails={true}
            onPress={(data, details = null) => {
              setDestination({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                address: data.description,
              });
            }}
            query={{ key: GOOGLE_MAPS_APIKEY, language: 'en' }}
            styles={{ textInput: styles.searchInput }}
          />
        </View>
      )}

      
      <View style={styles.bottomSheet}>
        {rideStatus === 'idle' ? (
          <>
            <Text style={styles.sheetTitle}>Where are you going?</Text>
            <View style={styles.rideOptions}>
              {['car', 'bike', 'truck'].map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setRideType(type)}
                  style={[
                    styles.rideBtn,
                    rideType === type && styles.activeRide,
                  ]}
                >
                  <Icon
                    name={type === 'truck' ? 'truck' : type}
                    size={28}
                    color={rideType === type ? COLORS.white : COLORS.primary}
                  />
                  <Text
                    style={{
                      color: rideType === type ? COLORS.white : COLORS.textDark,
                      fontSize: 12,
                    }}
                  >
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {destination && (
              <View style={styles.fareContainer}>
                <View style={styles.fareRow}>
                  <Text style={FONTS.h3}>RS {calculateFare(distance)}</Text>
                  <Text style={styles.distText}>
                    {distance.toFixed(1)} km • {duration.toFixed(0)} min
                  </Text>
                </View>
                <TouchableOpacity style={styles.goBtn} onPress={startBooking}>
                  <Text style={styles.goBtnText}>
                    CONFIRM {rideType.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <Icon name="account-circle" size={50} color={COLORS.border} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={FONTS.h3}>M. Abdul Basit</Text>
                <Text style={{ color: COLORS.textGrey }}>
                  Honda Civic • LEW-5542
                </Text>
              </View>
              <View style={styles.rating}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={{ fontWeight: 'bold' }}> 4.9</Text>
              </View>
            </View>
            <Text style={styles.arrivalText}>Driver is arriving in 4 mins</Text>
            <TouchableOpacity style={styles.comingBtn}>
              <Text style={styles.comingText}>I'M COMING</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isSearching && (
        <View style={styles.loader}>
          <Text style={styles.loaderText}>Finding your Ride...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 50,
    width: '90%',
    alignSelf: 'center',
    zIndex: 1,
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingHorizontal: 15,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  sheetTitle: { ...FONTS.h2, marginBottom: 20, color: COLORS.textDark },
  rideOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rideBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    marginHorizontal: 5,
    borderWeight: 1,
    borderColor: COLORS.border,
  },
  activeRide: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fareContainer: {
    borderTopWidth: 1,
    borderColor: COLORS.background,
    paddingTop: 15,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distText: { color: COLORS.textGrey, fontSize: 14 },
  goBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  goBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  driverCard: { paddingVertical: 10 },
  driverHeader: { flexDirection: 'row', alignItems: 'center' },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 5,
    borderRadius: 10,
  },
  arrivalText: {
    textAlign: 'center',
    color: COLORS.secondary,
    marginVertical: 15,
    fontWeight: 'bold',
  },
  comingBtn: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  comingText: { color: COLORS.white, fontWeight: 'bold' },
});

export default RiderHomeScreen;
