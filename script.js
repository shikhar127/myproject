const loanAmountRange = document.getElementById('loanAmountRange');
const loanAmountInput = document.getElementById('loanAmountInput');
const tenureRange = document.getElementById('tenureRange');
const tenureInput = document.getElementById('tenureInput');
const tenureUnit = document.getElementById('tenureUnit');
const roiInput = document.getElementById('roiInput');
const processingFeeInput = document.getElementById('processingFeeInput');
const processingSymbol = document.getElementById('processingSymbol');
const toggleButtons = document.querySelectorAll('.toggle-group .toggle');
const loanTypeSelect = document.getElementById('loanType');

const emiValue = document.getElementById('emiValue');
const totalPayableValue = document.getElementById('totalPayableValue');
const totalInterestValue = document.getElementById('totalInterestValue');
const processingFeeValue = document.getElementById('processingFeeValue');

const calculateBtn = document.getElementById('calculateBtn');

let breakdownChart;
let trendChart;
let tenureMonths = 60;
let processingMode = 'flat';
const processingMemory = {
  flat: 1999,
  percent: 1.5,
};

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function syncLoanAmount(value) {
  const numericValue = Number(value);
  const cleanValue = clamp(
    Number.isNaN(numericValue) ? Number(loanAmountRange.min) : numericValue,
    Number(loanAmountRange.min),
    Number(loanAmountRange.max),
  );
  loanAmountRange.value = cleanValue;
  loanAmountInput.value = cleanValue;
}

function updateTenureControls() {
  if (tenureUnit.value === 'years') {
    tenureRange.min = 1;
    tenureRange.max = 30;
    tenureRange.step = 1;
    tenureInput.min = 1;
    tenureInput.max = 30;
    tenureInput.step = 1;
    const years = Math.max(1, Math.round(tenureMonths / 12));
    tenureRange.value = years;
    tenureInput.value = years;
  } else {
    tenureRange.min = 6;
    tenureRange.max = 360;
    tenureRange.step = 1;
    tenureInput.min = 6;
    tenureInput.max = 360;
    tenureInput.step = 1;
    const months = Math.max(6, Math.round(tenureMonths));
    tenureRange.value = months;
    tenureInput.value = months;
  }
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function handleTenureInput(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return;
  }
  if (tenureUnit.value === 'years') {
    tenureMonths = clamp(numericValue, Number(tenureInput.min), Number(tenureInput.max)) * 12;
  } else {
    tenureMonths = clamp(numericValue, Number(tenureInput.min), Number(tenureInput.max));
  }
  updateTenureControls();
}

function setProcessingMode(mode) {
  const currentValue = Number(processingFeeInput.value);
  if (!Number.isNaN(currentValue)) {
    processingMemory[processingMode] = currentValue;
  }

  processingMode = mode;
  toggleButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  processingSymbol.textContent = mode === 'percent' ? '%' : '₹';
  processingFeeInput.step = mode === 'percent' ? 0.1 : 1;
  processingFeeInput.value = processingMemory[mode];
}

function calculateResults() {
  const principal = Number(loanAmountInput.value);
  const annualRate = Number(roiInput.value);
  const loanType = loanTypeSelect.value;

  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) {
    return;
  }

  const monthlyRate = annualRate / 12 / 100;
  const months = tenureMonths;

  let emi = 0;
  if (monthlyRate === 0) {
    emi = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    emi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalPayable = emi * months;
  const totalInterest = totalPayable - principal;

  let processingFee = Number(processingFeeInput.value) || 0;
  if (processingMode === 'percent') {
    processingFee = (processingFee / 100) * principal;
  }

  emiValue.innerHTML = `${formatter.format(Math.round(emi))} <span>/ month</span>`;
  totalPayableValue.textContent = formatter.format(Math.round(totalPayable));
  totalInterestValue.textContent = formatter.format(Math.round(totalInterest));
  processingFeeValue.textContent = formatter.format(Math.round(processingFee));

  updateCharts(principal, totalInterest, emi, monthlyRate, months, loanType);
}

function buildTrendData(principal, emi, monthlyRate, months) {
  const labels = [];
  const principalSeries = [];
  const interestSeries = [];
  let outstanding = principal;
  const limit = Math.min(months, 36);

  for (let month = 1; month <= limit; month += 1) {
    const interestComponent = monthlyRate === 0 ? 0 : outstanding * monthlyRate;
    const principalComponent = emi - interestComponent;
    outstanding = Math.max(outstanding - principalComponent, 0);
    labels.push(`M${month}`);
    principalSeries.push(Math.max(principalComponent, 0));
    interestSeries.push(Math.max(interestComponent, 0));
  }

  return { labels, principalSeries, interestSeries };
}

function updateCharts(principal, interest, emi, monthlyRate, months, loanType) {
  const breakdownCtx = document.getElementById('breakdownChart');
  const trendCtx = document.getElementById('trendChart');

  const palette = getAccentPalette(loanType);
  const chartAccent = palette.strong;
  const chartSoft = palette.soft;
  setAccentTheme(palette);
  const sanitizedPrincipal = Math.max(principal, 0);
  const sanitizedInterest = Math.max(interest, 0);

  if (!breakdownChart) {
    breakdownChart = new Chart(breakdownCtx, {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Interest'],
        datasets: [
          {
            data: [sanitizedPrincipal, sanitizedInterest],
            backgroundColor: [chartAccent, 'rgba(255, 255, 255, 0.24)'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#f5f5f5',
              usePointStyle: true,
              generateLabels: (chart) => {
                const dataset = chart.data.datasets[0];
                const total = dataset.data.reduce((acc, value) => acc + value, 0);
                return chart.data.labels.map((label, index) => {
                  const value = dataset.data[index];
                  const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
                  return {
                    text: `${label} – ${percentage}%`,
                    fillStyle: dataset.backgroundColor[index],
                    strokeStyle: dataset.backgroundColor[index],
                    lineWidth: 0,
                    hidden: Number.isNaN(dataset.data[index]) || dataset.data[index] === null,
                    index,
                  };
                });
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const dataset = ctx.dataset;
                const total = dataset.data.reduce((acc, value) => acc + value, 0);
                const percentage = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${formatter.format(ctx.parsed)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  } else {
    breakdownChart.data.datasets[0].data = [sanitizedPrincipal, sanitizedInterest];
    breakdownChart.data.datasets[0].backgroundColor = [chartAccent, 'rgba(255, 255, 255, 0.24)'];
    breakdownChart.update();
  }

  const { labels, principalSeries, interestSeries } = buildTrendData(principal, emi, monthlyRate, months);

  if (!trendChart) {
    trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Principal',
            data: principalSeries,
            borderColor: chartAccent,
            backgroundColor: chartSoft,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Interest',
            data: interestSeries,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#f5f5f5',
              usePointStyle: true,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
            },
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              callback: (value) => `${value / 1000}K`,
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
            },
          },
        },
      },
    });
  } else {
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = principalSeries;
    trendChart.data.datasets[1].data = interestSeries;
    trendChart.data.datasets[0].borderColor = chartAccent;
    trendChart.data.datasets[0].backgroundColor = chartSoft;
    trendChart.update();
  }
}

function getAccentPalette(loanType) {
  const accentMap = {
    personal: [0, 245, 212],
    home: [56, 189, 248],
    car: [251, 191, 36],
    other: [244, 114, 182],
  };
  const [r, g, b] = accentMap[loanType] || accentMap.personal;
  return {
    base: `rgb(${r}, ${g}, ${b})`,
    strong: `rgba(${r}, ${g}, ${b}, 0.95)`,
    medium: `rgba(${r}, ${g}, ${b}, 0.6)`,
    soft: `rgba(${r}, ${g}, ${b}, 0.2)`,
  };
}

function setAccentTheme(palette) {
  const root = document.documentElement;
  root.style.setProperty('--accent', palette.base);
  root.style.setProperty('--accent-strong', palette.strong);
  root.style.setProperty('--accent-medium', palette.medium);
  root.style.setProperty('--accent-soft', palette.soft);
}

loanAmountRange.addEventListener('input', (event) => {
  syncLoanAmount(event.target.value);
  calculateResults();
});

loanAmountInput.addEventListener('change', (event) => {
  syncLoanAmount(event.target.value);
  calculateResults();
});

loanAmountInput.addEventListener('blur', (event) => {
  syncLoanAmount(event.target.value);
  calculateResults();
});

tenureRange.addEventListener('input', (event) => {
  handleTenureInput(event.target.value);
  calculateResults();
});

tenureInput.addEventListener('change', (event) => {
  handleTenureInput(event.target.value);
  calculateResults();
});

tenureInput.addEventListener('input', (event) => {
  handleTenureInput(event.target.value);
  calculateResults();
});

tenureUnit.addEventListener('change', () => {
  if (tenureUnit.value === 'years') {
    const years = clamp(Math.round(tenureMonths / 12) || 1, 1, 30);
    tenureMonths = years * 12;
  } else {
    const months = clamp(Math.round(tenureMonths) || 6, 6, 360);
    tenureMonths = months;
  }
  updateTenureControls();
  calculateResults();
});

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setProcessingMode(button.dataset.mode);
    calculateResults();
  });
});

processingFeeInput.addEventListener('input', () => {
  calculateResults();
});

processingFeeInput.addEventListener('change', () => {
  calculateResults();
});

processingFeeInput.addEventListener('blur', () => {
  calculateResults();
});

roiInput.addEventListener('input', () => {
  calculateResults();
});

roiInput.addEventListener('change', () => {
  calculateResults();
});

roiInput.addEventListener('blur', () => {
  calculateResults();
});

loanTypeSelect.addEventListener('change', () => {
  calculateResults();
});

calculateBtn.addEventListener('click', (event) => {
  event.preventDefault();
  calculateResults();
});

document.addEventListener('DOMContentLoaded', () => {
  syncLoanAmount(loanAmountInput.value);
  updateTenureControls();
  setProcessingMode(processingMode);
  calculateResults();
});
