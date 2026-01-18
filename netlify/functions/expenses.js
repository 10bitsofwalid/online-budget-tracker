import clientPromise from './_db.js';
import { ObjectId } from 'mongodb';

export const handler = async (event, context) => {
    const cookies = event.headers.cookie || '';
    const sessionMatch = cookies.match(/session=([^;]+)/);

    if (!sessionMatch) {
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    let userId;
    try {
        const session = JSON.parse(decodeURIComponent(sessionMatch[1]));
        userId = session.user_id;
    } catch (e) {
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'budget_tracker');
    const expenses = db.collection('expenses');

    if (event.httpMethod === 'GET') {
        const { id } = event.queryStringParameters || {};
        if (id) {
            try {
                const expense = await expenses.findOne({ _id: new ObjectId(id), user_id: userId });
                if (expense) {
                    expense.id = expense._id.toString();
                    return {
                        statusCode: 200,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(expense)
                    };
                }
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Expense not found' })
                };
            } catch (e) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Invalid ID' })
                };
            }
        } else {
            const list = await expenses.find({ user_id: userId }).toArray();
            const formatted = list.map(e => ({ ...e, id: e._id.toString() }));
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formatted)
            };
        }
    }

    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const { title, amount, category, date } = body;
        if (!title || !amount || !category) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing fields' })
            };
        }

        const result = await expenses.insertOne({
            user_id: userId,
            title,
            amount: parseFloat(amount),
            category,
            date: date || new Date().toISOString().split('T')[0]
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, id: result.insertedId.toString() })
        };
    }

    if (event.httpMethod === 'PUT') {
        const { id } = event.queryStringParameters || {};
        if (!id) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing ID' })
            };
        }

        const body = JSON.parse(event.body || '{}');
        const { title, amount, category, date } = body;
        try {
            const result = await expenses.updateOne(
                { _id: new ObjectId(id), user_id: userId },
                { $set: { title, amount: parseFloat(amount), category, date } }
            );
            if (result.matchedCount === 0) {
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Not found' })
                };
            }
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
            };
        } catch (e) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid ID' })
            };
        }
    }

    if (event.httpMethod === 'DELETE') {
        const { id } = event.queryStringParameters || {};
        if (!id) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing ID' })
            };
        }

        try {
            const result = await expenses.deleteOne({ _id: new ObjectId(id), user_id: userId });
            if (result.deletedCount === 0) {
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Not found' })
                };
            }
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
            };
        } catch (e) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid ID' })
            };
        }
    }

    return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};