import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const LoanOfferNudge = ({ navigation }) => {
  const handleViewOffers = () => {
    console.log('View Pre-Approved Offers pressed from Loan App');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'PreApprovedOffers',
      permissions: ['salaryVerification'],
    });
  };

  const handleApplyFresh = () => {
    console.log('Apply fresh, skip pre-approved offers');
    navigation.navigate('LoanApplicationForm');
  };

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.emoji}>✨</Text>

      <Text style={commonStyles.subtitle}>
        See all your pre-approved offers
      </Text>

      <Text style={commonStyles.description}>
        You might already have offers ready
      </Text>

      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <Text style={commonStyles.bulletPoint}>• Compare rates instantly</Text>
        <Text style={commonStyles.bulletPoint}>• Choose best terms</Text>
        <Text style={commonStyles.bulletPoint}>• Faster approval</Text>
      </View>

      <TouchableOpacity
        style={commonStyles.primaryButton}
        onPress={handleViewOffers}
      >
        <Text style={commonStyles.primaryButtonText}>
          View Pre-Approved Offers →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={commonStyles.secondaryButton}
        onPress={handleApplyFresh}
      >
        <Text style={commonStyles.secondaryButtonText}>
          Apply fresh →
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          ℹ️ Requires Salary verification + proceed
        </Text>
      </View>
    </View>
  );
};

export default LoanOfferNudge;
