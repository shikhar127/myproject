import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const CheckScoreNudge = ({ navigation }) => {
  const handleViewScore = () => {
    // Navigate to score check flow
    // This would require login + SMS permission + alerts consent
    console.log('View Score pressed');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'ScoreView',
      permissions: ['login', 'sms', 'alerts'],
    });
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.card}>
        <Text style={commonStyles.emoji}>🎯</Text>

        <Text style={commonStyles.subtitle}>
          Want to know your actual credit score?
        </Text>

        <Text style={commonStyles.description}>
          Get your CIBIL score instantly
        </Text>

        <View style={{ marginTop: 8, marginBottom: 16 }}>
          <Text style={commonStyles.bulletPoint}>• Free, unlimited checks</Text>
          <Text style={commonStyles.bulletPoint}>• Track improvements over time</Text>
          <Text style={commonStyles.bulletPoint}>• Alerts on new credit inquiries</Text>
        </View>

        <TouchableOpacity
          style={commonStyles.primaryButton}
          onPress={handleViewScore}
        >
          <Text style={commonStyles.primaryButtonText}>
            View My Score →
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            ℹ️ Requires log-in + SMS permission + alerts consent
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CheckScoreNudge;
