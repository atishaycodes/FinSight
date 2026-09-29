import { useState } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "../components/ui/index.jsx";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate reset link dispatch
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
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
            Reset password
          </div>
          <p className="text-[12px] text-ink-3 text-center mb-6">
            Enter your email to receive password reset instructions.
          </p>

          {submitted ? (
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-fgreen-bg border border-fgreen-bd flex items-center justify-center mx-auto mb-3 text-fgreen text-[20px]">
                <i className="ti-check" />
              </div>
              <h3 className="font-serif text-[16px] font-semibold text-ink mb-1">
                Check your inbox
              </h3>
              <p className="text-[12px] text-ink-3 mb-6">
                If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">
                Return to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Email address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-1"
              >
                {loading ? <Spinner size={14} /> : "Send instructions →"}
              </button>

              <p className="text-center text-[12px] text-ink-3 mt-3">
                Remember your password?{" "}
                <Link to="/login" className="text-ink underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
