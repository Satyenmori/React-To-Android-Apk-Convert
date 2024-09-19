import React, { useEffect, useState } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import { create } from "xmlbuilder2";
import { Storage } from "@capacitor/storage";
import { useNavigate } from "react-router-dom";
import { initDB, saveSalesData, fetchProductDetails } from "./databse";
const Sales = () => {
  const [entries, setEntries] = useState([
    { product: "", price: "", quantity: "", subtotal: "" },
  ]);
  const [parties, setParties] = useState([]);
  const navigator = useNavigate();

  const createXML = async (sales) => {
    let existingXML;
    try {
      // Retrieve existing XML from Capacitor Storage
      const { value } = await Storage.get({ key: "salesXML" });

      if (value) {
        // Parse existing XML if found
        existingXML = new DOMParser().parseFromString(value, "application/xml");
      } else {
        // Initialize new XML structure if not found
        existingXML = new DOMParser().parseFromString(
          `<TALLYMESSAGE xmlns:UDF="TallyUDF"></TALLYMESSAGE>`,
          "application/xml"
        );
      }

      // Select the TALLYMESSAGE tag
      const tallyMessage = existingXML.querySelector("TALLYMESSAGE");

      // Loop through sales entries and create new VOUCHER elements
      sales.forEach((sale) => {
        const voucher = existingXML.createElement("VOUCHER");
        const uniqueGUID = crypto.randomUUID();

        voucher.innerHTML = `
          <DATE>${sale.date}</DATE>
          <PARTYNAME>${sale.party}</PARTYNAME>
          <GUID>${uniqueGUID}</GUID>
          <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
          <GSTNATUREOFSALE>Inter State</GSTNATUREOFSALE>
          <GSTPARTYTYPE>Regular</GSTPARTYTYPE>
          <UDF:GSTRETURNTYPE>Regular</UDF:GSTRETURNTYPE>
          <UDF:CONSULIEERGOODS>No</UDF:CONSULIEERGOODS>
          <VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
        `;

        let grandTotal = 0;

        // Create ALLINVENTORYENTRIES.LIST for each product in the sale
        sale.products.forEach((product) => {
          const inventoryEntry = existingXML.createElement(
            "ALLINVENTORYENTRIES.LIST"
          );
          inventoryEntry.innerHTML = `
            <STOCKITEMNAME>${product.product}</STOCKITEMNAME>
            <RATE>${product.price}/nos</RATE>
            <AMOUNT>${product.subtotal}</AMOUNT>
            <ACTUALQTY>${product.quantity} nos</ACTUALQTY>
            <ACCOUNTINGALLOCATIONS.LIST>
              <AMOUNT>${product.subtotal}</AMOUNT>
            </ACCOUNTINGALLOCATIONS.LIST>
          `;
          voucher.appendChild(inventoryEntry);

          // Calculate the grand total
          grandTotal += parseFloat(product.subtotal);
        });

        // Create and append LEDGERENTRIES.LIST with the grand total
        const ledgerEntry = existingXML.createElement("LEDGERENTRIES.LIST");
        ledgerEntry.innerHTML = `
          <AMOUNT>${grandTotal.toFixed(2)}</AMOUNT>
          <BILLALLOCATIONS.LIST>
            <AMOUNT>${grandTotal.toFixed(2)}</AMOUNT>
          </BILLALLOCATIONS.LIST>
        `;
        voucher.appendChild(ledgerEntry);

        // Append the completed voucher to TALLYMESSAGE
        tallyMessage.appendChild(voucher);
      });

      // Serialize the updated XML back to string
      const updatedXML = new XMLSerializer().serializeToString(existingXML);

      // Save updated XML back to Capacitor Storage
      await Storage.set({
        key: "salesXML",
        value: updatedXML,
      });

      alert("Sales data add successfully!");
      navigator("/voucher");
    } catch (error) {
      console.error("Error saving sales data:", error);
    }
  };

  const handleProductChange = async (index, value) => {
    const selectedParty = document.getElementById("party").value;

    const newEntries = [...entries];
    newEntries[index].product = value;

    if (selectedParty && value) {
      // Fetch price and quantity for the selected product and party
      const { price, quantity } = await fetchProductDetails(
        selectedParty,
        value
      );
      newEntries[index].price = price || "";
      newEntries[index].quantity = quantity || "";
      newEntries[index].subtotal = (
        parseFloat(price) * parseInt(quantity, 10) || 0
      ).toFixed(2);
    }

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Collect sales data from the form
    const party = event.target.party.value;
    const date = event.target.date.value;

    const products = entries.map((entry) => ({
      product: entry.product,
      price: entry.price,
      quantity: entry.quantity,
      subtotal: entry.subtotal,
    }));

    // Store the sales in XML format (already implemented)
    const sales = [
      {
        date,
        products,
        party,
      },
    ];
    await createXML(sales);

    try {
      // Store party data into the SQLite database
      await saveSalesData(party, date, products);

      alert("Sales data has been saved to the database successfully!");

      // Navigate to the voucher page
      navigator("/voucher");
    } catch (error) {
      console.error("Error saving sales data to SQLite:", error);
      alert("There was an error saving the sales data. Please try again.");
    }
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
  useEffect(() => {
    const FetchParties = async () => {
      await initDB();
    };

    FetchParties();
  }, []);
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
          <option value="Havells">Havells</option>
          <option value="SrWater">SrWater</option>
          <option value="Alpha">Alpha</option>
          <option value="Kent">Kent</option>
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
          <button className="button-17" type="submit" role="button">
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
