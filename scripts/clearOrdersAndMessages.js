const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {}

let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  try {
    const envPath = path.join(__dirname, "..", ".env");
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/^MONGODB_URI=(.+)$/m);
    if (match) {
      MONGODB_URI = match[1].trim();
    }
  } catch (e) {
    // Ignore if .env missing
  }
}

if (!MONGODB_URI) {
  MONGODB_URI = "mongodb://localhost:27017/tache";
}

async function clearData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully to database:", mongoose.connection.name);

    const db = mongoose.connection.db;

    // 1. Delete all orders
    const ordersResult = await db.collection("orders").deleteMany({});
    console.log(`Deleted ${ordersResult.deletedCount} orders.`);

    // 2. Delete all custom requests & contact messages
    const messagesResult = await db.collection("messages").deleteMany({});
    console.log(`Deleted ${messagesResult.deletedCount} contact messages and custom requests.`);

    // 3. Delete all payment records associated with orders
    const paymentsResult = await db.collection("payments").deleteMany({});
    console.log(`Deleted ${paymentsResult.deletedCount} payment records.`);

    console.log("\nSummary of collections in database:");
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} document(s)`);
    }

    console.log("\nAll orders and custom contact messages have been successfully cleared!");
  } catch (error) {
    console.error("Error clearing data:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

clearData();
