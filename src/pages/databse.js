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
    // Table create karna
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL
      );
    `);
    await sqliteConnection.closeConnection("mydb");
  } catch (err) {
    console.error("DB initialization failed:", err);
    alert("DB initialization failed:", err);
  }
};

export const saveFormData = async (name, email, phone) => {
  try {
    const db = await sqliteConnection.createConnection(
      "mydb",
      false,
      "no-encryption",
      1
    );
    await db.open();
    await db.run(`INSERT INTO users (name, email, phone) VALUES (?, ?, ?);`, [
      name,
      email,
      phone,
    ]);
    await sqliteConnection.closeConnection("mydb");
  } catch (err) {
    console.error("Save data failed:", err);
    alert("Save data failed:", err);
  }
};
