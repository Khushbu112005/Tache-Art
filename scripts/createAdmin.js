const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function createAdmin() {
  const args = process.argv.slice(2);
  let adminEmail = process.env.ADMIN_EMAIL;
  let adminPassword = process.env.ADMIN_PASSWORD;
  let adminName = process.env.ADMIN_NAME;

  try {
    const envPath = path.join(__dirname, "..", ".env");
    const envContent = fs.readFileSync(envPath, "utf8");
    const mEmail = envContent.match(/^ADMIN_EMAIL=(.+)$/m);
    if (mEmail && !adminEmail) adminEmail = mEmail[1].trim();
    const mPass = envContent.match(/^ADMIN_PASSWORD=(.+)$/m);
    if (mPass && !adminPassword) adminPassword = mPass[1].trim();
    const mName = envContent.match(/^ADMIN_NAME=(.+)$/m);
    if (mName && !adminName) adminName = mName[1].trim();
  } catch (e) {}

  const email = (args[0] || adminEmail || "admin@tacheart.com").toLowerCase().trim();
  const password = args[1] || adminPassword || "AdminPass123!";
  const name = args[2] || adminName || "Admin";

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    const hashedPassword = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.role = "admin";
      existing.name = name;
      existing.password = hashedPassword;
      await existing.save();
      console.log(`Updated admin credentials for ${email}.`);
      process.exit(0);
    }
    const admin = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log(`✅ Admin user successfully created in MongoDB!`);
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);
  } catch (err) {
    console.error("Error creating admin user:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
