import React, { useState, useEffect } from "react";
import { Storage } from "@capacitor/storage";
import "../App.css";

function XmlFileRead() {
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
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
      const file = await pickFile();
      if (file) {
        readFileContent(file);
      } else {
        alert("No file selected.");
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
          const reader = new FileReader();
          reader.onload = () => {
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
        setFileContent(file.content);
        await Storage.set({ key: 'fileContent', value: file.content });
      } else {
        throw new Error("File content is empty or cannot be read");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file: " + error.message);
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

export default XmlFileRead;
