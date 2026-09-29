import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ProtectedRoute    from "./components/layout/ProtectedRoute.jsx";
import AppLayout         from "./components/layout/AppLayout.jsx";
import LoginPage         from "./pages/LoginPage.jsx";
import RegisterPage      from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import DashboardPage     from "./pages/DashboardPage.jsx";
import TransactionsPage  from "./pages/TransactionsPage.jsx";
import BudgetsPage       from "./pages/BudgetsPage.jsx";
import AnalyticsPage     from "./pages/AnalyticsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import { ProfilePage, SettingsPage } from "./pages/ProfileSettingsPages.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"           element={<LoginPage />}           />
            <Route path="/register"        element={<RegisterPage />}        />
            <Route path="/forgot-password" element={<ForgotPasswordPage />}  />

            {/* Protected — all share AppLayout (topbar + footer) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard"     element={<DashboardPage />}     />
                <Route path="/transactions"  element={<TransactionsPage />}  />
                <Route path="/budgets"       element={<BudgetsPage />}       />
                <Route path="/analytics"     element={<AnalyticsPage />}     />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile"       element={<ProfilePage />}       />
                <Route path="/settings"      element={<SettingsPage />}      />
              </Route>
            </Route>

            {/* Default redirect */}
            <Route path="/"   element={<Navigate to="/dashboard" replace />} />
            <Route path="*"   element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
