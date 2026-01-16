<?php
require_once __DIR__ . '/../vendor/autoload.php';

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

function getUsers()
{
    return getUsersCollection()->find()->toArray();
}

function findUserByEmail($email)
{
    return getUsersCollection()->findOne(['email' => $email]);
}

function createUser($userData)
{
    $result = getUsersCollection()->insertOne($userData);
    return $result->getInsertedId();
}

function getExpenses($userId = null)
{
    $filter = [];
    if ($userId) {
        $filter['user_id'] = $userId;
    }
    $cursor = getExpensesCollection()->find($filter);
    $results = [];
    foreach ($cursor as $document) {
        $doc = (array) $document;
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
