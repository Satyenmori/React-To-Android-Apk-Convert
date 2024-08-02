import React, { useState } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";

const Sales = () => {
  const [entries, setEntries] = useState([
    { product: "", price: "", quantity: "", subtotal: "" },
  ]);

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

  return (
    <div className="container">
      <h1 className="title">Sales Form</h1>
      <form className="sales-form">
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" required />

        <label htmlFor="party">Party:</label>
        <select id="party" name="party" required>
          <option value="">Select Party</option>
          <option value="party1">Party 1</option>
          <option value="party2">Party 2</option>
        </select>

        {entries.map((entry, index) => (
          <div key={index} className="entry-group">
            <div className="entry-fields">
              <div className="field-group">
                <label htmlFor={`product-${index}`}>Product:</label>
                <span className="two-icone">
                  {index === 0 ? (
                    <FaPlus className="add-icon" onClick={addEntry} />
                  ) : (
                    <FaTrashAlt
                      className="subtotal-icon"
                      onClick={() => removeEntry(index)}
                    />
                  )}
                </span>
                <select
                  id={`product-${index}`}
                  name={`product-${index}`}
                  value={entry.product}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  <option value="product1">Product 1</option>
                  <option value="product2">Product 2</option>
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
          </div>
        ))}

        <div className="grand-total-container">
          <label htmlFor="grand-total">Grand Total:</label>
          <span className="grand-total-value">{getGrandTotal()}</span>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Sales;
