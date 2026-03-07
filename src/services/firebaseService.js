import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export const signUpUser = async userData => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      role,
      vehicleDetails,
      profileImage,
    } = userData;
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    const uid = userCredential.user.uid;

    const photoURL = await uploadImage(uid, profileImage);

    let profileData = {
      uid,
      fullName,
      email,
      phone,
      role,
      profilePic: photoURL || 'https://via.placeholder.com/150',
      createdAt: firestore.FieldValue.serverTimestamp(),
      isAvailable: true,
      currentLocation: new firestore.GeoPoint(0, 0),
    };

    if (role === 'driver') {
      profileData.vehicleInfo = {
        vehicleName: vehicleDetails.name,
        vehicleNumber: vehicleDetails.number,
        vehicleColor: vehicleDetails.color,
      };
      profileData.rating = 0;
      profileData.totalRides = 0;
      profileData.status = 'offline';
    }

    await firestore().collection('Users').doc(uid).set(profileData);
    return { success: true, user: profileData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const uploadImage = async (uid, imageUri) => {
  if (!imageUri) return null;
  try {
    const reference = storage().ref(`profile_pics/${uid}.jpg`);
    await reference.putFile(imageUri);
    const url = await reference.getDownloadURL();
    return url;
  } catch (error) {
    return null;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    const userDoc = await firestore()
      .collection('Users')
      .doc(userCredential.user.uid)
      .get();

    if (userDoc.exists) {
      return { success: true, user: userDoc.data() };
    } else {
      return { success: false, error: 'User data not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateLiveLocation = async (uid, latitude, longitude) => {
  try {
    await firestore()
      .collection('Users')
      .doc(uid)
      .update({
        currentLocation: new firestore.GeoPoint(latitude, longitude),
        lastUpdated: firestore.FieldValue.serverTimestamp(),
      });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
