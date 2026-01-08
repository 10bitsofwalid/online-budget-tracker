<?php 

include 'config/db.php';

$expenses->insertOne([
    "user_id" => $_SESSION['user_id'],
    "title" => $_POST['title'],
    "amount" => (int)$_POST['amount'],
    "category" => $_POST['category'],
    "date" => date("Y-m-d")
]);

header("Location: dashboard.php");

?>