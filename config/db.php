<?php

// Use JSON file storage instead of database
$usersFile = __DIR__ . '/../data/users.json';
$expensesFile = __DIR__ . '/../data/expenses.json';

// Ensure data directory exists
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}

// Helper functions
function getUsers() {
    global $usersFile;
    if (file_exists($usersFile)) {
        return json_decode(file_get_contents($usersFile), true) ?: [];
    }
    return [];
}

function saveUsers($users) {
    global $usersFile;
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
}

function getExpenses() {
    global $expensesFile;
    if (file_exists($expensesFile)) {
        return json_decode(file_get_contents($expensesFile), true) ?: [];
    }
    return [];
}

function saveExpenses($expenses) {
    global $expensesFile;
    file_put_contents($expensesFile, json_encode($expenses, JSON_PRETTY_PRINT));
}

session_start();

?>