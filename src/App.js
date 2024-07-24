import React, { useState, useEffect } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Device } from "@capacitor/device";
import { Capacitor } from "@capacitor/core";
import "./App.css";

function App() {
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    requestPermissions();
    readXMLFromDownloads();
  }, []);

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Device.getInfo();
        if (status.platform === "android") {
          const result = await Filesystem.requestPermissions();
          if (!result.publicStorage) {
            alert("Permission denied!");
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const readXMLFromDownloads = async () => {
    try {
      const fileName = "sample.xml"; // Replace with your actual file name
      const result = await Filesystem.readFile({
        path: `WhatsApp/Media/WhatsApp Documents/${fileName}`,
        directory: Directory.ExternalStorage, // or Directory.External if you are sure it's stored here
        encoding: Encoding.UTF8,
      });

      // Logging the result to verify the content
      console.log(result.data);

      // Check if the data is valid and not empty
      if (!result.data || result.data.trim() === "") {
        throw new Error("File content is empty or cannot be read");
      }

      const parsedXML = parseXML(result.data);
      setFileContent(parsedXML);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file: " + error.message);
    }
  };

  const parseXML = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      // Check if there was a parsing error
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error(parseError[0].textContent);
      }

      return xmlDoc.documentElement.outerHTML;
    } catch (error) {
      console.error("Error parsing XML:", error);
      return "Error parsing XML: " + error.message;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Read File from Downloads</h1>
        <div className="formdata">
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
