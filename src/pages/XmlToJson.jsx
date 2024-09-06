import React, { useState, useEffect } from "react";
import { Storage } from "@capacitor/storage";
import { XMLParser } from "fast-xml-parser";
import "../Style/Jsonpage.css";

const XmlTojson = () => {
  const [fileContent, setFileContent] = useState(null);
  const [jsonContent, setJsonContent] = useState(null);

  useEffect(() => {
    const loadFileContent = async () => {
      try {
        const { value } = await Storage.get({ key: "File1" });

        if (value) {
          setFileContent(value);
          const parser = new XMLParser({
            ignoreAttributes: false,
            ignoreTextNodeAttr: true,
          });
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
      (entry) => entry.VOUCHER
    );

  return (
    <div className="container">
      <div className="content">
        {fileContent ? (
          <>
            <div className="left-side">
              <h2 style={{ color: "black", textAlign: "center" }}>
                Converted JSON
              </h2>
              <hr />
              <pre style={{ color: "white" }}>
                {JSON.stringify(jsonContent, null, 2)}
              </pre>
            </div>
            <div className="right-side">
              <h2 style={{ color: "black", textAlign: "center" }}>
                VOUCHER DATA
              </h2>
              <hr />
              {ledgerEntries?.length > 0 ? (
                ledgerEntries.map((entry, index) => (
                  <div key={index}>
                    <p>Voucher Date: {entry.VOUCHER.DATE}</p>
                    <p>Item Name: {entry.VOUCHER.ITEMNAME}</p>
                    <p>Quantity: {entry.VOUCHER.QUANTITY}</p>
                    <p>Rate: {entry.VOUCHER.RATE}</p>
                    <p>Total Amounts: {entry.VOUCHER.AMOUNT}</p>

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
    </div>
  );
};

export default XmlTojson;
