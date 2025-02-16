import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";
import StorePassword from "../StorePassword/Password";
import StoreEmail from "../StoreEmail/Email";
import PrivateInfo from "../PrivateInfo/PrivateInfo";
import Notes from "../StoreNotes/Notes";
import Chatroom from "../Chatroom/Chatroom";

const AppRoutes  = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/store-password" element={<StorePassword />} />
        <Route path='/store-email' element={<StoreEmail />} />
        <Route path='/private-info' element={<PrivateInfo />} />
        <Route path='/store-notes' element={<Notes />} />
        <Route path='/chatroom' element={<Chatroom />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
