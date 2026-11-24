
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
  Zap,
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

        .finora-auth,
        .finora-auth * {
          box-sizing: border-box;
        }

        .finora-auth {
          min-height: 100vh;
          width: 100%;
          position: relative;
          isolation: isolate;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 8% 10%, rgba(119, 91, 255, .22), transparent 38%),
            radial-gradient(ellipse at 90% 90%, rgba(43, 203, 203, .15), transparent 36%),
            linear-gradient(135deg, #080d1b 0%, #10152b 52%, #091522 100%);
          color: #f2f5ff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 38px 22px;
          font-family: 'DM Sans', sans-serif;
        }

        .finora-auth::before,
        .finora-auth::after {
          content: "";
          position: absolute;
          z-index: -1;
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
        }

        .finora-auth::before {
          width: 340px;
          height: 340px;
          top: -170px;
          right: 7%;
          background: radial-gradient(circle, rgba(126, 99, 255, .17), transparent 70%);
        }

        .finora-auth::after {
          width: 390px;
          height: 390px;
          bottom: -220px;
          left: 5%;
          background: radial-gradient(circle, rgba(40, 212, 188, .14), transparent 70%);
        }

        .auth-layout {
          width: 100%;
          max-width: 1120px;
          min-height: 680px;
          display: grid;
          grid-template-columns: 1.03fr .97fr;
          background: rgba(15, 24, 45, .88);
          border: 1px solid rgba(164, 174, 255, .18);
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 35px 100px rgba(0, 0, 0, .42),
            0 0 80px rgba(112, 96, 255, .08),
            inset 0 1px 0 rgba(255, 255, 255, .06);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          animation: authAppear .6s ease both;
        }

        @keyframes authAppear {
          from {
            opacity: 0;
            transform: translateY(14px) scale(.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .auth-brand {
          position: relative;
          overflow: hidden;
          padding: 49px 48px;
          background:
            radial-gradient(circle at 15% 12%, rgba(153, 124, 255, .27), transparent 37%),
            radial-gradient(circle at 95% 85%, rgba(39, 215, 191, .17), transparent 42%),
            linear-gradient(145deg, #20244c 0%, #172341 49%, #103b48 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          isolation: isolate;
        }

        .auth-brand::before {
          content: "";
          position: absolute;
          z-index: -1;
          width: 390px;
          height: 390px;
          border: 1px solid rgba(255, 255, 255, .08);
          border-radius: 50%;
          right: -185px;
          top: 110px;
          box-shadow:
            0 0 0 35px rgba(255, 255, 255, .018),
            0 0 0 75px rgba(255, 255, 255, .014);
        }

        .auth-brand::after {
          content: "";
          position: absolute;
          z-index: -1;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: rgba(132, 111, 255, .16);
          filter: blur(45px);
          left: -65px;
          bottom: 10px;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 13px;
          font-family: 'Manrope', sans-serif;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: 2.5px;
          color: #fff;
        }

        .auth-logo-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #a28aff, #657dff 58%, #36d7c0);
          border-radius: 15px;
          color: white;
          box-shadow: 0 9px 26px rgba(116, 102, 255, .38);
        }

        .auth-brand-content {
          margin: 55px 0;
        }

        .auth-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #d0caff;
          background: rgba(158, 139, 255, .13);
          border: 1px solid rgba(178, 162, 255, .23);
          border-radius: 30px;
          padding: 9px 13px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .5px;
          margin-bottom: 25px;
        }

        .auth-brand-content h1 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(35px, 4vw, 49px);
          line-height: 1.17;
          letter-spacing: -2px;
          margin: 0 0 22px;
          color: #fff;
          font-weight: 800;
        }

        .auth-brand-content h1 span {
          background: linear-gradient(100deg, #b7a4ff, #63dfe0 95%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .auth-brand-content > p {
          color: #c0c9e0;
          font-size: 14px;
          line-height: 1.9;
          max-width: 390px;
          margin: 0;
        }

        .auth-features {
          display: grid;
          gap: 15px;
          margin-top: 34px;
        }

        .auth-feature {
          display: flex;
          align-items: center;
          gap: 13px;
          color: #e3e9f7;
          font-size: 13px;
          font-weight: 600;
        }

        .auth-feature-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(255, 255, 255, .09);
          border: 1px solid rgba(255, 255, 255, .1);
          color: #a99aff;
        }

        .auth-feature:nth-child(2) .auth-feature-icon {
          color: #62e1d0;
        }

        .auth-feature:nth-child(3) .auth-feature-icon {
          color: #83b8ff;
        }

        .auth-brand-footer {
          color: #9eabc5;
          font-size: 11px;
          letter-spacing: .3px;
        }

        /* FORM SIDE */

        .auth-form-side {
          padding: 58px 55px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background:
            radial-gradient(circle at 100% 0%, rgba(119, 100, 255, .08), transparent 42%),
            rgba(12, 20, 38, .6);
        }

        .auth-form-kicker {
          color: #a898ff;
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 13px;
        }

        .auth-form-side h2 {
          font-family: 'Manrope', sans-serif;
          font-size: 31px;
          letter-spacing: -1px;
          line-height: 1.25;
          color: #f5f6ff;
          margin: 0 0 10px;
          font-weight: 800;
        }

        .auth-subtitle {
          color: #9eacc5;
          font-size: 13px;
          line-height: 1.7;
          margin: 0 0 34px;
        }

        .auth-field {
          margin-bottom: 21px;
        }

        .auth-field label {
          display: block;
          font-size: 12px;
          color: #d0d8e9;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9b9cce;
          pointer-events: none;
          transition: color .2s ease;
        }

        .auth-input {
          width: 100%;
          height: 54px;
          border: 1px solid rgba(150, 166, 205, .2);
          border-radius: 13px;
          background: rgba(7, 14, 29, .72);
          color: #f5f7ff;
          padding: 0 47px;
          font-size: 13px;
          outline: none;
          font-family: inherit;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .auth-input:focus {
          border-color: #9882ff;
          background: rgba(19, 26, 52, .95);
          box-shadow:
            0 0 0 3px rgba(146, 117, 255, .13),
            0 0 20px rgba(146, 117, 255, .07);
        }

        .auth-input-wrap:focus-within .auth-input-icon {
          color: #b9aaff;
        }

        .auth-input::placeholder {
          color: #75839f;
          opacity: 1;
        }

        .auth-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #91a0bb;
          cursor: pointer;
          display: grid;
          place-items: center;
          border-radius: 8px;
          transition: color .2s ease, background .2s ease;
        }

        .auth-eye:hover {
          color: #c8bdff;
          background: rgba(146, 117, 255, .12);
        }

        .auth-submit {
          width: 100%;
          min-height: 54px;
          border: 1px solid rgba(255, 255, 255, .15);
          border-radius: 13px;
          background: linear-gradient(105deg, #9174ff 0%, #667dff 55%, #39cfc9 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 27px rgba(111, 102, 255, .23);
          transition: transform .22s ease, box-shadow .22s ease, filter .22s ease;
        }

        .auth-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 33px rgba(111, 102, 255, .34);
          filter: brightness(1.08);
        }

        .auth-submit:active {
          transform: translateY(0);
        }

        .auth-submit:disabled {
          opacity: .62;
          cursor: not-allowed;
          transform: none;
        }

        .auth-error {
          color: #ffadb7;
          background: rgba(255, 89, 117, .09);
          border: 1px solid rgba(255, 125, 145, .24);
          border-radius: 11px;
          padding: 13px 14px;
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .auth-switch {
          text-align: center;
          color: #a1aec6;
          font-size: 12px;
          margin-top: 27px;
        }

        .auth-switch button {
          background: none;
          border: none;
          color: #b5a6ff;
          font-weight: 800;
          cursor: pointer;
          font-size: 12px;
          font-family: inherit;
          padding: 3px;
        }

        .auth-switch button:hover {
          color: #d2caff;
          text-decoration: underline;
        }

        .auth-security {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          color: #8392ad;
          font-size: 11px;
          margin-top: 31px;
        }

        .auth-security svg {
          color: #55d9bb;
        }

        /* RESPONSIVE */

        @media(max-width: 900px) {
          .auth-layout {
            max-width: 650px;
            grid-template-columns: 1fr;
          }

          .auth-brand {
            padding: 35px 38px;
            gap: 20px;
          }

          .auth-brand-content {
            margin: 28px 0;
          }

          .auth-brand-content h1 {
            font-size: 38px;
          }

          .auth-features {
            grid-template-columns: 1fr 1fr;
            gap: 13px;
          }

          .auth-form-side {
            padding: 42px 38px;
          }
        }

        @media(max-width: 520px) {
          .finora-auth {
            padding: 15px 11px;
            align-items: flex-start;
          }

          .auth-layout {
            border-radius: 21px;
            min-height: auto;
          }

          .auth-brand {
            padding: 25px 23px;
          }

          .auth-logo {
            font-size: 21px;
          }

          .auth-logo-icon {
            width: 40px;
            height: 40px;
          }

          .auth-brand-content {
            margin: 25px 0;
          }

          .auth-brand-content h1 {
            font-size: 34px;
          }

          .auth-brand-content > p {
            font-size: 12px;
          }

          .auth-features {
            grid-template-columns: 1fr;
            gap: 11px;
            margin-top: 24px;
          }

          .auth-feature {
            font-size: 12px;
          }

          .auth-brand-footer {
            font-size: 10px;
          }

          .auth-form-side {
            padding: 34px 23px;
          }

          .auth-form-side h2 {
            font-size: 27px;
          }

          .auth-subtitle {
            margin-bottom: 27px;
          }

          .auth-security {
            margin-top: 25px;
            font-size: 10px;
          }
        }

        @media(prefers-reduced-motion: reduce) {
          .finora-auth *,
          .finora-auth *::before,
          .finora-auth *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
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
            <div className="auth-brand-badge">
              <Sparkles size={14} />
              SMARTER MONEY MANAGEMENT
            </div>

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

            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <TrendingUp size={19} />
                </div>
                Smart financial insights
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <Zap size={19} />
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
          </div>

          <div className="auth-brand-footer">
            © 2026 FINORA. Your finances, your future.
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-form-kicker">
            {isRegister ? "GET STARTED" : "YOUR FINANCIAL SPACE"}
          </div>

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
