import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
console.log('Connecting to MongoDB...');
if (!uri) {
    console.error('MONGO_URI is missing from environment variables!');
    throw new Error('Please add your Mongo URI to Vercel Environment Variables');
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
    // Adding serverSelectionTimeoutMS to help detect connection issues faster on Vercel
    client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    });
    clientPromise = client.connect().catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
    });
}

export default clientPromise;

