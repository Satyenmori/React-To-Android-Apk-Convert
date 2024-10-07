import React, { useState, useEffect } from "react";
import { Storage } from "@capacitor/storage";
import "../Style/Import.css";
import importImage from "../images/import1.png";
import {
  initDB,
  saveLanguageNames,
  saveproductNames,
  saveUnitNames,
} from "./databse";

function XmlFileRead() {
  const [fileInfos, setFileInfos] = useState([
    { name: null, dateTime: null, key: "File1" },
    { name: null, dateTime: null, key: "File2" },
    { name: null, dateTime: null, key: "File3" },
  ]);

  useEffect(() => {
    const loadFileInfos = async () => {
      try {
        const loadedInfos = await Promise.all(
          fileInfos.map(async (info) => {
            const { value } = await Storage.get({ key: info.key });
            return value ? JSON.parse(value) : { name: null, dateTime: null };
          })
        );
        setFileInfos((prev) =>
          prev.map((info, index) => ({
            ...info,
            ...loadedInfos[index],
          }))
        );
      } catch (error) {
        console.error("Error loading file infos:", error);
      }
    };
    loadFileInfos();
  }, []);

  const openFilePicker = async (index, type) => {
    try {
      const file = await pickFile();
      if (file) {
        const currentDateTime = new Date().toLocaleString();
        const updatedInfos = [...fileInfos];
        updatedInfos[index] = {
          ...updatedInfos[index],
          name: file.name,
          dateTime: currentDateTime,
        };
        setFileInfos(updatedInfos);
        if (index === 0) {
          // File1: Party XML
          await saveFileToStorage(
            file,
            currentDateTime,
            updatedInfos[index].key,
            "party"
          );
        } else if (index === 1) {
          // File2: Product XML
          await saveFileToStorage(
            file,
            currentDateTime,
            updatedInfos[index].key,
            "product"
          );
        }
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
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error("No file selected"));
        }
      };
      input.click();
    });
  };

  const saveFileToStorage = async (file, dateTime, key, type) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        let content = reader.result;

        // Clean content by removing new lines and multiple spaces
        content = content.replace(/\r\n/g, "").replace(/\s+/g, " ");

        // Modify the regex to capture <UNIT ...> elements with attributes and their inner content
        const unitMatches = [
          ...content.matchAll(/<UNIT\b[^>]*>(.*?)<\/UNIT>/g),
        ];
        let allNamesFromUnits = [];

        // Match <LANGUAGENAME.LIST> elements (unchanged)
        const languageListMatches = [
          ...content.matchAll(
            /<LANGUAGENAME\.LIST>(.*?)<\/LANGUAGENAME\.LIST>/g
          ),
        ];

        // Extract <NAME> from inside each <UNIT>
        unitMatches.forEach((unitMatch) => {
          const unitContent = unitMatch[1];

          // Extract <NAME> inside <UNIT>
          const namesInUnit = [
            ...unitContent.matchAll(/<NAME>(.*?)<\/NAME>/g),
          ].map((nameMatch) => nameMatch[1]); // Extract the content inside <NAME>

          allNamesFromUnits = allNamesFromUnits.concat(namesInUnit);
        });

        // Log the fetched <NAME> from <UNIT> independently
        if (allNamesFromUnits.length > 0) {
          console.log("Units:", allNamesFromUnits);
        } else {
          console.log("No <NAME> found inside <UNIT>");
        }

        // Process <LANGUAGENAME.LIST> as before
        if (languageListMatches.length > 0) {
          let allNames = [];

          languageListMatches.forEach((match) => {
            const languageListContent = match[1];

            const nameMatches = [
              ...languageListContent.matchAll(/<NAME>(.*?)<\/NAME>/g),
            ].map((nameMatch) => nameMatch[1]);

            allNames = allNames.concat(nameMatches);
          });

          // Party,Unit & Product Name Store database
          if (type === "party") {
            await saveLanguageNames(allNames);
            await saveUnitNames(allNamesFromUnits);
            // allNames.forEach((name) => {
            //   console.log("Party Name:", name);
            // });
            // allNamesFromUnits.forEach((name) => {
            //   console.log("Unit Names", name);
            // });
          } else if (type === "product") {
            await saveproductNames(allNames);
            allNames.forEach((name) => {
              console.log("Product Name:", name);
            });
          }
        } else {
          console.log("No <LANGUAGENAME.LIST> found.");
        }

        // Locale storage Name & Date only store
        const fileData = {
          name: file.name,
          dateTime: dateTime,
        };
        await Storage.set({
          key: key,
          value: JSON.stringify(fileData),
        });
      };

      reader.onerror = (err) => {
        console.error("Error reading file:", err);
        alert("Error reading file: " + err.message);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file: " + error.message);
    }
  };

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDB();
        // alert("Database initialized successfully.");
      } catch (error) {
        alert("Error initializing the database:", error);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <div className="main">
      <img src={importImage} alt="Import img" className="import-image" />
      <div className="import-container">
        {fileInfos.map((info, index) => (
          <div className="import-section" key={index}>
            <button className="btn" onClick={() => openFilePicker(index)}>
              Select XML File
            </button>
            <div className="file-info">
              {info.name ? (
                <div>
                  <h2>Selected File:</h2>
                  <p>Name: {info.name}</p>
                  <p className="date">Date: {info.dateTime}</p>
                </div>
              ) : (
                <p>No file selected yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default XmlFileRead;
