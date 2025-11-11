import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SMSPermissionGate from '../../screens/spendAnalyser/SMSPermissionGate';
import SpendEligibilityNudge from '../../screens/spendAnalyser/SpendEligibilityNudge';
import SpendScoreNudge from '../../screens/spendAnalyser/SpendScoreNudge';
import SpendOfferNudge from '../../screens/spendAnalyser/SpendOfferNudge';
import { commonStyles } from '../../styles/commonStyles';

/**
 * SpendAnalyserFlow Component
 * Entry Point: User wants spending analysis
 * Step 0: SMS Permission Gate
 * Then shows 3 nudges: Eligibility, Score, and Offer
 */
const SpendAnalyserFlow = ({ navigation }) => {
  const [smsPermissionGranted, setSmsPermissionGranted] = useState(false);
  const [analysisData, setAnalysisData] = useState({
    affordableLoan: '3',
    monthlyObligations: '15000',
    emiCapacity: '12000',
    regularPayments: 12,
    monthlySavings: '2500',
  });

  const handlePermissionGranted = () => {
    setSmsPermissionGranted(true);
    // In real app, this would trigger SMS analysis
    console.log('SMS permission granted, analyzing transactions...');
  };

  if (!smsPermissionGranted) {
    return (
      <SMSPermissionGate
        navigation={navigation}
        onPermissionGranted={handlePermissionGranted}
      />
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Your Spending Analysis</Text>
        <Text style={commonStyles.description}>
          Based on your transaction history, here's what we found
        </Text>
      </View>

      {/* Nudge 1: Check Eligibility */}
      <SpendEligibilityNudge
        navigation={navigation}
        affordableLoan={analysisData.affordableLoan}
        monthlyObligations={analysisData.monthlyObligations}
        emiCapacity={analysisData.emiCapacity}
      />

      {/* Nudge 2: Check Score */}
      <SpendScoreNudge
        navigation={navigation}
        regularPayments={analysisData.regularPayments}
      />

      {/* Nudge 3: Check Offer */}
      <SpendOfferNudge
        navigation={navigation}
        monthlySavings={analysisData.monthlySavings}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
});

export default SpendAnalyserFlow;
