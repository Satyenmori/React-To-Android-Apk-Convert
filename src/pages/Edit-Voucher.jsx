import React, { useState, useEffect } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import { Storage } from "@capacitor/storage";
import { useNavigate, useParams } from "react-router-dom";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

const EditSales = () => {
  const [entries, setEntries] = useState([
    { product: "", price: "", quantity: "", subtotal: "" },
  ]);
  const [initialData, setInitialData] = useState(null);
  const { guid } = useParams();
  const navigator = useNavigate();

  useEffect(() => {
    const fetchVoucherData = async () => {
      try {
        // Fetch voucher data to edit based on the ID
        const { value } = await Storage.get({ key: "salesXML" });
        if (value) {
          const parser = new XMLParser({
            ignoreAttributes: false,
            ignoreTextNodeAttr: true,
          });
          const json = parser.parse(value);
          const voucher = json?.TALLYMESSAGE?.VOUCHER?.find(
            (entry) => entry.GUID === guid
          );
          if (voucher) {
            setInitialData(voucher);
            let inventoryEntries = voucher["ALLINVENTORYENTRIES.LIST"];
            // left only one produt in innventory then map error fix
            if (!Array.isArray(inventoryEntries)) {
              inventoryEntries = [inventoryEntries];
            }
            setEntries(
              inventoryEntries.map((item) => ({
                product: item.STOCKITEMNAME || "",
                price: item.RATE.split("/")[0] || "",
                quantity: item.ACTUALQTY.split(" ")[0] || "",
                subtotal: item.AMOUNT || "0",
              }))
            );
          }
          console.log("edit page data", initialData);
        }
      } catch (error) {
        console.error("Error fetching voucher data", error);
      }
    };

    fetchVoucherData();
  }, [guid]);

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
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
    // setEntries(entries.filter((_, i) => i !== index));
  };

  const getGrandTotal = () => {
    return entries
      .reduce((total, entry) => total + parseFloat(entry.subtotal || 0), 0)
      .toFixed(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Fetch the current XML data from local storage
      const { value } = await Storage.get({ key: "salesXML" });
      if (value) {
        const parser = new XMLParser({
          ignoreAttributes: false,
          ignoreTextNodeAttr: true,
        });

        const json = parser.parse(value);

        const voucherIndex = json?.TALLYMESSAGE?.VOUCHER?.findIndex(
          (entry) => entry.GUID === guid
        );

        if (voucherIndex !== -1) {
          const updatedVoucher = json.TALLYMESSAGE.VOUCHER[voucherIndex];

          updatedVoucher.DATE = document.getElementById("date").value;
          updatedVoucher.PARTYNAME = document.getElementById("party").value;

          updatedVoucher["ALLINVENTORYENTRIES.LIST"] = entries.map((entry) => ({
            STOCKITEMNAME: entry.product,
            RATE: `${entry.price}/Nos`,
            ACTUALQTY: `${entry.quantity} Nos`,
            AMOUNT: entry.subtotal,
          }));

          // grant Total logic
          const grandTotal = getGrandTotal();

          if (updatedVoucher["LEDGERENTRIES.LIST"]) {
            updatedVoucher["LEDGERENTRIES.LIST"].AMOUNT = grandTotal;
            if (updatedVoucher["LEDGERENTRIES.LIST"]["BILLALLOCATIONS.LIST"]) {
              updatedVoucher["LEDGERENTRIES.LIST"][
                "BILLALLOCATIONS.LIST"
              ].AMOUNT = grandTotal;
            }
          }

          const builder = new XMLBuilder({
            ignoreAttributes: false,
          });
          const updatedXML = builder.build(json);

          await Storage.set({ key: "salesXML", value: updatedXML });

          alert("Voucher updated successfully!");
          navigator("/voucher");
        } else {
          alert("Voucher not found");
        }
      } else {
        alert("No voucher data found");
      }
    } catch (error) {
      console.error("Error updating voucher data", error);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Edit Sales Form</h1>
      <form className="sales-form" onSubmit={handleSubmit}>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          required
          defaultValue={initialData?.DATE}
        />

        <label htmlFor="party">Party:</label>
        <select
          id="party"
          name="party"
          required
          defaultValue={initialData?.PARTYNAME || "NA"}
        >
          <option value={initialData?.PARTYNAME || "NA"}>
            {initialData?.PARTYNAME || "NA"}
          </option>
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
                  value={entry.product || ""}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  required
                >
                  <option value={entry.product || ""}>
                    {entry.product || ""}
                  </option>
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

        {entries.length > 0 && (
          <FaPlus className="add-icon" onClick={addEntry} />
        )}

        <div className="grand-total-container">
          <label htmlFor="grand-total">Grand Total:</label>
          <span className="grand-total-value">{getGrandTotal()}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button className="button-17" type="submit" role="button">
            Update Voucher
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSales;
