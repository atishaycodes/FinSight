import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { extractApiError } from "../utils/index.js";
import { Spinner } from "../components/ui/index.jsx";

export default function LoginPage() {
  const { login }    = useAuth();
  const toast        = useToast();
  const navigate     = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required"); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Minimal header */}
      <header className="bg-ink h-[54px] flex items-center px-8">
        <span className="font-serif text-[19px] font-semibold text-cream">
          Fin<em className="not-italic font-normal">sight</em>
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="bg-white border border-border rounded-[4px] w-full max-w-[390px] p-10 shadow-sm">
          <div className="font-serif text-[24px] font-semibold text-ink text-center mb-1">
            Fin<em className="not-italic font-normal">sight</em>
          </div>
          <p className="text-[12px] text-ink-3 text-center mb-6">
            Personal finance, clearly.
          </p>

          {/* Database & Auth badge */}
          <div className="flex items-center gap-2 bg-fgreen-bg border border-fgreen-bd
                          rounded-[3px] px-3 py-2 text-[11px] text-fgreen mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-fgreen flex-shrink-0" />
            SQLite · Prisma ORM · JWT Auth
          </div>

          {error && (
            <div className="bg-fred-bg border border-fred-bd text-fred text-[12px]
                            rounded-[3px] px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="text-[12px] text-fblue hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <Spinner size={14} /> : "Sign in →"}
            </button>
          </form>

          <div className="flex items-center gap-2 my-4 text-ink-4 text-[11px]">
            <div className="flex-1 h-px bg-border" />
            or
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={() => toast.info("Google OAuth is configured for production deployments.")}
            className="btn-ghost w-full justify-center gap-2 flex items-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-[12px] text-ink-3 mt-5">
            No account?{" "}
            <Link to="/register" className="text-ink underline font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
