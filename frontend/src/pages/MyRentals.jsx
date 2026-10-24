
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../css/MyRentals.css";

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
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

  return (
    <>
      <Navbar />

      <main className="my-rentals-page">
        <header className="my-rentals-header">
          <p className="my-rentals-eyebrow">YOUR REWEAR ACCOUNT</p>
          <h1>My Rentals</h1>
          <p>
            Every occasion deserves something special.
            Keep track of your rental requests here.
          </p>
        </header>

        {loading && (
          <p className="rentals-message">Loading your rentals...</p>
        )}

        {!loading && error && (
          <div className="rentals-error" role="alert">
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
            <p className="rentals-empty-eyebrow">A LITTLE INSPIRATION</p>
            <h2>Your next favourite look awaits.</h2>
            <p>
              You haven't requested a rental yet. Explore the collection
              and find something for your next occasion.
            </p>
            <Link to="/collections" className="rentals-shop-button">
              Explore the collection
            </Link>
          </section>
        )}

        {!loading && !error && rentals.length > 0 && (
          <section className="rentals-list">
            <div className="rentals-list-heading">
              <h2>Your requests</h2>
              <span>
                {rentals.length} {rentals.length === 1 ? "rental" : "rentals"}
              </span>
            </div>

            {rentals.map((rental) => {
              const product =
                rental.product && typeof rental.product === "object"
                  ? rental.product
                  : null;

              const status = String(rental.status || "PENDING")
                .toUpperCase();

              return (
                <article className="rental-card" key={rental._id}>
                  <div className="rental-card-image">
                    {product?.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name || "Rented product"}
                      />
                    ) : (
                      <span>REWEAR</span>
                    )}
                  </div>

                  <div className="rental-card-content">
                    <div className="rental-card-top">
                      <div>
                        <p className="rental-card-brand">
                          {product?.brand || "REWEAR EDIT"}
                        </p>

                        <h3>
                          {product?.name || "Rental request"}
                        </h3>
                      </div>

                      <span
                        className={`rental-status rental-status--${status.toLowerCase().replaceAll("_", "-")}`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="rental-card-dates">
                      <div>
                        <span>Rental starts</span>
                        <strong>{formatDate(rental.startDate)}</strong>
                      </div>

                      <div>
                        <span>Return date</span>
                        <strong>{formatDate(rental.endDate)}</strong>
                      </div>
                    </div>

                    <div className="rental-card-bottom">
                      <div>
                        <span>Rental cost</span>
                        <strong>{formatPrice(rental.totalPrice)}</strong>
                      </div>

                      <div>
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
                        View piece ↗
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}

export default MyRentals;
