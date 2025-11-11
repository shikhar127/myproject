import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const SpendEligibilityNudge = ({ navigation, affordableLoan = '3', monthlyObligations = '15000', emiCapacity = '12000' }) => {
  const handleCheckEligibility = () => {
    console.log('Check Eligibility pressed from Spend Analyser');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'EligibilityCheck',
      permissions: ['login'],
    });
  };

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.emoji}>💡</Text>

      <Text style={commonStyles.subtitle}>
        Based on your spending, you can afford ₹{affordableLoan} lakh loan
      </Text>

      <View style={{
        backgroundColor: '#F0F8FF',
        padding: 16,
        borderRadius: 12,
        marginVertical: 16
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Monthly obligations:</Text>
          <Text style={{ fontSize: 14, color: '#333', fontWeight: '600' }}>₹{monthlyObligations}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Potential EMI capacity:</Text>
          <Text style={{ fontSize: 14, color: '#4CAF50', fontWeight: '600' }}>₹{emiCapacity}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={commonStyles.primaryButton}
        onPress={handleCheckEligibility}
      >
        <Text style={commonStyles.primaryButtonText}>
          Check Full Eligibility →
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          ℹ️ Requires Log-in
        </Text>
      </View>
    </View>
  );
};

export default SpendEligibilityNudge;
