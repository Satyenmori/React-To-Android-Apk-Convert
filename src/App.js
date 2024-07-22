import React, { useState, useEffect } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Device } from "@capacitor/device";
import { Capacitor } from "@capacitor/core";
import "./App.css";

function App() {
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Device.getInfo();
        if (status.platform === 'android' && parseInt(status.osVersion.split('.')[0]) >= 10) {
          // Add necessary permission request logic if needed
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const openFilePicker = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.xml'; // adjust file types if needed
      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const parsedXML = parseXML(reader.result);
          setFileContent(parsedXML);
        };
        reader.readAsText(file);
      };
      fileInput.click();
    } catch (error) {
      console.error("Error opening file picker:", error);
    }
  };

  const parseXML = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Read File from Downloads</h1>
        <div className="formdata">
          <button onClick={openFilePicker}>Read sample.xml</button>
          {fileContent && (
            <div>
              <h2>File Content:</h2>
              <pre style={{ color: "red" }}>{fileContent}</pre>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
