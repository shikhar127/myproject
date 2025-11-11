import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const LoanScoreNudge = ({ navigation }) => {
  const handleViewScore = () => {
    console.log('View Score pressed from Loan App');
    navigation.navigate('RequestPermissions', {
      nextScreen: 'ScoreView',
      permissions: ['sms', 'alerts'],
    });
  };

  const handleSkip = () => {
    console.log('Skip score check, continue application');
    navigation.navigate('LoanApplicationForm');
  };

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.emoji}>🎯</Text>

      <Text style={commonStyles.subtitle}>
        Know your credit score before applying
      </Text>

      <Text style={commonStyles.description}>
        Understanding your score helps:
      </Text>

      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <Text style={commonStyles.bulletPoint}>• Get better rate offers</Text>
        <Text style={commonStyles.bulletPoint}>• Know approval chances</Text>
        <Text style={commonStyles.bulletPoint}>• Track credit health</Text>
      </View>

      <TouchableOpacity
        style={commonStyles.primaryButton}
        onPress={handleViewScore}
      >
        <Text style={commonStyles.primaryButtonText}>
          View My Score First →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={commonStyles.secondaryButton}
        onPress={handleSkip}
      >
        <Text style={commonStyles.secondaryButtonText}>
          Skip, continue application →
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          ℹ️ Requires SMS permission + alerts consent
        </Text>
      </View>
    </View>
  );
};

export default LoanScoreNudge;
