<?php
require_once __DIR__ . '/../vendor/autoload.php';

// REPLACE THIS WITH YOUR ACTUAL MONGODB CONNECTION STRING
if (!defined('MONGO_URI')) {
    define('MONGO_URI', 'mongodb+srv://budgettracker:budgettracker435@cluster0.4rkxsl8.mongodb.net/');
}

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

function getClient()
{
    static $client = null;
    if ($client === null) {
        $client = new Client(MONGO_URI);
    }
    return $client;
}

function getDB()
{
    return getClient()->budget_tracker;
}

function getUsersCollection()
{
    return getDB()->users;
}

function getExpensesCollection()
{
    return getDB()->expenses;
}

// User Functions

function getUsers()
{
    // For compatibility, though typically we don't fetch ALL users in a real app
    return getUsersCollection()->find()->toArray();
}

function findUserByEmail($email)
{
    // Returns array or null
    return getUsersCollection()->findOne(['email' => $email]);
}

function createUser($userData)
{
    // userData should include keys like 'name', 'email', 'password'
    // 'id' will be the MongoDB _id (ObjectId), BUT for compatibility with existing code which might expect an ID, we can use the ObjectId string.

    // We don't strictly need numerical IDs anymore.
    $result = getUsersCollection()->insertOne($userData);
    return $result->getInsertedId();
}


// Expense Functions

function getExpenses($userId = null)
{
    $filter = [];
    if ($userId) {
        $filter['user_id'] = $userId;
    }
    // Return standard array of arrays (BSONDocument -> Array)
    $cursor = getExpensesCollection()->find($filter);
    $results = [];
    foreach ($cursor as $document) {
        $doc = (array) $document;
        // Convert ObjectId to string for 'id' to maintain frontend compatibility
        $doc['id'] = (string) $doc['_id'];
        $results[] = $doc;
    }
    return $results;
}

function getExpense($id)
{
    try {
        $objectId = new ObjectId($id);
        $doc = getExpensesCollection()->findOne(['_id' => $objectId]);
        if ($doc) {
            $doc = (array) $doc;
            $doc['id'] = (string) $doc['_id'];
            return $doc;
        }
    } catch (Exception $e) {
        // invalid ID format
    }
    return null;
}

function addExpense($expenseData)
{
    $result = getExpensesCollection()->insertOne($expenseData);
    return $result->getInsertedId();
}

function updateExpense($id, $data)
{
    try {
        $objectId = new ObjectId($id);
        getExpensesCollection()->updateOne(
            ['_id' => $objectId],
            ['$set' => $data]
        );
    } catch (Exception $e) {
        return false;
    }
    return true;
}

function deleteExpense($id)
{
    try {
        $objectId = new ObjectId($id);
        getExpensesCollection()->deleteOne(['_id' => $objectId]);
    } catch (Exception $e) {
        return false;
    }
    return true;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
