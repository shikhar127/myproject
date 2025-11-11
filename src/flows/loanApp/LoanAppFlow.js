import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LoginGate from '../../screens/loanApp/LoginGate';
import LoanEligibilityNudge from '../../screens/loanApp/LoanEligibilityNudge';
import LoanScoreNudge from '../../screens/loanApp/LoanScoreNudge';
import LoanOfferNudge from '../../screens/loanApp/LoanOfferNudge';
import { commonStyles } from '../../styles/commonStyles';

/**
 * LoanAppFlow Component
 * Entry Point: User opens loan application
 * Step 0: Login Gate
 * Then shows 3 nudges: Eligibility, Score, and Offer
 */
const LoanAppFlow = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerCount] = useState('5');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    console.log('User logged in successfully');
  };

  if (!isLoggedIn) {
    return (
      <LoginGate
        navigation={navigation}
        onLoginSuccess={handleLoginSuccess}
        customerCount={customerCount}
      />
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Apply for Your Loan</Text>
        <Text style={commonStyles.description}>
          Choose the best option to proceed with your loan application
        </Text>
      </View>

      {/* Nudge 1: Check Eligibility */}
      <LoanEligibilityNudge navigation={navigation} />

      {/* Nudge 2: Check Score */}
      <LoanScoreNudge navigation={navigation} />

      {/* Nudge 3: Check Offer */}
      <LoanOfferNudge navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
});

export default LoanAppFlow;
