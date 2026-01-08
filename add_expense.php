<?php 

include 'config/db.php';
if(!isset($_SESSION['user_id'])) header("Location: login.php");

$expenses = getExpenses();
$newExpense = [
    'id' => count($expenses) + 1,
    'user_id' => $_SESSION['user_id'],
    'title' => $_POST['title'],
    'amount' => (float)$_POST['amount'],
    'category' => $_POST['category'],
    'date' => date("Y-m-d")
];
$expenses[] = $newExpense;
saveExpenses($expenses);

header("Location: dashboard.php");

?>