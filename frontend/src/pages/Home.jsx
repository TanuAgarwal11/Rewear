
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              THE ART OF WEARING DIFFERENTLY
            </p>

            <h1>
              Wear more.
              <br />
              <em>Waste less.</em>
            </h1>

            <p className="hero-description">
              Discover extraordinary fashion for every occasion.
              Rent the pieces you love, make a statement,
              and give beautiful clothing another story.
            </p>

            <div className="hero-actions">
              <Link to="/collections" className="button-primary">
                Discover the collection <span>↗</span>
              </Link>

              <a href="#our-story" className="button-secondary">
                Our philosophy
              </a>
            </div>

            <div className="hero-footnote">
              <span>01 / A NEW WAY TO DRESS</span>
              <span>STYLE WITH INTENTION</span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85"
              alt="Contemporary fashion editorial"
            />

            <div className="hero-image-caption">
              <span>THE OCCASION EDIT</span>
              <span>01 — REWEAR</span>
            </div>

            <div className="hero-seal">
              Dress well.
              <br />
              Choose well.
            </div>
          </div>
        </section>

        <section className="category-ribbon">
          <span>INDIAN COUTURE</span>
          <span>DESIGNER DRESSES</span>
          <span>OCCASION WEAR</span>
          <span>ACCESSORIES</span>
        </section>

        <section className="intro-section" id="our-story">
          <p className="eyebrow">A WARDROBE WITHOUT LIMITS</p>

          <h2>
            Keep the memories.
            <br />
            <em>Not the wardrobe.</em>
          </h2>

          <p>
            From the celebrations that matter to the looks
            you've always wanted to try, discover fashion
            that makes room for more possibilities.
          </p>

          <Link to="/collections" className="text-link">
            Find your next favourite <span>↗</span>
          </Link>
        </section>
      </main>

      <footer className="footer">
        <Link to="/" className="brand">
          rewear<span>.</span>
        </Link>

        <p>Dress beautifully. Choose thoughtfully.</p>

        <span>© {new Date().getFullYear()} Rewear</span>
      </footer>
    </>
  );
}

export default Home;
