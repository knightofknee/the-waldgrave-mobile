import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('Logging in with:', email, password);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in userrrrr:', userCred.user);
      router.replace('/');
    } catch (err: any) {
      console.error('Login failed:', err.message);
      alert(err.message);
    }
  };

  const handleSignupRedirect = () => {
    router.push('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerLetter}>W</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSignupRedirect}>
          <Text style={styles.secondaryButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  headerLetter: {
    fontSize: 120,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.05)',
    marginBottom: 40,
  },
  form: {
    width: '80%',
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    marginTop: 12,
    textAlign: 'center',       // 🟢 center the label text
    alignSelf: 'center',       // 🟢 center the label component within the form
    width: '100%',             // ensure it doesn’t hug its content
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    width: '100%',
    backgroundColor: '#4287f5',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  or: {
    alignSelf: 'center',
    marginVertical: 12,
    color: '#666',
    fontSize: 14,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 6,
    borderColor: '#4287f5',
    borderWidth: 1.5,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4287f5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
