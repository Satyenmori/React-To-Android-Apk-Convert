import React, { useState, useEffect } from "react";
import { Storage } from "@capacitor/storage";
import { XMLParser } from "fast-xml-parser";
import "../App.css";

const XmlTojson = () => {
  const [fileContent, setFileContent] = useState(null);
  const [jsonContent, setJsonContent] = useState(null);

  useEffect(() => {
    const loadFileContent = async () => {
      try {
        const { value } = await Storage.get({ key: "SrData" });

        if (value) {
          setFileContent(value);
          const parser = new XMLParser();
          const json = parser.parse(value);
          setJsonContent(json);
          console.log("Json Data", json);
        } else {
          alert("No content found.");
        }
      } catch (error) {
        console.error("Error loading file content:", error);
      }
    };
    loadFileContent();
  }, []);

  // Filter LEDGER entries
  const ledgerEntries =
    jsonContent?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE?.filter(
      (entry) => entry.LEDGER
    );

  return (
    <div className="container">
      <header className="App-header">
        <div className="content">
          {fileContent ? (
            <>
              <div className="left-side">
                <h2 style={{ color: "black" }}>Converted JSON</h2>
                <hr />
                <pre style={{ color: "white" }}>
                  {JSON.stringify(jsonContent, null, 2)}
                </pre>
              </div>
              <div className="right-side">
                <h2 style={{ color: "black" }}>LEDGER Data</h2>
                <hr />
                {ledgerEntries?.length > 0 ? (
                  ledgerEntries.map((entry, index) => (
                    <div key={index}>
                      <p>Parent: {entry.LEDGER.PARENT}</p>
                      <p>Currency Name: {entry.LEDGER.CURRENCYNAME}</p>
                      <p>Dealer Type: {entry.LEDGER.VATDEALERTYPE}</p>

                      <p>GUID: {entry.LEDGER.GUID}</p>
                      <hr />
                      {/* Add more fields as needed */}
                    </div>
                  ))
                ) : (
                  <p>No LEDGER data available.</p>
                )}
              </div>
            </>
          ) : (
            <p>No file content available.</p>
          )}
        </div>
      </header>
    </div>
  );
};

export default XmlTojson;
