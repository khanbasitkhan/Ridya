import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, FONTS } from '../../constants/theme';
import { loginUser } from '../../services/firebaseService';
import { setRememberMe, setUser } from '../../store/userSlice';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const rememberMe = useSelector(state => state.user.rememberMe);

  const [identifier, setIdentifier] = useState(''); // Email, Phone, or Username
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter credentials');
      return;
    }

    const result = await loginUser(identifier, password);

    if (result.success) {
      const user = result.user;
      dispatch(setUser(user));

      if (user.role === 'rider') {
        navigation.replace('RiderHome');
      } else {
        navigation.replace('DriverHome');
      }
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to your Ridya account</Text>

        <View style={styles.inputContainer}>
          <Icon
            name="account-outline"
            size={20}
            color={COLORS.textGrey}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Email, Phone or Username"
            style={styles.input}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon
            name="lock-outline"
            size={20}
            color={COLORS.textGrey}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => dispatch(setRememberMe(!rememberMe))}
          >
            <Icon
              name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={rememberMe ? COLORS.primary : COLORS.textGrey}
            />
            <Text style={styles.rememberText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mainBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
              Sign Up
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1, padding: 25, justifyContent: 'center' },
  headerTitle: { ...FONTS.h1, color: COLORS.textDark },
  subtitle: { ...FONTS.body, marginBottom: 40 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: COLORS.textDark },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { marginLeft: 8, color: COLORS.textGrey, fontSize: 14 },
  forgotText: { color: COLORS.secondary, fontWeight: '600', fontSize: 14 },
  mainBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  footerText: { textAlign: 'center', marginTop: 25, color: COLORS.textGrey },
});

export default LoginScreen;
