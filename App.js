/**
 * Loan Nudge Flows Application
 *
 * This app demonstrates three different entry points for loan nudge flows:
 * 1. Calculator Flow - Shows nudges after loan calculator usage
 * 2. Spend Analyser Flow - Shows nudges after spending analysis
 * 3. Loan App Flow - Shows nudges during direct loan application
 *
 * Each flow has 3 nudges:
 * - Check Eligibility
 * - Check Credit Score
 * - Check Pre-Approved Offers
 */

import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <AppNavigator />
    </>
  );
};

export default App;
