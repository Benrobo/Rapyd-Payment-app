import React from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import { Route } from "react-router";
import { DataContextProvider } from "./context/DataContext";
import "./App.css";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Wallets from "./pages/wallet";
import Store from "./pages/store/store";
import PaymentLinks from "./pages/payments/links";
import PaymentButotns from "./pages/payments/buttons";
import Settings from "./pages/settings";
import Authentication from "./pages/auth";
import PaymentForm from "./pages/payments/form";

function App() {
  return (
    <div className="app">
      <DataContextProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={<ProtectedRoute component={<Dashboard />} />}
            />
            <Route
              path="/login"
              element={<Authentication />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute component={<Dashboard />} />
              }
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute component={<Wallets />} />
              }
            />
            <Route
              path="/store"
              element={<ProtectedRoute component={<Store />} />}
            />
            <Route
              path="/payment/links"
              element={
                <ProtectedRoute
                  component={<PaymentLinks />}
                />
              }
            />
            <Route
              path="/payment/buttons"
              element={
                <ProtectedRoute
                  component={<PaymentButotns />}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute component={<Settings />} />
              }
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute component={<Wallets />} />
              }
            />
            <Route
              path="/payment/link/:linkId"
              element={
                <PaymentForm />
              }
            />
          </Routes>
        </Router>
      </DataContextProvider>
    </div>
  );
}

export default App;
