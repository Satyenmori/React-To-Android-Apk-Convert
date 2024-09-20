import React, { useState, useEffect } from "react";
import { Storage } from "@capacitor/storage";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import "../Style/Voucherdata.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import { deleteVoucher } from "./databse";

const Voucher = () => {
  const [jsonContent, setJsonContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadFileContent = async () => {
      try {
        const { value } = await Storage.get({ key: "salesXML" });

        if (value) {
          const parser = new XMLParser({
            ignoreAttributes: false,
            ignoreTextNodeAttr: true,
          });
          const json = parser.parse(value);
          const vouchers = json.TALLYMESSAGE?.VOUCHER;
          if (vouchers && !Array.isArray(vouchers)) {
            json.TALLYMESSAGE.VOUCHER = [vouchers];
          }
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

  // Handle voucher deletion
  const handleDelete = async (guid, party, date) => {
    try {
      const updatedVouchers = jsonContent.TALLYMESSAGE.VOUCHER.filter(
        (voucher) => voucher.GUID !== guid
      );

      const updatedJsonContent = {
        ...jsonContent,
        TALLYMESSAGE: {
          ...jsonContent.TALLYMESSAGE,
          VOUCHER: updatedVouchers,
        },
      };

      const builder = new XMLBuilder({
        ignoreAttributes: false,
        ignoreTextNodeAttr: true,
      });
      const updatedXML = builder.build(updatedJsonContent);

      // Store the updated XML back to local storage
      await Storage.set({ key: "salesXML", value: updatedXML });

      // Update state
      setJsonContent(updatedJsonContent);

      // sql data delete
      await deleteVoucher(party, date);

      alert("Voucher deleted successfully from LS and SQL.");
    } catch (error) {
      console.error("Error deleting voucher:", error);
      alert("Error deleting voucher: " + error.message);
    }
  };

  // Handle search filtering
  const filteredEntries = jsonContent?.TALLYMESSAGE?.VOUCHER?.filter(
    (entry) => {
      const partyName = entry.PARTYNAME.toLowerCase().startsWith(
        searchTerm.toLowerCase()
      );
      const dateMatch = entry.DATE.includes(searchTerm);

      return partyName || dateMatch;
    }
  );
  // print handle
  const handlePrint = async () => {
    const { value: xmlData } = await Storage.get({ key: "salesXML" });
    if (xmlData) {
      const blob = new Blob([xmlData], { type: "application/xml" });

      saveAs(blob, "File1.xml");
    } else {
      alert("No sales data available to print.");
    }
  };

  return (
    <div className="container">
      <h2 style={{ color: "black", textAlign: "center" }}>VOUCHER DATA</h2>

      {/* Top section with "Add New Form" button and Search Bar */}
      <div className="top-bar">
        <div className="left">
          <Link to="/sales">
            <button className="addbtn">Add New Form</button>
          </Link>
        </div>
        <div className="right">
          <input
            type="text"
            placeholder="Search Party......"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>
      </div>

      <div className="table-responsive">
        {filteredEntries?.length > 0 ? (
          <table className="voucher-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Party Name</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => {
                const stockItems = entry["ALLINVENTORYENTRIES.LIST"];

                // Ensure `stockItems` is always an array
                const stockItemsArray = Array.isArray(stockItems)
                  ? stockItems
                  : stockItems
                  ? [stockItems]
                  : [];

                const itemCount = stockItemsArray.length;
                const ledgerAmount =
                  entry["LEDGERENTRIES.LIST"]?.["AMOUNT"] ?? "N/A";
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{entry.DATE}</td>
                    <td>{entry.PARTYNAME}</td>
                    <td>{itemCount} Product</td>
                    <td>{ledgerAmount}</td>

                    <td>
                      <Link to={`/edit/${entry.GUID}`}>
                        <button className="edit-btn">{<FaEdit />}</button>
                      </Link>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(entry.GUID, entry.PARTYNAME, entry.DATE)
                        }
                      >
                        {<FaTrash />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No Voucher data available.</p>
        )}
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button className="btndis" type="button" onClick={handlePrint}>
          <span>Download XML File</span>
        </button>
      </div>
    </div>
  );
};

export default Voucher;
