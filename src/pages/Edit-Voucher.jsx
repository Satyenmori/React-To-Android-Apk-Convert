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
          json?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE?.find(
            (entry) => entry.VOUCHER.GUID === guid
          );
        setVoucherData(voucher?.VOUCHER || null);
      }
    };

    loadVoucherData();
  }, [guid]);

  const handleSave = async () => {
    // Save the updated voucher data back to storage
    const { value } = await Storage.get({ key: "salesXML" });
    if (value) {
      const parser = new XMLParser({ ignoreAttributes: false });
      const json = parser.parse(value);

      const vouchers = json.ENVELOPE.BODY.IMPORTDATA.REQUESTDATA.TALLYMESSAGE;
      const voucherIndex = vouchers.findIndex(
        (entry) => entry.VOUCHER.GUID === guid
      );
      vouchers[voucherIndex].VOUCHER = voucherData;

      const builder = new XMLBuilder({ ignoreAttributes: false });
      const updatedXML = builder.build(json);

      await Storage.set({
        key: "salesXML",
        value: updatedXML,
      });

      navigate("/voucher");
    }
  };

  const handleInputChange = (field, value) => {
    const updatedVoucherData = { ...voucherData, [field]: value };

    // Calculate the amount if quantity or rate changes
    if (field === "QUANTITY" || field === "RATE") {
      const quantity = updatedVoucherData.QUANTITY || 0;
      const rate = updatedVoucherData.RATE || 0;
      updatedVoucherData.AMOUNT = quantity * rate;
    }

    setVoucherData(updatedVoucherData);
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

          <label>Item Name:</label>
          <input
            type="text"
            value={voucherData.ITEMNAME}
            onChange={(e) => handleInputChange("ITEMNAME", e.target.value)}
          />

          <label>Quantity:</label>
          <input
            type="number"
            value={voucherData.QUANTITY}
            onChange={(e) => handleInputChange("QUANTITY", e.target.value)}
          />

          <label>Rate:</label>
          <input
            type="number"
            value={voucherData.RATE}
            onChange={(e) => handleInputChange("RATE", e.target.value)}
          />

          <div style={{ display: "flex", alignItems: "center" }}>
            <label>Amount:</label>
            <span style={{ marginLeft: "10px" }}>
              {voucherData.AMOUNT || 0}
            </span>{" "}
            {/* Display Amount */}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button
              className="button-17"
              type="button"
              role="button"
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
