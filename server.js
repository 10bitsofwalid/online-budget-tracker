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
    const fileName = req.params.file;
    const filePath = path.join(__dirname, 'api', `${fileName}.js`);

    try {
        const module = await import(`./api/${fileName}.js`);
        const handler = module.default;
        if (typeof handler === 'function') {
            await handler(req, res);
        } else {
            res.status(500).json({ error: `API handler in ${fileName}.js not found or not a function` });
        }
    } catch (error) {
        console.error(`Error handling API request for ${fileName}:`, error);
        res.status(500).json({
            error: 'API execution failed',
            message: error.message,
            tip: 'If this is on Vercel, make sure you have set your MONGO_URI in Environment Variables.'
        });
    }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`\n> Local server running at http://localhost:${port}`);
        console.log(`> Please stop your PHP server and use this instead.\n`);
    });
}

export default app;
