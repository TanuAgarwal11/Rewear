
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../css/MyRentals.css";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getStatusLabel(status) {
  return String(status || "PENDING")
    .toUpperCase()
    .replaceAll("_", " ");
}

function getStatusClass(status) {
  return String(status || "PENDING")
    .toLowerCase()
    .replaceAll("_", "-");
}

function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRentals() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/rentals/my");
        const data = response.data;

        const rentalList = Array.isArray(data)
          ? data
          : data.rentals ??
            data.data?.rentals ??
            data.data ??
            [];

        if (!Array.isArray(rentalList)) {
          throw new Error("Unexpected rentals response from server.");
        }

        setRentals(rentalList);
      } catch (err) {
        console.error("Failed to fetch rentals:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your rentals."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRentals();
  }, []);

  const pendingCount = rentals.filter(
    (rental) => rental.status === "PENDING"
  ).length;

  const activeCount = rentals.filter((rental) =>
    ["CONFIRMED", "ACTIVE", "RETURN_REQUESTED"].includes(rental.status)
  ).length;

  const completedCount = rentals.filter((rental) =>
    ["COMPLETED", "RETURNED"].includes(rental.status)
  ).length;

  return (
    <>
      <Navbar />

      <main className="my-rentals-page">
        <section className="my-rentals-intro">
          <div className="my-rentals-header">
            <p className="my-rentals-eyebrow">
              YOUR REWEAR ACCOUNT
            </p>

            <h1>
              Your wardrobe,
              <br />
              <span>your way.</span>
            </h1>

            <p className="my-rentals-description">
              All your rented pieces, in one place.
              Keep track of every occasion, from your first
              request to the final return.
            </p>
          </div>

          <div className="my-rentals-intro-note">
            <span className="intro-note-line" />
            <p>Wear something wonderful. Rent it responsibly.</p>
          </div>
        </section>

        {!loading && !error && (
          <section
            className="rental-overview"
            aria-label="Rental overview"
          >
            <div className="rental-overview-heading">
              <p className="section-eyebrow">AT A GLANCE</p>
              <span>Your rental overview</span>
            </div>

            <div className="rental-stats">
              <article className="rental-stat">
                <span className="rental-stat-number">
                  {rentals.length.toString().padStart(2, "0")}
                </span>
                <span className="rental-stat-label">
                  Total rentals
                </span>
              </article>

              <article className="rental-stat">
                <span className="rental-stat-number">
                  {pendingCount.toString().padStart(2, "0")}
                </span>
                <span className="rental-stat-label">
                  Awaiting approval
                </span>
              </article>

              <article className="rental-stat">
                <span className="rental-stat-number">
                  {activeCount.toString().padStart(2, "0")}
                </span>
                <span className="rental-stat-label">
                  In progress
                </span>
              </article>

              <article className="rental-stat">
                <span className="rental-stat-number">
                  {completedCount.toString().padStart(2, "0")}
                </span>
                <span className="rental-stat-label">
                  Completed
                </span>
              </article>
            </div>
          </section>
        )}

        {loading && (
          <div className="rentals-state" role="status">
            <span className="rentals-loader" />
            <p>Curating your rental details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rentals-error" role="alert">
            <p className="section-eyebrow">SOMETHING WENT WRONG</p>
            <h2>We couldn't load your rentals.</h2>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && rentals.length === 0 && (
          <section className="rentals-empty">
            <div className="empty-decoration" aria-hidden="true">
              R
            </div>

            <p className="rentals-empty-eyebrow">
              A LITTLE INSPIRATION
            </p>

            <h2>Your next favourite look awaits.</h2>

            <p>
              You haven't requested a rental yet. Explore the
              collection and find something special for your
              next occasion.
            </p>

            <Link
              to="/collections"
              className="rentals-shop-button"
            >
              Explore the collection <span>↗</span>
            </Link>
          </section>
        )}

        {!loading && !error && rentals.length > 0 && (
          <section className="rentals-list">
            <div className="rentals-list-heading">
              <div>
                <p className="section-eyebrow">YOUR SELECTIONS</p>
                <h2>Your rental history</h2>
              </div>

              <span className="rentals-count">
                {rentals.length.toString().padStart(2, "0")}
                <span>
                  {rentals.length === 1 ? " piece" : " pieces"}
                </span>
              </span>
            </div>

            <div className="rentals-list-items">
              {rentals.map((rental) => {
                const product =
                  rental.product &&
                  typeof rental.product === "object"
                    ? rental.product
                    : null;

                const status = getStatusClass(rental.status);

                return (
                  <article
                    className="rental-card"
                    key={rental._id}
                  >
                    <div className="rental-card-image">
                      {product?.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name || "Rented product"}
                          loading="lazy"
                        />
                      ) : (
                        <span className="rental-image-placeholder">
                          REWEAR
                        </span>
                      )}

                      <span className="rental-image-caption">
                        YOUR RENTAL
                      </span>
                    </div>

                    <div className="rental-card-content">
                      <div className="rental-card-top">
                        <div className="rental-product-heading">
                          <p className="rental-card-brand">
                            {product?.brand || "REWEAR EDIT"}
                          </p>

                          <h3>
                            {product?.name || "Rental request"}
                          </h3>

                          <p className="rental-reference">
                            Ref. {String(rental._id || "").slice(-8).toUpperCase()}
                          </p>
                        </div>

                        <span
                          className={`rental-status rental-status--${status}`}
                        >
                          <span className="status-dot" />
                          {getStatusLabel(rental.status)}
                        </span>
                      </div>

                      <div className="rental-card-dates">
                        <div className="rental-detail">
                          <span className="detail-label">
                            <span className="detail-icon">↗</span>
                            Rental starts
                          </span>
                          <strong>
                            {formatDate(rental.startDate)}
                          </strong>
                        </div>

                        <div className="rental-detail">
                          <span className="detail-label">
                            <span className="detail-icon">↙</span>
                            Return date
                          </span>
                          <strong>
                            {formatDate(rental.endDate)}
                          </strong>
                        </div>
                      </div>

                      <div className="rental-card-bottom">
                        <div className="rental-price-item">
                          <span>Rental cost</span>
                          <strong>
                            {formatPrice(rental.totalPrice)}
                          </strong>
                        </div>

                        <div className="rental-price-item">
                          <span>Security deposit</span>
                          <strong>
                            {formatPrice(rental.securityDeposit)}
                          </strong>
                        </div>

                        <Link
                          to={
                            product?._id
                              ? `/products/${product._id}`
                              : "/collections"
                          }
                          className="rental-view-link"
                        >
                          View piece <span>↗</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="rentals-list-footer">
              <span>GOOD STYLE, CONSIDERED CHOICES.</span>
              <Link to="/collections">
                Discover more pieces ↗
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default MyRentals;
