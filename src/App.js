import React, { useState, useEffect } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import "./App.css";

function App() {
  const [fileUri, setFileUri] = useState(null);
  const [fileContent, setFileContent] = useState(null); // State to store file content

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Filesystem.requestPermissions();
        if (status.publicStorage !== "granted") {
          alert("Permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await uploadAndReadFile(file);
    }
  };

  const uploadAndReadFile = async (file) => {
    try {
      const base64data = await convertFileToBase64(file);
      const fileName = `uploaded_file.${file.name.split(".").pop()}`;
      const filePath = `/${fileName}`;

      const result = await Filesystem.writeFile({
        path: filePath,
        data: base64data,
        directory: Directory.External,
        encoding: Encoding.Base64,
      });

      alert("File uploaded successfully");
      setFileUri(result.uri); // Save the file URI to state

      // Read and parse the file content
      const fileData = await Filesystem.readFile({
        path: filePath,
        directory: Directory.External,
        encoding: Encoding.UTF8,
      });

      const parsedXML = parseXML(fileData.data); // Parse XML data
      setFileContent(parsedXML); // Save parsed content to state
    } catch (error) {
      console.error("Error uploading or reading file:", error);
      alert("Failed to upload or read file: " + error.message);
    }
  };

  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result.split(",")[1]);
      };
      reader.readAsDataURL(file);
    });

  const parseXML = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Upload and Open a File</h1>
        <div className="formdata">
          <form>
            <input type="file" onChange={handleFileChange} />
          </form>
          {fileUri && (
            <div>
              <h2>Uploaded File URI:</h2>
              <p>{fileUri}</p>
            </div>
          )}
          {fileContent && (
            <div>
              <h2>File Content:</h2>
              <pre style={{ color: 'black' }}>{fileContent}</pre>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
