
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const result = response.data.data ?? response.data;
      const token = result.token;

      if (!token) {
        throw new Error("No authentication token was returned.");
      }

      localStorage.setItem("token", token);

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      const destination = location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to log in. Please try again."
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

      <section className="auth-layout">
        <aside className="auth-editorial">
          <img
            className="auth-editorial-image"
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85"
            alt="Fashion editorial showcasing contemporary style"
          />

          <div className="auth-image-overlay" />

          <div className="auth-editorial-content">
            <span className="auth-image-label">
              THE ART OF REWEARING
            </span>

            <h1>
              Timeless style.
              <br />
              <em>Less waste.</em>
            </h1>

            <p>
              Discover exceptional pieces, wear them your way,
              and give every outfit another story.
            </p>

            <div className="auth-editorial-footer">
              <span>01 — CONSCIOUS FASHION</span>
              <span>EST. FOR EVERY OCCASION</span>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-mobile-label">
              REWEAR — CONSCIOUS FASHION
            </div>

            <p className="auth-eyebrow">
              YOUR WARDROBE AWAITS
            </p>

            <h2>
              Welcome
              <br />
              <em>back.</em>
            </h2>

            <p className="auth-description">
              Sign in to discover your next favourite look.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="email">EMAIL ADDRESS</label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">PASSWORD</label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
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
                  {loading ? "SIGNING YOU IN..." : "SIGN IN"}
                </span>
                <span className="auth-submit-arrow">↗</span>
              </button>
            </form>

            <div className="auth-divider">
              <span />
              <p>NEW TO REWEAR?</p>
              <span />
            </div>

            <p className="auth-signup">
              Your next favourite look starts here.
              <br />
              <Link to="/register">Create an account ↗</Link>
            </p>

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

export default Login;
