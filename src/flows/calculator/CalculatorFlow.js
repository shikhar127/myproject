import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CheckEligibilityNudge from '../../screens/calculator/CheckEligibilityNudge';
import CheckScoreNudge from '../../screens/calculator/CheckScoreNudge';
import CheckOfferNudge from '../../screens/calculator/CheckOfferNudge';
import { commonStyles } from '../../styles/commonStyles';

/**
 * CalculatorFlow Component
 * Entry Point: User completes calculator
 * Shows 3 nudges: Eligibility, Score, and Offer
 */
const CalculatorFlow = ({ navigation }) => {
  const [calculatorResult, setCalculatorResult] = useState({
    loanAmount: '5',
    income: '50000',
  });

  return (
    <ScrollView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Loan Calculator Results</Text>
        <Text style={commonStyles.description}>
          Based on your inputs, here are some personalized options for you
        </Text>
      </View>

      {/* Nudge 1: Check Eligibility */}
      <CheckEligibilityNudge
        navigation={navigation}
        loanAmount={calculatorResult.loanAmount}
      />

      {/* Nudge 2: Check Score */}
      <CheckScoreNudge navigation={navigation} />

      {/* Nudge 3: Check Offer */}
      <CheckOfferNudge navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
});

export default CalculatorFlow;
