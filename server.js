import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.all('/api/:file', async (req, res) => {
    if (process.env.VERCEL) {
        return res.status(404).json({ error: 'Not found' });
    }
    const fileName = req.params.file;

    try {
        const module = await import(`./api/${fileName}.js`);
        const handler = module.default;
        if (typeof handler === 'function') {
            await handler(req, res);
        } else {
            res.status(500).json({ error: 'Handler error' });
        }
    } catch (error) {
        res.status(500).json({
            error: 'Execution failed'
        });
    }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`> Server: http://localhost:${port}`);
    });
}

export default app;
