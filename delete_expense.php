<?php
include 'config/db.php';
if (!isset($_SESSION['user_id']))
    header("Location: login.php");

if (isset($_GET['id'])) {
    $expense = getExpense($_GET['id']);
    if ($expense && $expense['user_id'] == $_SESSION['user_id']) {
        deleteExpense($_GET['id']);
    }
}

header("Location: dashboard.php");
?>