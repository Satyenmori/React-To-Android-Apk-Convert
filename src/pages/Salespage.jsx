import React, { useState } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import { create } from "xmlbuilder2";
import { Storage } from "@capacitor/storage";
import { useNavigate } from "react-router-dom";
const Sales = () => {
  const [entries, setEntries] = useState([
    { product: "", price: "", quantity: "", subtotal: "" },
  ]);
  const navigator=useNavigate()
  const createXML = async (sales) => {
    // Retrieve existing XML from Capacitor Storage or initialize new XML
    let existingXML;
    try {
      const { value } = await Storage.get({ key: "salesXML" });
      if (value) {
        existingXML = new DOMParser().parseFromString(value, "application/xml");
      } else {
        existingXML = new DOMParser().parseFromString(
          `
          <ENVELOPE>
            <HEADER>
              <TALLYREQUEST>Import Data</TALLYREQUEST>
            </HEADER>
            <BODY>
              <IMPORTDATA>
                <REQUESTDESC>
                  <REPORTNAME>All Masters</REPORTNAME>
                  <STATICVARIABLES>
                    <SVCURRENTCOMPANY>My Company</SVCURRENTCOMPANY>
                  </STATICVARIABLES>
                </REQUESTDESC>
                <REQUESTDATA></REQUESTDATA>
              </IMPORTDATA>
            </BODY>
          </ENVELOPE>
        `,
          "application/xml"
        );
      }

      const requestData = existingXML.querySelector("REQUESTDATA");

      sales.forEach((sale) => {
        const tallyMessage = existingXML.createElement("TALLYMESSAGE");
        tallyMessage.setAttribute("xmlns:UDF", "TallyUDF");

        const voucher = existingXML.createElement("VOUCHER");
        voucher.innerHTML = `
          <DATE>${sale.date}</DATE>
          <GUID>12345678</GUID>
          <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
          <GSTNATUREOFSALE>Inter State</GSTNATUREOFSALE>
          <GSTPARTYTYPE>Regular</GSTPARTYTYPE>
          <UDF:GSTRETURNTYPE>Regular</UDF:GSTRETURNTYPE>
          <UDF:CONSULIEERGOODS>No</UDF:CONSULIEERGOODS>
          <VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
          <ITEMNAME>${sale.product}</ITEMNAME>
          <CATEGORYNAME>Sales</CATEGORYNAME>
          <GSTCLASS>Regular</GSTCLASS>
          <GSTEXEMPT>No</GSTEXEMPT>
          <BATCHNAME>${sale.product}-2024</BATCHNAME>
          <EXPIRYPERIOD>Default</EXPIRYPERIOD>
          <QUANTITY>${sale.quantity}</QUANTITY>
          <RATE>${sale.price}</RATE>
          <AMOUNT>${sale.subtotal}</AMOUNT>
          <!-- Add other elements as needed -->
        `;

        tallyMessage.appendChild(voucher);
        requestData.appendChild(tallyMessage);
      });

      const updatedXML = new XMLSerializer().serializeToString(existingXML);

      await Storage.set({
        key: "salesXML",
        value: updatedXML,
      });
      alert("Sales data saved as XML to Capacitor Storage!");
      navigator("/voucher")
    } catch (error) {
      console.error("Error saving sales data:", error);
    }
  };

  const handleProductChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].product = value;
    setEntries(newEntries);
  };

  const handlePriceChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].price = value;
    newEntries[index].subtotal = (
      parseFloat(value) * parseInt(newEntries[index].quantity, 10) || 0
    ).toFixed(2);
    setEntries(newEntries);
  };

  const handleQuantityChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].quantity = value;
    newEntries[index].subtotal = (
      parseFloat(newEntries[index].price) * parseInt(value, 10) || 0
    ).toFixed(2);
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      { product: "", price: "", quantity: "", subtotal: "" },
    ]);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const getGrandTotal = () => {
    return entries
      .reduce((total, entry) => total + parseFloat(entry.subtotal || 0), 0)
      .toFixed(2);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const sales = entries.map((entry) => ({
      date: event.target.date.value,
      product: entry.product,
      price: entry.price,
      quantity: entry.quantity,
      subtotal: entry.subtotal,
      party: event.target.party.value,
    }));

    // Create XML for each sales entry
    createXML(sales);
  };
  const ShowAddIcon = () => {
    const lastEntry = entries[entries.length - 1];
    return lastEntry.subtotal && parseFloat(lastEntry.subtotal) > 0;
  };

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
      <h1 className="title">Sales Form</h1>
      <form className="sales-form" onSubmit={handleSubmit}>
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" required />

        <label htmlFor="party">Party:</label>
        <select id="party" name="party" required>
          <option value="">Select Party</option>
          <option value="Flourish">Flourish</option>
          <option value="Flonix">Flonix</option>
        </select>

        {entries.map((entry, index) => (
          <div key={index} className="entry-group">
            <div className="entry-fields">
              <div className="field-group">
                <label htmlFor={`product-${index}`}>Product:</label>
                <select
                  id={`product-${index}`}
                  name={`product-${index}`}
                  value={entry.product}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  <option value="Ro Pump">Ro Pump</option>
                  <option value="Membrane">Membrane</option>
                </select>
              </div>

              <div className="inline-group">
                <div className="field-group">
                  <label htmlFor={`price-${index}`}>Price:</label>
                  <input
                    type="number"
                    id={`price-${index}`}
                    name={`price-${index}`}
                    value={entry.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label htmlFor={`quantity-${index}`}>Quantity:</label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    name={`quantity-${index}`}
                    value={entry.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor={`subtotal-${index}`}>Sub-Total:</label>
                <span className="subtotal-value">{entry.subtotal}</span>
              </div>
            </div>
            {index !== 0 && (
              <FaTrashAlt
                className="subtotal-icon"
                onClick={() => removeEntry(index)}
              />
            )}
          </div>
        ))}
        {ShowAddIcon() && <FaPlus className="add-icon" onClick={addEntry} />}
        <div className="grand-total-container">
          <label htmlFor="grand-total">Grand Total:</label>
          <span className="grand-total-value">{getGrandTotal()}</span>
        </div>

        <div className="btn-group">
          <button class="button-17" type="submit" role="button">
            Submit
          </button>
          <button
            class="button-17"
            type="button"
            role="button"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sales;
