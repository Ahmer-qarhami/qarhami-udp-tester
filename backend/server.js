import express from "express";
import cors from "cors";
import dgram from "dgram";

const app = express();
const PORT = 9490;
const UDP_PORT = 9495; // Fixed port - no load balancing

// Optional MongoDB connection (graceful failure if not available)
let mongoose = null;
let dbConnected = false;

async function connectMongoDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.log("MongoDB URI not provided, skipping database connection");
    return;
  }

  try {
    // Dynamically import mongoose only if MongoDB URI is provided
    mongoose = await import("mongoose");

    // Set connection options with shorter timeout
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 seconds instead of 30
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    };

    await mongoose.default.connect(MONGODB_URI, options);
    dbConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("ERROR IN MONGO DB CONNECTED...", error.message);
    console.log("Continuing without MongoDB connection...");
    dbConnected = false;
  }
}

// Attempt MongoDB connection (non-blocking)
connectMongoDB().catch((err) => {
  console.error("Failed to initialize MongoDB connection:", err.message);
});

app.use(
  cors({
    origin: "https://udp-tester.qarhami.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// Simple UDP send function
function sendUDPPacket(host, port, message) {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket("udp4");
    const messageBuffer = Buffer.from(message, "utf8");

    client.on("error", (err) => {
      client.close();
      reject(new Error(`UDP error: ${err.message}`));
    });

    client.send(messageBuffer, port, host, (err) => {
      client.close();
      if (err) {
        reject(new Error(`Failed to send: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}

// Single endpoint to send UDP packet
app.post("/api/send-packet", async (req, res) => {
  try {
    const { host, message } = req.body;

    if (!host || !message) {
      return res.status(400).json({ error: "host and message required" });
    }

    await sendUDPPacket(host, UDP_PORT, message);
    res.json({ success: true, port: UDP_PORT });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for ipapi.co to avoid CORS issues
app.get("/api/ipinfo", async (req, res) => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Sending UDP packets to port ${UDP_PORT}`);
});
