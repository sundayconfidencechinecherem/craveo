// src/app/test-auth/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useLogin } from '@/app/hooks/useGraphQL';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function TestAuthPage() {
  const { login } = useLogin();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleLogin = async () => {
    try {
      const result = await login(identifier, password);
      const accessToken = result.data?.login?.accessToken;
      const refreshToken = result.data?.login?.refreshToken;

      if (accessToken && refreshToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setMessage('✅ Logged in and tokens stored');
      } else {
        setMessage('❌ Login failed: no tokens returned');
      }
    } catch (err: any) {
      setMessage(`❌ Login error: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('❌ Please select a file first');
      return;
    }
    try {
      const token = localStorage.getItem('token') || '';
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/upload/single`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`✅ Upload success: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      setMessage(`❌ Upload error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Test Auth & Upload</h1>

      <input
        type="text"
        placeholder="Email or Username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
      />

      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
        Login & Save Tokens
      </button>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 w-full"
      />

      <button onClick={handleUpload} className="bg-green-500 text-white px-4 py-2 rounded">
        Upload File (Authenticated)
      </button>

      <p className="mt-4">{message}</p>
    </div>
  );
}
