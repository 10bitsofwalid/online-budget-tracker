import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
if (!uri) {
    throw new Error('MONGO_URI missing');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    });
    clientPromise = client.connect();
}

export default clientPromise;

