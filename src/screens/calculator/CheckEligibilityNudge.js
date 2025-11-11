import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const CheckEligibilityNudge = ({ navigation, loanAmount = '5' }) => {
  const handleCheckEligibility = () => {
    // Navigate to eligibility check flow
    // This would require SMS permission + login
    console.log('Check Eligibility pressed');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'EligibilityCheck',
      permissions: ['sms', 'login'],
    });
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.card}>
        <Text style={commonStyles.emoji}>💰</Text>

        <Text style={commonStyles.subtitle}>
          You may qualify for up to ₹{loanAmount} lakh
        </Text>

        <Text style={commonStyles.description}>
          Check your eligibility in 30 seconds{'\n'}
          No impact on credit score
        </Text>

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
            ℹ️ Requires SMS permission + log-in
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CheckEligibilityNudge;
