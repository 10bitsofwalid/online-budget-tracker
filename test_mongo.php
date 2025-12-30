<?php

require 'vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/?directConnection=true");
    $db = $client->test;
    $collection = $db->test_collection;
    
    // Insert a document
    $result = $collection->insertOne(['name' => 'test', 'value' => 1]);
    echo "Inserted document with ID: " . $result->getInsertedId() . "\n";
    
    // Find documents
    $documents = $collection->find();
    foreach ($documents as $document) {
        echo "Found document: " . json_encode($document) . "\n";
    }
    
    echo "MongoDB connection successful!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

?>