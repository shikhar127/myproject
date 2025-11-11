import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';

const HomeScreen = ({ navigation }) => {
  const flows = [
    {
      id: 'calculator',
      emoji: '🧮',
      title: 'Calculator Flow',
      description: 'After using loan calculator',
      nudges: ['Check Eligibility', 'Check Score', 'Check Offer'],
      route: 'CalculatorFlow',
      color: '#4A90E2',
    },
    {
      id: 'spendAnalyser',
      emoji: '📊',
      title: 'Spend Analyser Flow',
      description: 'Spending pattern analysis',
      nudges: ['SMS Permission Gate', 'Eligibility', 'Score', 'Offer'],
      route: 'SpendAnalyserFlow',
      color: '#7ED321',
    },
    {
      id: 'loanApp',
      emoji: '🏦',
      title: 'Loan App Flow',
      description: 'Direct loan application',
      nudges: ['Login Gate', 'Eligibility', 'Score', 'Offer'],
      route: 'LoanAppFlow',
      color: '#FF9800',
    },
  ];

  const handleFlowPress = (route) => {
    navigation.navigate(route);
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Loan Nudge Flows</Text>
        <Text style={commonStyles.description}>
          Select a flow to explore the nudge screens
        </Text>
      </View>

      {flows.map((flow) => (
        <TouchableOpacity
          key={flow.id}
          style={[styles.flowCard, { borderLeftColor: flow.color }]}
          onPress={() => handleFlowPress(flow.route)}
        >
          <Text style={styles.emoji}>{flow.emoji}</Text>
          <View style={styles.flowContent}>
            <Text style={styles.flowTitle}>{flow.title}</Text>
            <Text style={styles.flowDescription}>{flow.description}</Text>
            <View style={styles.nudgesContainer}>
              {flow.nudges.map((nudge, index) => (
                <View key={index} style={styles.nudgeBadge}>
                  <Text style={styles.nudgeBadgeText}>{nudge}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ About This Demo</Text>
        <Text style={styles.infoText}>
          This demo showcases three different entry points for loan nudge flows:
        </Text>
        <Text style={styles.infoBullet}>• Calculator - Income-focused messaging</Text>
        <Text style={styles.infoBullet}>• Spend Analyser - Spending behavior-focused</Text>
        <Text style={styles.infoBullet}>• Loan App - Application urgency-focused</Text>
        <Text style={[styles.infoText, { marginTop: 12 }]}>
          Each flow has 3 nudges: Eligibility, Score, and Offer checks.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  flowCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  emoji: {
    fontSize: 36,
    marginRight: 16,
  },
  flowContent: {
    flex: 1,
  },
  flowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  flowDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  nudgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  nudgeBadge: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nudgeBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    color: colors.primary,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 20,
    marginLeft: 8,
  },
});

export default HomeScreen;
