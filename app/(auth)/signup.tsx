import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save email + contact info to Firestore
      const profileData = {
        email: email.trim().toLowerCase(),
        method: 'email',
        contact: email.trim().toLowerCase(),
        pushToken: null, // will be set after login
        notificationsEnabled: true, // ✅ Default opt-in
      };

      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });

      router.replace('/');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/(auth)/login');
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
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError('');
          }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleLoginRedirect}>
          <Text style={styles.secondaryButtonText}>Log In</Text>
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
  error: {
    color: 'red',
    fontSize: 13,
    marginTop: 6,
    marginBottom: -8,
    alignSelf: 'center',
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
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
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
