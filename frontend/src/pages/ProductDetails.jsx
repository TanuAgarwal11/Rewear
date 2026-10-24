import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../css/ProductDetails.css";

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);
        const data = response.data;

        setProduct(data.product ?? data.data ?? data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("We couldn't find this piece.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const rentalDays =
    startDate && endDate && endDate > startDate
      ? Math.round(
          (Date.parse(`${endDate}T00:00:00Z`) -
            Date.parse(`${startDate}T00:00:00Z`)) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const rentalAmount = rentalDays * (product?.pricePerDay ?? 0);
  const deposit = product?.securityDeposit ?? 0;
  const totalAmount = rentalAmount + deposit;

  function handleStartDateChange(value) {
    setStartDate(value);
    setBookingMessage("");

    if (endDate && value && endDate <= value) {
      setEndDate("");
    }
  }

  async function handleContinue() {
    setBookingMessage("");

    if (!startDate || !endDate || rentalDays <= 0) {
      setBookingMessage("Please select a valid rental period.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: { from: window.location.pathname },
      });
      return;
    }

    try {
      const response = await api.post("/rentals", {
        productId: id,
        startDate,
        endDate,
      });

      setBookingMessage(
        response.data.message || "Rental request submitted successfully!",
      );
    }  catch (err) {
  console.error("Booking error:", err);
  console.log("Backend response:", err.response?.data);

  setBookingMessage(
    err.response?.data?.message ||
      err.response?.data?.error ||
      "Could not submit your rental request. Please try again."
  );
}

  }

  return (
    <>
      <Navbar />

      <main className="product-details-page">
        <Link to="/collections" className="back-link">
          ← Back to collection
        </Link>

        {loading && <p>Finding your piece...</p>}
        {!loading && error && <p>{error}</p>}

        {!loading && product && (
          <div className="product-details-layout">
            <div className="product-details-image">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <p>Image coming soon</p>
              )}
            </div>

            <section className="product-details-info">
              <p className="product-details-brand">
                {product.brand || "REWEAR EDIT"}
              </p>

              <h1>{product.name}</h1>
              <p className="product-details-category">{product.category}</p>

              <p className="product-details-price">
                ₹{product.pricePerDay}
                <span> / day</span>
              </p>

              <p>{product.description}</p>

              <div className="product-details-specs">
                <p>
                  <strong>Size:</strong> {product.size || "Not specified"}
                </p>
                <p>
                  <strong>Colour:</strong> {product.color || "Not specified"}
                </p>
                <p>
                  <strong>Condition:</strong>{" "}
                  {product.condition || "Not specified"}
                </p>
              </div>

              <div className="rental-panel">
                <h2>Make it yours, for a while.</h2>
                <p className="rental-panel-subtitle">
                  Choose your rental period.
                </p>

                <div className="rental-date-fields">
                  <label>
                    Rental start
                    <input
                      type="date"
                      min={getToday()}
                      value={startDate}
                      onChange={(event) =>
                        handleStartDateChange(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Return date
                    <input
                      type="date"
                      min={startDate || getToday()}
                      value={endDate}
                      onChange={(event) => {
                        setEndDate(event.target.value);
                        setBookingMessage("");
                      }}
                    />
                  </label>
                </div>

                <div className="rental-price-summary">
                  <div>
                    <span>Rental duration</span>
                    <strong>
                      {rentalDays} {rentalDays === 1 ? "day" : "days"}
                    </strong>
                  </div>

                  <div>
                    <span>Rental cost</span>
                    <strong>₹{rentalAmount.toLocaleString("en-IN")}</strong>
                  </div>

                  <div>
                    <span>Refundable security deposit</span>
                    <strong>₹{deposit.toLocaleString("en-IN")}</strong>
                  </div>

                  <div className="rental-total">
                    <span>Total payable</span>
                    <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="rent-button"
                  disabled={!startDate || !endDate || rentalDays <= 0}
                  onClick={handleContinue}
                >
                  Continue to booking
                </button>

                {bookingMessage && (
                  <p className="booking-message" role="status">
                    {bookingMessage}
                  </p>
                )}

                <p className="product-details-note">
                  The security deposit is shown separately from your rental
                  cost.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default ProductDetails;
