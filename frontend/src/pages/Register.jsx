import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/Auth.css";

function Register() {
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (!redirectToLogin) return;

    const timer = setTimeout(() => {
      navigate("/login", {
        state: { registrationSuccess: true },
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [redirectToLogin, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(
        response.data.message || "Your account has been created successfully.",
      );
      setRedirectToLogin(true);
      
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Link to="/" className="auth-logo">
          rewear<span>.</span>
        </Link>

        <Link to="/" className="auth-back-link">
          Back to home <span>↗</span>
        </Link>
      </header>

      <section className="auth-layout register-layout">
        <aside className="auth-editorial">
          <img
            className="auth-editorial-image"
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85"
            alt="Contemporary fashion editorial"
          />

          <div className="auth-image-overlay" />

          <div className="auth-editorial-content">
            <span className="auth-image-label">A MORE CONSCIOUS WARDROBE</span>

            <h1>
              Good style.
              <br />
              <em>New stories.</em>
            </h1>

            <p>
              Find pieces worth falling for. Wear them for your moments. Let
              someone else love them next.
            </p>

            <div className="auth-editorial-footer">
              <span>DISCOVER YOUR STYLE</span>
              <span>WEAR MORE. WASTE LESS.</span>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-inner register-form-inner">
            <div className="auth-mobile-label">REWEAR — CONSCIOUS FASHION</div>

            <p className="auth-eyebrow">YOUR STYLE JOURNEY STARTS HERE</p>

            <h2>
              Join the
              <br />
              <em>rewear.</em>
            </h2>

            <p className="auth-description">
              Create an account and discover a more thoughtful way to dress.
            </p>

            {success ? (
              <div className="auth-success" role="status">
                <p>{success}</p>
                <Link to="/login" className="auth-success-link">
                  Continue to sign in ↗
                </Link>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="register-name">FULL NAME</label>
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="register-email">EMAIL ADDRESS</label>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="register-password">PASSWORD</label>
                  <input
                    id="register-password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="confirm-password">CONFIRM PASSWORD</label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Enter password again"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                {error && (
                  <p className="auth-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  <span>
                    {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                  </span>
                  <span className="auth-submit-arrow">↗</span>
                </button>
              </form>
            )}

            {!success && (
              <>
                <div className="auth-divider">
                  <span />
                  <p>ALREADY A MEMBER?</p>
                  <span />
                </div>

                <p className="auth-signup">
                  Welcome back to your wardrobe.
                  <br />
                  <Link to="/login">Sign in to your account ↗</Link>
                </p>
              </>
            )}

            <div className="auth-bottom-note">
              <span>WEAR MORE. WASTE LESS.</span>
              <span>© REWEAR</span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Register;
