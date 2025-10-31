import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    try {
      setLoading(true);
      const resSignIn = await signIn?.create({ identifier: email });

      const emailAddressId = resSignIn?.supportedFirstFactors?.find(
        factor => factor.strategy === 'reset_password_email_code'
      )?.emailAddressId;

      if (!emailAddressId) {
        throw new Error('Email address ID not found.');
      }

      await signIn?.prepareFirstFactor({
        strategy: 'reset_password_email_code',
        emailAddressId,
      });

      setCodeSent(true);
      Alert.alert('Code Sent', 'Check your email and enter the code below.');
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.errors?.[0]?.message || err.message || 'Failed to send reset code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result?.status === 'complete') {
        await setActive?.({ session: result.createdSessionId });
        router.replace('/');
      } else {
        Alert.alert('Error', 'Password reset failed.');
      }
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.errors?.[0]?.message || err.message || 'Something went wrong during password reset.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {!codeSent && (
        <Button title="Send Reset Code" onPress={handleSendCode} disabled={loading || !email} />
      )}

      {codeSent && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            value={code}
            onChangeText={setCode}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="New Password"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
              <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            disabled={loading || !code || !newPassword}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggle: {
    marginLeft: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
});
