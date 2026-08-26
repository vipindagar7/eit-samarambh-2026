import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "samarambh";

if (!uri) {
  console.warn("[mongodb] MONGODB_URI is not set — registration writes to MongoDB will fail until it's configured in .env.local");
}

// Cache the client across hot reloads in dev, and across invocations in
// serverless prod, so we don't open a new connection on every request.
let clientPromise;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export async function getDb() {
  if (!clientPromise) {
    throw new Error("MONGODB_URI is not configured");
  }
  const client = await clientPromise;
  return client.db(dbName);
}
