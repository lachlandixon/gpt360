import React, { useState, useEffect } from 'react';

const API = 'http://localhost:4000/api'; // Change this to your backend URL when deployed

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [deployUrl, setDeployUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/status`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setLoggedIn(data.loggedIn));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        setLoggedIn(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    setLoggedIn(false);
    setUploaded(false);
    setDeployUrl('');
    setImage(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    try {
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        setUploaded(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleDeploy = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/deploy`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setDeployUrl(`${API.replace('/api','')}${data.url}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Deploy failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
            required
          />
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '100px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>360 Image Admin Portal</h2>
      <button onClick={handleLogout} style={{ float: 'right', marginTop: -40 }}>Logout</button>
      <form onSubmit={handleUpload} style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
          required
        />
        <button type="submit" disabled={loading || !image} style={{ marginLeft: 10 }}>
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
      <button
        onClick={handleDeploy}
        disabled={!uploaded || loading}
        style={{ width: '100%', marginBottom: 20 }}
      >
        {loading ? 'Deploying...' : 'Deploy & Get Live URL'}
      </button>
      {deployUrl && (
        <div style={{ marginTop: 20 }}>
          <b>Live URL:</b> <a href={deployUrl} target="_blank" rel="noopener noreferrer">{deployUrl}</a>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
}

export default App;
