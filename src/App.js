import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';
import "./App.css";

function App() {
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const requestPermissions = async () => {
    const permissionResult = await Filesystem.requestPermissions();
    if (permissionResult.publicStorage !== 'granted') {
      alert('Permission to write files was denied');
      throw new Error('Permission denied');
    }
  };

  const generatePDF = async () => {
    try {
      if (Capacitor.getPlatform() === 'android') {
        await requestPermissions();
      }

      const doc = new jsPDF();
      doc.text("This is my menu PDF!", 10, 10);
      const pdfOutput = doc.output('datauristring');

      const base64data = pdfOutput.split(',')[1];

      try {
        await Filesystem.writeFile({
          path: 'menu.pdf',
          data: base64data,
          directory: Directory.External,
          encoding: Encoding.Base64,
        });
        alert('PDF saved successfully');
        setPdfGenerated(true);
      } catch (error) {
        console.error('Error saving PDF:', error);
        alert('Failed to save PDF: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openPDF = async () => {
    try {
      const fileUri = await Filesystem.getUri({
        directory: Directory.External,
        path: 'menu.pdf',
      });

      await FileOpener.open({
        filePath: fileUri.uri,
        contentType: 'application/pdf',
      });
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Failed to open PDF: ' + error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Download My PDF</h1>
        <div className="formdata">
          <form>
            <button type="button" onClick={generatePDF}>
              Print
            </button>
            {pdfGenerated && (
              <button type="button" onClick={openPDF}>
                Open PDF
              </button>
            )}
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
