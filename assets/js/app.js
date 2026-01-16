const API_BASE = 'api';

function showModal(title, message, onConfirm, onCancel = null) {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">${title}</div>
            <div class="modal-body">${message}</div>
            <div class="modal-buttons">
                ${onCancel ? '<button class="modal-btn modal-btn-secondary" id="modal-cancel">Cancel</button>' : ''}
                <button class="modal-btn modal-btn-primary" id="modal-confirm">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add('active'), 10);

    document.getElementById('modal-confirm').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        if (onConfirm) onConfirm();
    });

    if (onCancel) {
        document.getElementById('modal-cancel').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
            onCancel();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
                onCancel();
            }
        });
    } else {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }
}

function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `<div class="toast-content">${message}</div>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 10);

    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}


async function checkSession() {
    try {
        const res = await fetch(`${API_BASE}/auth.php?action=check`);
        const data = await res.json();
        return data;
    } catch (e) {
        return { loggedIn: false };
    }
}

async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res;
}

async function register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth.php?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    return res;
}

async function logout() {
    await fetch(`${API_BASE}/auth.php?action=logout`, { method: 'POST' });
    window.location.href = 'login.html';
}

// Dashboard Functions
async function loadDashboard() {
    const session = await checkSession();
    if (!session.loggedIn) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('welcome-msg').textContent = `Welcome, ${session.user.name}!`;

    try {
        const res = await fetch(`${API_BASE}/expenses.php`);
        const expenses = await res.json();
        renderExpenses(expenses);
    } catch (e) {
        console.error('Failed to load expenses');
    }
}

function renderExpenses(expenses) {
    const tbody = document.querySelector('table tbody');
    // Keep header row if it exists or clear all? 
    // Usually table has <thead> but here it seems it was all in <table>. 
    // Let's assume standard <table> structure or just find the table.
    // The previous code had <tr><th>...</th></tr> then loop.

    // We'll reconstruct the table content.
    const table = document.querySelector('table');
    table.innerHTML = `
        <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Action</th>
        </tr>
    `;

    let total = 0;
    const categories = {};
    const monthlyTotal = {};

    expenses.forEach(e => {
        total += e.amount;
        categories[e.category] = (categories[e.category] || 0) + e.amount;

        const m = e.date.substring(0, 7);
        monthlyTotal[m] = (monthlyTotal[m] || 0) + e.amount;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${e.title}</td>
            <td>${e.amount}</td>
            <td>${e.category}</td>
            <td>${e.date}</td>
            <td>
                <a href="edit_expense.html?id=${e.id}" class="action-btn btn-edit">Edit</a>
                <a href="#" onclick="deleteExpense('${e.id}'); return false;" class="action-btn btn-delete">Delete</a>
            </td>
        `;
        table.appendChild(row);
    });

    document.getElementById('total-expense').textContent = `Total expense: ${total} tk`;

    // Render Monthly Breakdown
    const breakdownList = document.getElementById('monthly-breakdown');
    if (breakdownList) {
        breakdownList.innerHTML = ''; // clear
        if (Object.keys(monthlyTotal).length > 0) {
            Object.entries(monthlyTotal).forEach(([m, amt]) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${m}</strong>: ${amt} tk`;
                breakdownList.appendChild(li);
            });
            document.getElementById('monthly-box').style.display = 'block';
        } else {
            document.getElementById('monthly-box').style.display = 'none';
        }
    }

    // Chart
    renderChart(categories);
}

let myChart = null;
function renderChart(categories) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                label: 'Expenses by Category',
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
                    }
                }
            }
        }
    });
}

async function addExpense(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        title: form.title.value,
        amount: form.amount.value,
        category: form.category.value,
        date: form.date.value
    };

    const res = await fetch(`${API_BASE}/expenses.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        form.reset();
        form.date.value = new Date().toISOString().split('T')[0]; // reset date to today
        loadDashboard(); // reload data
    } else {
        alert('Failed to add expense');
    }
}

async function deleteExpense(id) {
    showModal(
        'Delete Expense',
        'Are you sure you want to delete this expense?',
        async () => {
            // User confirmed
            const res = await fetch(`${API_BASE}/expenses.php?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Expense deleted successfully', 'success');
                loadDashboard();
            } else {
                showToast('Failed to delete expense', 'error');
            }
        },
        () => {
            // User cancelled - do nothing
        }
    );
}


async function loadEditExpense() {
    const session = await checkSession();
    if (!session.loggedIn) {
        window.location.href = 'login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        window.location.href = 'dashboard.html';
        return;
    }

    const res = await fetch(`${API_BASE}/expenses.php?id=${id}`);
    if (res.ok) {
        const expense = await res.json();
        const form = document.getElementById('edit-form');
        form.title.value = expense.title;
        form.amount.value = expense.amount;
        form.category.value = expense.category;
        form.date.value = expense.date || '';
        form.setAttribute('data-id', id);
    } else {
        alert('Expense not found');
        window.location.href = 'dashboard.html';
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.getAttribute('data-id');
    const data = {
        title: form.title.value,
        amount: form.amount.value,
        category: form.category.value,
        date: form.date.value // assuming we add date field to edit form too, if not it's ignored or we should add it
    };

    const res = await fetch(`${API_BASE}/expenses.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        window.location.href = 'dashboard.html';
    } else {
        alert('Failed to update');
    }
}
