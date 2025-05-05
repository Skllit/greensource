import { Route, Routes } from "react-router-dom";
import Home from "./components/HomePage";
import Login from "./components/Login";
import { Provider } from "react-redux";
import { store } from "./store";
import AdminDashboard from "./components/AdminDashboard";
import AdminOverview from "./components/AdminOverview";
import AdminFarmersView from "./components/AdminFarmersView";
import AdminDeliveryAgentsView from "./components/AdminDeliveryAgentsView";
import AdminConsumersView from "./components/AdminConsumersView";
import AdminProducts from "./components/AdminProducts";
import AdminAnalytics from "./components/AdminAnalytics";
import AdminSettings from "./components/AdminSettings";
import AdminFarmerProductsPage from "./components/AdminFarmerProductsPage";
import AdminFarmerOrdersPage from "./components/AdminFarmerOrdersPage";
import AdminConsumerOrdersPage from "./components/AdminConsumerOrdersPage";
import AdminOrdersPage from "./components/AdminOrdersPage";
import AdminAdminsView from "./components/AdminAdminsView";

function App() {
  return (
    <>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminDashboard>
                <AdminOverview />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/users/farmers"
            element={
              <AdminDashboard>
                <AdminFarmersView />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/users/delivery-agents"
            element={
              <AdminDashboard>
                <AdminDeliveryAgentsView />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/users/consumers"
            element={
              <AdminDashboard>
                <AdminConsumersView />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/users/admins"
            element={
              <AdminDashboard>
                <AdminAdminsView />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminDashboard>
                <AdminProducts />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminDashboard>
                <AdminAnalytics />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminDashboard>
                <AdminSettings />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/consumers/:consumerEmail/orders"
            element={
              <AdminDashboard>
                <AdminConsumerOrdersPage />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/farmers/:farmerId/products"
            element={
              <AdminDashboard>
                <AdminFarmerProductsPage />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/farmers/:farmerId/orders"
            element={
              <AdminDashboard>
                <AdminFarmerOrdersPage />
              </AdminDashboard>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminDashboard>
                <AdminOrdersPage />
              </AdminDashboard>
            }
          />
        </Routes>
      </Provider>
    </>
  );
}

export default App;
