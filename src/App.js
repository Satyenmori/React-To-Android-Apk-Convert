import React, { useState, useEffect } from "react";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import "./App.css";

function App() {
  const [fileUri, setFileUri] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Filesystem.requestPermissions();
        if (status.publicStorage !== 'granted') {
          alert('Permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    try {
      const base64data = await convertFileToBase64(file);

      const fileName = `uploaded_file.${file.name.split('.').pop()}`;

      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64data,
        directory: Directory.External,
        encoding: Encoding.Base64,
      });

      alert('File uploaded successfully');
      setFileUri(result.uri);  // Save the file URI to state
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
    }
  };

  const convertFileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  });

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
              <h2>Uploaded File:</h2>
              {/* Example: Display file URI */}
              <p>{fileUri}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
