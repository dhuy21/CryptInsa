const express = require('express');
const { engine } = require('express-handlebars');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 8000;
const apiInternalUrl = process.env.API_INTERNAL_URL || 'http://127.0.0.1:5000';

//Set up morgan
app.use(morgan('combined'));

// Proxy API calls to Flask backend
app.use('/api', createProxyMiddleware({
    target: apiInternalUrl,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding to Flask
    },
    timeout: 30000, // 30 secondes timeout
    proxyTimeout: 30000,
    retry: true,
    onError: (err, req, res) => {
        console.error(`[${new Date().toISOString()}] Proxy error for ${req.url}:`, err.message);
        if (!res.headersSent) {
            res.status(503).json({ 
                error: 'Backend service temporarily unavailable', 
                message: 'Flask backend is starting up, please try again in a few seconds',
                timestamp: new Date().toISOString()
            });
        }
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[${new Date().toISOString()}] Proxying: ${req.method} ${req.url} -> ${apiInternalUrl}${req.url.replace('/api', '')}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[${new Date().toISOString()}] Proxy response: ${proxyRes.statusCode} for ${req.url}`);
    }
}));

//Set up handlebars
app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

// Serve static files
app.use(express.static('public'));

// Route de test pour vérifier la connexion avec Flask
app.get('/test-backend', async (req, res) => {
    try {
        const response = await fetch(`${apiInternalUrl}/health`);
        const data = await response.json();
        res.json({
            status: 'success',
            backend: data,
            message: 'Backend Flask is accessible'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Backend Flask is not accessible',
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.render('home', { title: 'CryptoAnalyzer - Analyse de Fréquence' });
});
app.get('/test', (req, res) => {
    res.render('test', { title: 'Test' });
});
app.get('/cesar', (req, res) => {
    res.render('cesar', { title: 'Illustration du chiffrement de César' });
});
app.get('/vigenere', (req, res) => {
    res.render('vigenere', { title: 'Illustration du chiffrement de Vigenère' });
});
app.get('/substitution', (req, res) => {
    res.render('substitution', { title: 'Illustration du chiffrement par substitution' });
});
app.get('/about_us', (req, res) => {
    res.render('about_us', { title: 'A propos de nous' });
});
app.get('/substitution_attaque', (req, res) => {
    res.render('substitution_attaque', { title: 'Attaque par substitution' });
});
app.get('/substitution_annalyse', (req, res) => {
    res.render('substitution_annalyse', { title: 'Analyse de fréquence' });
});
app.get('/substitution_dechiffre', (req, res) => {
    res.render('substitution_dechiffre', { title: 'Déchiffrement par substitution' });
});
app.get('/help', (req, res) => {
    res.render('help', { 
        title: 'Aide - CryptInsa',
        pageCSS: 'help',
        pageJS: 'help'
    });
});
//Start the server: Use commande "node app.js" to start the server. "npm run dev" to start the server with debug mode.
const server = app.listen(port, () => {
    console.log(`App listening at http://127.0.0.1:${port}`);
  });