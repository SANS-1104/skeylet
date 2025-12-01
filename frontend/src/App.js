import './App.css';
import { useContext, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { AuthContext } from "./Navbar/AuthContext";
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import PrivateRoute from './AUTH/PrivateRoute';
import { AuthPage } from './AUTH/AuthPage';
import LoginSuccess from './AUTH/LoginSuccess';
import LandingPage from './STUDIO/LANDING-PAGE/LandingPage';
import Dashboard from './STUDIO/USER/Dashboard';
import { CheckoutPage } from './STUDIO/LANDING-PAGE/CheckoutPage';
import StudioSuperAdminDashboard from './STUDIO/StudioSuperAdmin/StudioSuperAdminDashboard';
import LP2HomePage from './STUDIO/LP2/LP2HomePage';
import { PrivacyPolicy } from './STUDIO/LP2/PrivacyPolicy';
import { RefundPolicy } from './STUDIO/LP2/RefundPolicy';
import { TermsOfService } from './STUDIO/LP2/TermsOfService';
import { PaymentStatusPage } from './STUDIO/LANDING-PAGE/PaymentStatusPage';
import PaymentSuccess from './STUDIO/LANDING-PAGE/PaymentSuccess';
import PaymentFailed from './STUDIO/LANDING-PAGE/PaymentFailed';


function App() {

  const { isLoggedIn, name, authLoaded } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (authLoaded && location.pathname === "/" && isLoggedIn && name) {
      navigate(`/${name}`, { replace: true });
    }
  }, [location.pathname, isLoggedIn, name, authLoaded, navigate]);


  return (
    <>
      <Routes>
        <Route path="/" element={<LP2HomePage />} />
        <Route path="/:name" element={<LP2HomePage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/payment-status" element={<PaymentStatusPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/dashboard/:name" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/studioSuperAdmin" element={<StudioSuperAdminDashboard />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>

  );
}

export default App;


