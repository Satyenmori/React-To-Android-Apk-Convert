import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

export const initDB = async () => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party TEXT NOT NULL,
        product TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL
      );
    `;

    await db.execute(createTableQuery);

    await sqliteConnection.closeConnection("mydb");
    console.log("Sales table created successfully");
  } catch (err) {
    console.error("DB initialization failed:", err);
    alert("DB initialization failed: " + err.message);
  }
};

export const saveSalesData = async (party, product, price, quantity) => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    const insertQuery = `INSERT INTO sales (party, product, price, quantity) VALUES (?, ?, ?, ?);`;
    const result = await db.run(insertQuery, [party, product, price, quantity]);

    console.log("Data insertion result:", result);

    if (result.changes && result.changes.changes > 0) {
      console.log("Data inserted successfully!");
      alert("Sales data saved successfully to SQLite!");
    } else {
      console.error("No data was inserted.");
      alert("No data was inserted.");
    }

    await sqliteConnection.closeConnection("mydb");
  } catch (err) {
    console.error("Save data failed:", err);
    alert("Save data failed: " + err.message);
  }
};
