import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const LoanEligibilityNudge = ({ navigation }) => {
  const handleCheckEligibility = () => {
    console.log('Check Eligibility pressed from Loan App');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'EligibilityCheck',
      permissions: ['sms'],
    });
  };

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.emoji}>💰</Text>

      <Text style={commonStyles.subtitle}>
        First, let's check what you qualify for
      </Text>

      <Text style={commonStyles.description}>
        Quick eligibility check
      </Text>

      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <Text style={commonStyles.bulletPoint}>• Based on your profile</Text>
        <Text style={commonStyles.bulletPoint}>• No credit score impact</Text>
        <Text style={commonStyles.bulletPoint}>• Takes 30 seconds</Text>
      </View>

      <TouchableOpacity
        style={commonStyles.primaryButton}
        onPress={handleCheckEligibility}
      >
        <Text style={commonStyles.primaryButtonText}>
          Check Eligibility →
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          ℹ️ Requires SMS permission + proceed
        </Text>
      </View>
    </View>
  );
};

export default LoanEligibilityNudge;
