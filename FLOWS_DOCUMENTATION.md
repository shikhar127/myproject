# Loan Nudge Flows - Detailed Documentation

## Overview

This document details the exact UI copy and flow logic for all three loan nudge flows. Each flow has been designed with specific contextual messaging to maximize user engagement and conversion.

---

## 1. CALCULATOR FLOW

**Entry Point**: After user completes loan calculator

### Nudge 1: Check Eligibility

```
💰 You may qualify for up to ₹X lakh

Check your eligibility in 30 seconds
No impact on credit score

[Check Eligibility →]
```

**Action Required**: SMS permission + log-in

**File**: `src/screens/calculator/CheckEligibilityNudge.js`

---

### Nudge 2: Check Score

```
🎯 Want to know your actual credit score?

Get your CIBIL score instantly

• Free, unlimited checks
• Track improvements over time
• Alerts on new credit inquiries

[View My Score →]
```

**Action Required**: log-in + SMS permission + alerts consent

**File**: `src/screens/calculator/CheckScoreNudge.js`

---

### Nudge 3: Check Offer

```
✨ See your pre-approved loan offers

Based on your income, you have exclusive offers

• Instant approval decision
• Best rates available
• Quick salary verification

[View My Offers →]
```

**Action Required**: Log-in + salary details

**File**: `src/screens/calculator/CheckOfferNudge.js`

---

## 2. SPEND ANALYSER FLOW

**Entry Point**: User wants spending analysis

### Step 0: SMS Permission Gate

```
📊 Understand where your money goes

We'll analyze your spending patterns to help you:
• Track monthly expenses
• Identify saving opportunities
• Get personalized loan offers

📱 We need SMS access to read bank transaction messages

[Allow SMS Access →]
[Why do we need this?]
```

**Action Required**: SMS permission grant

**File**: `src/screens/spendAnalyser/SMSPermissionGate.js`

---

### Nudge 1: Check Eligibility (After Analysis)

```
💡 Based on your spending, you can afford ₹X lakh loan

┌─────────────────────────────────┐
│ Monthly obligations:     ₹Y     │
│ Potential EMI capacity:  ₹Z     │
└─────────────────────────────────┘

[Check Full Eligibility →]
```

**Action Required**: Log-in

**File**: `src/screens/spendAnalyser/SpendEligibilityNudge.js`

---

### Nudge 2: Check Score (After Analysis)

```
📈 See how your payment behavior affects your score

✓ Regular bill payments detected: X

• Get your actual CIBIL score
• Track score improvements
• Get alerts on inquiries

[View My Score →]
```

**Action Required**: Log-in + alerts consent

**File**: `src/screens/spendAnalyser/SpendScoreNudge.js`

---

### Nudge 3: Check Offer (After Analysis)

```
Based on your spending pattern, you can save ₹X/month on loan EMIs

💡 You have pre-approved offers with lower interest rates

[Check My Offers →]
```

**Action Required**: Log-in + proceed to offers

**File**: `src/screens/spendAnalyser/SpendOfferNudge.js`

---

## 3. LOAN APP FLOW

**Entry Point**: User opens loan application

### Step 0: Login Gate

```
🏦 Get your loan in 3 simple steps

✓ Trusted by X lakh+ customers

• Instant approval
• Lowest rates guaranteed
• Minimal documentation

[Log In to Continue →]
[New user? Sign up]
```

**Action Required**: Log-in/Sign-up

**File**: `src/screens/loanApp/LoginGate.js`

---

### Nudge 1: Check Eligibility (After Login)

```
💰 First, let's check what you qualify for

Quick eligibility check

• Based on your profile
• No credit score impact
• Takes 30 seconds

[Check Eligibility →]
```

**Action Required**: SMS permission + proceed

**File**: `src/screens/loanApp/LoanEligibilityNudge.js`

---

### Nudge 2: Check Score (After Login)

```
🎯 Know your credit score before applying

Understanding your score helps:

• Get better rate offers
• Know approval chances
• Track credit health

[View My Score First →]
[Skip, continue application →]
```

**Action Required**: SMS permission + alerts consent

**File**: `src/screens/loanApp/LoanScoreNudge.js`

---

### Nudge 3: Check Offer (After Login)

```
✨ See all your pre-approved offers

You might already have offers ready

• Compare rates instantly
• Choose best terms
• Faster approval

[View Pre-Approved Offers →]
[Apply fresh →]
```

**Action Required**: Salary verification + proceed

**File**: `src/screens/loanApp/LoanOfferNudge.js`

---

## Key Principles Applied

### 1. Value-First Messaging

Every nudge leads with what the user gets:
- "You may qualify for up to ₹X lakh"
- "Based on your spending, you can save ₹X/month"
- "See your pre-approved loan offers"

### 2. Reduced Friction Language

Specific, concrete language instead of vague promises:
- "30 seconds" ✅ instead of "quick" ❌
- "Instant approval" ✅ instead of "fast" ❌
- "3 simple steps" ✅ instead of "easy" ❌

### 3. Trust Signals

Build confidence at every step:
- "No credit score impact"
- "Free, unlimited checks"
- "Trusted by X lakh+ customers"
- "Lowest rates guaranteed"

### 4. Clear CTAs

Action-oriented button text with directional arrows:
- "Check Eligibility →"
- "View My Score →"
- "View My Offers →"
- "Allow SMS Access →"

### 5. Permission Rationale

Always explain why permissions are needed:
- SMS: "We need SMS access to read bank transaction messages"
- Login: Required for personalized offers and security
- Alerts: "Get alerts on new credit inquiries"

### 6. Context Adaptation

Different messaging based on entry point:

| Aspect | Calculator | Spend Analyser | Loan App |
|--------|-----------|----------------|----------|
| **Focus** | Income potential | Financial behavior | Speed & trust |
| **Tone** | Aspirational | Analytical | Urgent |
| **Data** | Loan amount | Spending patterns | Customer count |
| **Messaging** | "Based on income" | "Based on spending" | "Based on profile" |

---

## Permission Flow Matrix

| Permission Type | When Required | Purpose | User Benefit |
|-----------------|---------------|---------|--------------|
| **SMS** | Eligibility, Score, Analysis | Read transaction messages | Automated data entry |
| **Login** | All authenticated actions | User identification | Personalized offers |
| **Alerts** | Score tracking | Push notifications | Credit monitoring |
| **Salary Details** | Offer verification | Income proof | Accurate loan amounts |

---

## UX Guidelines

### Do's ✅

1. **Lead with benefits**: Always state what user gets first
2. **Be specific**: Use concrete numbers and timeframes
3. **Offer choice**: Provide skip options where appropriate
4. **Explain permissions**: Tell users why before asking
5. **Show progress**: Indicate where user is in the flow
6. **Use emojis**: Visual anchors for quick scanning
7. **Keep CTAs clear**: One primary action per screen

### Don'ts ❌

1. **Don't use jargon**: Avoid technical or financial terms
2. **Don't oversell**: Be honest about requirements
3. **Don't hide permissions**: Always show what's needed
4. **Don't force actions**: Provide skip options
5. **Don't use vague language**: "Quick" < "30 seconds"
6. **Don't overwhelm**: One key message per nudge
7. **Don't ignore context**: Adapt messaging to entry point

---

## Testing Checklist

### Calculator Flow
- [ ] Loan amount displays correctly from calculator
- [ ] All three nudges render properly
- [ ] Permission requirements shown clearly
- [ ] Navigation works for all CTAs

### Spend Analyser Flow
- [ ] SMS permission gate appears first
- [ ] Analysis data flows to nudges correctly
- [ ] Spending metrics display properly
- [ ] "Why we need this?" link works

### Loan App Flow
- [ ] Login gate appears first
- [ ] Sign up toggle works
- [ ] All nudges available after login
- [ ] Skip options function properly

---

## Conversion Optimization Notes

### High-Priority Elements

1. **Value Proposition** (First line of each nudge)
   - Must be clear, specific, and user-centric
   - Use actual numbers where possible

2. **Trust Indicators**
   - "No impact on credit score"
   - Customer count
   - Free features

3. **Time Commitment**
   - "30 seconds"
   - "Instant"
   - "3 simple steps"

### A/B Testing Opportunities

- Emoji selection (💰 vs 💵 vs 🏦)
- CTA button text ("Check" vs "View" vs "See")
- Bullet point order
- Permission explanation placement
- Skip option visibility

---

## Implementation Status

| Component | Status | File Path |
|-----------|--------|-----------|
| Calculator Flow | ✅ Complete | `src/flows/calculator/` |
| Spend Analyser Flow | ✅ Complete | `src/flows/spendAnalyser/` |
| Loan App Flow | ✅ Complete | `src/flows/loanApp/` |
| Navigation | ✅ Complete | `src/navigation/` |
| Common Styles | ✅ Complete | `src/styles/` |
| Home Screen | ✅ Complete | `src/screens/HomeScreen.js` |

---

## Future Enhancements

### Phase 2
- [ ] Add actual SMS permission handling
- [ ] Implement real authentication
- [ ] Connect to backend APIs
- [ ] Add analytics tracking

### Phase 3
- [ ] A/B testing framework
- [ ] Personalization engine
- [ ] Machine learning for offer optimization
- [ ] Advanced spending analysis

### Phase 4
- [ ] Multi-language support
- [ ] Voice assistance
- [ ] AR/VR features
- [ ] Gamification elements

---

**Last Updated**: 2025-11-11
