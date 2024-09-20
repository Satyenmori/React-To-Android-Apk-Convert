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

// Fetch product details based on the selected party and product
export const fetchProductDetails = async (party, product) => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    const query = `
      SELECT price, quantity 
      FROM sales_items 
      INNER JOIN sales ON sales_items.sale_id = sales.id
      WHERE sales.party = ? AND sales_items.product = ?;
    `;
    const result = await db.query(query, [party, product]);

    await sqliteConnection.closeConnection("mydb", false);

    if (result.values && result.values.length > 0) {
      return {
        price: result.values[0].price,
        quantity: result.values[0].quantity,
      };
    } else {
      return { price: "", quantity: "" };
    }
  } catch (err) {
    console.error("Failed to fetch product details:", err);
    alert("Failed to fetch product details: " + err.message);
    return { price: "", quantity: "" };
  }
};

// Update sales data
export const updateVoucherInDB = async (party, date, products) => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    // First, delete existing sales and products for this party and date
    const deleteSalesQuery = `
      DELETE FROM sales 
      WHERE party = ? AND date = ?;
    `;
    await db.run(deleteSalesQuery, [party, date]);

    // Insert the updated sales and products
    const insertSalesQuery = `INSERT INTO sales (party, date) VALUES (?, ?);`;
    const result = await db.run(insertSalesQuery, [party, date]);

    const saleId = result.changes.lastId;

    for (const product of products) {
      const insertProductQuery = `INSERT INTO sales_items (sale_id, product, price, quantity) VALUES (?, ?, ?, ?);`;
      await db.run(insertProductQuery, [
        saleId,
        product.product,
        product.price,
        product.quantity,
      ]);
    }

    alert("Voucher updated successfully in the database.");
    await sqliteConnection.closeConnection("mydb");
  } catch (err) {
    console.error("Update voucher in database failed:", err);
    alert("Update voucher failed: " + err.message);
  }
};

// Delete query
export const deleteVoucher = async (party, date) => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    // Delete from sales where the party and date match
    const deleteSalesQuery = `
      DELETE FROM sales 
      WHERE party = ? AND date = ?;
    `;
    await db.run(deleteSalesQuery, [party, date]);

    await sqliteConnection.closeConnection("mydb");
    console.log("Data deleted successfully from SQLite.");
  } catch (err) {
    console.error("Failed to delete data from SQLite:", err);
    throw new Error("Failed to delete data from SQLite: " + err.message);
  }
};
