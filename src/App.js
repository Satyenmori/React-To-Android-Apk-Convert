import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import XmlFileRead from "./pages/XmlFile-read";
import Navbar from "./pages/Navbar";
import XmlTojson from "./pages/XmlToJson";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<XmlFileRead />} />
          <Route path="/json" element={<XmlTojson />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
