import React, { useState, useEffect } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { Storage } from "@capacitor/storage";
import { useNavigate, useParams } from "react-router-dom";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import {
  getAllLanguageNames,
  getAllProductNames,
  initDB,
  updateVoucherInDB,
} from "./databse";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

const CustomSelectBox = ({ options, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedParty, setSelectedParty] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    setSelectedParty(option);
    setSearchTerm(option);
    setShowDropdown(false);
    onChange(option);
  };

  return (
    <div className="custom-select-container">
      <input
        type="text"
        placeholder="Select Party..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        className="custom-select-input"
      />

      {showDropdown && (
        <ul className="custom-select-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className="custom-select-option"
              >
                {option}
              </li>
            ))
          ) : (
            <li className="custom-select-no-option">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};
const CustomProductSelectBox = ({ options, onChange, defaultSelected }) => {
  const [searchTerm, setSearchTerm] = useState(defaultSelected || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(defaultSelected || "");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    setSelectedProduct(option);
    setSearchTerm(option);
    setShowDropdown(false);
    onChange(option);
  };

  return (
    <div className="custom-select-container">
      <input
        type="text"
        // placeholder="Select Product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        className="custom-select-input"
      />

      {showDropdown && (
        <ul className="custom-select-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className="custom-select-option"
              >
                {option}
              </li>
            ))
          ) : (
            <li className="custom-select-no-option">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

const EditSales = () => {
  const [entries, setEntries] = useState([
    { product: "", price: "", quantity: "", subtotal: "" },
  ]);
  const [initialData, setInitialData] = useState(null);
  const [partyNames, setPartyNames] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [selectedPartyName, setSelectedPartyName] = useState(
    initialData?.PARTYLEDGERNAME || ""
  );
  const [selectedProducts, setSelectedProducts] = useState(
    entries.map((entry) => entry.product || "")
  );
  const { guid } = useParams();
  const navigator = useNavigate();

  useEffect(() => {
    const fetchVoucherData = async () => {
      try {
        await initDB();
        const file = await Filesystem.readFile({
          path: "Transaction.xml",
          directory: Directory.External,
          encoding: Encoding.UTF8,
        });
        if (file.data) {
          const parser = new XMLParser({
            ignoreAttributes: false,
            ignoreTextNodeAttr: true,
          });
          const json = parser.parse(file.data);
          const voucher = json?.TALLYMESSAGE?.VOUCHER?.find(
            (entry) => entry.GUID === guid
          );
          if (voucher) {
            setInitialData(voucher);
            let inventoryEntries = voucher["ALLINVENTORYENTRIES.LIST"];
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
        }
      } catch (error) {
        console.error("Error fetching voucher data", error);
      }
    };
    const fetchPartyNames = async () => {
      try {
        await initDB();
        const partyNames = await getAllLanguageNames();
        setPartyNames(partyNames);
      } catch (error) {
        alert("Error fetching party names:" + error.message);
      }
    };
    const fetchProductNames = async () => {
      try {
        await initDB();
        const productNames = await getAllProductNames();
        setProductNames(productNames);
      } catch (error) {
        alert("Error fetching product names: " + error.message);
      }
    };
    fetchVoucherData();
    fetchPartyNames();
    fetchProductNames();
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
  };

  const getGrandTotal = () => {
    return entries
      .reduce((total, entry) => total + parseFloat(entry.subtotal || 0), 0)
      .toFixed(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Read the existing XML file
      const file = await Filesystem.readFile({
        path: "Transaction.xml",
        directory: Directory.External,
        encoding: Encoding.UTF8,
      });

      if (file.data) {
        const parser = new XMLParser({
          ignoreAttributes: false,
          ignoreTextNodeAttr: true,
        });

        // Parse XML to JSON
        const json = parser.parse(file.data);
        const voucherIndex = json?.TALLYMESSAGE?.VOUCHER?.findIndex(
          (entry) => entry.GUID === guid
        );

        if (voucherIndex !== -1) {
          const updatedVoucher = json.TALLYMESSAGE.VOUCHER[voucherIndex];

          // Format the date
          const rawDate = document.getElementById("date").value;
          const formattedDate = rawDate.replace(/-/g, "");
          updatedVoucher.DATE = formattedDate;
          updatedVoucher.VCHSTATUSDATE = formattedDate;

          // Update the party name in relevant fields
          const partyName = selectedPartyName;
          const partyFields = [
            "PARTYLEDGERNAME",
            "BASICBUYERNAME",
            "PARTYMAILINGNAME",
            "CONSIGNEEMAILINGNAME",
            "BASICBASEPARTYNAME",
          ];

          // Update all related party fields if they exist
          partyFields.forEach((field) => {
            if (updatedVoucher[field] !== undefined) {
              updatedVoucher[field] = partyName;
            }
          });

          // Ensure ALLINVENTORYENTRIES.LIST is an array
          let allInventoryEntries = updatedVoucher["ALLINVENTORYENTRIES.LIST"];

          if (!Array.isArray(allInventoryEntries)) {
            allInventoryEntries = [allInventoryEntries];
          }

          // Update inventory entries
          updatedVoucher["ALLINVENTORYENTRIES.LIST"] = allInventoryEntries.map(
            (existingInventoryEntry, index) => {
              const updatedEntry = entries[index] || existingInventoryEntry;
              return {
                ...existingInventoryEntry,
                STOCKITEMNAME:
                  updatedEntry.product || existingInventoryEntry.STOCKITEMNAME,
                RATE:
                  `${updatedEntry.price}/pcs` || existingInventoryEntry.RATE,
                ACTUALQTY:
                  `${updatedEntry.quantity} pcs` ||
                  existingInventoryEntry.ACTUALQTY,
                BILLEDQTY:
                  `${updatedEntry.quantity} pcs` ||
                  existingInventoryEntry.BILLEDQTY,
                AMOUNT: updatedEntry.subtotal || existingInventoryEntry.AMOUNT,
                "BATCHALLOCATIONS.LIST": {
                  ...existingInventoryEntry["BATCHALLOCATIONS.LIST"],
                  ACTUALQTY:
                    `${updatedEntry.quantity} pcs` ||
                    existingInventoryEntry["BATCHALLOCATIONS.LIST"].ACTUALQTY,
                  BILLEDQTY:
                    `${updatedEntry.quantity} pcs` ||
                    existingInventoryEntry["BATCHALLOCATIONS.LIST"].BILLEDQTY,
                  AMOUNT:
                    updatedEntry.subtotal ||
                    existingInventoryEntry["BATCHALLOCATIONS.LIST"].AMOUNT,
                },
                "ACCOUNTINGALLOCATIONS.LIST": {
                  ...existingInventoryEntry["ACCOUNTINGALLOCATIONS.LIST"],
                  AMOUNT:
                    updatedEntry.subtotal ||
                    existingInventoryEntry["ACCOUNTINGALLOCATIONS.LIST"].AMOUNT,
                },
              };
            }
          );

          // Ensure LEDGERENTRIES.LIST is an array
          let ledgerEntries = updatedVoucher["LEDGERENTRIES.LIST"];

          if (!Array.isArray(ledgerEntries)) {
            ledgerEntries = [ledgerEntries];
          }

          // Update the ledger entries while keeping other fields intact
          const grandTotal = getGrandTotal();
          updatedVoucher["LEDGERENTRIES.LIST"] = ledgerEntries.map(
            (ledgerEntry) => ({
              ...ledgerEntry,
              LEDGERNAME: partyName || ledgerEntry.LEDGERNAME,
              AMOUNT: `-${grandTotal}` || ledgerEntry.AMOUNT,
              "BILLALLOCATIONS.LIST": {
                ...ledgerEntry["BILLALLOCATIONS.LIST"],
                AMOUNT:
                  `-${grandTotal}` ||
                  ledgerEntry["BILLALLOCATIONS.LIST"].AMOUNT,
              },
            })
          );

          // Convert JSON back to XML
          const builder = new XMLBuilder({ ignoreAttributes: false });
          const updatedXML = builder.build(json);

          // Write the updated XML back to the file
          await Filesystem.writeFile({
            path: "Transaction.xml",
            directory: Directory.External,
            data: updatedXML,
            encoding: "utf8",
          });

          // Prepare data for database update
          const products = entries.map((entry) => ({
            product: entry.product,
            price: entry.price,
            quantity: entry.quantity,
          }));

          // Update the voucher in the database
          await updateVoucherInDB(partyName, products);

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
      alert("Error updating voucher data: " + error.message);
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
        <CustomSelectBox
          options={partyNames}
          onChange={(selectedParty) => {
            setSelectedPartyName(selectedParty);
          }}
          defaultSelected={initialData?.PARTYLEDGERNAME || ""}
        />

        {entries.map((entry, index) => (
          <div key={index} className="entry-group">
            <div className="entry-fields">
              <div className="field-group">
                <label htmlFor={`product-${index}`}>Product:</label>
                <CustomProductSelectBox
                  options={productNames}
                  defaultSelected={entry.product || ""}
                  onChange={(selectedProduct) =>
                    handleProductChange(index, selectedProduct)
                  }
                />
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
