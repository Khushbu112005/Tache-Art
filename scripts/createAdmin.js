const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

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
  const email = args[0] || "admin@tacheart.com";
  const password = args[1] || "AdminPass123!";
  const name = args[2] || "Admin";

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
        console.log(`Updated user ${email} to 'admin' role.`);
      } else {
        console.log(`Admin user with email "${email}" already exists.`);
      }
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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
