import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

// Initialize database and create tables
export const initDB = async () => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    // Create sales table (party-level information)
    const createSalesTableQuery = `
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party TEXT NOT NULL,
        date TEXT NOT NULL
      );
    `;
    await db.execute(createSalesTableQuery);

    // Create sales_items table (products associated with sales)
    const createSalesItemsTableQuery = `
      CREATE TABLE IF NOT EXISTS sales_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
      );
    `;
    await db.execute(createSalesItemsTableQuery);

    await sqliteConnection.closeConnection("mydb");
    // alert("Sales and Sales Items tables created successfully");
  } catch (err) {
    console.error("DB initialization failed:", err);
    alert("DB initialization failed: " + err.message);
  }
};

// Save sales data with multiple products
export const saveSalesData = async (party, date, products) => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    
    const insertSalesQuery = `INSERT INTO sales (party, date) VALUES (?, ?);`;
    const result = await db.run(insertSalesQuery, [party, date]);

    const saleId = result.changes.lastId; // Get the last inserted sale_id

    
    if (result.changes && result.changes.changes > 0) {
      // alert("Sales data inserted successfully with sale_id:", saleId);

      
      for (const product of products) {
        const insertProductQuery = `INSERT INTO sales_items (sale_id, product, price, quantity) VALUES (?, ?, ?, ?);`;
        await db.run(insertProductQuery, [
          saleId,
          product.product,
          product.price,
          product.quantity,
        ]);
      }

      console.log("All products inserted successfully.");
      alert("Sales data saved successfully to SQLite!");
    } else {
      console.error("Failed to insert sales data.");
      // alert("Failed to insert sales data.");
    }

    await sqliteConnection.closeConnection("mydb");
  } catch (err) {
    console.error("Save data failed:", err);
    alert("Save data failed: " + err.message);
  }
};


// Fetch party Data in sql
export const fetchParties = async () => {
  try {
    // Check if the connection already exists
    const isConn = await sqliteConnection.isConnection("mydb");

    if (isConn.result) {
      // If the connection exists, close it first
      await sqliteConnection.closeConnection("mydb",false);
    }

    // Create a new connection to the SQLite database
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    // Query to fetch all unique party names from the sales table
    const query = `SELECT DISTINCT party FROM sales;`;
    const result = await db.query(query);

    
    await sqliteConnection.closeConnection("mydb",false);

    
    if (result.values && result.values.length > 0) {
      
      const parties = result.values.map((row) => row.party);
      console.log("Fetched parties:", parties);
      alert("Fetched party data successfully!");
      return parties;
    } else {
      console.log("No parties found.");
      alert("No parties found.");
      return [];
    }
  } catch (err) {
    console.error("Failed to fetch parties:", err);
    alert("Failed to fetch parties: " + err.message);
    return [];
  }
};
