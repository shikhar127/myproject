import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const SpendScoreNudge = ({ navigation, regularPayments = 12 }) => {
  const handleViewScore = () => {
    console.log('View Score pressed from Spend Analyser');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'ScoreView',
      permissions: ['login', 'alerts'],
    });
  };

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.emoji}>📈</Text>

      <Text style={commonStyles.subtitle}>
        See how your payment behavior affects your score
      </Text>

      <View style={{
        backgroundColor: '#E8F5E9',
        padding: 16,
        borderRadius: 12,
        marginVertical: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50'
      }}>
        <Text style={{ fontSize: 14, color: '#2E7D32', fontWeight: '600' }}>
          ✓ Regular bill payments detected: {regularPayments}
        </Text>
      </View>

      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <Text style={commonStyles.bulletPoint}>• Get your actual CIBIL score</Text>
        <Text style={commonStyles.bulletPoint}>• Track score improvements</Text>
        <Text style={commonStyles.bulletPoint}>• Get alerts on inquiries</Text>
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
          ℹ️ Requires Log-in + alerts consent
        </Text>
      </View>
    </View>
  );
};

export default SpendScoreNudge;
