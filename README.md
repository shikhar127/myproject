# Loan Nudge Flows

A comprehensive React Native application demonstrating three distinct loan nudge flows with contextual messaging and user engagement strategies.

## 📋 Overview

This application showcases three different entry points for loan nudge flows, each with tailored messaging based on the user's context:

1. **Calculator Flow** - Income-focused messaging after loan calculator usage
2. **Spend Analyser Flow** - Spending behavior-focused messaging with SMS analysis
3. **Loan App Flow** - Application urgency-focused messaging for direct loan applications

## 🎯 Key Features

Each flow includes **3 core nudges**:
- ✅ **Check Eligibility** - Quick eligibility assessment
- 📊 **Check Credit Score** - CIBIL score viewing with tracking
- 💰 **Check Pre-Approved Offers** - View personalized loan offers

### Flow-Specific Features

#### Calculator Flow
- Entry point: User completes loan calculator
- 3 nudges immediately available
- Income-based loan amount suggestions
- No permission gates

#### Spend Analyser Flow
- Entry point: User wants spending analysis
- **SMS Permission Gate** before analysis
- 3 nudges after analysis completion
- Spending pattern-based recommendations
- EMI capacity calculations

#### Loan App Flow
- Entry point: User opens loan application
- **Login/Sign-up Gate** before access
- 3 nudges after authentication
- Application-focused messaging
- Skip options for score and offer checks

## 📁 Project Structure

```
myproject/
├── App.js                          # Main app component
├── index.js                        # App entry point
├── package.json                    # Dependencies
├── src/
│   ├── flows/                      # Main flow components
│   │   ├── calculator/
│   │   │   └── CalculatorFlow.js
│   │   ├── spendAnalyser/
│   │   │   └── SpendAnalyserFlow.js
│   │   └── loanApp/
│   │       └── LoanAppFlow.js
│   ├── screens/                    # Individual screen components
│   │   ├── calculator/
│   │   │   ├── CheckEligibilityNudge.js
│   │   │   ├── CheckScoreNudge.js
│   │   │   └── CheckOfferNudge.js
│   │   ├── spendAnalyser/
│   │   │   ├── SMSPermissionGate.js
│   │   │   ├── SpendEligibilityNudge.js
│   │   │   ├── SpendScoreNudge.js
│   │   │   └── SpendOfferNudge.js
│   │   ├── loanApp/
│   │   │   ├── LoginGate.js
│   │   │   ├── LoanEligibilityNudge.js
│   │   │   ├── LoanScoreNudge.js
│   │   │   └── LoanOfferNudge.js
│   │   └── HomeScreen.js
│   ├── navigation/
│   │   └── AppNavigator.js        # Navigation setup
│   ├── styles/
│   │   └── commonStyles.js        # Shared styles
│   ├── components/                # Reusable components
│   └── utils/                     # Utility functions
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native development environment
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and SDK

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myproject
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

### Running the App

#### iOS
```bash
npm run ios
# or
yarn ios
```

#### Android
```bash
npm run android
# or
yarn android
```

#### Start Metro Bundler
```bash
npm start
# or
yarn start
```

## 🎨 Design Principles

### Value-First Messaging
Every nudge starts with the value proposition:
- "You may qualify for up to ₹X lakh"
- "Based on your spending, you can save ₹X/month"
- "See your pre-approved loan offers"

### Reduced Friction Language
- "30 seconds" instead of "quick"
- "Instant approval" instead of "fast"
- Clear time commitments

### Trust Signals
- "No credit score impact"
- "Free, unlimited checks"
- "Trusted by X lakh+ customers"
- "Lowest rates guaranteed"

### Clear CTAs
All buttons use action-oriented text with arrows:
- "Check Eligibility →"
- "View My Score →"
- "View My Offers →"

### Permission Rationale
Every permission request explains the "why":
- SMS: "We need SMS access to read bank transaction messages"
- Login: "Get your loan in 3 simple steps"
- Alerts: "Get alerts on new credit inquiries"

## 📱 Screen Flow Details

### Calculator Flow

#### Nudge 1: Check Eligibility
```
💰 You may qualify for up to ₹X lakh

Check your eligibility in 30 seconds
No impact on credit score

[Check Eligibility →]

Requirements: SMS permission + log-in
```

#### Nudge 2: Check Score
```
🎯 Want to know your actual credit score?

Get your CIBIL score instantly
• Free, unlimited checks
• Track improvements over time
• Alerts on new credit inquiries

[View My Score →]

Requirements: log-in + SMS permission + alerts consent
```

#### Nudge 3: Check Offer
```
✨ See your pre-approved loan offers

Based on your income, you have exclusive offers

• Instant approval decision
• Best rates available
• Quick salary verification

[View My Offers →]

Requirements: Log-in + salary details
```

### Spend Analyser Flow

#### Step 0: SMS Permission Gate
```
📊 Understand where your money goes

We'll analyze your spending patterns to help you:
• Track monthly expenses
• Identify saving opportunities
• Get personalized loan offers

📱 We need SMS access to read bank transaction messages

[Allow SMS Access →]
[Why do we need this?]

Requirements: SMS permission grant
```

#### After Analysis: 3 Nudges
All nudges contextualized to spending patterns with specific metrics:
- Monthly obligations: ₹X
- EMI capacity: ₹Y
- Regular payments detected: N
- Potential savings: ₹Z/month

### Loan App Flow

#### Step 0: Login Gate
```
🏦 Get your loan in 3 simple steps

✓ Trusted by X lakh+ customers
• Instant approval
• Lowest rates guaranteed
• Minimal documentation

[Log In to Continue →]
[New user? Sign up]

Requirements: Log-in/Sign-up
```

#### After Login: 3 Nudges
All nudges include skip options for user flexibility:
- "Skip, continue application →"
- "Apply fresh →"

## 🎯 Context Adaptation

### Messaging Strategy

| Flow | Focus | Tone | Data Points |
|------|-------|------|-------------|
| **Calculator** | Income potential | Aspirational | Loan amount, Income |
| **Spend Analyser** | Financial health | Analytical | Spending, Obligations, Savings |
| **Loan App** | Speed & trust | Urgent | Customer count, Features |

### Permission Requests

| Permission | Calculator | Spend Analyser | Loan App |
|------------|-----------|----------------|----------|
| **SMS** | Eligibility & Score | Entry gate | Score nudge |
| **Login** | All nudges | Nudges | Entry gate |
| **Alerts** | Score | Score | Score |
| **Salary** | Offer | - | Offer |

## 🛠️ Technologies Used

- **React Native** - Mobile app framework
- **React Navigation** - Navigation library
- **React Native Gesture Handler** - Touch handling
- **React Native Permissions** - Permission management
- **React Native Safe Area Context** - Safe area handling

## 📊 Component Architecture

### Reusable Components
All nudge screens follow a consistent pattern:
1. Emoji header
2. Value proposition
3. Supporting details/bullets
4. Primary CTA button
5. Permission requirements notice

### Common Styles
Centralized styling system with:
- Color palette
- Typography scale
- Component styles (cards, buttons, badges)
- Layout utilities

## 🔄 State Management

Each flow manages its own state:
- **Calculator**: Loan amount, Income
- **Spend Analyser**: SMS permission, Analysis data
- **Loan App**: Login status

## 📈 Future Enhancements

- [ ] Add actual permission handling with react-native-permissions
- [ ] Implement real SMS analysis
- [ ] Add authentication flow
- [ ] Connect to backend APIs
- [ ] Add analytics tracking
- [ ] Implement A/B testing framework
- [ ] Add unit and integration tests
- [ ] Add accessibility features
- [ ] Implement error handling
- [ ] Add loading states and animations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Built with ❤️ for better loan application experiences.

## 📞 Support

For support, please open an issue in the repository.

---

**Note**: This is a demonstration project showcasing UI/UX patterns for loan nudge flows. Production implementation would require:
- Backend API integration
- Security hardening
- Regulatory compliance (KYC, data privacy)
- Production-grade error handling
- Performance optimization
- Comprehensive testing
