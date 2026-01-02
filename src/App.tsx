import { useState, useRef } from "react";
import Papa from "papaparse";
import "./App.css";

interface LogEntry {
  id: number;
  timestamp: Date;
  message: string;
  status: "success" | "error";
  index: number;
}

function App() {
  const [host, setHost] = useState(
    import.meta.env.VITE_UDP_SERVER_HOST || "localhost"
  );
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSendingRef = useRef(false);
  const logIdCounterRef = useRef(0);
  const API_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://api-udp-tester.qarhami.com/api";

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][];
        const nonBlankRows = rows.filter((row) =>
          row.some((cell) => cell && cell.trim().length > 0)
        );
        setCsvData(nonBlankRows);
        setStatus(`Loaded ${nonBlankRows.length} rows`);
      },
      error: (error) => {
        setStatus(`Error: ${error.message}`);
      },
    });
  };

  // Send single packet
  const sendPacket = async (message: string) => {
    const response = await fetch(`${API_URL}/send-packet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send packet");
    }

    return await response.json();
  };

  // Send all packets
  const startSending = async () => {
    if (csvData.length === 0) {
      setStatus("Error: Please upload CSV file first");
      return;
    }

    setIsSending(true);
    isSendingRef.current = true;
    setStatus("Sending packets...");
    setLogs([]); // Clear previous logs

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < csvData.length; i++) {
      if (!isSendingRef.current) break;

      const packet = csvData[i].join(",");
      try {
        await sendPacket(packet);
        successCount++;
        setStatus(
          `Sending... ${i + 1}/${
            csvData.length
          } (${successCount} success, ${failCount} failed)`
        );
        // Add success log
        setLogs((prev) => [
          ...prev,
          {
            id: logIdCounterRef.current++,
            timestamp: new Date(),
            message: packet,
            status: "success",
            index: i + 1,
          },
        ]);
      } catch (error) {
        failCount++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`Packet ${i + 1} failed:`, error);
        // Add error log
        setLogs((prev) => [
          ...prev,
          {
            id: logIdCounterRef.current++,
            timestamp: new Date(),
            message: `${packet} - Error: ${errorMessage}`,
            status: "error",
            index: i + 1,
          },
        ]);
      }
    }

    setIsSending(false);
    isSendingRef.current = false;
    setStatus(`Done! ${successCount} sent, ${failCount} failed`);
  };

  // Stop sending
  const stopSending = () => {
    setIsSending(false);
    isSendingRef.current = false;
    setStatus("Stopped");
  };

  // Clear all
  const clearAll = () => {
    setCsvData([]);
    setStatus("");
    setLogs([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clear logs only
  const clearLogs = () => {
    setLogs([]);
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
    return `${timeString}.${milliseconds}`;
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Simple UDP Packet Sender</h1>
        <p>Upload CSV and send packets to port 9495</p>
      </div>

      <div className="main-content">
        <div className="config-section">
          <h2>Server Configuration</h2>
          <div className="config-item">
            <label>Host:</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              disabled={isSending}
              placeholder="localhost"
            />
            <small>Port: 9495 (fixed)</small>
          </div>
        </div>

        <div className="upload-section">
          <h2>CSV File Upload</h2>
          <div className="upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isSending}
              style={{ display: "none" }}
            />
            <button
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
            >
              {csvData.length > 0 ? "Change CSV" : "Upload CSV"}
            </button>
            {csvData.length > 0 && (
              <div className="file-info">
                <p>{csvData.length} rows loaded</p>
                <button
                  className="clear-button"
                  onClick={clearAll}
                  disabled={isSending}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="control-section">
          <h2>Controls</h2>
          <div className="control-buttons">
            {!isSending ? (
              <button
                className="start-button"
                onClick={startSending}
                disabled={csvData.length === 0}
              >
                Start Sending
              </button>
            ) : (
              <button className="stop-button" onClick={stopSending}>
                Stop
              </button>
            )}
          </div>
        </div>

        <div className="status-section">
          <h2>Status</h2>
          <div className="status-display">
            <p
              className={
                status.includes("Error")
                  ? "error"
                  : status === "" || status === "Ready"
                  ? "ready"
                  : ""
              }
            >
              {status || "Ready"}
            </p>
          </div>
        </div>

        <div className="commands-section">
          <div className="commands-list-header">
            <h2>Message Logs</h2>
            {logs.length > 0 && (
              <button className="clear-logs-button" onClick={clearLogs}>
                Clear Logs
              </button>
            )}
          </div>
          <div className="commands-list-container">
            {logs.length === 0 ? (
              <div className="empty-state">
                No logs yet. Start sending messages to see logs here.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`command-item ${
                    log.status === "error" ? "error" : "processed"
                  }`}
                >
                  <div className="command-content">
                    <span className="command-index">#{log.index}</span>
                    <span className="command-data">{log.message}</span>
                  </div>
                  <div className="command-timestamp">
                    <span>{formatTimestamp(log.timestamp)}</span>
                    {log.status === "success" ? (
                      <span className="server-badge">Success</span>
                    ) : (
                      <span className="error-badge">Error</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
