// ===== Global Variables =====
let ctcBreakdownChart = null;
let deductionsChart = null;

// Holds settings applied from Advanced Mode tab
let advancedSettings = {
    applied: false,
    hraType: 'auto',
    hraManual: 0,
    lta: 0,
    conveyance: 0,
    medicalAllowance: 0,
    daPercent: 0,
    otherAllowances: 0,
    employerPFType: 'standard',
    includeGratuity: true,
    employerInsurance: 0,
    employerNPSPercent: 0,
    employeePFType: 'full',
    vpfPercent: 0,
    loanRepayment: 0,
    lwf: 0,
    otherDeductionsAdv: 0
};

// ===== Professional Tax Data =====
const professionalTax = {
    'maharashtra':     { monthly: 200, total: 2500 },
    'karnataka':       { monthly: 200, total: 2400 },
    'west-bengal':     { monthly: 200, total: 2400 },
    'tamil-nadu':      { monthly: 208, total: 2500 },
    'telangana':       { monthly: 200, total: 2400 },
    'andhra-pradesh':  { monthly: 200, total: 2400 },
    'gujarat':         { monthly: 200, total: 2400 },
    'kerala':          { monthly: 200, total: 2400 },
    'madhya-pradesh':  { monthly: 208, total: 2500 },
    'delhi':           { monthly: 0,   total: 0 },
    'uttar-pradesh':   { monthly: 0,   total: 0 },
    'punjab':          { monthly: 0,   total: 0 },
    'haryana':         { monthly: 0,   total: 0 },
    'rajasthan':       { monthly: 0,   total: 0 },
    'other':           { monthly: 0,   total: 0 }
};

// ===== New Tax Regime Slabs (FY 2025-26) =====
const newTaxSlabs = [
    { min: 0,        max: 400000,  rate: 0    },
    { min: 400000,   max: 800000,  rate: 0.05 },
    { min: 800000,   max: 1200000, rate: 0.10 },
    { min: 1200000,  max: 1600000, rate: 0.15 },
    { min: 1600000,  max: 2000000, rate: 0.20 },
    { min: 2000000,  max: 2400000, rate: 0.25 },
    { min: 2400000,  max: Infinity,rate: 0.30 }
];

// ===== Old Tax Regime Slabs =====
const oldTaxSlabs = [
    { min: 0,       max: 250000,  rate: 0    },
    { min: 250000,  max: 500000,  rate: 0.05 },
    { min: 500000,  max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity,rate: 0.30 }
];

// ===== Utility Functions =====
function formatCurrency(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
}

function parseNumber(value) {
    return parseFloat(value) || 0;
}

// ===== Tax Calculation Functions =====
function calculateTaxBySlabs(taxableIncome, slabs) {
    let tax = 0;
    for (const slab of slabs) {
        if (taxableIncome > slab.min) {
            const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
            tax += taxableInSlab * slab.rate;
        }
    }
    return tax;
}

function calculateNewRegimeTax(grossSalary) {
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, grossSalary - standardDeduction);
    let tax = calculateTaxBySlabs(taxableIncome, newTaxSlabs);

    // Rebate u/s 87A (FY 2025-26): zero tax for taxable income <= ₹12L
    if (taxableIncome <= 1200000) {
        tax = 0;
    } else {
        // Marginal relief: tax increase above ₹12L cannot exceed the income increase above ₹12L
        const excessIncome = taxableIncome - 1200000;
        if (tax > excessIncome) {
            tax = excessIncome;
        }
    }

    // Add 4% cess
    tax = tax * 1.04;

    return { tax, taxableIncome };
}

function calculateOldRegimeTax(grossSalary, deductions) {
    const standardDeduction = 50000;
    const totalDeductions = standardDeduction + deductions.total;
    const taxableIncome = Math.max(0, grossSalary - totalDeductions);
    let tax = calculateTaxBySlabs(taxableIncome, oldTaxSlabs);

    // Rebate u/s 87A: zero tax for taxable income <= ₹5L
    if (taxableIncome <= 500000) {
        tax = 0;
    }

    // Add 4% cess
    tax = tax * 1.04;

    return { tax, taxableIncome };
}

// ===== HRA Exemption Calculator =====
function calculateHRAExemption(annualBasic, annualDA, annualHRAReceived, annualRent, isMetro) {
    const basicPlusDA = annualBasic + annualDA;
    const rentMinus10Percent = Math.max(0, annualRent - 0.10 * basicPlusDA);
    const percentageOfBasic = (isMetro ? 0.50 : 0.40) * basicPlusDA;
    return Math.max(0, Math.min(annualHRAReceived, rentMinus10Percent, percentageOfBasic));
}

// ===== EPF Calculation =====
function calculateEPF(monthlyBasic, pfType) {
    if (pfType === 'capped') {
        return Math.min(monthlyBasic, 15000) * 0.12;
    }
    return monthlyBasic * 0.12;
}

// ===== ESI Calculation =====
function calculateESI(grossMonthly) {
    if (grossMonthly <= 21000) {
        return { applicable: true, employee: grossMonthly * 0.0075, employer: grossMonthly * 0.0325 };
    }
    return { applicable: false, employee: 0, employer: 0 };
}

// ===== Advanced Settings Helpers =====
function readAdvancedSettingsFromDOM() {
    return {
        applied: true,
        hraType: document.querySelector('input[name="hraType"]:checked').value,
        hraManual: parseNumber(document.getElementById('hraManual').value),
        lta: parseNumber(document.getElementById('lta').value),
        conveyance: parseNumber(document.getElementById('conveyance').value) * 12,
        medicalAllowance: parseNumber(document.getElementById('medicalAllowance').value) * 12,
        daPercent: parseNumber(document.getElementById('daAllowance').value),
        otherAllowances: parseNumber(document.getElementById('otherAllowances').value),
        employerPFType: document.querySelector('input[name="employerPFType"]:checked').value,
        includeGratuity: document.getElementById('includeGratuity').checked,
        employerInsurance: parseNumber(document.getElementById('employerInsurance').value),
        employerNPSPercent: parseNumber(document.getElementById('employerNPS').value),
        employeePFType: document.querySelector('input[name="employeePFType"]:checked').value,
        vpfPercent: parseNumber(document.getElementById('vpf').value),
        loanRepayment: parseNumber(document.getElementById('loanRepayment').value) * 12,
        lwf: parseNumber(document.getElementById('lwf').value),
        otherDeductionsAdv: parseNumber(document.getElementById('otherDeductionsAdv').value) * 12
    };
}

function resetAdvancedSettingsToDefaults() {
    advancedSettings = {
        applied: false,
        hraType: 'auto',
        hraManual: 0,
        lta: 0,
        conveyance: 0,
        medicalAllowance: 0,
        daPercent: 0,
        otherAllowances: 0,
        employerPFType: 'standard',
        includeGratuity: true,
        employerInsurance: 0,
        employerNPSPercent: 0,
        employeePFType: 'full',
        vpfPercent: 0,
        loanRepayment: 0,
        lwf: 0,
        otherDeductionsAdv: 0
    };

    // Also reset form fields
    document.querySelector('input[name="hraType"][value="auto"]').checked = true;
    document.getElementById('hraManual').value = '0';
    document.getElementById('hraManual').style.display = 'none';
    document.getElementById('lta').value = '0';
    document.getElementById('conveyance').value = '0';
    document.getElementById('medicalAllowance').value = '0';
    document.getElementById('daAllowance').value = '0';
    document.getElementById('otherAllowances').value = '0';
    document.querySelector('input[name="employerPFType"][value="standard"]').checked = true;
    document.getElementById('includeGratuity').checked = true;
    document.getElementById('employerInsurance').value = '0';
    document.getElementById('employerNPS').value = '0';
    document.querySelector('input[name="employeePFType"][value="full"]').checked = true;
    document.getElementById('vpf').value = '0';
    document.getElementById('loanRepayment').value = '0';
    document.getElementById('lwf').value = '0';
    document.getElementById('otherDeductionsAdv').value = '0';
}

// ===== Main Salary Calculation =====
function calculateSalary() {
    const annualCTC = parseNumber(document.getElementById('annualCTC').value);
    const variablePay = parseNumber(document.getElementById('variablePay').value);
    const includeVariableMonthly = document.getElementById('includeVariableMonthly').checked;
    const cityType = document.getElementById('cityType').value;
    const state = document.getElementById('state').value;
    const taxRegime = document.querySelector('input[name="taxRegime"]:checked').value;
    const isMetro = cityType === 'metro';

    // --- Basic salary ---
    const basicType = document.querySelector('input[name="basicType"]:checked').value;
    let annualBasic;
    if (basicType === 'percentage') {
        annualBasic = annualCTC * parseNumber(document.getElementById('basicPercentage').value) / 100;
    } else {
        annualBasic = parseNumber(document.getElementById('basicAbsolute').value);
    }
    const monthlyBasic = annualBasic / 12;

    // Validate basic %
    const basicPct = (annualBasic / annualCTC) * 100;
    document.getElementById('basicWarning').style.display =
        (basicPct < 35 || basicPct > 60) ? 'block' : 'none';

    // --- Dearness Allowance ---
    const annualDA = annualBasic * (advancedSettings.daPercent / 100);

    // --- Employer PF ---
    let employerPF;
    const epfType = advancedSettings.applied ? advancedSettings.employerPFType : 'standard';
    if (epfType === 'none') {
        employerPF = 0;
    } else if (epfType === 'capped') {
        employerPF = Math.min(monthlyBasic, 15000) * 0.12 * 12;
    } else {
        employerPF = monthlyBasic * 0.12 * 12;
    }

    // --- Gratuity ---
    const includeGratuity = advancedSettings.applied ? advancedSettings.includeGratuity : true;
    const gratuity = includeGratuity ? annualBasic * 0.0481 : 0;

    // --- Employer Insurance & NPS ---
    const employerInsurance = advancedSettings.applied ? advancedSettings.employerInsurance : 0;
    const employerNPS = advancedSettings.applied
        ? annualBasic * (advancedSettings.employerNPSPercent / 100)
        : 0;

    // --- Gross Salary (CTC minus all employer contributions) ---
    const annualGross = annualCTC - employerPF - gratuity - employerInsurance - employerNPS;

    // --- HRA ---
    let annualHRA;
    if (advancedSettings.applied && advancedSettings.hraType === 'manual') {
        annualHRA = advancedSettings.hraManual;
    } else {
        annualHRA = annualBasic * (isMetro ? 0.50 : 0.40);
    }

    // --- Named allowances from Advanced Mode ---
    const annualLTA           = advancedSettings.applied ? advancedSettings.lta : 0;
    const annualConveyance    = advancedSettings.applied ? advancedSettings.conveyance : 0;
    const annualMedical       = advancedSettings.applied ? advancedSettings.medicalAllowance : 0;
    const annualOtherAllow    = advancedSettings.applied ? advancedSettings.otherAllowances : 0;

    // --- Special Allowance (balancing figure) ---
    const namedAllowances = annualBasic + annualHRA + annualDA + annualLTA +
        annualConveyance + annualMedical + annualOtherAllow + variablePay;
    const annualSpecial = Math.max(0, annualGross - namedAllowances);

    // --- Monthly Gross ---
    const monthlyVariable = includeVariableMonthly ? variablePay / 12 : 0;
    const grossMonthly = (annualGross - variablePay) / 12 + monthlyVariable;

    // --- Employee PF ---
    const pfType = advancedSettings.applied ? advancedSettings.employeePFType : 'full';
    const monthlyEmployeePF = epfType === 'none' ? 0 : calculateEPF(monthlyBasic, pfType);
    const annualEmployeePF  = monthlyEmployeePF * 12;

    // --- VPF ---
    const monthlyVPF = advancedSettings.applied
        ? monthlyBasic * (advancedSettings.vpfPercent / 100)
        : 0;

    // --- Professional Tax ---
    const ptData = professionalTax[state] || professionalTax['other'];
    const monthlyPT = ptData.monthly;
    const annualPT  = ptData.total;

    // --- ESI ---
    const esiData  = calculateESI(grossMonthly);
    const monthlyESI = esiData.employee;

    document.getElementById('monthlyESIRow').style.display =
        esiData.applicable ? 'flex' : 'none';

    // --- Additional deductions from Advanced Mode ---
    const monthlyLoanRepayment = advancedSettings.applied ? advancedSettings.loanRepayment / 12 : 0;
    const monthlyLWF           = advancedSettings.applied ? advancedSettings.lwf / 12 : 0;
    const monthlyOtherDedAdv   = advancedSettings.applied ? advancedSettings.otherDeductionsAdv / 12 : 0;

    // --- Tax Calculation ---
    let annualTax, taxableIncome, monthlyTax;

    if (taxRegime === 'new') {
        const r = calculateNewRegimeTax(annualGross);
        annualTax = r.tax;  taxableIncome = r.taxableIncome;
    } else {
        const monthlyRent = parseNumber(document.getElementById('monthlyRent').value);
        const hraExemption = calculateHRAExemption(
            annualBasic, annualDA, annualHRA, monthlyRent * 12, isMetro
        );
        const section80C   = parseNumber(document.getElementById('section80C').value);
        const section80D   = parseNumber(document.getElementById('section80D').value);
        const section80CCD = parseNumber(document.getElementById('section80CCD1B').value);
        const homeLoan     = parseNumber(document.getElementById('homeLoanInterest').value);
        const otherDed     = parseNumber(document.getElementById('otherDeductions').value);

        const total80C = Math.min(section80C + annualEmployeePF, 150000);

        const deductions = {
            total: hraExemption +
                Math.min(total80C, 150000) +
                Math.min(section80D, 100000) +
                Math.min(section80CCD, 50000) +
                Math.min(homeLoan, 200000) +
                otherDed
        };

        const r = calculateOldRegimeTax(annualGross, deductions);
        annualTax = r.tax;  taxableIncome = r.taxableIncome;
    }
    monthlyTax = annualTax / 12;

    // --- Comparison regime (always calculate both) ---
    const newRegimeResult = calculateNewRegimeTax(annualGross);

    let oldRegimeResult;
    if (taxRegime === 'old') {
        oldRegimeResult = { tax: annualTax, taxableIncome };
    } else {
        const monthlyRent = parseNumber(document.getElementById('monthlyRent').value);
        const hraExemption = calculateHRAExemption(
            annualBasic, annualDA, annualHRA, monthlyRent * 12, isMetro
        );
        const d = { total: hraExemption + Math.min(annualEmployeePF, 150000) };
        oldRegimeResult = calculateOldRegimeTax(annualGross, d);
    }

    // --- Total deductions & In-Hand ---
    const totalMonthlyDeductions = monthlyEmployeePF + monthlyVPF + monthlyPT + monthlyTax +
        monthlyESI + monthlyLoanRepayment + monthlyLWF + monthlyOtherDedAdv;

    const monthlyInHand  = grossMonthly - totalMonthlyDeductions;
    const annualTakeHome = (monthlyInHand * 12) + (includeVariableMonthly ? 0 : variablePay);

    // --- Display ---
    displayResults({
        monthlyInHand, annualTakeHome,
        monthlyBasic, monthlyHRA: annualHRA / 12,
        monthlySpecial: annualSpecial / 12, monthlyVariable,
        grossMonthly, monthlyEmployeePF, monthlyVPF,
        monthlyPT, monthlyTax, monthlyESI,
        totalMonthlyDeductions,
        annualCTC, annualBasic, annualHRA, annualSpecial, variablePay,
        employerPF, gratuity, annualEmployeePF, annualPT, annualTax,
        newRegimeResult, oldRegimeResult, annualGross
    });

    updateCharts({
        annualBasic, annualHRA, annualSpecial, variablePay,
        employerPF, gratuity, annualEmployeePF, annualPT, annualTax
    });
}

// ===== Display Results =====
function displayResults(data) {
    document.getElementById('monthlyInHand').textContent  = formatCurrency(data.monthlyInHand);
    document.getElementById('annualTakeHome').textContent = formatCurrency(data.annualTakeHome);

    // Monthly earnings
    document.getElementById('monthlyBasic').textContent   = formatCurrency(data.monthlyBasic);
    document.getElementById('monthlyHRA').textContent     = formatCurrency(data.monthlyHRA);
    document.getElementById('monthlySpecial').textContent = formatCurrency(data.monthlySpecial);
    document.getElementById('monthlyVariable').textContent= formatCurrency(data.monthlyVariable);
    document.getElementById('grossMonthly').textContent   = formatCurrency(data.grossMonthly);

    document.getElementById('monthlyVariableRow').style.display =
        data.monthlyVariable > 0 ? 'flex' : 'none';

    // Monthly deductions
    document.getElementById('monthlyPF').textContent    = formatCurrency(data.monthlyEmployeePF);
    document.getElementById('monthlyPT').textContent    = formatCurrency(data.monthlyPT);
    document.getElementById('monthlyTax').textContent   = formatCurrency(data.monthlyTax);
    document.getElementById('monthlyESI').textContent   = formatCurrency(data.monthlyESI);
    document.getElementById('totalMonthlyDeductions').textContent = formatCurrency(data.totalMonthlyDeductions);

    // Annual breakdown
    document.getElementById('annualCTCDisplay').textContent  = formatCurrency(data.annualCTC);
    document.getElementById('annualBasic').textContent        = formatCurrency(data.annualBasic);
    document.getElementById('annualHRA').textContent          = formatCurrency(data.annualHRA);
    document.getElementById('annualSpecial').textContent      = formatCurrency(data.annualSpecial);
    document.getElementById('annualVariablePay').textContent  = formatCurrency(data.variablePay);
    document.getElementById('annualEmployerPF').textContent   = formatCurrency(data.employerPF);
    document.getElementById('annualGratuity').textContent     = formatCurrency(data.gratuity);
    document.getElementById('annualPF').textContent           = formatCurrency(data.annualEmployeePF);
    document.getElementById('annualPT').textContent           = formatCurrency(data.annualPT);
    document.getElementById('annualTax').textContent          = formatCurrency(data.annualTax);

    const totalAnnualDed = data.annualEmployeePF + data.annualPT + data.annualTax;
    document.getElementById('totalAnnualDeductions').textContent = formatCurrency(totalAnnualDed);
    document.getElementById('annualTakeHomeDisplay').textContent = formatCurrency(data.annualTakeHome);

    // Regime comparison
    const newTakeHome = data.annualGross - data.annualEmployeePF - data.annualPT - data.newRegimeResult.tax;
    const oldTakeHome = data.annualGross - data.annualEmployeePF - data.annualPT - data.oldRegimeResult.tax;

    document.getElementById('newTaxableIncome').textContent = formatCurrency(data.newRegimeResult.taxableIncome);
    document.getElementById('newTaxAmount').textContent     = formatCurrency(data.newRegimeResult.tax);
    document.getElementById('newTakeHome').textContent      = formatCurrency(newTakeHome);
    document.getElementById('oldTaxableIncome').textContent = formatCurrency(data.oldRegimeResult.taxableIncome);
    document.getElementById('oldTaxAmount').textContent     = formatCurrency(data.oldRegimeResult.tax);
    document.getElementById('oldTakeHome').textContent      = formatCurrency(oldTakeHome);

    const rec = document.getElementById('regimeRecommendation');
    const savings = Math.abs(newTakeHome - oldTakeHome);
    if (newTakeHome > oldTakeHome) {
        rec.innerHTML = `<strong>✓ Recommendation: New Tax Regime</strong><br>Saves ${formatCurrency(savings)} annually vs Old Regime.`;
        rec.className = 'recommendation';
    } else if (oldTakeHome > newTakeHome) {
        rec.innerHTML = `<strong>✓ Recommendation: Old Tax Regime</strong><br>Saves ${formatCurrency(savings)} annually vs New Regime.`;
        rec.className = 'recommendation';
    } else {
        rec.innerHTML = `<strong>Both regimes give the same take-home.</strong><br>Choose based on your investment preferences.`;
        rec.className = 'recommendation';
    }
}

// ===== Update Charts =====
function updateCharts(data) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const titleColor = isDark ? '#f1f5f9' : '#0f172a';

    // CTC Breakdown
    const ctcCtx = document.getElementById('ctcBreakdownChart').getContext('2d');
    if (ctcBreakdownChart) ctcBreakdownChart.destroy();

    ctcBreakdownChart = new Chart(ctcCtx, {
        type: 'doughnut',
        data: {
            labels: ['Basic', 'HRA', 'Special Allowance', 'Variable Pay', 'Employer PF', 'Gratuity'],
            datasets: [{
                data: [data.annualBasic, data.annualHRA, data.annualSpecial,
                       data.variablePay, data.employerPF, data.gratuity],
                backgroundColor: ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: { display: true, text: 'CTC Breakdown', color: titleColor, font: { size: 15 } },
                legend: { position: 'bottom', labels: { color: titleColor } },
                tooltip: { callbacks: { label: ctx => ctx.label + ': ' + formatCurrency(ctx.parsed) } }
            }
        }
    });

    // Deductions Breakdown
    const dedCtx = document.getElementById('deductionsChart').getContext('2d');
    if (deductionsChart) deductionsChart.destroy();

    deductionsChart = new Chart(dedCtx, {
        type: 'pie',
        data: {
            labels: ['Employee PF', 'Professional Tax', 'Income Tax'],
            datasets: [{
                data: [data.annualEmployeePF, data.annualPT, data.annualTax],
                backgroundColor: ['#ef4444','#f97316','#eab308']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: { display: true, text: 'Annual Deductions', color: titleColor, font: { size: 15 } },
                legend: { position: 'bottom', labels: { color: titleColor } },
                tooltip: { callbacks: { label: ctx => ctx.label + ': ' + formatCurrency(ctx.parsed) } }
            }
        }
    });
}

// ===== Hike Calculator (uses proper tax calc) =====
function calculateInHandForCTC(ctc, basicPercent, city) {
    const basic    = ctc * basicPercent / 100;
    const isMetro  = city === 'metro';
    const hra      = basic * (isMetro ? 0.50 : 0.40);
    const emplPF   = basic / 12 * 0.12 * 12;
    const gratuity = basic * 0.0481;
    const gross    = ctc - emplPF - gratuity;
    const empPF    = basic / 12 * 0.12 * 12;
    const pt       = 2400; // avg across states
    const { tax }  = calculateNewRegimeTax(gross);
    return (gross - empPF - pt - tax) / 12;
}

function calculateHike() {
    const currentCTC     = parseNumber(document.getElementById('currentCTC').value);
    const hikePercentage = parseNumber(document.getElementById('hikePercentage').value);
    const hikeAbsolute   = parseNumber(document.getElementById('hikeAbsolute').value);

    const newCTC = hikeAbsolute > 0
        ? currentCTC + hikeAbsolute
        : currentCTC * (1 + hikePercentage / 100);

    const basicPct = parseNumber(document.getElementById('basicPercentage').value) || 40;
    const city     = document.getElementById('cityType').value;

    const currentInHand   = calculateInHandForCTC(currentCTC, basicPct, city);
    const newInHand        = calculateInHandForCTC(newCTC, basicPct, city);
    const incrementalInHand= newInHand - currentInHand;

    document.getElementById('currentInHand').value = Math.round(currentInHand);
    document.getElementById('newCTC').textContent          = formatCurrency(newCTC);
    document.getElementById('newInHand').textContent        = formatCurrency(newInHand);
    document.getElementById('incrementalInHand').textContent= formatCurrency(incrementalInHand);
}

// ===== Compare Offers (uses proper tax calc) =====
function compareOffers() {
    const offers = [];

    for (let i = 1; i <= 3; i++) {
        const ctc = parseNumber(document.getElementById(`offer${i}CTC`).value);
        if (ctc <= 0) continue;

        const company    = document.getElementById(`company${i}`).value || `Offer ${i}`;
        const basicPct   = parseNumber(document.getElementById(`offer${i}Basic`).value) || 40;
        const variable   = parseNumber(document.getElementById(`offer${i}Variable`).value);
        const city       = document.getElementById(`offer${i}City`).value;
        const inHand     = calculateInHandForCTC(ctc - variable, basicPct, city);

        offers.push({ company, ctc, inHand: Math.round(inHand) });
        document.getElementById(`offer${i}InHand`).textContent = formatCurrency(inHand);
    }

    if (offers.length < 2) return;

    const best = offers.reduce((a, b) => a.inHand > b.inHand ? a : b);

    const tableDiv = document.getElementById('comparisonTable');
    let html = `<table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:var(--bg-tertiary);">
            <th style="padding:12px;text-align:left;border:1px solid var(--border-color);">Metric</th>`;
    offers.forEach(o => {
        const highlight = o.company === best.company ? 'color:var(--success-color);' : '';
        html += `<th style="padding:12px;text-align:right;border:1px solid var(--border-color);${highlight}">${o.company}${o.company === best.company ? ' ⭐' : ''}</th>`;
    });
    html += `</tr></thead><tbody>`;

    html += `<tr><td style="padding:12px;border:1px solid var(--border-color);">Annual CTC</td>`;
    offers.forEach(o => {
        html += `<td style="padding:12px;text-align:right;border:1px solid var(--border-color);">${formatCurrency(o.ctc)}</td>`;
    });
    html += `</tr>`;

    html += `<tr style="background:var(--bg-secondary);">
        <td style="padding:12px;border:1px solid var(--border-color);"><strong>Monthly In-Hand</strong></td>`;
    offers.forEach(o => {
        const highlight = o.inHand === best.inHand ? 'color:var(--success-color);font-weight:700;' : 'font-weight:700;';
        html += `<td style="padding:12px;text-align:right;border:1px solid var(--border-color);${highlight}">${formatCurrency(o.inHand)}</td>`;
    });
    html += `</tr></tbody></table>
        <p style="margin-top:12px;color:var(--success-color);">⭐ Best offer: <strong>${best.company}</strong> — Monthly in-hand ${formatCurrency(best.inHand)}</p>`;

    tableDiv.innerHTML = html;
    document.getElementById('comparisonResults').style.display = 'block';
}

// ===== Reverse Calculator =====
function calculateReverse() {
    const desiredInHand = parseNumber(document.getElementById('desiredInHand').value);
    const basicPercent  = parseNumber(document.getElementById('reverseBasic').value) || 40;
    const city          = document.getElementById('reverseCity').value;
    const state         = document.getElementById('reverseState').value;

    // Iterative refinement
    let estimatedCTC = desiredInHand * 12 / 0.72;

    for (let i = 0; i < 10; i++) {
        const basic      = estimatedCTC * basicPercent / 100;
        const isMetro    = city === 'metro';
        const emplPF     = basic / 12 * 0.12 * 12;
        const gratuity   = basic * 0.0481;
        const gross      = estimatedCTC - emplPF - gratuity;
        const empPF      = basic / 12 * 0.12 * 12;
        const pt         = (professionalTax[state] || professionalTax['other']).total;
        const { tax }    = calculateNewRegimeTax(gross);
        const calcInHand = (gross - empPF - pt - tax) / 12;
        estimatedCTC    += (desiredInHand - calcInHand) * 12 * 1.3;
    }

    const basic    = estimatedCTC * basicPercent / 100;
    const isMetro  = city === 'metro';
    const hra      = basic * (isMetro ? 0.50 : 0.40);
    const emplPF   = basic / 12 * 0.12 * 12;
    const gratuity = basic * 0.0481;
    const gross    = estimatedCTC - emplPF - gratuity;
    const other    = estimatedCTC - basic - hra - emplPF - gratuity;

    document.getElementById('requiredCTC').textContent          = formatCurrency(estimatedCTC);
    document.getElementById('requiredGross').textContent         = formatCurrency(gross / 12);
    document.getElementById('reverseBasicAmount').textContent    = formatCurrency(basic);
    document.getElementById('reverseHRAAmount').textContent      = formatCurrency(hra);
    document.getElementById('reverseOtherAmount').textContent    = formatCurrency(Math.max(0, other));
}

// ===== PDF Export =====
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('India Salary Breakdown Report', 105, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Generated: ' + new Date().toLocaleDateString('en-IN'), 105, 26, { align: 'center' });

    // Main figures
    doc.setFontSize(13);
    doc.text('Monthly In-Hand:  ' + document.getElementById('monthlyInHand').textContent,  20, 40);
    doc.text('Annual Take-Home: ' + document.getElementById('annualTakeHome').textContent, 20, 50);

    // Monthly earnings
    doc.setFontSize(11);
    doc.text('Monthly Earnings', 20, 66);
    doc.setFontSize(10);
    const earn = [
        ['Basic Salary',      document.getElementById('monthlyBasic').textContent],
        ['HRA',               document.getElementById('monthlyHRA').textContent],
        ['Special Allowance', document.getElementById('monthlySpecial').textContent],
        ['Gross Salary',      document.getElementById('grossMonthly').textContent],
    ];
    let y = 74;
    earn.forEach(([label, val]) => {
        doc.text(label + ':',  22, y);
        doc.text(val,         120, y, { align: 'right' });
        y += 8;
    });

    // Monthly deductions
    y += 4;
    doc.setFontSize(11);
    doc.text('Monthly Deductions', 20, y);
    doc.setFontSize(10);
    y += 8;
    const ded = [
        ['Employee PF',    document.getElementById('monthlyPF').textContent],
        ['Professional Tax', document.getElementById('monthlyPT').textContent],
        ['Income Tax (TDS)', document.getElementById('monthlyTax').textContent],
        ['Total Deductions', document.getElementById('totalMonthlyDeductions').textContent],
    ];
    ded.forEach(([label, val]) => {
        doc.text(label + ':',  22, y);
        doc.text(val,         120, y, { align: 'right' });
        y += 8;
    });

    // Footer
    doc.setFontSize(8);
    doc.text('Disclaimer: Approximate figures based on FY 2025-26 tax rules. Consult a CA for personalised advice.', 105, 285, { align: 'center' });

    doc.save('salary-report-' + new Date().toISOString().slice(0, 10) + '.pdf');
}

// ===== Share Results =====
function shareResults() {
    const monthly = document.getElementById('monthlyInHand').textContent;
    const annual  = document.getElementById('annualTakeHome').textContent;
    const text = `My Salary Breakdown (FY 2025-26):\n\nMonthly In-Hand: ${monthly}\nAnnual Take-Home: ${annual}\n\nCalculated using India Salary Calculator`;

    if (navigator.share) {
        navigator.share({ title: 'Salary Breakdown', text });
    } else {
        navigator.clipboard.writeText(text)
            .then(() => alert('Results copied to clipboard!'))
            .catch(() => alert('Could not copy. Please copy manually.'));
    }
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', function () {

    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').addEventListener('click', function () {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // Main tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });

    // Result sub-tabs
    document.querySelectorAll('.tab-result-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-result-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.result-breakdown').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
            this.classList.add('active');
            const target = document.getElementById(this.dataset.tab + '-breakdown');
            target.classList.add('active');
            target.style.display = 'block';
        });
    });

    // Basic type radio toggle
    document.querySelectorAll('input[name="basicType"]').forEach(r => {
        r.addEventListener('change', function () {
            document.getElementById('basicPercentage').style.display = this.value === 'percentage' ? 'block' : 'none';
            document.getElementById('basicAbsolute').style.display   = this.value === 'absolute'   ? 'block' : 'none';
        });
    });

    // Tax regime radio toggle
    document.querySelectorAll('input[name="taxRegime"]').forEach(r => {
        r.addEventListener('change', function () {
            document.getElementById('oldRegimeDeductions').style.display = this.value === 'old' ? 'block' : 'none';
        });
    });

    // Advanced: HRA type toggle
    document.querySelectorAll('input[name="hraType"]').forEach(r => {
        r.addEventListener('change', function () {
            document.getElementById('hraManual').style.display = this.value === 'manual' ? 'block' : 'none';
        });
    });

    // Calculate
    document.getElementById('calculateBtn').addEventListener('click', calculateSalary);

    // Reset basic
    document.getElementById('resetBtn').addEventListener('click', function () {
        ['annualCTC','basicPercentage','variablePay','monthlyRent',
         'section80C','section80D','section80CCD1B','homeLoanInterest','otherDeductions']
            .forEach(id => {
                const el = document.getElementById(id);
                el.value = id === 'annualCTC' ? '1200000' : id === 'basicPercentage' ? '40' : '0';
            });
        calculateSalary();
    });

    // Advanced Mode: Apply
    document.getElementById('applyAdvanced').addEventListener('click', function () {
        advancedSettings = readAdvancedSettingsFromDOM();
        calculateSalary();
        // Switch back to basic tab to show results
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="basic"]').classList.add('active');
        document.getElementById('basic-tab').classList.add('active');
        alert('Advanced settings applied! Results updated.');
    });

    // Advanced Mode: Reset
    document.getElementById('resetAdvanced').addEventListener('click', function () {
        resetAdvancedSettingsToDefaults();
        calculateSalary();
        alert('Advanced settings reset to defaults.');
    });

    // Hike
    document.getElementById('calculateHike').addEventListener('click', calculateHike);
    document.getElementById('hikePercentage').addEventListener('input', function () {
        if (this.value) document.getElementById('hikeAbsolute').value = '';
    });
    document.getElementById('hikeAbsolute').addEventListener('input', function () {
        if (this.value) document.getElementById('hikePercentage').value = '';
    });

    // Compare
    document.getElementById('compareOffers').addEventListener('click', compareOffers);

    // Reverse
    document.getElementById('calculateReverse').addEventListener('click', calculateReverse);

    // Export & Share
    document.getElementById('exportPDF').addEventListener('click', exportPDF);
    document.getElementById('shareBtn').addEventListener('click', shareResults);

    // Initial calculation
    calculateSalary();
});
