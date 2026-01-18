import clientPromise from './_db.js';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

export default async function handler(req, res) {
    const { action } = req.query;
    let client;
    try {
        client = await clientPromise;
    } catch (dbError) {
        return res.status(500).json({
            error: 'Connection failed'
        });
    }
    const db = client.db(process.env.DB_NAME || 'budget_tracker');
    const users = db.collection('users');

    if (req.method === 'POST') {
        const body = req.body;

        if (action === 'login') {
            const { email, password } = body;
            const user = await users.findOne({ email });

            if (user && await bcrypt.compare(password, user.password)) {
                const sessionData = JSON.stringify({
                    user_id: user._id.toString(),
                    name: user.name
                });

                res.setHeader('Set-Cookie', serialize('session', sessionData, {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7
                }));

                return res.status(200).json({ success: true });
            }
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (action === 'register') {
            const { name, email, password } = body;
            const existing = await users.findOne({ email });

            if (existing) {
                return res.status(400).json({ success: false, error: 'Email exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await users.insertOne({
                name,
                email,
                password: hashedPassword
            });

            return res.status(200).json({ success: true });
        }

        if (action === 'logout') {
            res.setHeader('Set-Cookie', serialize('session', '', {
                path: '/',
                maxAge: -1
            }));
            return res.status(200).json({ success: true });
        }
    }

    if (req.method === 'GET') {
        if (action === 'check') {
            const cookies = req.headers.cookie || '';
            const sessionMatch = cookies.match(/session=([^;]+)/);

            if (sessionMatch) {
                try {
                    const session = JSON.parse(decodeURIComponent(sessionMatch[1]));
                    return res.status(200).json({
                        loggedIn: true,
                        user: {
                            id: session.user_id,
                            name: session.name
                        }
                    });
                } catch (e) {
                    return res.status(200).json({ loggedIn: false });
                }
            }
            return res.status(200).json({ loggedIn: false });
        }
    }

    return res.status(404).json({ error: 'Not found' });
}
