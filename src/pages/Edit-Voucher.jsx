import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Storage } from "@capacitor/storage";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import "../Style/Sales.css";

const EditVoucher = () => {
  const { guid } = useParams();
  const [voucherData, setVoucherData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadVoucherData = async () => {
      const { value } = await Storage.get({ key: "salesXML" });
      if (value) {
        const parser = new XMLParser({
          ignoreAttributes: false,
          ignoreTextNodeAttr: true,
        });
        const json = parser.parse(value);

        const voucher =
          json?.TALLYMESSAGE?.VOUCHER?.find((entry) => entry.GUID === guid);
        setVoucherData(voucher || null);
      }
    };

    loadVoucherData();
  }, [guid]);

  const handleInputChange = (field, value) => {
    setVoucherData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleInventoryChange = (index, field, value) => {
    const updatedInventory = voucherData["ALLINVENTORYENTRIES.LIST"].map(
      (item, idx) =>
        idx === index ? { ...item, [field]: value } : item
    );
    setVoucherData((prevData) => ({
      ...prevData,
      "ALLINVENTORYENTRIES.LIST": updatedInventory,
    }));
  };

  const handleSave = async () => {
    const { value } = await Storage.get({ key: "salesXML" });
    if (value) {
      const parser = new XMLParser({ ignoreAttributes: false });
      const json = parser.parse(value);

      const vouchers = json.TALLYMESSAGE.VOUCHER;
      const voucherIndex = vouchers.findIndex((entry) => entry.GUID === guid);
      vouchers[voucherIndex] = voucherData;

      const builder = new XMLBuilder({ ignoreAttributes: false });
      const updatedXML = builder.build(json);

      await Storage.set({
        key: "salesXML",
        value: updatedXML,
      });

      navigate("/voucher");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Edit Voucher</h1>
      {voucherData ? (
        <form className="sales-form">
          <label>Date:</label>
          <input
            type="date"
            value={voucherData.DATE}
            onChange={(e) => handleInputChange("DATE", e.target.value)}
          />

          <label>Party Name:</label>
          <input
            type="text"
            value={voucherData.PARTYNAME}
            onChange={(e) => handleInputChange("PARTYNAME", e.target.value)}
          />

          <h3>Inventory Entries</h3>
          {voucherData["ALLINVENTORYENTRIES.LIST"].map((item, index) => (
            <div key={index}>
              <label>Stock Item Name:</label>
              <input
                type="text"
                value={item.STOCKITEMNAME}
                onChange={(e) =>
                  handleInventoryChange(index, "STOCKITEMNAME", e.target.value)
                }
              />

              <label>Rate:</label>
              <input
                type="text"
                value={item.RATE}
                onChange={(e) =>
                  handleInventoryChange(index, "RATE", e.target.value)
                }
              />

              <label>Amount:</label>
              <input
                type="number"
                value={item.AMOUNT}
                onChange={(e) =>
                  handleInventoryChange(index, "AMOUNT", e.target.value)
                }
              />

              <label>Actual Qty:</label>
              <input
                type="text"
                value={item.ACTUALQTY}
                onChange={(e) =>
                  handleInventoryChange(index, "ACTUALQTY", e.target.value)
                }
              />
            </div>
          ))}

          <h3>Ledger Entries</h3>
          <label>Ledger Amount:</label>
          <input
            type="number"
            value={voucherData["LEDGERENTRIES.LIST"].AMOUNT}
            onChange={(e) =>
              handleInputChange("LEDGERENTRIES.LIST.AMOUNT", e.target.value)
            }
          />

          <div
            style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
          >
            <button
              className="button-17"
              type="button"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <p>Loading voucher data...</p>
      )}
    </div>
  );
};

export default EditVoucher;
