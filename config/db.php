<?php

require 'vendor/autoload.php';

$client = new MongoDB\Client("mongodb://localhost:27017/?directConnection=true");
$db = $client ->budget_tracker;
$users = $db ->users;
$expenses = $db ->expenses;

session_start();

?>