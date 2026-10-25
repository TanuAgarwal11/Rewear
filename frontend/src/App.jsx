import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Collections from "./pages/Collections";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyRentals from "./pages/MyRentals";
import RentalDetails from "./pages/RentalDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/my-rentals" element={<MyRentals />} />
      <Route path="/my-rentals/:id" element={<RentalDetails />} />
    </Routes>
  );
}

export default App;

