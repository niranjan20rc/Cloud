// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb://localhost:27017/hostdb';
const BASE_DOMAIN = 'localhost';

mongoose.connect(MONGO_URI);
const Site = mongoose.model('Site', new mongoose.Schema({
  name: String,
  domain: String,
  created: { type: Date, default: Date.now }
}));

const upload = multer({ dest: path.join(__dirname, 'uploads') });
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Create site
app.post('/api/sites', async (req, res) => {
  const site = await Site.create({
    name: req.body.name,
    domain: `${req.body.name}.${BASE_DOMAIN}`
  });
  res.json(site);
});

// Deploy single HTML file (not ZIP)
app.post('/api/sites/:id/deploy', upload.single('index'), async (req, res) => {
  const site = await Site.findById(req.params.id);
  if (!site) return res.status(404).json({ error: 'Not found' });

  const destDir = path.join(__dirname, 'sites', site.name);
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });

  fs.renameSync(req.file.path, path.join(destDir, 'index.html'));
  res.json({ ok: true, url: `http://localhost:4000/sites/${site.name}/` });
});

// List sites
app.get('/api/sites', async (req, res) => {
  res.json(await Site.find().sort('-created'));
});

// Serve static HTML
app.use('/sites/:name', (req, res, next) => {
  const siteDir = path.join(__dirname, 'sites', req.params.name);
  express.static(siteDir)(req, res, next);
});

app.listen(4000, () => console.log('Server on port 4000'));
