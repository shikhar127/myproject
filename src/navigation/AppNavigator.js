import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import flows
import CalculatorFlow from '../flows/calculator/CalculatorFlow';
import SpendAnalyserFlow from '../flows/spendAnalyser/SpendAnalyserFlow';
import LoanAppFlow from '../flows/loanApp/LoanAppFlow';

// Import placeholder screens for navigation targets
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Loan Nudge Flows Demo' }}
        />
        <Stack.Screen
          name="CalculatorFlow"
          component={CalculatorFlow}
          options={{ title: 'Calculator Results' }}
        />
        <Stack.Screen
          name="SpendAnalyserFlow"
          component={SpendAnalyserFlow}
          options={{ title: 'Spend Analyser' }}
        />
        <Stack.Screen
          name="LoanAppFlow"
          component={LoanAppFlow}
          options={{ title: 'Loan Application' }}
        />
        {/* Placeholder screens for navigation targets */}
        <Stack.Screen
          name="RequestPermissions"
          component={PlaceholderScreen}
          options={{ title: 'Request Permissions' }}
        />
        <Stack.Screen
          name="EligibilityCheck"
          component={PlaceholderScreen}
          options={{ title: 'Eligibility Check' }}
        />
        <Stack.Screen
          name="ScoreView"
          component={PlaceholderScreen}
          options={{ title: 'Credit Score' }}
        />
        <Stack.Screen
          name="PreApprovedOffers"
          component={PlaceholderScreen}
          options={{ title: 'Pre-Approved Offers' }}
        />
        <Stack.Screen
          name="LoanApplicationForm"
          component={PlaceholderScreen}
          options={{ title: 'Loan Application Form' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Placeholder screen component
const PlaceholderScreen = ({ route }) => {
  const { View, Text, StyleSheet } = require('react-native');
  const { commonStyles } = require('../styles/commonStyles');

  return (
    <View style={[commonStyles.container, styles.center]}>
      <Text style={commonStyles.title}>Coming Soon</Text>
      <Text style={commonStyles.description}>
        This screen would handle: {route.name}
      </Text>
      {route.params && (
        <Text style={styles.params}>
          Params: {JSON.stringify(route.params, null, 2)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  params: {
    marginTop: 20,
    fontSize: 12,
    color: '#666',
  },
});

export default AppNavigator;
