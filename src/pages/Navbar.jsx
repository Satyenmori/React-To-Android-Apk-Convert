import React, { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { FaFileImport, FaExchangeAlt, FaBars, FaFilePdf, FaEdit } from "react-icons/fa"; // Import Font Awesome icons
import "../Style/Navbar.css";
import XmlFileRead from "./ImportPage";
import XmlTojson from "./XmlToJson";
import Sales from "./Salespage";
import EditVoucher from "./Edit-Voucher";
import Voucher from "./VoucherData";
import { AiOutlineBarChart } from "react-icons/ai";

function Navbar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`layout ${isExpanded ? "expanded" : "collapsed"}`}>
      <nav
        className="sidebar"
        // onMouseEnter={() => setIsExpanded(true)}
        // onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="logo-container">
          <FaBars className="menu-icon" onClick={toggleSidebar} />
        </div>
        <ul>
          <li>
            <Link to="/">
              <FaFileImport />
              {isExpanded && " IMPORT XML"}
            </Link>
          </li>
          <li>
            <Link to="/voucher">
              <AiOutlineBarChart/>
              {isExpanded && " Voucher"}
            </Link>
          </li>
          <li>
            <Link to="/sales">
              <FaFilePdf />
              {isExpanded && " SALES"}
            </Link>
          </li>         
          <li>
            <Link to="/json">
              <FaExchangeAlt />
              {isExpanded && " Convert JSON"}
            </Link>
          </li>
        </ul>
      </nav>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<XmlFileRead />} />
          <Route path="/json" element={<XmlTojson />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/voucher" element={<Voucher />} />
          <Route path="/edit" element={<EditVoucher />} />

        </Routes>
      </div>
    </div>
  );
}

export default Navbar;
