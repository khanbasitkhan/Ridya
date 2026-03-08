import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { COLORS, FONTS } from '../../constants/theme';
import { signUpUser } from '../../services/firebaseService';
import { setUser } from '../../store/userSlice';

const SignUpScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [role, setRole] = useState('rider');
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [vName, setVName] = useState('');
  const [vNumber, setVNumber] = useState('');
  const [vColor, setVColor] = useState('');

  const pickImage = () => {
    const options = { mediaType: 'photo', quality: 0.5 };
    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill all basic fields');
      return;
    }

    if (role === 'driver' && (!vName || !vNumber || !vColor)) {
      Alert.alert('Error', 'Please fill all vehicle details');
      return;
    }

    const userData = {
      fullName,
      email,
      password,
      phone,
      role,
      profileImage,
    };

    if (role === 'driver') {
      userData.vehicleDetails = {
        name: vName,
        number: vNumber,
        color: vColor,
      };
    }

    const result = await signUpUser(userData);
    if (result.success) {
      dispatch(setUser(result.user));
    } else {
      Alert.alert('Sign Up Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.subtitle}>Join Ridya for a premium experience</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profilePic} />
          ) : (
            <View style={styles.placeholderPic}>
              <Text style={styles.plusText}>+</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'rider' && styles.activeRole]}
            onPress={() => setRole('rider')}
          >
            <Text
              style={[styles.roleText, role === 'rider' && styles.activeText]}
            >
              Rider
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'driver' && styles.activeRole]}
            onPress={() => setRole('driver')}
          >
            <Text
              style={[styles.roleText, role === 'driver' && styles.activeText]}
            >
              Driver
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor={COLORS.textGrey}
          style={styles.input}
          onChangeText={setFullName}
          color={COLORS.textDark}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor={COLORS.textGrey}
          style={styles.input}
          keyboardType="email-address"
          onChangeText={setEmail}
          color={COLORS.textDark}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor={COLORS.textGrey}
          style={styles.input}
          keyboardType="phone-pad"
          onChangeText={setPhone}
          color={COLORS.textDark}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={COLORS.textGrey}
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          color={COLORS.textDark}
        />

        {role === 'driver' && (
          <View style={styles.driverSection}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <TextInput
              placeholder="Vehicle Name"
              placeholderTextColor={COLORS.textGrey}
              style={styles.input}
              onChangeText={setVName}
              color={COLORS.textDark}
            />
            <TextInput
              placeholder="Vehicle Number"
              placeholderTextColor={COLORS.textGrey}
              style={styles.input}
              onChangeText={setVNumber}
              color={COLORS.textDark}
            />
            <TextInput
              placeholder="Vehicle Color"
              placeholderTextColor={COLORS.textGrey}
              style={styles.input}
              onChangeText={setVColor}
              color={COLORS.textDark}
            />
          </View>
        )}

        <TouchableOpacity style={styles.mainBtn} onPress={handleSignUp}>
          <Text style={styles.btnText}>SIGN UP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 25 },
  headerTitle: { ...FONTS.h1, color: COLORS.textDark, marginTop: 20 },
  subtitle: { ...FONTS.body, marginBottom: 20 },
  imagePicker: { alignSelf: 'center', marginBottom: 20 },
  profilePic: { width: 100, height: 100, borderRadius: 50 },
  placeholderPic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  plusText: { fontSize: 30, color: COLORS.textGrey },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 5,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeRole: { backgroundColor: COLORS.primary },
  roleText: { fontWeight: '600', color: COLORS.textGrey },
  activeText: { color: COLORS.white },
  input: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  driverSection: { marginTop: 10 },
  sectionTitle: { ...FONTS.h3, marginBottom: 15, color: COLORS.secondary },
  mainBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  footerText: { textAlign: 'center', marginTop: 25, color: COLORS.textGrey },
});

export default SignUpScreen;
