import express from "express";
import cors from "cors";
import dgram from "dgram";

const app = express();
const PORT = 9490;
const UDP_PORT = 9495; // Fixed port - no load balancing

app.use(cors());
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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Sending UDP packets to port ${UDP_PORT}`);
});
