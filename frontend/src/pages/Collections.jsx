import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import "../css/Collections.css";

const categories = [
  "ALL",
  "DRESS",
  "SAREE",
  "SUIT",
  "SHERWANI",
  "JEWELLERY",
  "SHOES",
  "BAG",
  "ACCESSORIES",
];

function Collections() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");

        // Support either an array response or an object containing products.
        const data = response.data;
        const productList = Array.isArray(data)
          ? data
          : data.products ?? data.data ?? [];

        setProducts(productList);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("We couldn't load the collection. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const name = product.name || product.title || "";
      const brand = product.brand || product.designer || "";
      const searchText = `${name} ${brand}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesCategory =
        category === "ALL" || product.category === category;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const priceA = Number(
        a.pricePerDay ?? a.rentPerDay ?? a.rentalPrice ?? a.price ?? 0
      );
      const priceB = Number(
        b.pricePerDay ?? b.rentPerDay ?? b.rentalPrice ?? b.price ?? 0
      );

      if (sort === "price-low") return priceA - priceB;
      if (sort === "price-high") return priceB - priceA;

      return 0;
    });

  return (
    <>
      <Navbar />

      <main className="collections-page">
        <section className="collection-heading">
          <p className="eyebrow">THE REWEAR SELECTION</p>
          <h1>Pieces worth <em>rewearing.</em></h1>
          <p>
            Discover considered fashion for celebrations, special
            occasions, and everything in between.
          </p>
        </section>

        <section className="collection-controls">
          <label className="search-control">
            <span>Search pieces</span>
            <input
              type="search"
              placeholder="Try a dress or designer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="sort-control">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </section>

        <section className="collection-layout">
          <aside className="category-sidebar">
            <p className="filter-heading">CATEGORIES</p>

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`category-option ${
                  category === item ? "selected" : ""
                }`}
                onClick={() => setCategory(item)}
              >
                {item === "ALL" ? "All pieces" : item.replaceAll("_", " ")}
              </button>
            ))}
          </aside>

          <div className="collection-results">
            <div className="results-heading">
              <p>
                {loading
                  ? "Discovering pieces..."
                  : `${filteredProducts.length} pieces to explore`}
              </p>
              <span>CURATED FOR YOU</span>
            </div>

            {loading && (
              <p className="collection-message">Loading the collection...</p>
            )}

            {!loading && error && (
              <div className="collection-message">
                <p>{error}</p>
                <button
                  className="button-primary"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <p className="collection-message">
                No pieces match your search. Try another keyword or category.
              </p>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Collections;
