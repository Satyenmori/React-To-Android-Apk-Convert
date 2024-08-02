import React, { useState } from "react";
import "../Style/Sales.css";
import { FaPlus, FaMinus } from "react-icons/fa";

const Sales = () => {
  const [entries, setEntries] = useState([{ price: "", quantity: "", subtotal: "" }]);

  const handlePriceChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].price = value;
    newEntries[index].subtotal = (parseFloat(value) * parseInt(newEntries[index].quantity, 10) || 0).toFixed(2);
    setEntries(newEntries);
  };

  const handleQuantityChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].quantity = value;
    newEntries[index].subtotal = (parseFloat(newEntries[index].price) * parseInt(value, 10) || 0).toFixed(2);
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { price: "", quantity: "", subtotal: "" }]);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <div className="container">
      {/* <h1 className="title">Sales Form</h1> */}
      <form className="sales-form">
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" required />

        <label htmlFor="party">Party:</label>
        <select id="party" name="party" required>
          <option value="">Select Party</option>
          <option value="party1">Party 1</option>
          <option value="party2">Party 2</option>
        </select>

        <label htmlFor="product">Product:</label>
        <select id="product" name="product" required>
          <option value="">Select Product</option>
          <option value="product1">Product 1</option>
          <option value="product2">Product 2</option>
        </select>

        {entries.map((entry, index) => (
          <div key={index} className="entry-group">
            <div className="inline-group">
              <div>
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
              <div>
                <label htmlFor={`quantity-${index}`}>Quantity:</label>
                <input
                  type="number"
                  id={`quantity-${index}`}
                  name={`quantity-${index}`}
                  value={entry.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="subtotal-container">
              <div className="subtotal-label-value">
                <label htmlFor={`subtotal-${index}`}>Sub-Total:</label>
                <span className="subtotal-value">{entry.subtotal}</span>
              </div>
              {entries.length > 1 && index !== 0 && (
                <div className="subtotal-icon-container" onClick={() => removeEntry(index)}>
                  <FaMinus className="subtotal-icon" />
                </div>
              )}
            </div>
          </div>
        ))}

        {entries.length > 0 && (
          <div className="add-entry-container">
            <FaPlus className="add-icon" onClick={addEntry} />
          </div>
        )}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Sales;
