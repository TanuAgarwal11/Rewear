import { useEffect, useState } from "react";
import axios from "axios";
import "../css/LenderDashboard.css";

const API_URL = "http://localhost:5000/api";

function LenderDashboard() {
  const [products, setProducts] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to access your lender dashboard.");
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [productsResponse, requestsResponse] =
          await Promise.all([
            axios.get(`${API_URL}/products/my`, config),
            axios.get(`${API_URL}/rentals/requests`, config),
          ]);

        setProducts(productsResponse.data.products || []);
        setRentalRequests(requestsResponse.data.rentals || []);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingProducts = products.filter(
    (product) => product.isApproved === false
  ).length;

  const pendingRequests = rentalRequests.filter(
    (rental) => rental.status === "PENDING"
  ).length;

  const activeRentals = rentalRequests.filter(
    (rental) => rental.status === "ACTIVE"
  ).length;

  const totalEarnings = rentalRequests
    .filter((rental) => rental.status === "COMPLETED")
    .reduce(
      (total, rental) =>
        total + Number(rental.lenderAmount ?? rental.totalAmount ?? 0),
      0
    );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Preparing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="lender-dashboard">
      <aside className="dashboard-sidebar">
        <a href="/" className="dashboard-brand">
          rewear<span>.</span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="dashboard-nav">
          <a href="#overview" className="nav-item active">
            <span>◫</span> Overview
          </a>

          <a href="#listings" className="nav-item">
            <span>♧</span> My Listings
          </a>

          <a href="#requests" className="nav-item">
            <span>↗</span> Rental Requests
          </a>

          <a href="#management" className="nav-item">
            <span>◇</span> Rental Management
          </a>

          <a href="/" className="nav-item">
            <span>←</span> Back to Store
          </a>
        </nav>

        <div className="sidebar-note">
          <span className="note-icon">✳</span>
          <h4>Fashion with purpose.</h4>
          <p>
            Give your wardrobe a second life and make every piece count.
          </p>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">YOUR CREATOR SPACE</p>
            <h1>Lender Dashboard</h1>
            <p className="header-description">
              Manage your collection, rentals, and earnings in one place.
            </p>
          </div>

          <a href="/collections" className="add-listing-button">
            + Explore Collection
          </a>
        </header>

        {error && (
          <div className="dashboard-error">
            <p>{error}</p>
          </div>
        )}

        <section id="overview" className="dashboard-stats">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total Listings</span>
              <span className="stat-icon">♧</span>
            </div>

            <h2>{products.length}</h2>
            <p>Pieces in your collection</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Pending Listings</span>
              <span className="stat-icon">◷</span>
            </div>

            <h2>{pendingProducts}</h2>
            <p>Awaiting approval</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Rental Requests</span>
              <span className="stat-icon">↗</span>
            </div>

            <h2>{pendingRequests}</h2>
            <p>Requests to review</p>
          </article>

          <article className="stat-card earnings-card">
            <div className="stat-top">
              <span>Total Earnings</span>
              <span className="stat-icon">₹</span>
            </div>

            <h2>₹{totalEarnings.toLocaleString("en-IN")}</h2>
            <p>From completed rentals</p>
          </article>
        </section>

        <section id="listings" className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR WARDROBE</p>
              <h2>My Listings</h2>
            </div>

            <span className="section-count">
              {products.length} pieces
            </span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">♧</span>
              <h3>Your collection starts here.</h3>
              <p>
                List your first fashion piece and let someone else fall in love
                with it.
              </p>
              <a href="/collections">Explore the collection</a>
            </div>
          ) : (
            <div className="listing-grid">
              {products.map((product) => (
                <article className="listing-card" key={product._id}>
                  <div className="listing-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <div className="image-placeholder">
                        REWEAR
                      </div>
                    )}

                    <span
                      className={`approval-badge ${
                        product.isApproved
                          ? "approved"
                          : "pending"
                      }`}
                    >
                      {product.isApproved
                        ? "Approved"
                        : "Pending approval"}
                    </span>
                  </div>

                  <div className="listing-info">
                    <p className="listing-category">
                      {product.category || "Fashion"}
                    </p>

                    <h3>{product.name}</h3>

                    <p className="listing-price">
                      ₹{Number(product.pricePerDay || 0).toLocaleString("en-IN")}
                      <span> / day</span>
                    </p>

                    <div className="listing-actions">
                      <a href={`/products/${product._id}`}>
                        View details
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="requests" className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">INCOMING BOOKINGS</p>
              <h2>Rental Requests</h2>
            </div>

            <span className="section-count">
              {rentalRequests.length} requests
            </span>
          </div>

          {rentalRequests.length === 0 ? (
            <div className="empty-state compact-empty">
              <span className="empty-icon">◇</span>
              <h3>No rental requests yet.</h3>
              <p>
                Your incoming rental requests will appear here when someone
                wants to rent one of your pieces.
              </p>
            </div>
          ) : (
            <div className="requests-list">
              {rentalRequests.map((rental) => (
                <article className="request-card" key={rental._id}>
                  <div className="request-details">
                    <h3>
                      {rental.product?.name || "Rental request"}
                    </h3>

                    <p>
                      Renter:{" "}
                      {rental.renter?.name || "Renter"}
                    </p>

                    <p>
                      Status:{" "}
                      <span
                        className={`request-status ${String(
                          rental.status || ""
                        ).toLowerCase()}`}
                      >
                        {rental.status || "Unknown"}
                      </span>
                    </p>

                    <p>
                      {rental.startDate
                        ? new Date(rental.startDate).toLocaleDateString()
                        : "Start date unavailable"}
                      {" — "}
                      {rental.endDate
                        ? new Date(rental.endDate).toLocaleDateString()
                        : "End date unavailable"}
                    </p>
                  </div>

                  <a
                    className="request-view-button"
                    href={`/my-rentals/${rental._id}`}
                  >
                    View rental
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="management" className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RENTAL ACTIVITY</p>
              <h2>Rental Management</h2>
            </div>
          </div>

          <div className="management-card">
            <div>
              <h3>{activeRentals} active rentals</h3>
              <p>
                Keep track of ongoing rentals and follow their progress.
              </p>
            </div>

            <a href="/my-rentals">View My Rentals →</a>
          </div>
        </section>

        <footer className="dashboard-footer">
          <p>REWEAR — Wear more. Waste less.</p>
        </footer>
      </main>
    </div>
  );
}

export default LenderDashboard;