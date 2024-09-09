import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Storage } from "@capacitor/storage";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

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
        const voucher = json?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE?.find(
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
    setVoucherData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <div className="container">
      {voucherData ? (
        <form>
          <h2>Edit Voucher</h2>
          <div>
            <label>Date:</label>
            <input
              type="date"
              value={voucherData.DATE}
              onChange={(e) => handleInputChange("DATE", e.target.value)}
            />
          </div>
          <div>
            <label>Item Name:</label>
            <input
              type="text"
              value={voucherData.ITEMNAME}
              onChange={(e) => handleInputChange("ITEMNAME", e.target.value)}
            />
          </div>
          <div>
            <label>Quantity:</label>
            <input
              type="number"
              value={voucherData.QUANTITY}
              onChange={(e) => handleInputChange("QUANTITY", e.target.value)}
            />
          </div>
          <div>
            <label>Rate:</label>
            <input
              type="number"
              value={voucherData.RATE}
              onChange={(e) => handleInputChange("RATE", e.target.value)}
            />
          </div>
          <div>
            <label>Amount:</label>
            <input
              type="number"
              value={voucherData.AMOUNT}
              onChange={(e) => handleInputChange("AMOUNT", e.target.value)}
            />
          </div>

          <button type="button" onClick={handleSave}>
            Save Changes
          </button>
        </form>
      ) : (
        <p>Loading voucher data...</p>
      )}
    </div>
  );
};

export default EditVoucher;
