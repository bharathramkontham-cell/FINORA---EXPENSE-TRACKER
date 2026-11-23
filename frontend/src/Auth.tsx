
import { useState } from "react";
import {
  Wallet,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

type AuthProps = {
  onAuthSuccess: (
    user: { id: number; name: string; email: string },
    token: string
  ) => void;
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (isRegister && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";

      const response = await fetch(
        `${API_URL}/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(isRegister ? { name: name.trim() } : {}),
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Authentication failed."
        );
      }

      if (!result.token || !result.user) {
        throw new Error("Invalid server response.");
      }

      onAuthSuccess(result.user, result.token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="finora-auth">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .finora-auth {
          min-height: 100vh;
          background: #080d17;
          color: #f5f7fb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px 20px;
          font-family: 'DM Sans', sans-serif;
        }

        .auth-layout {
          width: 100%;
          max-width: 1080px;
          min-height: 650px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #101827;
          border: 1px solid #263448;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 90px rgba(0,0,0,.35);
        }

        .auth-brand {
          padding: 48px;
          background:
            radial-gradient(circle at 15% 15%, rgba(35,190,130,.19), transparent 40%),
            linear-gradient(145deg, #102b2b, #101827 70%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Manrope', sans-serif;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .auth-logo-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          background: #13a879;
          border-radius: 13px;
          color: white;
        }

        .auth-brand-content h1 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(34px, 4vw, 48px);
          line-height: 1.2;
          margin: 0 0 20px;
        }

        .auth-brand-content h1 span {
          color: #36d69a;
        }

        .auth-brand-content p {
          color: #a6b4c4;
          font-size: 15px;
          line-height: 1.8;
          max-width: 390px;
        }

        .auth-feature {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 23px;
          color: #d4e1e8;
          font-size: 14px;
        }

        .auth-feature-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: rgba(54,214,154,.12);
          color: #36d69a;
        }

        .auth-brand-footer {
          color: #8495a8;
          font-size: 12px;
        }

        .auth-form-side {
          padding: 55px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-form-side h2 {
          font-family: 'Manrope', sans-serif;
          font-size: 30px;
          margin: 0 0 9px;
        }

        .auth-subtitle {
          color: #91a0b3;
          font-size: 14px;
          margin-bottom: 32px;
        }

        .auth-field {
          margin-bottom: 19px;
        }

        .auth-field label {
          display: block;
          font-size: 13px;
          color: #c5cfdb;
          margin-bottom: 9px;
          font-weight: 600;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #8191a5;
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          height: 51px;
          border: 1px solid #2b3a4e;
          border-radius: 11px;
          background: #0b1320;
          color: white;
          padding: 0 45px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: .2s;
        }

        .auth-input:focus {
          border-color: #20bd87;
          box-shadow: 0 0 0 3px rgba(32,189,135,.12);
        }

        .auth-input::placeholder {
          color: #63748a;
        }

        .auth-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #8191a5;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .auth-submit {
          width: 100%;
          height: 52px;
          border: none;
          border-radius: 11px;
          background: linear-gradient(100deg, #12a875, #25c992);
          color: #04150e;
          font-size: 15px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          margin-top: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: .2s;
        }

        .auth-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 9px 25px rgba(25,190,130,.2);
        }

        .auth-submit:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-error {
          color: #ff9292;
          background: rgba(255,80,80,.09);
          border: 1px solid rgba(255,80,80,.22);
          border-radius: 9px;
          padding: 12px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .auth-switch {
          text-align: center;
          color: #91a0b3;
          font-size: 13px;
          margin-top: 25px;
        }

        .auth-switch button {
          background: none;
          border: none;
          color: #39d49b;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
        }

        .auth-security {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          color: #71849a;
          font-size: 12px;
          margin-top: 30px;
        }

        @media(max-width: 760px) {
          .auth-layout {
            grid-template-columns: 1fr;
            max-width: 470px;
          }
          .auth-brand {
            padding: 27px;
            gap: 35px;
          }
          .auth-brand-content h1 {
            font-size: 32px;
          }
          .auth-brand-footer {
            display: none;
          }
          .auth-form-side {
            padding: 35px 27px;
          }
        }
      `}</style>

      <div className="auth-layout">
        <section className="auth-brand">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Wallet size={24} />
            </div>
            FINORA
          </div>

          <div className="auth-brand-content">
            <h1>
              Take control.
              <br />
              Build your <span>wealth.</span>
            </h1>

            <p>
              Your money deserves smarter management.
              Track expenses, understand your habits
              and make better financial decisions with FINORA.
            </p>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <TrendingUp size={19} />
              </div>
              Smart financial insights
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <Sparkles size={19} />
              </div>
              Intelligent expense tracking
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <ShieldCheck size={19} />
              </div>
              Secure account authentication
            </div>
          </div>

          <div className="auth-brand-footer">
            © 2026 FINORA. Your finances, your future.
          </div>
        </section>

        <section className="auth-form-side">
          <h2>
            {isRegister ? "Create account" : "Welcome back"}
          </h2>

          <p className="auth-subtitle">
            {isRegister
              ? "Start your smarter financial journey today."
              : "Sign in to continue to your financial dashboard."}
          </p>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="auth-field">
                <label>Full name</label>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" size={18} />
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" size={18} />
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" size={18} />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                />

                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister
              ? "Already have an account? "
              : "Don't have an account? "}

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setPassword("");
              }}
            >
              {isRegister ? "Sign in" : "Create account"}
            </button>
          </div>

          <div className="auth-security">
            <ShieldCheck size={15} />
            Secure authentication powered by FINORA
          </div>
        </section>
      </div>
    </div>
  );
}
