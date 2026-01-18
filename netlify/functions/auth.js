import clientPromise from '../api/_db.js';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

export const handler = async (event, context) => {
    const { action } = event.queryStringParameters || {};
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'budget_tracker');
    const users = db.collection('users');

    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body || '{}');

        if (action === 'login') {
            const { email, password } = body;
            const user = await users.findOne({ email });

            if (user && await bcrypt.compare(password, user.password)) {
                const sessionData = JSON.stringify({
                    user_id: user._id.toString(),
                    name: user.name
                });

                const cookie = serialize('session', sessionData, {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                });

                return {
                    statusCode: 200,
                    headers: {
                        'Set-Cookie': cookie,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ success: true })
                };
            }
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: false, error: 'Invalid credentials' })
            };
        }

        if (action === 'register') {
            const { name, email, password } = body;
            const existing = await users.findOne({ email });

            if (existing) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: false, error: 'Email already exists' })
                };
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await users.insertOne({
                name,
                email,
                password: hashedPassword
            });

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
            };
        }

        if (action === 'logout') {
            const cookie = serialize('session', '', {
                path: '/',
                maxAge: -1
            });

            return {
                statusCode: 200,
                headers: {
                    'Set-Cookie': cookie,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ success: true })
            };
        }
    }

    if (event.httpMethod === 'GET') {
        if (action === 'check') {
            const cookies = event.headers.cookie || '';
            const sessionMatch = cookies.match(/session=([^;]+)/);

            if (sessionMatch) {
                try {
                    const session = JSON.parse(decodeURIComponent(sessionMatch[1]));
                    return {
                        statusCode: 200,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            loggedIn: true,
                            user: {
                                id: session.user_id,
                                name: session.name
                            }
                        })
                    };
                } catch (e) {
                    return {
                        statusCode: 200,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ loggedIn: false })
                    };
                }
            }
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loggedIn: false })
            };
        }
    }

    return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Not found' })
    };
};