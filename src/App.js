import React, { useState, useEffect } from "react";
import { Filesystem, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Storage } from "@capacitor/storage";
import "./App.css";

function App() {
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    // Retrieve saved file content from storage on component mount
    const loadFileContent = async () => {
      try {
        const { value } = await Storage.get({ key: 'fileContent' });
        if (value) {
          setFileContent(value);
        }
      } catch (error) {
        console.error("Error loading file content:", error);
      }
    };
    loadFileContent();
  }, []);

  const openFilePicker = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const file = await pickFile();
        if (file) {
          readFileContent(file);
        } else {
          alert("No file selected.");
        }
      } else {
        alert("File picking not supported on this platform.");
      }
    } catch (error) {
      console.error("Error opening file picker:", error);
      alert("Error opening file picker: " + error.message);
    }
  };

  const pickFile = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/xml,text/xml,.xml";
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log("Selected file:", file); // Debugging
          const reader = new FileReader();
          reader.onload = () => {
            console.log("File content:", reader.result); // Debugging
            resolve({
              uri: file.name,
              content: reader.result,
            });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        } else {
          reject(new Error("No file selected"));
        }
      };
      input.click();
    });
  };

  const readFileContent = async (file) => {
    try {
      if (file && file.content) {
        const parsedXML = parseXML(file.content);
        setFileContent(parsedXML);

        // Save file content to storage
        await Storage.set({
          key: 'fileContent',
          value: parsedXML,
        });
      } else {
        throw new Error("File content is empty or cannot be read");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file: " + error.message);
    }
  };

  const parseXML = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Error parsing XML");
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
        <button onClick={openFilePicker}>Select XML File</button>
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
