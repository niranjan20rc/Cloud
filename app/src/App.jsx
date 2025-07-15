// App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';

export default function App() {
  const [name, setName] = useState('');
  const [sites, setSites] = useState([]);

  useEffect(() => {
    axios.get(`${API}/sites`).then(res => setSites(res.data));
  }, []);

  const create = async () => {
    await axios.post(`${API}/sites`, { name });
    setName('');
    setSites((await axios.get(`${API}/sites`)).data);
  };

  const deploy = async (id, file) => {
    const fd = new FormData();
    fd.append('index', file);
    await axios.post(`${API}/sites/${id}/deploy`, fd);
    alert('Deploy complete');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>HTML Host (Pure MERN)</h1>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Site Name" />
      <button onClick={create} disabled={!name}>Create</button>
      <ul>
        {sites.map(s => (
          <li key={s._id}>
            <a href={`http://localhost:4000/sites/${s.name}/`} target="_blank" rel="noopener noreferrer">
              {s.domain}
            </a>
            <input type="file" accept=".html" onChange={e => deploy(s._id, e.target.files[0])}/>
          </li>
        ))}
      </ul>
    </div>
  );
}
