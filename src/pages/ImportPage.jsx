import React, { useState, useEffect } from "react";
import { Storage } from "@capacitor/storage";
import "../Style/Import.css";
import importImage from "../images/import1.png";

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

  const openFilePicker = async (index) => {
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
        await saveFileToStorage(file, currentDateTime, updatedInfos[index].key);
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

  const saveFileToStorage = async (file, dateTime, key) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileData = {
          name: file.name,
          content: reader.result,
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
