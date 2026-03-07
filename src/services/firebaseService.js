import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const signUpUser = async (fullName, email, password, phone, role = 'rider') => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    await firestore().collection('Users').doc(uid).set({
      uid,
      fullName,
      email,
      phone,
      role,
      createdAt: firestore.FieldValue.serverTimestamp(),
      rating: 5.0,
      isAvailable: true
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const userDoc = await firestore().collection('Users').doc(userCredential.user.uid).get();
    
    return { success: true, user: userDoc.data() };
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