'use client';

import { useState } from 'react';

export default function Home() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Hibás jelszó!');
    }
  };

  const handleUpload = async () => {
    if (!files) return;

    setUploading(true);
    const totalFiles = files.length;
    let uploaded = 0;

    for (const file of Array.from(files)) {
      try {
        // Get presigned URL
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NEXT_PUBLIC_PASSWORD || '',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        });

        const data = await response.json();

        // Upload to S3
        await fetch(data.url, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        uploaded++;
        setProgress(Math.round((uploaded / totalFiles) * 100));
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    setProgress(0);
    setFiles(null);
    alert('Feltöltés kész!');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <form onSubmit={handleLogin} style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: '300px'
        }}>
          <h1 style={{ marginTop: 0, fontSize: '1.5rem', textAlign: 'center' }}>
            Hiradó
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
            Add meg a jelszót a folytatáshoz
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Jelszó"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              marginBottom: '1rem',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Belépés
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Fotók és videók feltöltése</h1>
        <a
          href="/gallery"
          style={{
            padding: '0.5rem 1rem',
            background: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Galéria
        </a>
      </div>

      <div style={{
        border: '2px dashed #ddd',
        borderRadius: '8px',
        padding: '3rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => setFiles(e.target.files)}
          style={{ marginBottom: '1rem' }}
        />
        
        {files && (
          <p>{files.length} fájl kiválasztva</p>
        )}

        {uploading && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#f0f0f0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#0070f3',
                transition: 'width 0.3s'
              }} />
            </div>
            <p>{progress}%</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!files || uploading}
          style={{
            padding: '0.75rem 2rem',
            background: files && !uploading ? '#0070f3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: files && !uploading ? 'pointer' : 'not-allowed',
            marginTop: '1rem'
          }}
        >
          {uploading ? 'Feltöltés...' : 'Feltöltés'}
        </button>
      </div>
    </div>
  );
}
