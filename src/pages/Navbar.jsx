import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">XML-READ</Link>
        </li>
        <li>
          <Link to="/json">Convert JSON</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
