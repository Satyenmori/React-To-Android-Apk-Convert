import React, { useState, useEffect } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { Storage } from "@capacitor/storage";
import { useNavigate, useParams } from "react-router-dom";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import {
  getAllLanguageNames,
  getAllProductNames,
  getAllUnitNames,
  initDB,
  updateVoucherInDB,
} from "./databse";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

const CustomSelectBox = ({ options, onChange, defaultSelected }) => {
  const [searchTerm, setSearchTerm] = useState(defaultSelected || "");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    setSearchTerm(option);
    setShowDropdown(false);
    onChange(option);
  };
  useEffect(() => {
    setSearchTerm(defaultSelected || "");
  }, [defaultSelected]);

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

  // Update state when defaultSelected changes (e.g., on edit)
  useEffect(() => {
    setSearchTerm(defaultSelected || "");
    setSelectedProduct(defaultSelected || "");
  }, [defaultSelected]);

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
        placeholder="Select Product..."
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

const CustomUnitSelectBox = ({ options, defaultSelected, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(defaultSelected || "");
  const [showDropdown, setShowDropdown] = useState(false);

  // Update searchTerm when defaultSelected changes (e.g., on edit)
  useEffect(() => {
    setSearchTerm(defaultSelected || "");
  }, [defaultSelected]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    setSearchTerm(option);
    setShowDropdown(false);
    onChange(option);
  };

  return (
    <div className="custom-select-container">
      <input
        type="text"
        placeholder="Select Unit..."
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
    { product: "", unit: "", price: "", quantity: "", subtotal: "" },
  ]);
  const [initialData, setInitialData] = useState(null);
  const [partyNames, setPartyNames] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [unitNames, setUnitNames] = useState([]);
  const [selectedPartyName, setSelectedPartyName] = useState(
    initialData?.PARTYLEDGERNAME || ""
  );
  const [date, setDate] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(
    entries.map((entry) => entry.product || "")
  );
  const { guid } = useParams();
  const navigator = useNavigate();
  const formatDate = (dateString) => {
    if (typeof dateString !== "string") {
      return "";
    }
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    alert(`${year}-${month}-${day}`);
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    const fetchVoucherData = async () => {
      try {
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

          let vouchers = json?.TALLYMESSAGE?.VOUCHER;

          if (!Array.isArray(vouchers)) {
            vouchers = [vouchers];
          }

          const voucher = vouchers.find((entry) => entry.GUID === guid);

          if (voucher) {
            setInitialData(voucher);
            setSelectedPartyName(voucher.PARTYLEDGERNAME);
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
            if (voucher.DATE) {
              const formattedDate = formatDate(String(voucher.DATE));
              setDate(formattedDate);
              alert("date value: " + formattedDate);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching voucher data", error);
        alert("Error fetching voucher data" + error.message);
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
    const fetchUnitNames = async () => {
      try {
        await initDB();
        const unitNames = await getAllUnitNames();
        setUnitNames(unitNames);
      } catch (error) {
        alert("Error fetching unit names:" + error.message);
      }
    };
    fetchVoucherData();
    fetchPartyNames();
    fetchProductNames();
    fetchUnitNames();
  }, [guid]);

  const handleProductChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].product = value;
    newEntries[index].price = "";
    newEntries[index].quantity = "";
    newEntries[index].subtotal = "";
    setEntries(newEntries);
  };
  const handleUnitChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].unit = value;
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
      { product: "", unit: "", price: "", quantity: "", subtotal: "" },
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
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(file.data, "text/xml");

      const vouchers = xmlDoc.getElementsByTagName("VOUCHER");
      let voucherFound = false;

      for (let i = 0; i < vouchers.length; i++) {
        const voucher = vouchers[i];
        const guidElement = voucher.getElementsByTagName("GUID")[0];

        if (guidElement && guidElement.textContent === guid) {
          voucherFound = true;

          // Update the date
          const rawDate = document.getElementById("date").value;
          const formattedDate = rawDate.replace(/-/g, "");
          voucher.getElementsByTagName("DATE")[0].textContent = formattedDate;
          voucher.getElementsByTagName("VCHSTATUSDATE")[0].textContent =
            formattedDate;

          const partyName = selectedPartyName;
          const partyFields = [
            "PARTYLEDGERNAME",
            "BASICBUYERNAME",
            "PARTYMAILINGNAME",
            "CONSIGNEEMAILINGNAME",
            "BASICBASEPARTYNAME",
          ];

          partyFields.forEach((field) => {
            const fieldElement = voucher.getElementsByTagName(field)[0];
            if (fieldElement) {
              fieldElement.textContent = partyName;
            }
          });

          // Update inventory entries
          const inventoryEntries = voucher.getElementsByTagName(
            "ALLINVENTORYENTRIES.LIST"
          );

          entries.forEach((updatedEntry, index) => {
            let existingEntry;

            // If there's an existing entry, update it; if not, create a new entry
            if (inventoryEntries[index]) {
              existingEntry = inventoryEntries[index];
            } else {
              existingEntry = xmlDoc.createElement("ALLINVENTORYENTRIES.LIST");
              voucher.appendChild(existingEntry);

              // Add default BATCHALLOCATIONS.LIST on new entry
              const batchAllocations = xmlDoc.createElement("BATCHALLOCATIONS.LIST");
              existingEntry.appendChild(batchAllocations);

              const godownName = xmlDoc.createElement("GODOWNNAME");
              godownName.textContent = "Main Location";
              batchAllocations.appendChild(godownName);

              const batchName = xmlDoc.createElement("BATCHNAME");
              batchName.textContent = "Primary Batch";
              batchAllocations.appendChild(batchName);

              const indentNo = xmlDoc.createElement("INDENTNO");
              indentNo.textContent = "Not Applicable";
              batchAllocations.appendChild(indentNo);

              const orderNo = xmlDoc.createElement("ORDERNO");
              orderNo.textContent = "Not Applicable";
              batchAllocations.appendChild(orderNo);
            }

            const unit =
              updatedEntry.unit ||
              existingEntry.getElementsByTagName("UNIT")[0]?.textContent ||
              "pcs";

            // Update or add new inventory entry
            const stockItemNameElement =
              existingEntry.getElementsByTagName("STOCKITEMNAME")[0] ||
              existingEntry.appendChild(
                xmlDoc.createElement("STOCKITEMNAME")
              );
            stockItemNameElement.textContent =
              updatedEntry.product || stockItemNameElement.textContent;

            const rateElement =
              existingEntry.getElementsByTagName("RATE")[0] ||
              existingEntry.appendChild(xmlDoc.createElement("RATE"));
            rateElement.textContent = `${
              updatedEntry.price || rateElement.textContent.split("/")[0]
            }/${unit}`;

            const actualQtyElement =
              existingEntry.getElementsByTagName("ACTUALQTY")[0] ||
              existingEntry.appendChild(xmlDoc.createElement("ACTUALQTY"));
            actualQtyElement.textContent = `${
              updatedEntry.quantity ||
              actualQtyElement.textContent.split(" ")[0]
            } ${unit}`;

            const billedQtyElement =
              existingEntry.getElementsByTagName("BILLEDQTY")[0] ||
              existingEntry.appendChild(xmlDoc.createElement("BILLEDQTY"));
            billedQtyElement.textContent = `${
              updatedEntry.quantity ||
              billedQtyElement.textContent.split(" ")[0]
            } ${unit}`;

            const amountElement =
              existingEntry.getElementsByTagName("AMOUNT")[0] ||
              existingEntry.appendChild(xmlDoc.createElement("AMOUNT"));
            amountElement.textContent =
              updatedEntry.subtotal || amountElement.textContent;

            // Ensure BATCHALLOCATIONS.LIST is updated or created
            let batchAllocations =
              existingEntry.getElementsByTagName("BATCHALLOCATIONS.LIST")[0];
            if (!batchAllocations) {
              batchAllocations = xmlDoc.createElement("BATCHALLOCATIONS.LIST");
              existingEntry.appendChild(batchAllocations);
            }

            // Add default tracking number if new entry
            const trackingNumberElement =
              batchAllocations.getElementsByTagName("TRACKINGNUMBER")[0] ||
              batchAllocations.appendChild(
                xmlDoc.createElement("TRACKINGNUMBER")
              );
            trackingNumberElement.textContent = "&#4; Not Applicable"; 

            const actualQtyBatchElement =
              batchAllocations.getElementsByTagName("ACTUALQTY")[0] ||
              batchAllocations.appendChild(xmlDoc.createElement("ACTUALQTY"));
            actualQtyBatchElement.textContent = updatedEntry.quantity || 0;

            const billedQtyBatchElement =
              batchAllocations.getElementsByTagName("BILLEDQTY")[0] ||
              batchAllocations.appendChild(xmlDoc.createElement("BILLEDQTY"));
            billedQtyBatchElement.textContent = updatedEntry.quantity || 0;

            const amountBatchElement =
              batchAllocations.getElementsByTagName("AMOUNT")[0] ||
              batchAllocations.appendChild(xmlDoc.createElement("AMOUNT"));
            amountBatchElement.textContent = updatedEntry.subtotal || 0;

            // Update ACCOUNTINGALLOCATIONS.LIST for the corresponding entry
            let accountingAllocations =
              existingEntry.getElementsByTagName("ACCOUNTINGALLOCATIONS.LIST")[0];
            if (!accountingAllocations) {
              accountingAllocations = xmlDoc.createElement(
                "ACCOUNTINGALLOCATIONS.LIST"
              );
              existingEntry.appendChild(accountingAllocations);
            }

            // Create OLDAUDITENTRYIDS.LIST
            const oldAuditEntryIdsList = xmlDoc.createElement("OLDAUDITENTRYIDS.LIST");
            const oldAuditEntryIds = xmlDoc.createElement("OLDAUDITENTRYIDS");
            oldAuditEntryIds.textContent = "-1";
            oldAuditEntryIdsList.appendChild(oldAuditEntryIds);
            accountingAllocations.appendChild(oldAuditEntryIdsList);

            // Create LEDGERNAME element
            const ledgerNameElement =
              accountingAllocations.getElementsByTagName("LEDGERNAME")[0] ||
              accountingAllocations.appendChild(xmlDoc.createElement("LEDGERNAME"));
            ledgerNameElement.textContent = "Sales Ledger";

            // Update accounting amount
            const accountingAmountElement =
              accountingAllocations.getElementsByTagName("AMOUNT")[0] ||
              accountingAllocations.appendChild(
                xmlDoc.createElement("AMOUNT")
              );
            accountingAmountElement.textContent = updatedEntry.subtotal || 0;
          });

          // Update ledger entries (if needed)
          const ledgerEntries =
            voucher.getElementsByTagName("LEDGERENTRIES.LIST");
          const grandTotal = getGrandTotal();

          for (let j = 0; j < ledgerEntries.length; j++) {
            const ledgerEntry = ledgerEntries[j];
            ledgerEntry.getElementsByTagName("LEDGERNAME")[0].textContent =
              partyName ||
              ledgerEntry.getElementsByTagName("LEDGERNAME")[0].textContent;
            ledgerEntry.getElementsByTagName(
              "AMOUNT"
            )[0].textContent = `-${grandTotal}`;
            ledgerEntry.getElementsByTagName(
              "BILLALLOCATIONS.LIST"
            )[0].textContent = `-${grandTotal}`;
          }

          
          const serializer = new XMLSerializer();
          const updatedXML = serializer.serializeToString(xmlDoc);

          
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
          break;
        }
      }

      if (!voucherFound) {
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
        <input type="date" id="date" name="date" required defaultValue={date} />

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
              <div className="field-group">
                <label htmlFor={`unit-${index}`}>Unit:</label>
                <CustomUnitSelectBox
                  options={unitNames}
                  defaultSelected={entry.unit || ""}
                  onChange={(selectedUnit) =>
                    handleUnitChange(index, selectedUnit)
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
