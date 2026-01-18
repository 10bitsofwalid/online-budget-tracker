import clientPromise from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const cookies = req.headers.cookie || '';
    const sessionMatch = cookies.match(/session=([^;]+)/);

    if (!sessionMatch) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let userId;
    try {
        const session = JSON.parse(decodeURIComponent(sessionMatch[1]));
        userId = session.user_id;
    } catch (e) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let client;
    try {
        client = await clientPromise;
    } catch (dbError) {
        console.error('Database connection failed in expenses.js:', dbError);
        return res.status(500).json({
            error: 'Database connection failed',
            message: dbError.message,
            tip: 'Check your MongoDB Atlas "Network Access" and ensure Vercel can connect.'
        });
    }
    const db = client.db(process.env.DB_NAME || 'budget_tracker');
    const expenses = db.collection('expenses');

    if (req.method === 'GET') {
        const { id } = req.query;
        if (id) {
            try {
                const expense = await expenses.findOne({ _id: new ObjectId(id), user_id: userId });
                if (expense) {
                    expense.id = expense._id.toString();
                    return res.status(200).json(expense);
                }
                return res.status(404).json({ error: 'Expense not found' });
            } catch (e) {
                return res.status(400).json({ error: 'Invalid ID' });
            }
        } else {
            const list = await expenses.find({ user_id: userId }).toArray();
            const formatted = list.map(e => ({ ...e, id: e._id.toString() }));
            return res.status(200).json(formatted);
        }
    }

    if (req.method === 'POST') {
        const { title, amount, category, date } = req.body;
        if (!title || !amount || !category) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const result = await expenses.insertOne({
            user_id: userId,
            title,
            amount: parseFloat(amount),
            category,
            date: date || new Date().toISOString().split('T')[0]
        });

        return res.status(200).json({ success: true, id: result.insertedId.toString() });
    }

    if (req.method === 'PUT') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing ID' });

        const { title, amount, category, date } = req.body;
        try {
            const result = await expenses.updateOne(
                { _id: new ObjectId(id), user_id: userId },
                { $set: { title, amount: parseFloat(amount), category, date } }
            );
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing ID' });

        try {
            const result = await expenses.deleteOne({ _id: new ObjectId(id), user_id: userId });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
