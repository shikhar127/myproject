import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const CheckOfferNudge = ({ navigation }) => {
  const handleViewOffers = () => {
    // Navigate to offers flow
    // This would require login + salary details
    console.log('View Offers pressed');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'PreApprovedOffers',
      permissions: ['login', 'salaryDetails'],
    });
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.card}>
        <Text style={commonStyles.emoji}>✨</Text>

        <Text style={commonStyles.subtitle}>
          See your pre-approved loan offers
        </Text>

        <Text style={commonStyles.description}>
          Based on your income, you have exclusive offers
        </Text>

        <View style={{ marginTop: 8, marginBottom: 16 }}>
          <Text style={commonStyles.bulletPoint}>• Instant approval decision</Text>
          <Text style={commonStyles.bulletPoint}>• Best rates available</Text>
          <Text style={commonStyles.bulletPoint}>• Quick salary verification</Text>
        </View>

        <TouchableOpacity
          style={commonStyles.primaryButton}
          onPress={handleViewOffers}
        >
          <Text style={commonStyles.primaryButtonText}>
            View My Offers →
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            ℹ️ Requires Log-in + salary details
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CheckOfferNudge;
