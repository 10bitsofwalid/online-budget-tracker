<?php

include 'config/db.php';
if (!isset($_SESSION['user_id']))
    header("Location: login.php");

$expenses = getExpenses();
$data = array_filter($expenses, function ($e) {
    return $e['user_id'] == $_SESSION['user_id'];
});
$total = 0;

?>


<!DOCTYPE html>
<html>

<head>
    <title>Dashboard</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>
    <h2>Welcome, <?= $_SESSION['name'] ?></h2>

    <a href="logout.php" class="logout-link">Logout</a>

    <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
        <div class="box" style="flex: 1; min-width: 300px;">
            <h3>Add expense</h3>
            <form method="post" action="add_expense.php"
                style="box-shadow: none; padding: 0; border: none; margin-bottom: 0;">
                <input type="text" name="title" placeholder="Expense title" required>
                <input type="number" name="amount" placeholder="Amount" step="0.01" required>
                <input type="date" name="date" value="<?= date('Y-m-d') ?>" required title="Select exact date">
                <select name="category">
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Shopping</option>
                    <option>Others</option>
                </select>
                <button>Add</button>
            </form>
        </div>

        <div class="chart-container" style="flex: 1; min-width: 300px;">
            <canvas id="expenseChart"></canvas>
        </div>
    </div>

    <h3>Expense list</h3>
    <table>
        <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Action</th>
        </tr>

        <?php
        $categories = [];
        $monthlyTotal = [];
        foreach ($data as $e):
            $total += $e['amount'];
            if (!isset($categories[$e['category']]))
                $categories[$e['category']] = 0;
            $categories[$e['category']] += $e['amount'];

            $date = isset($e['date']) ? $e['date'] : date('Y-m-d');
            $m = substr($date, 0, 7);

            if (!isset($monthlyTotal[$m]))
                $monthlyTotal[$m] = 0;
            $monthlyTotal[$m] += $e['amount'];
            ?>

            <tr>
                <td><?= $e['title'] ?></td>
                <td><?= $e['amount'] ?></td>
                <td><?= $e['category'] ?></td>
                <td><?= $date ?></td>
                <td>
                    <a href="edit_expense.php?id=<?= $e['id'] ?>" class="action-btn btn-edit">Edit</a>
                    <a href="delete_expense.php?id=<?= $e['id'] ?>" class="action-btn btn-delete">Delete</a>
                </td>
            </tr>

        <?php endforeach; ?>

    </table>

    <h3>Total expense: <?= $total ?> tk</h3>

    <?php if (!empty($monthlyTotal)): ?>
        <div class="box" style="margin-top: 20px;">
            <h3>Monthly Breakdown</h3>
            <ul>
                <?php foreach ($monthlyTotal as $m => $amt): ?>
                    <li><strong><?= $m ?></strong>: <?= $amt ?> tk</li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

</body>
<script src="assets/js/script.js"></script>
<script>
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const data = {
        labels: <?= json_encode(array_keys($categories)) ?>,
        datasets: [{
            label: 'Expenses by Category',
            data: <?= json_encode(array_values($categories)) ?>,
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
    };

    const config = {
        type: 'doughnut',
        data: data,
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
    };

    const myChart = new Chart(ctx, config);
</script>

</html>