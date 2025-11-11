import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const SMSPermissionGate = ({ navigation, onPermissionGranted }) => {
  const handleAllowSMS = async () => {
    // Request SMS permissions
    console.log('Requesting SMS permission...');

    // Simulate permission request
    // In real app, use react-native-permissions
    try {
      // const granted = await request(PERMISSIONS.ANDROID.READ_SMS);
      // if (granted === RESULTS.GRANTED) {
      //   onPermissionGranted();
      // }

      // For demo, just proceed
      if (onPermissionGranted) {
        onPermissionGranted();
      } else {
        navigation.navigate('SpendAnalysisResults');
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const handleWhyNeed = () => {
    // Show explanation modal
    console.log('Show why we need SMS permission');
    navigation.navigate('SMSPermissionExplanation');
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.card}>
        <Text style={commonStyles.emoji}>📊</Text>

        <Text style={commonStyles.subtitle}>
          Understand where your money goes
        </Text>

        <Text style={commonStyles.description}>
          We'll analyze your spending patterns to help you:
        </Text>

        <View style={{ marginTop: 8, marginBottom: 16 }}>
          <Text style={commonStyles.bulletPoint}>• Track monthly expenses</Text>
          <Text style={commonStyles.bulletPoint}>• Identify saving opportunities</Text>
          <Text style={commonStyles.bulletPoint}>• Get personalized loan offers</Text>
        </View>

        <View style={{
          backgroundColor: '#FFF9E6',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor: '#FFB800'
        }}>
          <Text style={{ fontSize: 14, color: '#666', fontWeight: '500' }}>
            📱 We need SMS access to read bank transaction messages
          </Text>
        </View>

        <TouchableOpacity
          style={commonStyles.primaryButton}
          onPress={handleAllowSMS}
        >
          <Text style={commonStyles.primaryButtonText}>
            Allow SMS Access →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={commonStyles.textButton}
          onPress={handleWhyNeed}
        >
          <Text style={commonStyles.textButtonText}>
            Why do we need this?
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SMSPermissionGate;
