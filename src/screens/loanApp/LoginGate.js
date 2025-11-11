import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';

const LoginGate = ({ navigation, onLoginSuccess, customerCount = '5' }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = () => {
    console.log('Login pressed');
    // Simulate login
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      navigation.navigate('LoanApplicationDashboard');
    }
  };

  const handleSignUp = () => {
    console.log('Sign up pressed');
    setIsSignUp(true);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.card}>
        <Text style={commonStyles.emoji}>🏦</Text>

        <Text style={commonStyles.subtitle}>
          Get your loan in 3 simple steps
        </Text>

        <View style={{
          backgroundColor: '#E8F5E9',
          padding: 16,
          borderRadius: 12,
          marginVertical: 16
        }}>
          <Text style={{ fontSize: 14, color: '#2E7D32', fontWeight: '500', textAlign: 'center' }}>
            ✓ Trusted by {customerCount} lakh+ customers
          </Text>
        </View>

        <View style={{ marginTop: 8, marginBottom: 24 }}>
          <Text style={commonStyles.bulletPoint}>• Instant approval</Text>
          <Text style={commonStyles.bulletPoint}>• Lowest rates guaranteed</Text>
          <Text style={commonStyles.bulletPoint}>• Minimal documentation</Text>
        </View>

        {/* Simple login form */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Phone number or Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={commonStyles.primaryButton}
          onPress={handleLogin}
        >
          <Text style={commonStyles.primaryButtonText}>
            {isSignUp ? 'Sign Up →' : 'Log In to Continue →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={commonStyles.textButton}
          onPress={toggleMode}
        >
          <Text style={commonStyles.textButtonText}>
            {isSignUp ? 'Already have an account? Log in' : 'New user? Sign up'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 12,
    color: colors.text,
  },
});

export default LoginGate;
