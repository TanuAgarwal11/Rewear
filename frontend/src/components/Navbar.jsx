import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <>
      <div className="announcement-bar">
        Considered fashion. Exceptional pieces. A new way to wear.
      </div>

      <header className="navbar">
        <Link to="/" className="brand" aria-label="Rewear home">
          rewear<span>.</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/collections">
            Collections
          </NavLink>

          <NavLink to="/my-rentals">
            My Rentals
          </NavLink>

          <NavLink to="/lender-dashboard">
            Lender Dashboard
          </NavLink>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="nav-login">
            Sign in
          </Link>

          <Link to="/collections" className="nav-cta">
            Discover the edit <span>↗</span>
          </Link>
        </div>
      </header>
    </>
  );
}

export default Navbar;