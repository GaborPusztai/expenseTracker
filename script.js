document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const monthSelect = document.getElementById('month');
    const yearSelect = document.getElementById('year');
    const amountInput = document.getElementById('amount');
    const expenseChart = document.getElementById('expense-chart');

    let selectedMonth;
    let selectedYear;
    let myChart;

    // Generate year options dinamically
    for (let year = 2020; year <= 2040; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // initialize expenses object with categories
    const categories = ['Housing', 'Bills', 'Transportation', 'Food', 'Restaurant'];

    const createExpenseCategory = () => 
        categories.reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {});

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
     'July', 'August', 'September', 'October', 'November', 'December'];

    const expenses = months.reduce((acc, month) => {
        acc[month] = createExpenseCategory();
        return acc;
    }, {});

    // Load expenses
    function getExpensesFromLocalStorage(month, year) {
        const key = `${month}-${year}`;
        return JSON.parse(localStorage.getItem(key)) || {};
    }

    // Save expenses
    function saveExpensesFromLocalStorage(month, year) {
        const key = `${month}-${year}`;
        localStorage.setItem(key, JSON.stringify(expenses[month]))
    }

    // Get Selected Month and year
    function getSelectedMY() {
        selectedMonth = monthSelect.value;
        selectedYear = yearSelect.value;

        if (!selectedMonth || !selectedYear) {
            alert('Please select month and year');
            return;
        }

        if (!expenses[selectedMonth]) {
            expenses[selectedMonth] = createExpenseCategory();
        }
    }

    //Update Chart
    function updateChart() {
        getSelectedMY();

        const expenseData = getExpensesFromLocalStorage(selectedMonth, selectedYear);
        Object.assign(expenses[selectedMonth], expenseData);

        const ctx = expenseChart.getContext('2d');

        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: Object.keys(expenses[selectedMonth]),
              datasets: [{
                data: Object.values(expenses[selectedMonth]),
                backgroundColor: ['#ffcd56',
                                  '#ff6384',
                                  '#36a2eb', 
                                  '#fd6b19', 
                                  '#4bc0c0']
              }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `${tooltipItem.label}: $${tooltipItem.raw}`;
                            }
                        }
                    }
                }
            }
          });
    }

    //Handle Form Submission
    function handleSubmit(event) {
        event.preventDefault();
        getSelectedMY();

        const category = event.target.category.value;
        const amount = parseFloat(event.target.amount.value);
        const currentAmount = expenses[selectedMonth][category] || 0;

        if(amount > 0) {
            expenses[selectedMonth][category] = currentAmount + amount;
        } else if (amount < 0 && currentAmount >= Math.abs(amount)) {
            expenses[selectedMonth][category] = currentAmount + amount;
        } else {
            alert('Invalid amount');
        }

        saveExpensesFromLocalStorage(selectedMonth, selectedYear);
        updateChart();
        amountInput.value = '';
    }
    
    //Event listeners
    expenseForm.addEventListener('submit', handleSubmit);
    monthSelect.addEventListener('change', updateChart);
    yearSelect.addEventListener('change', updateChart);

    //Set default month and year based on current month and year
    function setDefaultMY() {
        const now = new Date();
        const initialMonth = now.toLocaleDateString('default', { month: 'long'});
        const initialYear = now.getFullYear();
        monthSelect.value = initialMonth;
        yearSelect.value = initialYear;
    }

    setDefaultMY();
    updateChart();
});