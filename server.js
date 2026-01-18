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
        const module = await import(`file://${filePath}`);
        const handler = module.default;
        if (typeof handler === 'function') {
            await handler(req, res);
        } else {
            res.status(500).json({ error: 'API handler not found or not a function' });
        }
    } catch (error) {
        console.error(`Error loading API handler ${fileName}:`, error);
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

app.listen(port, () => {
    console.log(`\n> Local server running at http://localhost:${port}`);
    console.log(`> Please stop your PHP server and use this instead.\n`);
});
