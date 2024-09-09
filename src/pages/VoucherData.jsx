import React, { useState, useEffect } from "react";
import { Storage } from "@capacitor/storage";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import "../Style/Voucherdata.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

const Voucher = () => {
  const [fileContent, setFileContent] = useState(null);
  const [jsonContent, setJsonContent] = useState(null);

  useEffect(() => {
    const loadFileContent = async () => {
      try {
        const { value } = await Storage.get({ key: "salesXML" });

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

  // Handle voucher deletion
  const handleDelete = async (guid) => {
    try {
      // Filter out the voucher with the matching GUID
      const updatedEntries = ledgerEntries.filter(
        (entry) => entry.VOUCHER.GUID !== guid
      );

      
      const updatedJsonContent = {
        ...jsonContent,
        ENVELOPE: {
          ...jsonContent.ENVELOPE,
          BODY: {
            ...jsonContent.ENVELOPE.BODY,
            IMPORTDATA: {
              ...jsonContent.ENVELOPE.BODY.IMPORTDATA,
              REQUESTDATA: {
                ...jsonContent.ENVELOPE.BODY.IMPORTDATA.REQUESTDATA,
                TALLYMESSAGE: updatedEntries, // Update with the filtered vouchers
              },
            },
          },
        },
      };
      
      // Rebuild XML from updated JSON
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        ignoreTextNodeAttr: true,
      });
      const updatedXML = builder.build(updatedJsonContent);

      // Store the updated XML back to local storage
      await Storage.set({ key: "salesXML", value: updatedXML });

      // Update state
      setJsonContent(updatedJsonContent);
    } catch (error) {
      console.error("Error deleting voucher:", error);
    }
  };
  return (
    <div className="container">
      <h2 style={{ color: "black", textAlign: "center" }}>VOUCHER DATA</h2>
      <div className="table-responsive">
        {ledgerEntries?.length > 0 ? (
          <table className="voucher-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{entry.VOUCHER.DATE}</td>
                  <td>{entry.VOUCHER.ITEMNAME}</td>
                  <td>{entry.VOUCHER.QUANTITY}</td>
                  <td>{entry.VOUCHER.RATE}</td>
                  <td>{entry.VOUCHER.AMOUNT}</td>
                  <td>
                    <Link to={`/edit/${entry.VOUCHER.GUID}`}>
                      {" "}
                      <button className="edit-btn">{<FaEdit />}</button>
                    </Link>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(entry.VOUCHER.GUID)}
                    >
                      {<FaTrash />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Voucher data available.</p>
        )}
      </div>
    </div>
  );
};

export default Voucher;
