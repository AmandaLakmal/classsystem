import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate(); // <-- INJECTED AT THE TOP OF THE COMPONENT
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed. Verify credentials and backend connection.');
      }

      const data = await response.json();
      
      console.log("Authentication Successful. Role:", data.role);
      
      // Store tokens with the 'zerostate_' prefix to match your state architecture
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      alert(`Access Granted. Welcome, ${data.role}. Redirecting to dashboard...`);
      
      // PUSH USER PAST THE ROUTE GUARD
      navigate('/admin/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col justify-center items-center p-4 font-sans text-[#CCCCCC]">
      
      {/* ZeroState Branding */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          {/* Slashed Zero ASCII Representation */}
          <div className="relative text-5xl font-mono text-white font-bold">
            0
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-1 bg-[#00FF00] rotate-45 transform"></div>
            </div>
          </div>
          <h1 className="text-3xl font-mono text-white tracking-[0.2em]">ZEROSTATE</h1>
        </div>
        <p className="text-sm font-mono text-[#00FF00] tracking-widest">SECURE PORTAL INITIALIZATION</p>
      </div>

      {/* Authentication Form */}
      <div className="w-full max-w-md bg-black/40 border border-gray-800 p-8 rounded-sm shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block">
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-400 p-3 text-xs font-mono uppercase tracking-wider mb-4">
                  [ SYSTEM_ERROR ] {error}
                </div>
              )}
              [ ID_CREDENTIAL ] // Email
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F1115] border border-gray-700 focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] text-white p-3 outline-none transition-colors font-mono text-sm"
              placeholder="admin@zerostatelabs.tech"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block">
              [ SEC_KEY ] // Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F1115] border border-gray-700 focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] text-white p-3 outline-none transition-colors font-mono text-sm"
              placeholder="••••••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-black font-bold font-mono tracking-widest p-4 transition-colors uppercase text-sm mt-4 ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#00FF00] hover:bg-[#00cc00]'}`}
          >
            {isLoading ? 'INITIALIZING PROTOCOL...' : 'Authenticate User'}
          </button>
          
        </form>
      </div>

      {/* Footer System Status */}
      <div className="mt-12 text-center text-[10px] font-mono text-gray-600 tracking-widest">
        <p>SYSTEM ARCHITECTURE BY ZEROSTATE LABS</p>
        <p>STATUS: AIR-GAPPED & AWAITING CONNECTION</p>
      </div>

    </div>
  );
}