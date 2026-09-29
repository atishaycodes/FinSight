import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { extractApiError } from "../utils/index.js";
import { Spinner } from "../components/ui/index.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("All fields are required"); return; }
    if (password.length < 8)          { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm)         { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-ink h-[54px] flex items-center px-8">
        <span className="font-serif text-[19px] font-semibold text-cream">
          Fin<em className="not-italic font-normal">sight</em>
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="bg-white border border-border rounded-[4px] w-full max-w-[390px] p-10 shadow-sm">
          <div className="font-serif text-[22px] font-semibold text-ink text-center mb-1">
            Create your account
          </div>
          <p className="text-[12px] text-ink-3 text-center mb-6">
            Free forever. No credit card needed.
          </p>

          {error && (
            <div className="bg-fred-bg border border-fred-bd text-fred text-[12px]
                            rounded-[3px] px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" placeholder="e.g. Alex Johnson"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min. 8 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input className="input" type="password" placeholder="Repeat password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-1"
            >
              {loading ? <Spinner size={14} /> : "Create account →"}
            </button>
          </form>

          <p className="text-center text-[12px] text-ink-3 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-ink underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
