import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const SpendOfferNudge = ({ navigation, monthlySavings = '2500' }) => {
  const handleViewOffers = () => {
    console.log('View Offers pressed from Spend Analyser');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'PreApprovedOffers',
      permissions: ['login'],
    });
  };

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.subtitle}>
        Based on your spending pattern, you can save ₹{monthlySavings}/month on loan EMIs
      </Text>

      <View style={{
        backgroundColor: '#FFF9E6',
        padding: 16,
        borderRadius: 12,
        marginVertical: 16,
        alignItems: 'center'
      }}>
        <Text style={commonStyles.emoji}>💡</Text>
        <Text style={{ fontSize: 15, color: '#666', fontWeight: '500', textAlign: 'center' }}>
          You have pre-approved offers with lower interest rates
        </Text>
      </View>

      <TouchableOpacity
        style={commonStyles.primaryButton}
        onPress={handleViewOffers}
      >
        <Text style={commonStyles.primaryButtonText}>
          Check My Offers →
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          ℹ️ Requires Log-in + proceed to offers
        </Text>
      </View>
    </View>
  );
};

export default SpendOfferNudge;
