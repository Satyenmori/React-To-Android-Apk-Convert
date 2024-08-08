import React, { useState } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import { create } from "xmlbuilder2";

const Sales = () => {
  const [entries, setEntries] = useState([
    { product: "", price: "", quantity: "", subtotal: "" },
  ]);
  const createXML = (sales) => {
    const tallyData = `
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
            <REQUESTDATA>
              <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER>
                  <DATE>${sales.date}</DATE>
                  <GUID>12345678</GUID>
                  <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
                  <GSTNATUREOFSALE>Inter State</GSTNATUREOFSALE>
                  <GSTPARTYTYPE>Regular</GSTPARTYTYPE>
                  <UDF:GSTRETURNTYPE>Regular</UDF:GSTRETURNTYPE>
                  <UDF:CONSULIEERGOODS>No</UDF:CONSULIEERGOODS>
                  <VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
                  <ITEMNAME>Laptops</ITEMNAME>
                  <CATEGORYNAME>Sales</CATEGORYNAME>
                  <GSTCLASS>Regular</GSTCLASS>
                  <GSTEXEMPT>No</GSTEXEMPT>
                  <BATCHNAME>LAPTOP-2024</BATCHNAME>
                  <EXPIRYPERIOD>Default</EXPIRYPERIOD>
                  <QUANTITY>1</QUANTITY>
                  <RATE>10000</RATE>
                  <AMOUNT>10000</AMOUNT>
                  <STAXTYPE>Inter State</STAXTYPE>
                  <VATRATE>18</VATRATE>
                  <CSTRATE>2</CSTRATE>
                  <COSTCENTER>No</COSTCENTER>
                  <LEDGERFROMITEM>No</LEDGERFROMITEM>
                  <STOCKITEMNAME>Laptops</STOCKITEMNAME>
                  <UDF:HSNCODE>8471</UDF:HSNCODE>
                  <STOCKCATEGORYNAME>Laptops</STOCKCATEGORYNAME>
                  <ISSERIALNO>No</ISSERIALNO>
                  <CUSTOMERLOCATION>No</CUSTOMERLOCATION>
                  <RATEINCLUSIVE>No</RATEINCLUSIVE>
                  <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
                  <CSTFORMISSUETYPE>&#4; Not Applicable</CSTFORMISSUETYPE>
                  <CSTFORMRECVTYPE>&#4; Not Applicable</CSTFORMRECVTYPE>
                  <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
                  <VCHSTATUSTAXADJUSTMENT>Default</VCHSTATUSTAXADJUSTMENT>
                  <VCHSTATUSVOUCHERTYPE>Sales</VCHSTATUSVOUCHERTYPE>
                  <VCHGSTCLASS>&#4; Not Applicable</VCHGSTCLASS>
                  <VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
                  <DIFFACTUALQTY>No</DIFFACTUALQTY>
                  <ISMSTFROMSYNC>No</ISMSTFROMSYNC>
                  <ISDELETED>No</ISDELETED>
                  <ISSECURITYONWHENENTERED>No</ISSECURITYONWHENENTERED>
                  <ASORIGINAL>No</ASORIGINAL>
                  <AUDITED>No</AUDITED>
                  <ISCOMMONPARTY>No</ISCOMMONPARTY>
                  <FORJOBCOSTING>No</FORJOBCOSTING>
                  <ISOPTIONAL>No</ISOPTIONAL>
                  <EFFECTIVEDATE>20240402</EFFECTIVEDATE>
                  <USEFOREXCISE>No</USEFOREXCISE>
                  <ISFORJOBWORKIN>No</ISFORJOBWORKIN>
                  <ALLOWCONSUMPTION>No</ALLOWCONSUMPTION>
                  <USEFORINTEREST>No</USEFORINTEREST>
                  <USEFORGAINLOSS>No</USEFORGAINLOSS>
                  <USEFORGODOWNTRANSFER>No</USEFORGODOWNTRANSFER>
                  <USEFORCOMPOUND>No</USEFORCOMPOUND>
                  <USEFORSERVICETAX>No</USEFORSERVICETAX>
                  <ISREVERSECHARGEAPPLICABLE>No</ISREVERSECHARGEAPPLICABLE>
                  <ISSYSTEM>No</ISSYSTEM>
                  <ISFETCHEDONLY>No</ISFETCHEDONLY>
                  <ISGSTOVERRIDDEN>No</ISGSTOVERRIDDEN>
                  <ISCANCELLED>No</ISCANCELLED>
                  <ISONHOLD>No</ISONHOLD>
                  <ISSUMMARY>No</ISSUMMARY>
                  <ISECOMMERCESUPPLY>No</ISECOMMERCESUPPLY>
                  <ISBOENOTAPPLICABLE>No</ISBOENOTAPPLICABLE>
                  <ISGSTSECSEVENAPPLICABLE>No</ISGSTSECSEVENAPPLICABLE>
                  <IGNOREEINVVALIDATION>No</IGNOREEINVVALIDATION>
                  <CMPGSTISOTHTERRITORYASSESSEE>No</CMPGSTISOTHTERRITORYASSESSEE>
                  <PARTYGSTISOTHTERRITORYASSESSEE>No</PARTYGSTISOTHTERRITORYASSESSEE>
                  <IRNJSONEXPORTED>No</IRNJSONEXPORTED>
                  <IRNCANCELLED>No</IRNCANCELLED>
                  <IGNOREGSTCONFLICTINMIG>No</IGNOREGSTCONFLICTINMIG>
                  <ISOPBALTRANSACTION>No</ISOPBALTRANSACTION>
                  <IGNOREGSTFORMATVALIDATION>No</IGNOREGSTFORMATVALIDATION>
                  <ISELIGIBLEFORITC>Yes</ISELIGIBLEFORITC>
                  <UPDATESUMMARYVALUES>No</UPDATESUMMARYVALUES>
                  <ISEWAYBILLAPPLICABLE>No</ISEWAYBILLAPPLICABLE>
                  <ISDELETEDRETAINED>No</ISDELETEDRETAINED>
                  <ISNULL>No</ISNULL>
                  <ISEXCISEVOUCHER>No</ISEXCISEVOUCHER>
                  <EXCISETAXOVERRIDE>No</EXCISETAXOVERRIDE>
                  <USEFORTAXUNITTRANSFER>No</USEFORTAXUNITTRANSFER>
                  <ISEXER1NOPOVERWRITE>No</ISEXER1NOPOVERWRITE>
                  <ISEXF2NOPOVERWRITE>No</ISEXF2NOPOVERWRITE>
                  <ISEXER3NOPOVERWRITE>No</ISEXER3NOPOVERWRITE>
                  <IGNOREPOSVALIDATION>No</IGNOREPOSVALIDATION>
                  <EXCISEOPENING>No</EXCISEOPENING>
                  <USEFORFINALPRODUCTION>No</USEFORFINALPRODUCTION>
                  <ISTDSOVERRIDDEN>No</ISTDSOVERRIDDEN>
                  <ISTCSOVERRIDDEN>No</ISTCSOVERRIDDEN>
                  <ISTDSTCSCASHVCH>No</ISTDSTCSCASHVCH>
                  <INCLUDEADVPYMTVCH>No</INCLUDEADVPYMTVCH>
                  <ISSUBWORKSCONTRACT>No</ISSUBWORKSCONTRACT>
                  <ISVATPRINCIPALACCOUNT>No</ISVATPRINCIPALACCOUNT>
                  <ISBOENOTAPPLICABLE>No</ISBOENOTAPPLICABLE>
                  <ISSPECIALENVELOPE>No</ISSPECIALENVELOPE>
                  <ISCANCELLEDINPART>No</ISCANCELLEDINPART>
                  <EXCLUDEDTAXATION>No</EXCLUDEDTAXATION>
                  <IGNOREPARTYFILTER>No</IGNOREPARTYFILTER>
                  <IGNOREINVOICEFINVOCETYPE>No</IGNOREINVOICEFINVOCETYPE>
                  <IGNOREAGGRPERIOD>No</IGNOREAGGRPERIOD>
                  <EXCLUDEDACTUAL>No</EXCLUDEDACTUAL>
                  <IGNOREINVENTORY>No</IGNOREINVENTORY>
                  <ISVCHOPENING>No</ISVCHOPENING>
                  <VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
                  <NARRATION>${sales.date}</NARRATION>
                  <ISINTER>Yes</ISINTER>
                  <ISCANCELLED>No</ISCANCELLED>
                  <TAXUNITNAME>U-23</TAXUNITNAME>
                  <BASICVCHCLASSIFY>1</BASICVCHCLASSIFY>
                  <EXCISEREGISTRATIONTYPE>Regular</EXCISEREGISTRATIONTYPE>
                  <VATDEALERTYPE>Regular</VATDEALERTYPE>
                  <ENTEREDBY>Administrator</ENTEREDBY>
                  <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                  <VCHAMOUNT>11111</VCHAMOUNT>
                  <CONSIGNEESTATENAME>Gujarat</CONSIGNEESTATENAME>
                  <CONSIGNEESTATEID>24</CONSIGNEESTATEID>
                  <CONSIGNEECOUNTRYNAME>India</CONSIGNEECOUNTRYNAME>
                  <BASICBUYERNAME>${sales.party}</BASICBUYERNAME>
                  <BASEPARTYNAME>${sales.product}</BASEPARTYNAME>
                  <UDF:TDSAPPLICABLE>No</UDF:TDSAPPLICABLE>
                  <UDF:GSTRATE>Regular</UDF:GSTRATE>
                  <UDF:GSTRETURNTYPE>Regular</UDF:GSTRETURNTYPE>
                  <UDF:CONSULIEERGOODS>No</UDF:CONSULIEERGOODS>
                  <CUSTOMERLOCATION>No</CUSTOMERLOCATION>
                  <RATEINCLUSIVE>No</RATEINCLUSIVE>
                </VOUCHER>
              </TALLYMESSAGE>
            </REQUESTDATA>
          </IMPORTDATA>
        </BODY>
      </ENVELOPE>
    `;

    const blob = new Blob([tallyData], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SalesData.xml";
    a.click();
    URL.revokeObjectURL(url);
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

    const sales = {
      date: event.target.date.value,
      // party: Array.from(event.target.party.selectedOptions).map(
      //   (option) => option.value
      // ),
      // product: Array.from(event.target.product.selectedOptions).map(
      //   (option) => option.value
      // ),
      // Add other form data as needed
    };
    createXML(sales);
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
          <option value="party1">Flourish</option>
          <option value="party2">Flonix</option>
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
                  <option value="product1">Ro Pump</option>
                  <option value="product2">Membrane</option>
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

        <div className="btn-group">
          <button type="submit">Submit</button>
          <button type="button">Print</button>
        </div>
      </form>
    </div>
  );
};

export default Sales;
