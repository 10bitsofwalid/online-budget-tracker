<?php
include 'config/db.php';
if (!isset($_SESSION['user_id']))
    header("Location: login.php");

$expense = null;
if (isset($_GET['id'])) {
    $expense = getExpense($_GET['id']);
    if (!$expense || $expense['user_id'] != $_SESSION['user_id']) {
        header("Location: dashboard.php");
        exit;
    }
} else {
    header("Location: dashboard.php");
    exit;
}

if ($_POST) {
    $updateData = [
        'title' => $_POST['title'],
        'amount' => (float) $_POST['amount'],
        'category' => $_POST['category']
    ];
    updateExpense($_GET['id'], $updateData);
    header("Location: dashboard.php");
    exit;
}
?>

<!DOCTYPE html>
<html>

<head>
    <title>Edit Expense</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body>
    <h2>Edit Expense</h2>

    <form method="post">
        <input type="text" name="title" placeholder="Expense title" value="<?= $expense['title'] ?>" required>
        <input type="number" name="amount" placeholder="Amount" step="0.01" value="<?= $expense['amount'] ?>" required>
        <select name="category">
            <option <?= $expense['category'] == 'Food' ? 'selected' : '' ?>>Food</option>
            <option <?= $expense['category'] == 'Transport' ? 'selected' : '' ?>>Transport</option>
            <option <?= $expense['category'] == 'Shopping' ? 'selected' : '' ?>>Shopping</option>
            <option <?= $expense['category'] == 'Others' ? 'selected' : '' ?>>Others</option>
        </select>
        <button>Update</button>
        <a href="dashboard.php" class="nav-button"
            style="display:block; margin-top:10px; background-color: #6b7280; color:white;">Cancel</a>
    </form>

</body>
<script src="assets/js/script.js"></script>

</html>