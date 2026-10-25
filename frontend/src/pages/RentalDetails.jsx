import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../css/RentalDetails.css";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatStatus(status) {
  return String(status || "PENDING")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function RentalDetails() {
  const { id } = useParams();

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchRental() {
      try {
        setLoading(true);
        setError("");

        // Reuse the existing endpoint that returns the logged-in
        // renter's bookings, then find the requested booking by ID.
        const response = await api.get("/rentals/my");
        const data = response.data;

        const rentals = Array.isArray(data)
          ? data
          : (data.rentals ?? data.data?.rentals ?? data.data ?? []);

        if (!Array.isArray(rentals)) {
          throw new Error("Unexpected response from the server.");
        }

        const selectedRental = rentals.find(
          (item) => String(item._id) === String(id),
        );

        if (!selectedRental) {
          throw new Error(
            "Rental not found. It may not belong to your account.",
          );
        }

        if (isMounted) {
          setRental(selectedRental);
        }
      } catch (err) {
        console.error("Failed to fetch rental details:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load rental details.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRental();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleCancelRental() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this rental request?",
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError("");
      setMessage("");

      const response = await api.put(`/rentals/${id}/cancel`);

      setRental((current) =>
        current
          ? {
              ...current,
              status: response.data?.rental?.status || "CANCELLED",
            }
          : current,
      );

      setMessage(response.data?.message || "Your rental has been cancelled.");
    } catch (err) {
      console.error("Failed to cancel rental:", err);

      setError(
        err.response?.data?.message ||
          "We couldn't cancel this rental. Please try again.",
      );
    } finally {
      setCancelling(false);
    }
  }

  const product =
    rental?.product && typeof rental.product === "object"
      ? rental.product
      : null;

  const status = String(rental?.status || "PENDING").toUpperCase();

  const canCancel = ["PENDING", "CONFIRMED"].includes(status);

  const imageUrl = product?.images?.[0];

  return (
    <>
      <Navbar />

      <main className="rental-details-page">
        <div className="rental-details-container">
          <Link to="/my-rentals" className="rental-details-back">
            <span aria-hidden="true">←</span> Back to my rentals
          </Link>

          <header className="rental-details-header">
            <p className="rental-details-eyebrow">YOUR REWEAR JOURNEY</p>
            <h1>
              The details
              <br />
              <span>matter.</span>
            </h1>
            <p>
              Everything you need to know about your selected piece and its
              booking.
            </p>
          </header>

          {loading && (
            <div className="rental-details-state" role="status">
              <span className="rental-details-loader" />
              <p>Gathering your rental details...</p>
            </div>
          )}

          {!loading && error && !rental && (
            <section className="rental-details-error" role="alert">
              <p className="rental-details-eyebrow">BOOKING UNAVAILABLE</p>
              <h2>We couldn't find this rental.</h2>
              <p>{error}</p>
              <Link to="/my-rentals" className="rental-details-primary">
                Return to my rentals
              </Link>
            </section>
          )}

          {!loading && rental && (
            <>
              {error && (
                <div
                  className="rental-details-alert rental-details-alert--error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  className="rental-details-alert rental-details-alert--success"
                  role="status"
                >
                  {message}
                </div>
              )}

              <section className="rental-details-layout">
                <article className="rental-details-product">
                  <div className="rental-details-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product?.name || "Your rented piece"}
                      />
                    ) : (
                      <div className="rental-details-image-placeholder">
                        REWEAR
                      </div>
                    )}

                    <span className="rental-details-image-label">
                      YOUR SELECTED PIECE
                    </span>
                  </div>

                  <div className="rental-details-product-info">
                    <p className="rental-details-brand">
                      {product?.brand || "REWEAR EDIT"}
                    </p>

                    <h2>{product?.name || "Rental booking"}</h2>

                    {product?.pricePerDay != null && (
                      <p className="rental-details-per-day">
                        {formatPrice(product.pricePerDay)} / day
                      </p>
                    )}

                    {product?._id && (
                      <Link
                        to={`/products/${product._id}`}
                        className="rental-details-product-link"
                      >
                        View product <span>↗</span>
                      </Link>
                    )}
                  </div>
                </article>

                <section className="rental-details-information">
                  <div className="rental-details-booking-heading">
                    <div>
                      <p className="rental-details-eyebrow">BOOKING SUMMARY</p>
                      <h2>Your reservation</h2>
                    </div>

                    <span
                      className={`rental-details-status rental-details-status--${status.toLowerCase().replaceAll("_", "-")}`}
                    >
                      <span />
                      {formatStatus(status)}
                    </span>
                  </div>

                  <div className="rental-details-reference">
                    <span>BOOKING REFERENCE</span>
                    <strong>
                      RW-
                      {String(rental._id || "")
                        .slice(-8)
                        .toUpperCase()}
                    </strong>
                  </div>

                  <div className="rental-details-dates">
                    <div>
                      <span className="rental-details-label">RENTAL START</span>
                      <strong>{formatDate(rental.startDate)}</strong>
                    </div>

                    <span
                      className="rental-details-date-divider"
                      aria-hidden="true"
                    >
                      →
                    </span>

                    <div>
                      <span className="rental-details-label">RENTAL END</span>
                      <strong>{formatDate(rental.endDate)}</strong>
                    </div>
                  </div>

                  <div className="rental-details-price-breakdown">
                    <h3>Payment breakdown</h3>

                    <div className="rental-details-price-row">
                      <span>Rental cost</span>
                      <strong>{formatPrice(rental.totalPrice)}</strong>
                    </div>

                    <div className="rental-details-price-row">
                      <span>Security deposit</span>
                      <strong>{formatPrice(rental.securityDeposit)}</strong>
                    </div>

                    <div className="rental-details-price-row rental-details-price-row--total">
                      <span>Rental + deposit</span>
                      <strong>
                        {formatPrice(
                          Number(rental.totalPrice || 0) +
                            Number(rental.securityDeposit || 0),
                        )}
                      </strong>
                    </div>

                    <p className="rental-details-note">
                      The security deposit is separate from the rental charge
                      and is handled according to the rental's return and
                      deposit-settlement process.
                    </p>
                  </div>

                  <div className="rental-details-actions">
                    {canCancel ? (
                      <button
                        type="button"
                        className="rental-details-cancel"
                        onClick={handleCancelRental}
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling..." : "Cancel rental"}
                      </button>
                    ) : (
                      <p className="rental-details-cancel-note">
                        {status === "CANCELLED"
                          ? "This rental has been cancelled."
                          : "Cancellation is no longer available for this booking."}
                      </p>
                    )}

                    <Link to="/my-rentals" className="rental-details-primary">
                      All my rentals <span>↗</span>
                    </Link>
                  </div>
                </section>
              </section>
            </>
          )}

          <footer className="rental-details-footer">
            <span>REWEAR</span>
            <p>Wear more. Waste less.</p>
          </footer>
        </div>
      </main>
    </>
  );
}

export default RentalDetails;
