import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./App.css"
const API = 'http://localhost:4000/api';

export default function App() {
  const [name, setName] = useState('');
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await axios.get(`${API}/sites`);
      setSites(res.data);
    } catch {
      alert('Failed to load sites');
    }
  };

  const create = async () => {
    try {
      await axios.post(`${API}/sites`, { name });
      setName('');
      fetchSites();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create site');
    }
  };

  const deploy = async (id, file) => {
    if (!file) return;

    const fd = new FormData();
    fd.append('index', file);

    try {
      await axios.post(`${API}/sites/${id}/deploy`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Deploy complete');
    } catch (err) {
      alert(err.response?.data?.error || 'Deploy failed');
    }
  };

  const deleteSite = async (id, name) => {
    if (!window.confirm(`Delete site "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/sites/${id}`);
      alert('Site deleted');
      fetchSites();
    } catch {
      alert('Failed to delete site');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>HTML Hosting</h1>
      <p>Your HTML file must be named <code>index.html</code>.</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Site Name"
        style={{ marginRight: 10 }}
      />
      <button onClick={create} disabled={!name.trim()}>
        Create
      </button>

      <h2>Your Hosted Websites</h2>
      <ul>
        {sites.map(s => (
          <li key={s._id} style={{ marginBottom: 10 }}>
            <button
              onClick={() =>
                window.open(`http://localhost:4000/sites/${s._id}/index.html`, '_blank')
              }
              style={{ marginRight: 10 }}
            >
              View
            </button>
            <a
              href={`http://localhost:4000/sites/${s._id}/index.html`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: 10 }}
            >
              {s.domain}
            </a>
            <input
              type="file"
              accept=".html"
              onChange={e => deploy(s._id, e.target.files[0])}
              title="Upload index.html"
              style={{ marginRight: 10 }}
            />
            <button onClick={() => deleteSite(s._id, s.name)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
