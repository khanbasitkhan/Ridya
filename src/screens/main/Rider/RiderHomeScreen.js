import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyCdmIHvKSHu-vKEeN0hcvjQrOtr8row6qE';

const RiderHomeScreen = () => {
  const mapRef = useRef(null);

  // States
  const [region, setRegion] = useState({
    latitude: 33.6844, // Default Islamabad
    longitude: 73.0479,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [rideType, setRideType] = useState('car'); // car, bike, truck
  const [isSearching, setIsSearching] = useState(false);
  const [rideStatus, setRideStatus] = useState('idle'); // idle, searching, onWay, started
  const [driverLocation, setDriverLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        Alert.alert('Permission Denied', 'Defaulting to Islamabad location.');
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setRegion({ ...region, latitude, longitude });
        setPickup({ latitude, longitude, address: 'Current Location' });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const calculateFare = dist => {
    const rates = { car: 50, bike: 20, truck: 120 };
    return (dist * rates[rideType]).toFixed(0);
  };

  const startBooking = () => {
    if (!pickup || !destination)
      return Alert.alert('Error', 'Select both locations');
    setIsSearching(true);
    // Simulating Driver Found after 3 seconds
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
      {/* Map Section */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {pickup && (
          <Marker coordinate={pickup} title="Pickup">
            <Icon name="map-marker-radius" size={40} color={COLORS.primary} />
          </Marker>
        )}

        {destination && (
          <Marker coordinate={destination} title="Drop-off">
            <Icon name="flag-checkered" size={40} color={COLORS.secondary} />
          </Marker>
        )}

        {driverLocation && (
          <Marker coordinate={driverLocation} rotation={90}>
            <Image
              source={
                rideType === 'car'
                  ? require('../../assets/images/car_top.png')
                  : rideType === 'bike'
                  ? require('../../assets/images/bike_top.png')
                  : require('../../assets/images/truck_top.png')
              }
              style={{ width: 40, height: 40 }}
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
                edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
              });
            }}
          />
        )}
      </MapView>

      {/* Search Bar - Floating */}
      {rideStatus === 'idle' && (
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            placeholder="Where to?"
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

      {/* Bottom Sheet - Details & Options */}
      <View style={styles.bottomSheet}>
        {rideStatus === 'idle' ? (
          <>
            <Text style={styles.sheetTitle}>Choose a Ride</Text>
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
                    size={30}
                    color={rideType === type ? COLORS.white : COLORS.primary}
                  />
                  <Text
                    style={{
                      color: rideType === type ? COLORS.white : COLORS.textDark,
                    }}
                  >
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {destination && (
              <View style={styles.fareContainer}>
                <Text style={FONTS.h3}>
                  Est. Fare: RS {calculateFare(distance)}
                </Text>
                <Text style={FONTS.body}>
                  Dist: {distance.toFixed(1)} km | Time: {duration.toFixed(0)}{' '}
                  min
                </Text>
                <TouchableOpacity style={styles.goBtn} onPress={startBooking}>
                  <Text style={styles.goBtnText}>GO - FIND DRIVER</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : rideStatus === 'onWay' ? (
          <View style={styles.driverDetailCard}>
            <View style={styles.driverHeader}>
              <View style={styles.driverInfo}>
                <Icon name="account-circle" size={50} color={COLORS.primary} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={FONTS.h3}>Ahmad Khan</Text>
                  <Text style={COLORS.textGrey}>Toyota Corolla • ABC-123</Text>
                </View>
              </View>
              <View style={styles.ratingBox}>
                <Icon name="star" size={20} color="#FFD700" />
                <Text>4.8</Text>
              </View>
            </View>
            <Text style={styles.statusText}>
              Driver is on the way (5m Wait)
            </Text>
            <TouchableOpacity style={styles.cancelBtn}>
              <Text style={{ color: COLORS.white }}>I'm Coming</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Searching Loader Overlay */}
      {isSearching && (
        <View style={styles.loaderOverlay}>
          <Text style={styles.loaderText}>Searching nearest drivers...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 50,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  searchInput: { borderRadius: 10, elevation: 5, height: 50 },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
  },
  sheetTitle: { ...FONTS.h2, marginBottom: 15 },
  rideOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rideBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeRide: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fareContainer: {
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 15,
  },
  goBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  goBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 18 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  driverDetailCard: { padding: 10 },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 5,
    borderRadius: 8,
  },
  statusText: {
    textAlign: 'center',
    marginVertical: 15,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default RiderHomeScreen;
