import clientPromise from './_db.js';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

export const handler = async (event, context) => {
    console.log('Auth function called', event.httpMethod, event.queryStringParameters);
    try {
        const { action } = event.queryStringParameters || {};
        console.log('Action:', action);
        const client = await clientPromise;
        console.log('MongoDB connected');
        const db = client.db(process.env.DB_NAME || 'budget_tracker');
        const users = db.collection('users');

        if (event.httpMethod === 'POST') {
            let body;
            try {
                body = JSON.parse(event.body || '{}');
                console.log('Body parsed:', body);
            } catch (e) {
                console.log('JSON parse error:', e.message);
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Invalid JSON' })
                };
            }

            if (action === 'register') {
                console.log('Registering user:', body.email);
                try {
                    const { name, email, password } = body;
                    const existing = await users.findOne({ email });
                    console.log('Existing user:', !!existing);

                    if (existing) {
                        return {
                            statusCode: 400,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success: false, error: 'Email already exists' })
                        };
                    }

                    const hashedPassword = await bcrypt.hash(password, 10);
                    console.log('Password hashed');
                    await users.insertOne({
                        name,
                        email,
                        password: hashedPassword
                    });
                    console.log('User inserted');

                    return {
                        statusCode: 200,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ success: true })
                    };
                } catch (error) {
                    console.log('Registration error:', error.message);
                    return {
                        statusCode: 500,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ error: 'Registration failed: ' + error.message })
                    };
                }
            }
        }

        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Not found' })
        };
    } catch (error) {
        console.log('Handler error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Server error: ' + error.message })
        };
    }
};