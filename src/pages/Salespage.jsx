import React, { useEffect, useState } from "react";
import "../Style/Sales.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import { create } from "xmlbuilder2";
import { Storage } from "@capacitor/storage";
import { useNavigate } from "react-router-dom";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import {
  initDB,
  saveSalesData,
  fetchProductDetails,
  getAllLanguageNames,
  getAllProductNames,
  getAllUnitNames,
} from "./databse";

const fetchPartyNames = async () => {
  try {
    const partyNames = await getAllLanguageNames();
    return partyNames;
  } catch (error) {
    alert("Error fetching party names:" + error.message);
    return [];
  }
};
const fetchProductNames = async () => {
  try {
    const partyNames = await getAllProductNames();
    return partyNames;
  } catch (error) {
    alert("Error fetching party names:" + error.message);
    return [];
  }
};

const fetchUnitNames = async () => {
  try {
    const unitNames = await getAllUnitNames();
    return unitNames;
  } catch (error) {
    alert("Error fetching party names:" + error.message);
    return [];
  }
};

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

const CustomProductBox = ({ options, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  // Filter options based on the search term
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

const CustomUnitBox = ({ options, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");

  // Filter options based on the search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    setSelectedUnit(option);
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
const Sales = () => {
  const [entries, setEntries] = useState([
    { product: "", unit: "", price: "", quantity: "", subtotal: "" },
  ]);
  const [party, setParty] = useState("");
  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [unit, setUnit] = useState([]);
  const [selectedParty, setSelectedParty] = useState("");
  const navigator = useNavigate();

  const createXML = async (sales) => {
    let existingXML;
    try {
      // read the file
      const file = await Filesystem.readFile({
        path: "Transaction.xml",
        directory: Directory.External,
        encoding: Encoding.UTF8,
      }).catch((error) => {
        console.warn("File not found, creating a new one", error);
        // alert("File not found, creating a new one", error.message);
        return { data: null };
      });
      const xmlContent = file.data;
      if (xmlContent) {
        existingXML = new DOMParser().parseFromString(
          xmlContent,
          "application/xml"
        );
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
                <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                <REFERENCE>55</REFERENCE>
                <VOUCHERNUMBER>5152</VOUCHERNUMBER>                
                <PARTYLEDGERNAME>${sale.party}</PARTYLEDGERNAME>
                <CSTFORMISSUETYPE />
                <CSTFORMRECVTYPE />
                <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
                <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
                <VCHGSTCLASS />
                <ENTEREDBY>sunil</ENTEREDBY>
                <DIFFACTUALQTY>No</DIFFACTUALQTY>
                <ISMSTFROMSYNC>No</ISMSTFROMSYNC>
                <ASORIGINAL>No</ASORIGINAL>
                <AUDITED>No</AUDITED>
                <FORJOBCOSTING>No</FORJOBCOSTING>
                <ISOPTIONAL>No</ISOPTIONAL>
                <EFFECTIVEDATE>${Dateformate}</EFFECTIVEDATE>
                <USEFOREXCISE>No</USEFOREXCISE>
                <ISFORJOBWORKIN>No</ISFORJOBWORKIN>
                <ALLOWCONSUMPTION>No</ALLOWCONSUMPTION>
                <USEFORINTEREST>No</USEFORINTEREST>
                <USEFORGAINLOSS>No</USEFORGAINLOSS>
                <USEFORGODOWNTRANSFER>No</USEFORGODOWNTRANSFER>
                <USEFORCOMPOUND>No</USEFORCOMPOUND>
                <USEFORSERVICETAX>No</USEFORSERVICETAX>
                <ISEXCISEVOUCHER>No</ISEXCISEVOUCHER>
                <EXCISETAXOVERRIDE>No</EXCISETAXOVERRIDE>
                <USEFORTAXUNITTRANSFER>No</USEFORTAXUNITTRANSFER>
                <EXCISEOPENING>No</EXCISEOPENING>
                <USEFORFINALPRODUCTION>No</USEFORFINALPRODUCTION>
                <ISTDSOVERRIDDEN>No</ISTDSOVERRIDDEN>
                <ISTCSOVERRIDDEN>No</ISTCSOVERRIDDEN>
                <ISTDSTCSCASHVCH>No</ISTDSTCSCASHVCH>
                <INCLUDEADVPYMTVCH>No</INCLUDEADVPYMTVCH>
                <ISSUBWORKSCONTRACT>No</ISSUBWORKSCONTRACT>
                <ISVATOVERRIDDEN>No</ISVATOVERRIDDEN>
                <IGNOREORIGVCHDATE>No</IGNOREORIGVCHDATE>
                <ISVATPAIDATCUSTOMS>No</ISVATPAIDATCUSTOMS>
                <ISDECLAREDTOCUSTOMS>No</ISDECLAREDTOCUSTOMS>
                <ISSERVICETAXOVERRIDDEN>No</ISSERVICETAXOVERRIDDEN>
                <ISISDVOUCHER>No</ISISDVOUCHER>
                <ISEXCISEOVERRIDDEN>No</ISEXCISEOVERRIDDEN>
                <ISEXCISESUPPLYVCH>No</ISEXCISESUPPLYVCH>
                <ISGSTOVERRIDDEN>No</ISGSTOVERRIDDEN>
                <GSTNOTEXPORTED>No</GSTNOTEXPORTED>
                <IGNOREGSTINVALIDATION>No</IGNOREGSTINVALIDATION>
                <ISVATPRINCIPALACCOUNT>No</ISVATPRINCIPALACCOUNT>
                <ISBOENOTAPPLICABLE>No</ISBOENOTAPPLICABLE>
                <ISSHIPPINGWITHINSTATE>No</ISSHIPPINGWITHINSTATE>
                <ISOVERSEASTOURISTTRANS>No</ISOVERSEASTOURISTTRANS>
                <ISDESIGNATEDZONEPARTY>No</ISDESIGNATEDZONEPARTY>
                <ISCANCELLED>No</ISCANCELLED>
                <HASCASHFLOW>No</HASCASHFLOW>
                <ISPOSTDATED>No</ISPOSTDATED>
                <USETRACKINGNUMBER>No</USETRACKINGNUMBER>
                <ISINVOICE>Yes</ISINVOICE>
                <MFGJOURNAL>No</MFGJOURNAL>
                <HASDISCOUNTS>No</HASDISCOUNTS>
                <ASPAYSLIP>No</ASPAYSLIP>
                <ISCOSTCENTRE>No</ISCOSTCENTRE>
                <ISSTXNONREALIZEDVCH>No</ISSTXNONREALIZEDVCH>
                <ISEXCISEMANUFACTURERON>No</ISEXCISEMANUFACTURERON>
                <ISBLANKCHEQUE>No</ISBLANKCHEQUE>
                <ISVOID>No</ISVOID>
                <ISONHOLD>No</ISONHOLD>
                <ORDERLINESTATUS>No</ORDERLINESTATUS>
                <VATISAGNSTCANCSALES>No</VATISAGNSTCANCSALES>
                <VATISPURCEXEMPTED>No</VATISPURCEXEMPTED>
                <ISVATRESTAXINVOICE>No</ISVATRESTAXINVOICE>
                <VATISASSESABLECALCVCH>No</VATISASSESABLECALCVCH>
                <ISVATDUTYPAID>Yes</ISVATDUTYPAID>
                <ISDELIVERYSAMEASCONSIGNEE>No</ISDELIVERYSAMEASCONSIGNEE>
                <ISDISPATCHSAMEASCONSIGNOR>No</ISDISPATCHSAMEASCONSIGNOR>
                <ISDELETED>No</ISDELETED>
                <CHANGEVCHMODE>No</CHANGEVCHMODE>
                <ALTERID> 161235</ALTERID>
                <MASTERID> 118180</MASTERID>
                <VOUCHERKEY>195674415038624</VOUCHERKEY>
                <EXCLUDEDTAXATIONS.LIST> </EXCLUDEDTAXATIONS.LIST>
                <OLDAUDITENTRIES.LIST> </OLDAUDITENTRIES.LIST>
                <ACCOUNTAUDITENTRIES.LIST> </ACCOUNTAUDITENTRIES.LIST>
                <AUDITENTRIES.LIST> </AUDITENTRIES.LIST>
                <DUTYHEADDETAILS.LIST> </DUTYHEADDETAILS.LIST>
                <SUPPLEMENTARYDUTYHEADDETAILS.LIST> </SUPPLEMENTARYDUTYHEADDETAILS.LIST>
                <EWAYBILLDETAILS.LIST> </EWAYBILLDETAILS.LIST>
                <INVOICEDELNOTES.LIST> </INVOICEDELNOTES.LIST>
                <INVOICEORDERLIST.LIST> </INVOICEORDERLIST.LIST>
                <INVOICEINDENTLIST.LIST> </INVOICEINDENTLIST.LIST>
                <ATTENDANCEENTRIES.LIST> </ATTENDANCEENTRIES.LIST>
                <ORIGINVOICEDETAILS.LIST> </ORIGINVOICEDETAILS.LIST>
                <INVOICEEXPORTLIST.LIST> </INVOICEEXPORTLIST.LIST>
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
                    <ISGSTASSESSABLEVALUEOVERRIDDEN>No</ISGSTASSESSABLEVALUEOVERRIDDEN>
                    <STRDISGSTAPPLICABLE>No</STRDISGSTAPPLICABLE>
                    <CONTENTNEGISPOS>No</CONTENTNEGISPOS>
                    <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
                    <ISAUTONEGATE>No</ISAUTONEGATE>
                    <ISCUSTOMSCLEARANCE>No</ISCUSTOMSCLEARANCE>
                    <ISTRACKCOMPONENT>No</ISTRACKCOMPONENT>
                    <ISTRACKPRODUCTION>No</ISTRACKPRODUCTION>
                    <ISPRIMARYITEM>No</ISPRIMARYITEM>
                    <ISSCRAP>No</ISSCRAP>
                    <RATE>${product.price}/${product.unit}</RATE>
                    <AMOUNT>${product.subtotal}</AMOUNT>
                    <ACTUALQTY>${product.quantity} ${product.unit}</ACTUALQTY>
                    <BILLEDQTY>${product.quantity} ${product.unit}</BILLEDQTY>
                    <BATCHALLOCATIONS.LIST>
                        <GODOWNNAME>Main Location</GODOWNNAME>
                        <BATCHNAME>Primary Batch</BATCHNAME>
                        <INDENTNO>Not Applicable</INDENTNO>
                        <ORDERNO>Not Applicable</ORDERNO>
                        <TRACKINGNUMBER><![CDATA[&#4; Not Applicable]]></TRACKINGNUMBER>
                        <DYNAMICCSTISCLEARED>No</DYNAMICCSTISCLEARED>
                        <AMOUNT>${product.subtotal}</AMOUNT>
                        <ACTUALQTY>${product.quantity} ${product.unit}</ACTUALQTY>
                        <BILLEDQTY>${product.quantity} ${product.unit}</BILLEDQTY>
                        <ADDITIONALDETAILS.LIST>        </ADDITIONALDETAILS.LIST>
                        <VOUCHERCOMPONENTLIST.LIST>        </VOUCHERCOMPONENTLIST.LIST>
                    </BATCHALLOCATIONS.LIST>
                    <ACCOUNTINGALLOCATIONS.LIST>
                        <OLDAUDITENTRYIDS.LIST TYPE="Number">
                          <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
                        </OLDAUDITENTRYIDS.LIST>
                        <LEDGERNAME>Sales Ledger</LEDGERNAME>
                        <GSTCLASS>Not Applicable</GSTCLASS>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <LEDGERFROMITEM>No</LEDGERFROMITEM>
                        <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <GSTOVERRIDDEN>No</GSTOVERRIDDEN>
                        <ISGSTASSESSABLEVALUEOVERRIDDEN>No</ISGSTASSESSABLEVALUEOVERRIDDEN>
                        <STRDISGSTAPPLICABLE>No</STRDISGSTAPPLICABLE>
                        <STRDGSTISPARTYLEDGER>No</STRDGSTISPARTYLEDGER>
                        <STRDGSTISDUTYLEDGER>No</STRDGSTISDUTYLEDGER>
                        <CONTENTNEGISPOS>No</CONTENTNEGISPOS>
                        <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
                        <ISCAPVATTAXALTERED>No</ISCAPVATTAXALTERED>
                        <ISCAPVATNOTCLAIMED>No</ISCAPVATNOTCLAIMED>
                        <AMOUNT>${product.subtotal}</AMOUNT>
                        <SERVICETAXDETAILS.LIST>        </SERVICETAXDETAILS.LIST>
                        <BANKALLOCATIONS.LIST>        </BANKALLOCATIONS.LIST>
                        <BILLALLOCATIONS.LIST>        </BILLALLOCATIONS.LIST>
                        <INTERESTCOLLECTION.LIST>        </INTERESTCOLLECTION.LIST>
                        <OLDAUDITENTRIES.LIST>        </OLDAUDITENTRIES.LIST>
                        <ACCOUNTAUDITENTRIES.LIST>        </ACCOUNTAUDITENTRIES.LIST>
                        <AUDITENTRIES.LIST>        </AUDITENTRIES.LIST>
                        <INPUTCRALLOCS.LIST>        </INPUTCRALLOCS.LIST>
                        <DUTYHEADDETAILS.LIST>        </DUTYHEADDETAILS.LIST>
                        <EXCISEDUTYHEADDETAILS.LIST>        </EXCISEDUTYHEADDETAILS.LIST>
                        <RATEDETAILS.LIST>        </RATEDETAILS.LIST>
                        <SUMMARYALLOCS.LIST>        </SUMMARYALLOCS.LIST>
                        <CENVATDUTYALLOCATIONS.LIST>        </CENVATDUTYALLOCATIONS.LIST>
                        <STPYMTDETAILS.LIST>        </STPYMTDETAILS.LIST>
                        <EXCISEPAYMENTALLOCATIONS.LIST>        </EXCISEPAYMENTALLOCATIONS.LIST>
                        <TAXBILLALLOCATIONS.LIST>        </TAXBILLALLOCATIONS.LIST>
                        <TAXOBJECTALLOCATIONS.LIST>        </TAXOBJECTALLOCATIONS.LIST>
                        <TDSEXPENSEALLOCATIONS.LIST>        </TDSEXPENSEALLOCATIONS.LIST>
                        <VATSTATUTORYDETAILS.LIST>        </VATSTATUTORYDETAILS.LIST>
                        <COSTTRACKALLOCATIONS.LIST>        </COSTTRACKALLOCATIONS.LIST>
                        <REFVOUCHERDETAILS.LIST>        </REFVOUCHERDETAILS.LIST>
                        <INVOICEWISEDETAILS.LIST>        </INVOICEWISEDETAILS.LIST>
                        <VATITCDETAILS.LIST>        </VATITCDETAILS.LIST>
                        <ADVANCETAXDETAILS.LIST>        </ADVANCETAXDETAILS.LIST>
                        <TAXTYPEALLOCATIONS.LIST>        </TAXTYPEALLOCATIONS.LIST>
                    </ACCOUNTINGALLOCATIONS.LIST>
                    <DUTYHEADDETAILS.LIST>       </DUTYHEADDETAILS.LIST>
                    <RATEDETAILS.LIST>
                      <GSTRATEDUTYHEAD>CGST</GSTRATEDUTYHEAD>
                    </RATEDETAILS.LIST>
                    <RATEDETAILS.LIST>
                      <GSTRATEDUTYHEAD>SGST/UTGST</GSTRATEDUTYHEAD>
                    </RATEDETAILS.LIST>
                    <RATEDETAILS.LIST>
                      <GSTRATEDUTYHEAD>IGST</GSTRATEDUTYHEAD>
                    </RATEDETAILS.LIST>
                    <RATEDETAILS.LIST>
                      <GSTRATEDUTYHEAD>Cess</GSTRATEDUTYHEAD>
                    </RATEDETAILS.LIST>
                    <RATEDETAILS.LIST>
                      <GSTRATEDUTYHEAD>State Cess</GSTRATEDUTYHEAD>
                    </RATEDETAILS.LIST>
                    <SUPPLEMENTARYDUTYHEADDETAILS.LIST>       </SUPPLEMENTARYDUTYHEADDETAILS.LIST>
                    <TAXOBJECTALLOCATIONS.LIST>       </TAXOBJECTALLOCATIONS.LIST>
                    <REFVOUCHERDETAILS.LIST>       </REFVOUCHERDETAILS.LIST>
                    <EXCISEALLOCATIONS.LIST>       </EXCISEALLOCATIONS.LIST>
                    <EXPENSEALLOCATIONS.LIST>       </EXPENSEALLOCATIONS.LIST>
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
        data: xmlString,
        encoding: Encoding.UTF8,
      });
      // await Storage.set({ key: "salesXML", value: xmlString });
      // alert("Sales data add In Folder!", res.uri);
      return xmlString;
    } catch (error) {
      console.error("Error saving sales data:", error);
      alert("Error Saving Sales Data" + error.message);
      return null;
    }
  };

  const handleProductChange = async (index, value, type) => {
    if (!party) {
      alert("Please select a party first.");
      return;
    }

    const newEntries = [...entries];

    if (type === "product") {
      newEntries[index].product = value;
      if (value) {
        const { price, quantity } = await fetchProductDetails(party, value);
        newEntries[index].price = price || "";
        newEntries[index].quantity = quantity || "";
        newEntries[index].subtotal = (
          parseFloat(price) * parseInt(quantity, 10) || 0
        ).toFixed(2);
      }
    } else if (type === "unit") {
      newEntries[index].unit = value;
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
      { product: "", unit: "", price: "", quantity: "", subtotal: "" },
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

    // const party = event.target.party.value;
    const date = event.target.date.value;

    const products = entries.map((entry) => ({
      product: entry.product,
      unit: entry.unit,
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
    const initializeDatabaseAndLoadParties = async () => {
      try {
        await initDB();
        // alert("Database initialized.");
        const fetchedParties = await fetchPartyNames();
        const fetchedProducts = await fetchProductNames();
        const fetchedUnits = await fetchUnitNames();
        setParties(fetchedParties);
        setProducts(fetchedProducts);
        setUnit(fetchedUnits);
      } catch (error) {
        alert("Initialization or data fetching failed:", error);
      }
    };

    initializeDatabaseAndLoadParties();
  }, []);
  return (
    <div className="container">
      <h1 className="title">Sales Form</h1>
      <form className="sales-form" onSubmit={handleSubmit}>
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" required />

        <label htmlFor="party">Party:</label>
        {parties.length > 0 ? (
          <CustomSelectBox
            options={parties}
            onChange={(selectedParty) => setParty(selectedParty)}
          />
        ) : (
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            Loading parties...
          </p>
        )}
        {/* <p>Selected Party: {party}</p> */}
        {entries.map((entry, index) => (
          <div key={index} className="entry-group">
            <div className="entry-fields">
              <div className="field-group">
                <label htmlFor={`product-${index}`}>Product:</label>
                <CustomProductBox
                  options={products}
                  onChange={(value) =>
                    handleProductChange(index, value, "product")
                  }
                />
              </div>
              <div className="field-group">
                <label htmlFor={`unit-${index}`}>Unit:</label>
                <CustomUnitBox
                  options={unit}
                  onChange={(value) =>
                    handleProductChange(index, value, "unit")
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
