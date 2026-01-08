// ===== Global Variables =====
let ctcBreakdownChart = null;
let deductionsChart = null;

// ===== Professional Tax Data =====
const professionalTax = {
    'maharashtra': { monthly: 200, annualExtra: 300, total: 2500 },
    'karnataka': { monthly: 200, total: 2400 },
    'west-bengal': { monthly: 200, total: 2400 },
    'tamil-nadu': { monthly: 208, total: 2500 },
    'telangana': { monthly: 200, total: 2400 },
    'andhra-pradesh': { monthly: 200, total: 2400 },
    'gujarat': { monthly: 200, total: 2400 },
    'kerala': { monthly: 200, total: 2400 },
    'madhya-pradesh': { monthly: 208, total: 2500 },
    'delhi': { monthly: 0, total: 0 },
    'uttar-pradesh': { monthly: 0, total: 0 },
    'punjab': { monthly: 0, total: 0 },
    'haryana': { monthly: 0, total: 0 },
    'rajasthan': { monthly: 0, total: 0 },
    'other': { monthly: 0, total: 0 }
};

// ===== New Tax Regime Slabs (FY 2025-26) =====
const newTaxSlabs = [
    { min: 0, max: 400000, rate: 0 },
    { min: 400000, max: 800000, rate: 0.05 },
    { min: 800000, max: 1200000, rate: 0.10 },
    { min: 1200000, max: 1600000, rate: 0.15 },
    { min: 1600000, max: 2000000, rate: 0.20 },
    { min: 2000000, max: 2400000, rate: 0.25 },
    { min: 2400000, max: Infinity, rate: 0.30 }
];

// ===== Old Tax Regime Slabs =====
const oldTaxSlabs = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
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

    // Apply rebate u/s 87A (for income up to 12L)
    if (taxableIncome <= 1200000) {
        tax = Math.max(0, tax - 60000);
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

    // Apply rebate u/s 87A (for income up to 5L)
    if (taxableIncome <= 500000) {
        tax = Math.max(0, tax - 12500);
    }

    // Add 4% cess
    tax = tax * 1.04;

    return { tax, taxableIncome };
}

// ===== HRA Exemption Calculator =====
function calculateHRAExemption(basic, da, hraReceived, rentPaid, isMetro) {
    const basicPlusDA = basic + da;
    const actualHRA = hraReceived;
    const rentMinus10Percent = Math.max(0, rentPaid - (0.10 * basicPlusDA));
    const percentageOfBasic = (isMetro ? 0.50 : 0.40) * basicPlusDA;

    const exemption = Math.min(actualHRA, rentMinus10Percent, percentageOfBasic);
    return Math.max(0, exemption);
}

// ===== EPF Calculation =====
function calculateEPF(basic, pfType = 'full') {
    if (pfType === 'capped') {
        const cappedBasic = Math.min(basic, 15000);
        return cappedBasic * 0.12;
    }
    return basic * 0.12;
}

// ===== ESI Calculation =====
function calculateESI(grossMonthly) {
    if (grossMonthly <= 21000) {
        return {
            applicable: true,
            employee: grossMonthly * 0.0075,
            employer: grossMonthly * 0.0325
        };
    }
    return { applicable: false, employee: 0, employer: 0 };
}

// ===== Main Salary Calculation =====
function calculateSalary() {
    // Get input values
    const annualCTC = parseNumber(document.getElementById('annualCTC').value);
    const variablePay = parseNumber(document.getElementById('variablePay').value);
    const includeVariableMonthly = document.getElementById('includeVariableMonthly').checked;
    const cityType = document.getElementById('cityType').value;
    const state = document.getElementById('state').value;
    const taxRegime = document.querySelector('input[name="taxRegime"]:checked').value;

    // Basic salary calculation
    const basicType = document.querySelector('input[name="basicType"]:checked').value;
    let annualBasic;
    if (basicType === 'percentage') {
        const basicPercentage = parseNumber(document.getElementById('basicPercentage').value);
        annualBasic = (annualCTC * basicPercentage) / 100;
    } else {
        annualBasic = parseNumber(document.getElementById('basicAbsolute').value);
    }

    const monthlyBasic = annualBasic / 12;

    // Validate basic salary
    const basicPercentOfCTC = (annualBasic / annualCTC) * 100;
    const basicWarning = document.getElementById('basicWarning');
    if (basicPercentOfCTC < 35 || basicPercentOfCTC > 60) {
        basicWarning.style.display = 'block';
    } else {
        basicWarning.style.display = 'none';
    }

    // Calculate HRA
    const isMetro = cityType === 'metro';
    const hraPercentage = isMetro ? 0.50 : 0.40;
    const annualHRA = annualBasic * hraPercentage;
    const monthlyHRA = annualHRA / 12;

    // Calculate employer contributions (part of CTC but not in gross)
    const employerPF = calculateEPF(monthlyBasic, 'standard') * 12;
    const gratuity = annualBasic * 0.0481;

    // Calculate gross salary (CTC minus employer contributions)
    const annualGross = annualCTC - employerPF - gratuity;

    // Calculate special allowance (balancing figure)
    const annualSpecial = annualGross - annualBasic - annualHRA - variablePay;
    const monthlySpecial = annualSpecial / 12;

    // Monthly calculations
    const monthlyVariable = includeVariableMonthly ? variablePay / 12 : 0;
    const grossMonthly = monthlyBasic + monthlyHRA + monthlySpecial + monthlyVariable;

    // Employee PF
    const monthlyEmployeePF = calculateEPF(monthlyBasic, 'full');
    const annualEmployeePF = monthlyEmployeePF * 12;

    // Professional Tax
    const ptData = professionalTax[state];
    const monthlyPT = ptData.monthly;
    const annualPT = ptData.total;

    // ESI Calculation
    const esiData = calculateESI(grossMonthly);
    const monthlyESI = esiData.employee;
    const annualESI = monthlyESI * 12;

    // Show/hide ESI row
    if (esiData.applicable) {
        document.getElementById('monthlyESIRow').style.display = 'flex';
    } else {
        document.getElementById('monthlyESIRow').style.display = 'none';
    }

    // Tax calculation based on regime
    let monthlyTax, annualTax, taxableIncome;

    if (taxRegime === 'new') {
        const newTaxResult = calculateNewRegimeTax(annualGross);
        annualTax = newTaxResult.tax;
        taxableIncome = newTaxResult.taxableIncome;
        monthlyTax = annualTax / 12;
    } else {
        // Old regime with deductions
        const monthlyRent = parseNumber(document.getElementById('monthlyRent').value);
        const annualRent = monthlyRent * 12;

        // HRA exemption
        const hraExemption = calculateHRAExemption(
            annualBasic,
            0, // DA (can be added from advanced mode)
            annualHRA,
            annualRent,
            isMetro
        );

        // Other deductions
        const section80C = parseNumber(document.getElementById('section80C').value);
        const section80D = parseNumber(document.getElementById('section80D').value);
        const section80CCD1B = parseNumber(document.getElementById('section80CCD1B').value);
        const homeLoanInterest = parseNumber(document.getElementById('homeLoanInterest').value);
        const otherDeductions = parseNumber(document.getElementById('otherDeductions').value);

        // Total 80C (including EPF)
        const total80C = Math.min(section80C + annualEmployeePF, 150000);

        const totalDeductions = {
            hraExemption,
            section80C: total80C,
            section80D: Math.min(section80D, 100000),
            section80CCD1B: Math.min(section80CCD1B, 50000),
            homeLoanInterest: Math.min(homeLoanInterest, 200000),
            otherDeductions,
            total: 0
        };

        totalDeductions.total =
            totalDeductions.hraExemption +
            totalDeductions.section80C +
            totalDeductions.section80D +
            totalDeductions.section80CCD1B +
            totalDeductions.homeLoanInterest +
            totalDeductions.otherDeductions;

        const oldTaxResult = calculateOldRegimeTax(annualGross, totalDeductions);
        annualTax = oldTaxResult.tax;
        taxableIncome = oldTaxResult.taxableIncome;
        monthlyTax = annualTax / 12;
    }

    // Calculate both regimes for comparison
    const newRegimeResult = calculateNewRegimeTax(annualGross);
    let oldRegimeResult;

    if (taxRegime === 'old') {
        oldRegimeResult = { tax: annualTax, taxableIncome };
    } else {
        // Calculate old regime for comparison
        const monthlyRent = parseNumber(document.getElementById('monthlyRent').value);
        const annualRent = monthlyRent * 12;
        const hraExemption = calculateHRAExemption(annualBasic, 0, annualHRA, annualRent, isMetro);

        const totalDeductions = {
            hraExemption,
            section80C: Math.min(annualEmployeePF, 150000),
            section80D: 0,
            section80CCD1B: 0,
            homeLoanInterest: 0,
            otherDeductions: 0,
            total: 0
        };

        totalDeductions.total = totalDeductions.hraExemption + totalDeductions.section80C;
        oldRegimeResult = calculateOldRegimeTax(annualGross, totalDeductions);
    }

    // Total monthly deductions
    const totalMonthlyDeductions = monthlyEmployeePF + monthlyPT + monthlyTax + monthlyESI;

    // In-hand salary
    const monthlyInHand = grossMonthly - totalMonthlyDeductions;
    const annualTakeHome = (monthlyInHand * 12) + (includeVariableMonthly ? 0 : variablePay);

    // Display results
    displayResults({
        monthlyInHand,
        annualTakeHome,
        monthlyBasic,
        monthlyHRA,
        monthlySpecial,
        monthlyVariable,
        grossMonthly,
        monthlyEmployeePF,
        monthlyPT,
        monthlyTax,
        monthlyESI,
        totalMonthlyDeductions,
        annualCTC,
        annualBasic,
        annualHRA,
        annualSpecial,
        variablePay,
        employerPF,
        gratuity,
        annualEmployeePF,
        annualPT,
        annualTax,
        newRegimeResult,
        oldRegimeResult,
        annualGross
    });

    // Update charts
    updateCharts({
        annualBasic,
        annualHRA,
        annualSpecial,
        variablePay,
        employerPF,
        gratuity,
        annualEmployeePF,
        annualPT,
        annualTax
    });
}

// ===== Display Results =====
function displayResults(data) {
    // Main results
    document.getElementById('monthlyInHand').textContent = formatCurrency(data.monthlyInHand);
    document.getElementById('annualTakeHome').textContent = formatCurrency(data.annualTakeHome);

    // Monthly breakdown
    document.getElementById('monthlyBasic').textContent = formatCurrency(data.monthlyBasic);
    document.getElementById('monthlyHRA').textContent = formatCurrency(data.monthlyHRA);
    document.getElementById('monthlySpecial').textContent = formatCurrency(data.monthlySpecial);
    document.getElementById('monthlyVariable').textContent = formatCurrency(data.monthlyVariable);
    document.getElementById('grossMonthly').textContent = formatCurrency(data.grossMonthly);

    // Show/hide variable pay row
    if (data.monthlyVariable > 0) {
        document.getElementById('monthlyVariableRow').style.display = 'flex';
    }

    document.getElementById('monthlyPF').textContent = formatCurrency(data.monthlyEmployeePF);
    document.getElementById('monthlyPT').textContent = formatCurrency(data.monthlyPT);
    document.getElementById('monthlyTax').textContent = formatCurrency(data.monthlyTax);
    document.getElementById('monthlyESI').textContent = formatCurrency(data.monthlyESI);
    document.getElementById('totalMonthlyDeductions').textContent = formatCurrency(data.totalMonthlyDeductions);

    // Annual breakdown
    document.getElementById('annualCTCDisplay').textContent = formatCurrency(data.annualCTC);
    document.getElementById('annualBasic').textContent = formatCurrency(data.annualBasic);
    document.getElementById('annualHRA').textContent = formatCurrency(data.annualHRA);
    document.getElementById('annualSpecial').textContent = formatCurrency(data.annualSpecial);
    document.getElementById('annualVariablePay').textContent = formatCurrency(data.variablePay);
    document.getElementById('annualEmployerPF').textContent = formatCurrency(data.employerPF);
    document.getElementById('annualGratuity').textContent = formatCurrency(data.gratuity);
    document.getElementById('annualPF').textContent = formatCurrency(data.annualEmployeePF);
    document.getElementById('annualPT').textContent = formatCurrency(data.annualPT);
    document.getElementById('annualTax').textContent = formatCurrency(data.annualTax);

    const totalAnnualDeductions = data.annualEmployeePF + data.annualPT + data.annualTax;
    document.getElementById('totalAnnualDeductions').textContent = formatCurrency(totalAnnualDeductions);
    document.getElementById('annualTakeHomeDisplay').textContent = formatCurrency(data.annualTakeHome);

    // Regime comparison
    document.getElementById('newTaxableIncome').textContent = formatCurrency(data.newRegimeResult.taxableIncome);
    document.getElementById('newTaxAmount').textContent = formatCurrency(data.newRegimeResult.tax);
    const newTakeHome = data.annualGross - data.annualEmployeePF - data.annualPT - data.newRegimeResult.tax;
    document.getElementById('newTakeHome').textContent = formatCurrency(newTakeHome);

    document.getElementById('oldTaxableIncome').textContent = formatCurrency(data.oldRegimeResult.taxableIncome);
    document.getElementById('oldTaxAmount').textContent = formatCurrency(data.oldRegimeResult.tax);
    const oldTakeHome = data.annualGross - data.annualEmployeePF - data.annualPT - data.oldRegimeResult.tax;
    document.getElementById('oldTakeHome').textContent = formatCurrency(oldTakeHome);

    // Recommendation
    const recommendationDiv = document.getElementById('regimeRecommendation');
    const savings = Math.abs(newTakeHome - oldTakeHome);

    if (newTakeHome > oldTakeHome) {
        recommendationDiv.innerHTML = `
            <strong>✓ Recommendation: Choose New Tax Regime</strong><br>
            You'll save ${formatCurrency(savings)} annually by choosing the New Tax Regime.
        `;
        recommendationDiv.className = 'recommendation';
    } else if (oldTakeHome > newTakeHome) {
        recommendationDiv.innerHTML = `
            <strong>✓ Recommendation: Choose Old Tax Regime</strong><br>
            You'll save ${formatCurrency(savings)} annually by choosing the Old Tax Regime with deductions.
        `;
        recommendationDiv.className = 'recommendation';
    } else {
        recommendationDiv.innerHTML = `
            <strong>Both regimes result in the same take-home salary.</strong><br>
            Choose based on your preference for claiming deductions.
        `;
        recommendationDiv.className = 'recommendation';
    }
}

// ===== Update Charts =====
function updateCharts(data) {
    // CTC Breakdown Chart
    const ctcCtx = document.getElementById('ctcBreakdownChart').getContext('2d');

    if (ctcBreakdownChart) {
        ctcBreakdownChart.destroy();
    }

    ctcBreakdownChart = new Chart(ctcCtx, {
        type: 'doughnut',
        data: {
            labels: ['Basic Salary', 'HRA', 'Special Allowance', 'Variable Pay', 'Employer PF', 'Gratuity'],
            datasets: [{
                data: [
                    data.annualBasic,
                    data.annualHRA,
                    data.annualSpecial,
                    data.variablePay,
                    data.employerPF,
                    data.gratuity
                ],
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ec4899',
                    '#06b6d4'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'CTC Breakdown',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.parsed);
                        }
                    }
                }
            }
        }
    });

    // Deductions Chart
    const deductionsCtx = document.getElementById('deductionsChart').getContext('2d');

    if (deductionsChart) {
        deductionsChart.destroy();
    }

    deductionsChart = new Chart(deductionsCtx, {
        type: 'pie',
        data: {
            labels: ['Employee PF', 'Professional Tax', 'Income Tax'],
            datasets: [{
                data: [
                    data.annualEmployeePF,
                    data.annualPT,
                    data.annualTax
                ],
                backgroundColor: [
                    '#ef4444',
                    '#f97316',
                    '#eab308'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Annual Deductions Breakdown',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.parsed);
                        }
                    }
                }
            }
        }
    });
}

// ===== Hike Calculator =====
function calculateHike() {
    const currentCTC = parseNumber(document.getElementById('currentCTC').value);
    const hikePercentage = parseNumber(document.getElementById('hikePercentage').value);
    const hikeAbsolute = parseNumber(document.getElementById('hikeAbsolute').value);

    let newCTC;
    if (hikeAbsolute > 0) {
        newCTC = currentCTC + hikeAbsolute;
    } else {
        newCTC = currentCTC * (1 + hikePercentage / 100);
    }

    // Calculate approximate in-hand (using simplified calculation)
    const currentInHand = currentCTC * 0.7 / 12; // Approximate 70% of CTC
    const newInHand = newCTC * 0.7 / 12;
    const incrementalInHand = newInHand - currentInHand;

    document.getElementById('currentInHand').value = Math.round(currentInHand);
    document.getElementById('newCTC').textContent = formatCurrency(newCTC);
    document.getElementById('newInHand').textContent = formatCurrency(newInHand);
    document.getElementById('incrementalInHand').textContent = formatCurrency(incrementalInHand);
}

// ===== Compare Offers =====
function compareOffers() {
    const offers = [];

    for (let i = 1; i <= 3; i++) {
        const ctc = parseNumber(document.getElementById(`offer${i}CTC`).value);
        if (ctc > 0) {
            const company = document.getElementById(`company${i}`).value || `Offer ${i}`;
            const basicPercent = parseNumber(document.getElementById(`offer${i}Basic`).value);
            const variable = parseNumber(document.getElementById(`offer${i}Variable`).value);
            const city = document.getElementById(`offer${i}City`).value;

            const basic = (ctc * basicPercent) / 100;
            const isMetro = city === 'metro';
            const hra = basic * (isMetro ? 0.50 : 0.40);
            const employerPF = (basic / 12) * 0.12 * 12;
            const gratuity = basic * 0.0481;
            const gross = ctc - employerPF - gratuity;

            // Simplified in-hand calculation
            const inHand = (gross * 0.75) / 12; // Approximate

            offers.push({
                company,
                ctc,
                basic,
                variable,
                inHand: Math.round(inHand)
            });

            document.getElementById(`offer${i}InHand`).textContent = formatCurrency(inHand);
        }
    }

    // Display comparison table
    if (offers.length >= 2) {
        const comparisonDiv = document.getElementById('comparisonResults');
        const tableDiv = document.getElementById('comparisonTable');

        let tableHTML = `
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-tertiary);">
                        <th style="padding:12px; text-align:left; border:1px solid var(--border-color);">Metric</th>
        `;

        offers.forEach(offer => {
            tableHTML += `<th style="padding:12px; text-align:right; border:1px solid var(--border-color);">${offer.company}</th>`;
        });

        tableHTML += `</tr></thead><tbody>`;

        // CTC Row
        tableHTML += `<tr><td style="padding:12px; border:1px solid var(--border-color);">Annual CTC</td>`;
        offers.forEach(offer => {
            tableHTML += `<td style="padding:12px; text-align:right; border:1px solid var(--border-color);">${formatCurrency(offer.ctc)}</td>`;
        });
        tableHTML += `</tr>`;

        // In-Hand Row
        tableHTML += `<tr style="background: var(--bg-secondary);"><td style="padding:12px; border:1px solid var(--border-color);"><strong>Monthly In-Hand</strong></td>`;
        offers.forEach(offer => {
            tableHTML += `<td style="padding:12px; text-align:right; border:1px solid var(--border-color);"><strong>${formatCurrency(offer.inHand)}</strong></td>`;
        });
        tableHTML += `</tr>`;

        tableHTML += `</tbody></table>`;

        tableDiv.innerHTML = tableHTML;
        comparisonDiv.style.display = 'block';
    }
}

// ===== Reverse Calculator =====
function calculateReverse() {
    const desiredInHand = parseNumber(document.getElementById('desiredInHand').value);
    const basicPercent = parseNumber(document.getElementById('reverseBasic').value);
    const city = document.getElementById('reverseCity').value;
    const state = document.getElementById('reverseState').value;

    // Reverse calculation (iterative approach)
    // Starting with approximation: CTC ≈ In-Hand * 1.43 (assuming ~70% take-home)
    let estimatedCTC = desiredInHand * 12 / 0.7;

    // Refine calculation
    for (let i = 0; i < 5; i++) {
        const basic = (estimatedCTC * basicPercent) / 100;
        const isMetro = city === 'metro';
        const hra = basic * (isMetro ? 0.50 : 0.40);
        const employerPF = (basic / 12) * 0.12 * 12;
        const gratuity = basic * 0.0481;
        const gross = estimatedCTC - employerPF - gratuity;

        // Tax calculation (simplified new regime)
        const newTaxResult = calculateNewRegimeTax(gross);
        const tax = newTaxResult.tax;

        const employeePF = (basic / 12) * 0.12 * 12;
        const pt = professionalTax[state].total;

        const calculatedInHand = (gross - employeePF - pt - tax) / 12;

        // Adjust CTC
        const difference = desiredInHand - calculatedInHand;
        estimatedCTC += difference * 12 * 1.2; // Adjustment factor
    }

    const basic = (estimatedCTC * basicPercent) / 100;
    const isMetro = city === 'metro';
    const hra = basic * (isMetro ? 0.50 : 0.40);
    const employerPF = (basic / 12) * 0.12 * 12;
    const gratuity = basic * 0.0481;
    const gross = estimatedCTC - employerPF - gratuity;
    const other = estimatedCTC - basic - hra - employerPF - gratuity;

    document.getElementById('requiredCTC').textContent = formatCurrency(estimatedCTC);
    document.getElementById('requiredGross').textContent = formatCurrency(gross / 12);
    document.getElementById('reverseBasicAmount').textContent = formatCurrency(basic);
    document.getElementById('reverseHRAAmount').textContent = formatCurrency(hra);
    document.getElementById('reverseOtherAmount').textContent = formatCurrency(other);
}

// ===== PDF Export =====
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Salary Breakdown Report', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString('en-IN'), 105, 30, { align: 'center' });

    // Monthly In-Hand
    doc.setFontSize(14);
    doc.text('Monthly In-Hand Salary:', 20, 45);
    doc.setFontSize(16);
    doc.text(document.getElementById('monthlyInHand').textContent, 20, 53);

    doc.setFontSize(14);
    doc.text('Annual Take-Home:', 120, 45);
    doc.setFontSize(16);
    doc.text(document.getElementById('annualTakeHome').textContent, 120, 53);

    // Monthly Breakdown
    doc.setFontSize(12);
    doc.text('Monthly Breakdown:', 20, 70);

    let y = 80;
    doc.text('Basic Salary: ' + document.getElementById('monthlyBasic').textContent, 20, y);
    y += 8;
    doc.text('HRA: ' + document.getElementById('monthlyHRA').textContent, 20, y);
    y += 8;
    doc.text('Special Allowance: ' + document.getElementById('monthlySpecial').textContent, 20, y);
    y += 8;
    doc.text('Gross Monthly: ' + document.getElementById('grossMonthly').textContent, 20, y);

    y += 15;
    doc.text('Deductions:', 20, y);
    y += 8;
    doc.text('Employee PF: ' + document.getElementById('monthlyPF').textContent, 20, y);
    y += 8;
    doc.text('Professional Tax: ' + document.getElementById('monthlyPT').textContent, 20, y);
    y += 8;
    doc.text('Income Tax: ' + document.getElementById('monthlyTax').textContent, 20, y);

    // Save PDF
    doc.save('salary-breakdown.pdf');
}

// ===== Share Results =====
function shareResults() {
    const monthlyInHand = document.getElementById('monthlyInHand').textContent;
    const annualTakeHome = document.getElementById('annualTakeHome').textContent;

    const text = `My Salary Breakdown:\n\nMonthly In-Hand: ${monthlyInHand}\nAnnual Take-Home: ${annualTakeHome}\n\nCalculated using India Salary Calculator`;

    if (navigator.share) {
        navigator.share({
            title: 'Salary Breakdown',
            text: text
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', function() {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');

            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        });
    });

    // Result tabs
    document.querySelectorAll('.tab-result-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');

            document.querySelectorAll('.tab-result-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.result-breakdown').forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(tabName + '-breakdown').classList.add('active');
        });
    });

    // Basic type toggle
    document.querySelectorAll('input[name="basicType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'percentage') {
                document.getElementById('basicPercentage').style.display = 'block';
                document.getElementById('basicAbsolute').style.display = 'none';
            } else {
                document.getElementById('basicPercentage').style.display = 'none';
                document.getElementById('basicAbsolute').style.display = 'block';
            }
        });
    });

    // Tax regime toggle
    document.querySelectorAll('input[name="taxRegime"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'old') {
                document.getElementById('oldRegimeDeductions').style.display = 'block';
            } else {
                document.getElementById('oldRegimeDeductions').style.display = 'none';
            }
        });
    });

    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculateSalary);

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', function() {
        document.getElementById('annualCTC').value = '1200000';
        document.getElementById('basicPercentage').value = '40';
        document.getElementById('variablePay').value = '0';
        document.getElementById('monthlyRent').value = '0';
        document.getElementById('section80C').value = '0';
        document.getElementById('section80D').value = '0';
        document.getElementById('section80CCD1B').value = '0';
        document.getElementById('homeLoanInterest').value = '0';
        document.getElementById('otherDeductions').value = '0';
    });

    // Hike calculator
    document.getElementById('calculateHike').addEventListener('click', calculateHike);

    // Hike percentage/absolute toggle
    document.getElementById('hikePercentage').addEventListener('input', function() {
        if (this.value) {
            document.getElementById('hikeAbsolute').value = '';
        }
    });

    document.getElementById('hikeAbsolute').addEventListener('input', function() {
        if (this.value) {
            document.getElementById('hikePercentage').value = '';
        }
    });

    // Compare offers
    document.getElementById('compareOffers').addEventListener('click', compareOffers);

    // Reverse calculator
    document.getElementById('calculateReverse').addEventListener('click', calculateReverse);

    // Export PDF
    document.getElementById('exportPDF').addEventListener('click', exportPDF);

    // Share button
    document.getElementById('shareBtn').addEventListener('click', shareResults);

    // Initial calculation
    calculateSalary();
});
