import mongoose from "mongoose";
import dns from "dns";

// Ensure reliable DNS resolution for mongodb+srv:// on local ISP networks
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // Ignore in non-Node environments
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global cache to prevent multiple connections in development
const globalWithMongoose = global as typeof global & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in your Vercel project settings or .env"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
