// import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import { Provider } from "react-redux";
import { store } from "./store";
import Signup from "./pages/Signup";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import ConsumerProfilePage from "./pages/ConsumerProfilePage";
import ConsumerOrdersPage from "./pages/ConsumerOrdersPage";
import ConsumerSavedPage from "./pages/ConsumerSavedPage";
import MarketPage from "./pages/MarketPage";
import FarmerProducts from "./pages/FarmerProducts";
import FarmerOrdersPage from "./pages/FarmerOrdersPage";
import FarmerProfile from "./pages/FarmerProfile";
import FarmerEarnings from "./pages/FarmerEarnings";
//import { AuthPersistence } from "./store/slices/AuthPersistence";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (
    <>
      <Provider store={store}>
        {/* <AuthPersistence /> */}
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route
            path="/consumer/products"
            element={
              <ConsumerDashboard>
                <ProductsPage />
              </ConsumerDashboard>
            }
          />
          <Route
            path="/consumer/cart"
            element={
              <ConsumerDashboard>
                <CartPage />
              </ConsumerDashboard>
            }
          />
          <Route
            path="/consumer/profile"
            element={
              <ConsumerDashboard>
                <ConsumerProfilePage />
              </ConsumerDashboard>
            }
          />
          <Route
            path="/consumer/orders"
            element={
              <ConsumerDashboard>
                <ConsumerOrdersPage />
              </ConsumerDashboard>
            }
          />
          <Route
            path="/consumer/saved"
            element={
              <ConsumerDashboard>
                <ConsumerSavedPage />
              </ConsumerDashboard>
            }
          />
          <Route
            path="/consumer/market-prices"
            element={
              <ConsumerDashboard>
                <MarketPage />
              </ConsumerDashboard>
            }
          />
          <Route
            path="/farmer/products"
            element={
              <FarmerDashboard>
                <FarmerProducts />
              </FarmerDashboard>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <FarmerDashboard>
                <FarmerOrdersPage />
              </FarmerDashboard>
            }
          />
          <Route
            path="/farmer/profile"
            element={
              <FarmerDashboard>
                <FarmerProfile />
              </FarmerDashboard>
            }
          />
          <Route
            path="/farmer/earnings"
            element={
              <FarmerDashboard>
                <FarmerEarnings />
              </FarmerDashboard>
            }
          />
          <Route
            path="/farmer/market-prices"
            element={
              <FarmerDashboard>
                <MarketPage />
              </FarmerDashboard>
            }
          />
          <Route
            path="/consumers/orders/:orderId"
            element={
              <ConsumerDashboard>
                <OrderDetailsPage />
              </ConsumerDashboard>
            }
          />
          <Route
            path="/farmer/orders/:orderId"
            element={
              <FarmerDashboard>
                <OrderDetailsPage />
              </FarmerDashboard>
            }
          />
        </Routes>
        <ToastContainer />
      </Provider>
    </>
  );
}

export default App;
