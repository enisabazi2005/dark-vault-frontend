import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";
import StorePassword from "../StorePassword/Password";

const AppRoutes  = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/store-password" element={<StorePassword />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
