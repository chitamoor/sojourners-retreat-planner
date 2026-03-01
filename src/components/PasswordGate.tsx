import { useState, type FormEvent } from 'react';

interface Props {
  onUnlock: () => void;
}

const EXPECTED_USER = import.meta.env.VITE_APP_USERNAME ?? '';
const EXPECTED_PASS = import.meta.env.VITE_APP_PASSWORD ?? '';

export default function PasswordGate({ onUnlock }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (username === EXPECTED_USER && password === EXPECTED_PASS) {
      setError(false);
      localStorage.setItem('retreat_auth', '1');
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Sojourners Retreat</h1>
          <p className="text-sm text-slate-500 mt-1">Pricing Planner · Oct 9–11, 2026</p>
        </div>

        {/* Card */}
        <div
          className={`bg-white rounded-2xl shadow-md border border-slate-200 p-8 transition-transform ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
          style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
        >
          <h2 className="text-base font-semibold text-slate-700 mb-5">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(false); }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`}
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`}
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium">
                Incorrect username or password. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm mt-1"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Contact your retreat coordinator for access credentials.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
