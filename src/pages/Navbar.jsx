import React, { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { FaFileImport, FaExchangeAlt, FaBars, FaFilePdf } from "react-icons/fa"; // Import Font Awesome icons
import "../Style/Navbar.css";
import XmlFileRead from "./ImportPage";
import XmlTojson from "./XmlToJson";
import {
  MdOutlineAttachMoney,
  MdOutlineFormatAlignCenter,
  MdOutlinePictureAsPdf,
  MdPictureAsPdf,
} from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import Sales from "./Salespage";
import Sample from "./Sample";

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
            <Link to="/sales">
              <FaFilePdf />
              {isExpanded && " SALES"}
            </Link>
          </li>
          <li>
            <Link to="/sample">
              <FaExchangeAlt />
              {isExpanded && " Sample"}
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
          <Route path="/sample" element={<Sample />} />

        </Routes>
      </div>
    </div>
  );
}

export default Navbar;
