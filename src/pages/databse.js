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
        party TEXT NOT NULL
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

    // Create Partyname table
    const createPartynameTableQuery = `
      CREATE TABLE IF NOT EXISTS partyname (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `;
    await db.execute(createPartynameTableQuery);

    await sqliteConnection.closeConnection("mydb");
    // alert("Sales and Sales Items tables created successfully");
  } catch (err) {
    console.error("DB initialization failed:", err);
    alert("DB initialization failed: " + err.message);
  }
};

// Save sales data with multiple products
export const saveSalesData = async (party, products) => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    // Check if the sale already exists for the given party and date
    const selectSalesQuery = `SELECT id FROM sales WHERE party = ?;`;
    const salesResult = await db.query(selectSalesQuery, [party]);

    let saleId;

    if (salesResult.values && salesResult.values.length > 0) {
      // If sale already exists, get the sale_id
      saleId = salesResult.values[0].id;

      // Update existing products for this sale
      for (const product of products) {
        const selectProductQuery = `SELECT id FROM sales_items WHERE sale_id = ? AND product = ?;`;
        const productResult = await db.query(selectProductQuery, [
          saleId,
          product.product,
        ]);

        if (productResult.values && productResult.values.length > 0) {
          // Update the existing product if it exists
          const updateProductQuery = `UPDATE sales_items SET price = ?, quantity = ? WHERE sale_id = ? AND product = ?;`;
          await db.run(updateProductQuery, [
            product.price,
            product.quantity,
            saleId,
            product.product,
          ]);
        } else {
          // Insert a new product if it doesn't exist
          const insertProductQuery = `INSERT INTO sales_items (sale_id, product, price, quantity) VALUES (?, ?, ?, ?);`;
          await db.run(insertProductQuery, [
            saleId,
            product.product,
            product.price,
            product.quantity,
          ]);
        }
      }
      console.log("Sales data updated successfully.");
    } else {
      // If sale doesn't exist, insert new sale
      const insertSalesQuery = `INSERT INTO sales (party) VALUES (?);`;
      const result = await db.run(insertSalesQuery, [party]);
      saleId = result.changes.lastId;

      // Insert products for the new sale
      for (const product of products) {
        const insertProductQuery = `INSERT INTO sales_items (sale_id, product, price, quantity) VALUES (?, ?, ?, ?);`;
        await db.run(insertProductQuery, [
          saleId,
          product.product,
          product.price,
          product.quantity,
        ]);
      }
      console.log("Sales data inserted successfully.");
    }

    alert("Sales data saved successfully to SQLite!");
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
export const updateVoucherInDB = async (party, products) => {
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
      WHERE party = ?;
    `;
    await db.run(deleteSalesQuery, [party]);

    // Insert the updated sales and products
    const insertSalesQuery = `INSERT INTO sales (party) VALUES (?);`;
    const result = await db.run(insertSalesQuery, [party]);

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
export const deleteVoucher = async (party) => {
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
      WHERE party = ?;
    `;
    await db.run(deleteSalesQuery, [party]);

    await sqliteConnection.closeConnection("mydb");
    console.log("Data deleted successfully from SQLite.");
  } catch (err) {
    console.error("Failed to delete data from SQLite:", err);
    throw new Error("Failed to delete data from SQLite: " + err.message);
  }
};

// Party name store
// Save extracted language names to the SQLite database
export const saveLanguageNames = async (languageNames) => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();

    // Insert each language name into the languages table
    for (const name of languageNames) {
      const insertLanguageQuery = `INSERT INTO partyname (name) VALUES (?);`;
      await db.run(insertLanguageQuery, [name]);
    }
    
    alert("Party names saved successfully to SQLite!");

    await sqliteConnection.closeConnection("mydb");
  } catch (err) {
    console.error("Failed to save Partyname names:", err);
    alert("Failed to save Partyname names: " + err.message);
  }
};

// get all partynames
// export const getAllLanguageNames = async () => {
//   try {
//     const db = await sqliteConnection.createConnection(
//       "mydb",
//       false,
//       "no-encryption",
//       1
//     );
//     await db.open();

//     // Query to select all language names
//     const selectAllLanguagesQuery = `SELECT name FROM partyname;`;
//     const result = await db.query(selectAllLanguagesQuery);

//     if (result.values && result.values.length > 0) {
//       const languageNames = result.values.map(row => row.name);
//       alert("Retrieved partyname names:", languageNames);
//       return languageNames;
//     } else {
//       console.log("No partyname names found.");
//       alert("No partyname names found.");
//       // return [];
//     }

//     await sqliteConnection.closeConnection("mydb");
//   } catch (err) {
//     console.error("Failed to retrieve language names:", err);
//     alert("Failed to retrieve language names: " + err.message);
//     return [];
//   }
// };
