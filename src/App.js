import React, { useEffect, useState } from "react";
import { Filesystem, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import "./App.css";
import { Storage } from "@capacitor/storage";
import { XMLBuilder, XMLParser, j2xParser } from "fast-xml-parser";

function App() {
  const [fileContent, setFileContent] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [party, setParty] = useState([]);
  const [product, setProduct] = useState([]);

  const getMaster = async () => {
    try {
      let master = await Storage.get({ key: "master" });
      let products = await Storage.get({ key: "product" });
      // console.log(value);
      console.log(master.value, "master");
      console.log(products.value);
      // setMasterData(master);
      // travrseMaster(master);
      if (master.value) {
        console.log(master);
        setMasterData(master.value);
        travrseMaster(master.value);
      }
      if (products.value) {
        console.log(products.value);
        setProductData(products.value);
        fetchProduct(products.value);
      } else {
        alert("unknown File");
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const setMaster = async () => {
    await Storage.set({
      key: "master",
      value: fileContent,
    });
  };
  const openFilePicker = async () => {
    try {
      const file = await pickFile();
      if (file) {
        readFileContent(file);
      } else {
        alert("No file selected.");
      }
    } catch (error) {
      console.error("Error opening file picker:", error);
      alert("Error opening file picker: " + error.message);
    }
  };

  const pickFile = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/xml,text/xml,.xml";
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log("Selected file:", file); // Debugging
          const reader = new FileReader();
          reader.onload = () => {
            console.log("File content:", reader.result); // Debugging
            resolve({
              uri: file.name,
              content: reader.result,
            });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        } else {
          reject(new Error("No file selected"));
        }
      };
      input.click();
    });
  };

  const readFileContent = async (file) => {
    try {
      if (file && file.content) {
        console.log(file.uri);
        if (file.uri == "Master.xml") {
          setFileContent(file.content);
          await Storage.set({
            key: "master",
            value: file.content,
          });
        } else if (file.uri == "product.xml") {
          setProductData(file.content);
          await Storage.set({
            key: "product",
            value: file.content,
          });
        } else if (file.uri == "Alltransactions.xml") {
          await Storage.set({
            key: "transaction",
            value: file.content,
          });
          return;
        } else {
          return;
        }
        // alert(file.content)
      } else {
        throw new Error("File content is empty or cannot be read");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file: " + error.message);
    }
  };

  const fetchProduct = (products) => {
    try {
      // let res = await axios.get(productsfile);
      // let xml = res.data;
      const parser = new XMLParser();
      let json = parser.parse(products);
      json = json.ENVELOPE.DSPACCNAME;
      let arr = json.map((e, i) => {
        return e.DSPDISPNAME;
      });
      console.log(arr, "products");
      setProduct(arr);
    } catch (error) {
      console.log(error);
    }
  };

  const parseXML = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Error parsing XML");
      }
      return xmlDoc.documentElement.outerHTML;
    } catch (error) {
      console.error("Error parsing XML:", error);
      return "Error parsing XML: " + error.message;
    }
  };
  // traverse master data
  const travrseMaster = async (masterData) => {
    try {
      // alert(masterData)
      const parser = new XMLParser();
      const json = parser.parse(masterData);
      // filter ledger wise
      let arr = json.ENVELOPE.BODY.IMPORTDATA.REQUESTDATA.TALLYMESSAGE.filter(
        (e, i) => {
          let x = e.LEDGER;
          return x;
        }
      );
      // get name of ledger
      arr = arr.map((e, i) => {
        return arr[i].LEDGER["LANGUAGENAME.LIST"]["NAME.LIST"].NAME;
      });
      setParty(arr);
      console.log(arr);
    } catch (error) {
      console.log(error);
    }
  };

  // print bill

  const printBill = (customerName, items, total) => {
    const newWindow = window.open("", "", "width=800,height=600");

    

    
  newWindow.document.write('<html><head><title>Sales Bill</title>');
  newWindow.document.write('<style>');
  newWindow.document.write('body { font-family: Arial, sans-serif; margin: 0; padding: 0; }');
  newWindow.document.write('.container { padding: 20px; }');
  newWindow.document.write('.header, .footer { text-align: center; padding: 10px; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; }');
  newWindow.document.write('.footer { border-top: none; }');
  newWindow.document.write(`.wrapper{border-radius:20px}`)
  newWindow.document.write('table { width: 100%; border-collapse: collapse; seperate: 20px 0;border:0px solid black; }');
  newWindow.document.write('th, td { border: 1px solid black; padding: 8px; text-align: center; }');
  newWindow.document.write(".name{width:40%}")
  newWindow.document.write(".align{text-align:left}")
  newWindow.document.write('th { background-color: #f2f2f2; }');
  newWindow.document.write('.total-section { text-align: right; margin-top: 20px; }');
  newWindow.document.write('.total-section table { border: none; }');
  newWindow.document.write('.total-section th, .total-section td { border: none; padding: 5px; }');
  newWindow.document.write('</style>');
  newWindow.document.write('</head><body>');

  // Header
  newWindow.document.write('<div class="header">');
  newWindow.document.write('<h1>SR Water Group</h1>');
  newWindow.document.write('<p>Surat,Gujart</p>');
  newWindow.document.write('</div>');

  // Main Content
  newWindow.document.write('<div class="container">');
  newWindow.document.write(`<h2 class="header">Sales Challan</h2>`);
  newWindow.document.write(`<p>Party Name: ${customerName}</p>`);
    // newWindow.document.wri
  newWindow.document.write('<table>');
  newWindow.document.write('<thead><tr><th>Sr No.</th><th class="name align">Item</th><th>Quantity</th><th>Price / pcs</th><th>Total</th></tr></thead>');
  newWindow.document.write('<tbody>');
  items.forEach((item,i) => {
    newWindow.document.write(`<tr><td>${i+1}</td><td class="align">${item.name}</td><td>${item.quantity}</td><td>${item.price}</td><td>${item.quantity * item.price}</td></tr>`);
  });
  newWindow.document.write(`<tr><th>Total</th><td></td><td></td><td></td><td>${total.toFixed(2)}</td></tr>`);
  newWindow.document.write('</tbody></table>');

  // Subtotal, Tax, and Total

 
  
  newWindow.document.write('</table>');
  newWindow.document.write('</div>');

  // Footer
  newWindow.document.write('<div class="footer">');
  newWindow.document.write('<p>Thank you Visit Again !</p>');
  newWindow.document.write('</div>');

  newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.focus(); // Focus on the new window
    newWindow.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    printBill(
      "Prince",
      [
        { name: "pump", quantity: 5, price: 500 },
        { name: "SMPS", quantity: 10, price: 700 },
      ],
      9500
    );
  };
  useEffect(() => {
    getMaster();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: "flex" }}>
          <div>
            <h1>Read File from Downloads</h1>
            <button onClick={openFilePicker}>Select Master XML File</button>
            <div className="formdata">
              {masterData && (
                <div>
                  <h2>Party Name:</h2>
                  {/* <pre style={{ color: "red" }}>{masterData}</pre> */}
                  {party.length > 0 ? (
                    party?.map((e, index) => <h2 key={index}>{e}</h2>)
                  ) : (
                    <p>No party data available</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <h1>Read File from Downloads</h1>
            <button onClick={openFilePicker}>Select Product XML File</button>
            <div className="formdata">
              {productData && (
                <div>
                  <h2>Product Name:</h2>
                  {/* <pre style={{ color: "red" }}>{masterData}</pre> */}
                  {product.length > 0 ? (
                    product?.map((e, index) => <h2 key={index}>{e}</h2>)
                  ) : (
                    <p>No product data available</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <h1>Read File from Downloads</h1>
            <button onClick={openFilePicker}>Select Product XML File</button>
            <div className="formdata">
              {masterData && (
                <div>
                  <h2>File Content:</h2>
                  {/* <pre style={{ color: "red" }}>{masterData}</pre> */}
                  {party.length > 0 ? (
                    party?.map((e, index) => <h2 key={index}>{e}</h2>)
                  ) : (
                    <p>No party data available</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <button onClick={handleSubmit}>Print Bill</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
