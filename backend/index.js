const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

let sites = []; // In-memory site storage

// Get all sites
app.get('/api/sites', (req, res) => {
  res.json(sites);
});

// Create a new site
app.post('/api/sites', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  if (sites.find(s => s.name === name)) {
    return res.status(400).json({ error: 'Site name already exists' });
  }

  const id = Date.now().toString();
  sites.push({ _id: id, name, domain: name });
  res.json({ _id: id, name, domain: name });
});

// Multer storage config for uploading index.html under site folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const siteDir = path.join(uploadDir, req.params.id);
    if (!fs.existsSync(siteDir)) fs.mkdirSync(siteDir, { recursive: true });
    cb(null, siteDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'index.html'); // save as index.html
  },
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === '.html') cb(null, true);
  else cb(new Error('Only HTML files allowed'));
};

const upload = multer({ storage, fileFilter });

// Deploy HTML file
app.post('/api/sites/:id/deploy', upload.single('index'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No HTML file uploaded' });
  res.json({ message: 'Deploy complete' });
});

// Delete site and uploaded files
app.delete('/api/sites/:id', (req, res) => {
  const id = req.params.id;
  const siteIndex = sites.findIndex(s => s._id === id);
  if (siteIndex === -1) return res.status(404).json({ error: 'Site not found' });

  // Remove site from array
  sites.splice(siteIndex, 1);

  // Delete uploaded files folder if exists
  const siteDir = path.join(uploadDir, id);
  if (fs.existsSync(siteDir)) {
    fs.rmSync(siteDir, { recursive: true, force: true });
  }

  res.json({ message: 'Site deleted' });
});

// Serve uploaded sites statically
app.use('/sites', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
