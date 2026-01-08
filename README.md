# 🇮🇳 India In-Hand Salary Calculator

A comprehensive web-based salary calculator for India that accurately converts CTC (Cost to Company) to in-hand/take-home salary with full support for both New and Old Tax Regimes (FY 2025-26).

## 🚀 Features

### Core Calculations
- **CTC to In-Hand Conversion**: Accurate calculation of monthly and annual take-home salary
- **Tax Regime Support**:
  - New Tax Regime (FY 2025-26) with ₹75,000 standard deduction
  - Old Tax Regime with full deduction support (80C, 80D, HRA, etc.)
- **Intelligent Tax Comparison**: Side-by-side comparison of both regimes with automatic recommendations
- **HRA Exemption Calculator**: Accurate HRA exemption calculation based on rent paid, city type, and salary structure
- **Professional Tax**: State-wise professional tax calculation for all Indian states
- **EPF Calculation**: Employee Provident Fund (12% of basic, configurable)
- **ESI Support**: Auto-detection for employees with gross salary ≤ ₹21,000/month

### Advanced Features

#### 1. **Basic Salary Calculator**
- Flexible basic salary input (percentage or absolute value)
- Variable pay/bonus configuration
- Option to include variable pay in monthly calculations
- Automatic validation (warns if basic is outside 35-60% range)

#### 2. **Advanced Mode**
- Detailed allowance configuration:
  - HRA (auto-calculate or manual)
  - LTA (Leave Travel Allowance)
  - Conveyance Allowance
  - Medical Allowance
  - Dearness Allowance (for govt/PSU)
  - Other custom allowances
- Employer contributions:
  - Employer PF (standard/capped/none)
  - Gratuity (4.81% of basic)
  - Group medical insurance
  - Employer NPS contribution
- Additional deductions:
  - Voluntary PF (VPF)
  - Loan repayments
  - Labour Welfare Fund (LWF)

#### 3. **Tax Deductions (Old Regime)**
- **Section 80C**: EPF, PPF, ELSS, Insurance (max ₹1,50,000)
- **Section 80D**: Health insurance premiums (max ₹1,00,000)
- **Section 80CCD(1B)**: Additional NPS (max ₹50,000)
- **Section 24(b)**: Home loan interest (max ₹2,00,000)
- **HRA Exemption**: Automatic calculation based on:
  - Actual HRA received
  - Rent paid minus 10% of basic
  - 50% of basic (metro) or 40% (non-metro)
- **Other Deductions**: 80E, 80G, 80TTA, etc.

#### 4. **Salary Hike Calculator**
- Calculate new CTC after percentage or absolute hike
- View new monthly in-hand salary
- See incremental take-home increase

#### 5. **Job Offer Comparison**
- Compare up to 3 different job offers
- Side-by-side comparison of CTC vs in-hand salary
- Factor in different salary structures and locations

#### 6. **Reverse Calculator**
- Input desired monthly in-hand salary
- Calculate required CTC to achieve that amount
- View complete CTC breakdown

### Visualization & Reporting

- **Interactive Charts**:
  - CTC breakdown (pie/doughnut chart)
  - Annual deductions breakdown
  - Powered by Chart.js

- **Export Options**:
  - PDF report generation
  - Share via WhatsApp/Email
  - Copy to clipboard

### User Experience

- **Dark Mode Support**: Full dark theme with persistent preference
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Calculations**: Instant results as you type
- **Helpful Tooltips**: Context-sensitive help for every field
- **No Login Required**: Use immediately without registration
- **Offline Capable**: Works without internet after initial load

## 📊 Tax Calculation Details

### New Tax Regime (FY 2025-26)

| Income Slab | Tax Rate |
|------------|----------|
| ₹0 - ₹4,00,000 | 0% |
| ₹4,00,001 - ₹8,00,000 | 5% |
| ₹8,00,001 - ₹12,00,000 | 10% |
| ₹12,00,001 - ₹16,00,000 | 15% |
| ₹16,00,001 - ₹20,00,000 | 20% |
| ₹20,00,001 - ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

- **Standard Deduction**: ₹75,000
- **Rebate u/s 87A**: ₹60,000 (if taxable income ≤ ₹12,00,000)
- **Health & Education Cess**: 4%

### Old Tax Regime

| Income Slab | Tax Rate |
|------------|----------|
| ₹0 - ₹2,50,000 | 0% |
| ₹2,50,001 - ₹5,00,000 | 5% |
| ₹5,00,001 - ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

- **Standard Deduction**: ₹50,000
- **Rebate u/s 87A**: ₹12,500 (if taxable income ≤ ₹5,00,000)
- **Deductions Available**: 80C, 80D, 80CCD(1B), 24(b), HRA exemption, etc.
- **Health & Education Cess**: 4%

### Professional Tax by State

| State | Annual PT |
|-------|-----------|
| Maharashtra | ₹2,500 |
| Karnataka | ₹2,400 |
| West Bengal | ₹2,400 |
| Tamil Nadu | ₹2,500 |
| Telangana | ₹2,400 |
| Andhra Pradesh | ₹2,400 |
| Gujarat | ₹2,400 |
| Kerala | ₹2,400 |
| Madhya Pradesh | ₹2,500 |
| Delhi, UP, Punjab, Haryana, Rajasthan | ₹0 |

## 🛠️ Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js v4.4.1
- **PDF Export**: jsPDF v2.5.1
- **No Backend Required**: 100% client-side calculation
- **No Dependencies**: Vanilla JavaScript, no frameworks

## 📁 Project Structure

```
india-salary-calculator/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS with dark mode
├── calculator.js       # Core calculation engine
└── README.md          # Documentation
```

## 🚀 Getting Started

### Option 1: Direct Usage
1. Clone or download the repository
2. Open `index.html` in any modern web browser
3. Start calculating!

### Option 2: Local Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

### Option 3: Deploy to GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Select main branch as source
4. Your calculator will be live at `https://yourusername.github.io/india-salary-calculator`

## 💡 Usage Examples

### Example 1: Basic Calculation
1. Enter Annual CTC: ₹12,00,000
2. Basic Salary: 40% (default)
3. Select your city type and state
4. Choose tax regime
5. Click "Calculate Salary"

**Result**:
- Monthly In-Hand: ~₹75,000
- Annual Take-Home: ~₹9,00,000

### Example 2: With Old Regime Deductions
1. Annual CTC: ₹15,00,000
2. Select "Old Tax Regime"
3. Enter monthly rent: ₹20,000
4. Add 80C deductions: ₹1,50,000
5. Add 80D: ₹25,000
6. Calculate

**Result**: View comparison showing which regime saves more tax

### Example 3: Compare Job Offers
1. Go to "Compare Offers" tab
2. Enter details for 2-3 job offers
3. Compare actual in-hand salaries

## 🎯 Calculation Accuracy

This calculator implements the exact formulas used by:
- Income Tax Department of India
- EPFO (Employees' Provident Fund Organisation)
- ESIC (Employees' State Insurance Corporation)
- State government professional tax rules

**Formula for In-Hand Salary**:
```
Gross Salary = CTC - Employer PF - Gratuity - Employer Insurance

Taxable Income = Gross - Standard Deduction - Exemptions - Deductions

Income Tax = Slab Calculation + 4% Cess - Rebate (if applicable)

Monthly TDS = Annual Tax / 12

In-Hand = Gross Monthly - Employee PF - Professional Tax - TDS - ESI
```

## ⚠️ Important Notes

### Assumptions
- Basic salary is typically 40-50% of CTC (configurable)
- HRA is 50% of basic for metro cities, 40% for non-metro
- Employer PF contribution: 12% of basic
- Gratuity: 4.81% of basic (payable after 5 years)
- Standard working: 12 months per year

### Limitations
- Does not include:
  - Surcharge for income above ₹50 lakhs
  - Senior citizen tax benefits
  - NRI taxation rules
  - Capital gains tax
  - Income from other sources

- Actual in-hand may vary based on:
  - Company-specific policies
  - Mid-year salary changes
  - Actual rent paid and HRA claimed
  - Investment proofs submitted

### When to Consult a Tax Professional
- Income above ₹50 lakhs (surcharge applicable)
- Multiple sources of income
- Capital gains from stocks/property
- Foreign income or assets
- Complex investment structures

## 📱 Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

## 🔐 Privacy & Security

- **100% Client-Side**: All calculations happen in your browser
- **No Data Collection**: Zero data is sent to any server
- **No Cookies**: No tracking or analytics
- **No Registration**: Use anonymously without login
- **Offline Capable**: Works without internet after first load

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Open an issue describing the problem
2. **Suggest Features**: Share ideas for new features
3. **Submit PRs**: Fix bugs or add features
4. **Update Tax Rules**: Keep tax slabs current
5. **Improve Documentation**: Enhance README or code comments

### Development Guidelines
- Keep calculations accurate and up-to-date
- Maintain responsive design
- Add comments for complex logic
- Test on multiple browsers
- Update documentation

## 📜 Changelog

### Version 1.0.0 (2026-01-08)
- ✅ Initial release
- ✅ New Tax Regime (FY 2025-26) support
- ✅ Old Tax Regime with all deductions
- ✅ HRA exemption calculator
- ✅ Professional tax for all states
- ✅ EPF and ESI calculations
- ✅ Visual charts and breakdowns
- ✅ Regime comparison
- ✅ Hike calculator
- ✅ Offer comparison (up to 3)
- ✅ Reverse calculator
- ✅ PDF export
- ✅ Dark mode
- ✅ Fully responsive design

## 📚 References

- [Income Tax Department, India](https://www.incometax.gov.in)
- [EPFO - Employees' Provident Fund](https://www.epfindia.gov.in)
- [ESIC - Employees' State Insurance](https://www.esic.in)
- [Budget 2025 - Tax Proposals](https://www.indiabudget.gov.in)

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Tax calculation formulas: Income Tax Department
- EPF rules: EPFO official guidelines
- Professional tax rates: State government portals
- Inspired by: ET Money Salary Calculator

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Open a discussion on GitHub
- **Updates**: Watch this repo for tax law changes

## ⭐ Star History

If you find this calculator useful, please give it a star on GitHub!

---

**Disclaimer**: This calculator provides approximate calculations based on standard formulas. Actual in-hand salary may vary depending on company policies, mid-year changes, and tax-saving investments. For personalized tax advice, please consult a qualified Chartered Accountant or tax professional.

**Last Updated**: January 2026 | **Tax Year**: FY 2025-26

---

Made with ❤️ for Indian professionals
