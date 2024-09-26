import React, { useEffect, useState } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import { create } from "xmlbuilder2";
import { Storage } from "@capacitor/storage";
import { useNavigate } from "react-router-dom";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
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
      
      const { value } = await Storage.get({ key: "salesXML" });

      if (value) {
        
        existingXML = new DOMParser().parseFromString(value, "application/xml");
      } else {
        
        existingXML = new DOMParser().parseFromString(
          `<TALLYMESSAGE xmlns:UDF="TallyUDF"></TALLYMESSAGE>`,
          "application/xml"
        );
      }

      
      const tallyMessage = existingXML.querySelector("TALLYMESSAGE");

      
      sales.forEach((sale) => {
        const uniqueGUID = crypto.randomUUID();
        const Dateformate = sale.date.replace(/-/g, "");
        const voucher = existingXML.createElement("VOUCHER");

        voucher.setAttribute("REMOTEID", uniqueGUID);
        voucher.setAttribute(
          "VCHKEY",
          "a282ccd7-4452-4ea6-8468-933b6012dabd-0000b147:000000c8"
        );
        voucher.setAttribute("VCHTYPE", "Sales");
        voucher.setAttribute("ACTION", "Create");
        voucher.setAttribute("OBJVIEW", "Invoice Voucher View");

        voucher.innerHTML = `
                <OLDAUDITENTRYIDS.LIST TYPE="Number">
                    <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
                </OLDAUDITENTRYIDS.LIST>
                <DATE>${Dateformate}</DATE>
                <VCHSTATUSDATE>${Dateformate}</VCHSTATUSDATE>
                <GUID>${uniqueGUID}</GUID>
                <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
                <VATDEALERTYPE>Regular</VATDEALERTYPE>
                <STATENAME>Gujarat</STATENAME>
                <COUNTRYOFRESIDENCE>India</COUNTRYOFRESIDENCE>
                <PLACEOFSUPPLY>Gujarat</PLACEOFSUPPLY>
                <PARTYNAME>${sale.party}</PARTYNAME>
                <GSTREGISTRATION TAXTYPE="GST" TAXREGISTRATION="">Gujarat Registration</GSTREGISTRATION>
                <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                <PARTYLEDGERNAME>${sale.party}</PARTYLEDGERNAME>
                <VOUCHERNUMBER>30</VOUCHERNUMBER>
                <BASICBUYERNAME>${sale.party}</BASICBUYERNAME>
                <CMPGSTREGISTRATIONTYPE>Regular</CMPGSTREGISTRATIONTYPE>
                <PARTYMAILINGNAME>${sale.party}</PARTYMAILINGNAME>
                <CONSIGNEEMAILINGNAME>${sale.party}</CONSIGNEEMAILINGNAME>
                <CONSIGNEESTATENAME>Gujarat</CONSIGNEESTATENAME>
                <CMPGSTSTATE>Gujarat</CMPGSTSTATE>
                <CONSIGNEECOUNTRYNAME>India</CONSIGNEECOUNTRYNAME>
                <BASICBASEPARTYNAME>${sale.party}</BASICBASEPARTYNAME>
                <NUMBERINGSTYLE>Auto Retain</NUMBERINGSTYLE>
                <CSTFORMISSUETYPE>Not Applicable</CSTFORMISSUETYPE>
                <CSTFORMRECVTYPE>Not Applicable</CSTFORMRECVTYPE>
                <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
                <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
                <VCHSTATUSTAXADJUSTMENT>Default</VCHSTATUSTAXADJUSTMENT>
                <VCHSTATUSVOUCHERTYPE>Sales</VCHSTATUSVOUCHERTYPE>
                <VCHGSTCLASS>Not Applicable</VCHGSTCLASS>
                <VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
            `;

        let grandTotal = 0;

        
        sale.products.forEach((product) => {
          const inventoryEntry = existingXML.createElement(
            "ALLINVENTORYENTRIES.LIST"
          );
          inventoryEntry.innerHTML = `
                    <STOCKITEMNAME>${product.product}</STOCKITEMNAME>
                    <GSTOVRDNISREVCHARGEAPPL>Not Applicable</GSTOVRDNISREVCHARGEAPPL>
                    <GSTOVRDNSTOREDNATURE/>
                    <GSTOVRDNTYPEOFSUPPLY>Goods</GSTOVRDNTYPEOFSUPPLY>
                    <GSTRATEINFERAPPLICABILITY>As per Masters/Company</GSTRATEINFERAPPLICABILITY>
                    <GSTHSNINFERAPPLICABILITY>As per Masters/Company</GSTHSNINFERAPPLICABILITY>
                    <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                    <RATE>${product.price}/nos</RATE>
                    <AMOUNT>${product.subtotal}</AMOUNT>
                    <ACTUALQTY>${product.quantity}nos</ACTUALQTY>
                    <BILLEDQTY>${product.quantity}nos</BILLEDQTY>
                    <BATCHALLOCATIONS.LIST>
                        <GODOWNNAME>Main Location</GODOWNNAME>
                        <BATCHNAME>Primary Batch</BATCHNAME>
                        <TRACKINGNUMBER>Not Applicable</TRACKINGNUMBER>
                        <AMOUNT>${product.subtotal}</AMOUNT>
                        <ACTUALQTY>${product.quantity}nos</ACTUALQTY>
                        <BILLEDQTY>${product.quantity}nos</BILLEDQTY>
                    </BATCHALLOCATIONS.LIST>
                    <ACCOUNTINGALLOCATIONS.LIST>
                        <LEDGERNAME>Sales Ledger</LEDGERNAME>
                        <GSTCLASS>Not Applicable</GSTCLASS>
                        <AMOUNT>${product.subtotal}</AMOUNT>
                    </ACCOUNTINGALLOCATIONS.LIST>
                `;
          voucher.appendChild(inventoryEntry);

          
          grandTotal += parseFloat(product.subtotal);
        });

       
        const ledgerEntry = existingXML.createElement("LEDGERENTRIES.LIST");
        ledgerEntry.innerHTML = `
                <OLDAUDITENTRYIDS.LIST TYPE="Number">
                    <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
                </OLDAUDITENTRYIDS.LIST>
                <LEDGERNAME>${sale.party}</LEDGERNAME>
                <GSTCLASS>Not Applicable</GSTCLASS>
                <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                <LEDGERFROMITEM>No</LEDGERFROMITEM>
                <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
                <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
                <GSTOVERRIDDEN>No</GSTOVERRIDDEN>
                <ISGSTASSESSABLEVALUEOVERRIDDEN>No</ISGSTASSESSABLEVALUEOVERRIDDEN>
                <STRDISGSTAPPLICABLE>No</STRDISGSTAPPLICABLE>
                <STRDGSTISPARTYLEDGER>No</STRDGSTISPARTYLEDGER>
                <STRDGSTISDUTYLEDGER>No</STRDGSTISDUTYLEDGER>
                <CONTENTNEGISPOS>No</CONTENTNEGISPOS>
                <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
                <ISCAPVATTAXALTERED>No</ISCAPVATTAXALTERED>
                <ISCAPVATNOTCLAIMED>No</ISCAPVATNOTCLAIMED>
                <AMOUNT>-${grandTotal.toFixed(2)}</AMOUNT>
                <SERVICETAXDETAILS.LIST> </SERVICETAXDETAILS.LIST>
                <BANKALLOCATIONS.LIST> </BANKALLOCATIONS.LIST>
                <BILLALLOCATIONS.LIST>
                    <NAME>30</NAME>
                    <BILLTYPE>New Ref</BILLTYPE>
                    <TDSDEDUCTEEISSPECIALRATE>No</TDSDEDUCTEEISSPECIALRATE>
                    <AMOUNT>-${grandTotal.toFixed(2)}</AMOUNT>
                    <INTERESTCOLLECTION.LIST> </INTERESTCOLLECTION.LIST>
                    <STBILLCATEGORIES.LIST> </STBILLCATEGORIES.LIST>
                </BILLALLOCATIONS.LIST>
                <INTERESTCOLLECTION.LIST> </INTERESTCOLLECTION.LIST>
                <OLDAUDITENTRIES.LIST> </OLDAUDITENTRIES.LIST>
                <ACCOUNTAUDITENTRIES.LIST> </ACCOUNTAUDITENTRIES.LIST>
                <AUDITENTRIES.LIST> </AUDITENTRIES.LIST>
                <INPUTCRALLOCS.LIST> </INPUTCRALLOCS.LIST>
                <DUTYHEADDETAILS.LIST> </DUTYHEADDETAILS.LIST>
                <EXCISEDUTYHEADDETAILS.LIST> </EXCISEDUTYHEADDETAILS.LIST>
                <RATEDETAILS.LIST> </RATEDETAILS.LIST>
                <SUMMARYALLOCS.LIST> </SUMMARYALLOCS.LIST>
                <CENVATDUTYALLOCATIONS.LIST> </CENVATDUTYALLOCATIONS.LIST>
                <STPYMTDETAILS.LIST> </STPYMTDETAILS.LIST>
                <EXCISEPAYMENTALLOCATIONS.LIST> </EXCISEPAYMENTALLOCATIONS.LIST>
                <TAXBILLALLOCATIONS.LIST> </TAXBILLALLOCATIONS.LIST>
                <TAXOBJECTALLOCATIONS.LIST> </TAXOBJECTALLOCATIONS.LIST>
                <TDSEXPENSEALLOCATIONS.LIST> </TDSEXPENSEALLOCATIONS.LIST>
                <VATSTATUTORYDETAILS.LIST> </VATSTATUTORYDETAILS.LIST>
                <COSTTRACKALLOCATIONS.LIST> </COSTTRACKALLOCATIONS.LIST>
                <REFVOUCHERDETAILS.LIST> </REFVOUCHERDETAILS.LIST>
                <INVOICEWISEDETAILS.LIST> </INVOICEWISEDETAILS.LIST>
                <VATITCDETAILS.LIST> </VATITCDETAILS.LIST>
                <ADVANCETAXDETAILS.LIST> </ADVANCETAXDETAILS.LIST>
                <TAXTYPEALLOCATIONS.LIST> </TAXTYPEALLOCATIONS.LIST>
            `;
        voucher.appendChild(ledgerEntry);

        
        tallyMessage.appendChild(voucher);
      });

      
      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(existingXML);

      let res = await Filesystem.writeFile({
        path: "Transaction.xml",
        directory: Directory.External,
        data:xmlString,
        encoding: "utf8",
      });      
      // await Storage.set({ key: "salesXML", value: xmlString });
      alert("Sales data add successfully!",res.uri);
      return xmlString;

      // navigator("/voucher");
    } catch (error) {
      console.error("Error saving sales data:", error);
      return null;
    }
  };

  const handleProductChange = async (index, value) => {
    const selectedParty = document.getElementById("party").value;

    const newEntries = [...entries];
    newEntries[index].product = value;

    if (selectedParty && value) {
      
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

   
    const party = event.target.party.value;
    const date = event.target.date.value;

    const products = entries.map((entry) => ({
      product: entry.product,
      price: entry.price,
      quantity: entry.quantity,
      subtotal: entry.subtotal,
    }));

   
    const sales = [
      {
        date,
        products,
        party,
      },
    ];
    await createXML(sales);

    try {
      
      await saveSalesData(party, products);

      alert("Sales data has been saved to the database successfully!");

      
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
          <option value="Flonix">Flonix</option>
          <option value="Prime">Prime</option>
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
                  <option value="Pump">Pump</option>
                  <option value="Ro">Ro</option>
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
        </div>
      </form>
    </div>
  );
};

export default Sales;
