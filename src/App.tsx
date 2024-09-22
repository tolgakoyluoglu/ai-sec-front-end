import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:3000"; // Replace with your actual API base URL

function App() {
  const [networkInfo, setNetworkInfo] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>(""); // For URL input
  const [startPort, setStartPort] = useState<number>(1);
  const [endPort, setEndPort] = useState<number>(1024);
  const [timeout, setTimeoutValue] = useState<number>(500); // Timeout in milliseconds

  // Fetch the local network info when the component mounts (if needed)
  useEffect(() => {
    async function fetchNetworkInfo() {
      try {
        const response = await fetch(`${API_BASE_URL}/network/info`, {
          method: "GET",
        });
        const data = await response.json();
        setNetworkInfo(data.networkRange); // Assuming the API returns { networkRange: '192.168.1.0/24' }
      } catch (error) {
        console.error("Error fetching network info:", error);
      }
    }

    fetchNetworkInfo();
  }, []);

  // Scan ports of the local network or a specific domain
  async function handleScanPorts() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/portscanner?url=${encodeURIComponent(
          url
        )}&startPort=${startPort}&endPort=${endPort}&timeout=${timeout}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setScanResult(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error scanning ports:", error);
      setIsLoading(false);
    }
  }

  // Analyze a specific URL/web page for vulnerabilities
  async function handleAnalyzeWebPage() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/webpageanalyzer?url=${encodeURIComponent(url)}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setScanResult(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error analyzing web page:", error);
      setIsLoading(false);
    }
  }

  // Scan for vulnerabilities from the result (after port scan or web page analysis)
  async function handleMatchVulnerabilities() {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vulnerabilities/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scanResult }), // Pass the scan result for matching vulnerabilities
      });
      const data = await response.json();
      setVulnerabilities(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      setIsLoading(false);
    }
  }

  return (
    <div className="App">
      <h1>Vulnerability Scanner</h1>

      {/* Display the local network info */}
      {networkInfo && <p>Current Local Network: {networkInfo}</p>}

      {/* Input field for URL */}
      <div>
        <input
          type="text"
          placeholder="Enter a URL (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ marginBottom: "10px", padding: "10px", width: "300px" }}
        />
        <div>
          {/* Port range inputs */}
          <label>Start Port:</label>
          <input
            type="number"
            value={startPort}
            onChange={(e) => setStartPort(parseInt(e.target.value))}
            min={1}
            max={65535}
          />
          <label>End Port:</label>
          <input
            type="number"
            value={endPort}
            onChange={(e) => setEndPort(parseInt(e.target.value))}
            min={1}
            max={65535}
          />
          <label>Timeout (ms):</label>
          <input
            type="number"
            value={timeout}
            onChange={(e) => setTimeoutValue(parseInt(e.target.value))}
            min={100}
          />
        </div>

        <button onClick={handleScanPorts} disabled={isLoading || !url}>
          {isLoading ? "Scanning Ports..." : "Scan Ports"}
        </button>
      </div>

      <button onClick={handleAnalyzeWebPage} disabled={isLoading || !url}>
        {isLoading ? "Analyzing Web Page..." : "Analyze Web Page"}
      </button>

      {scanResult && (
        <div>
          <h2>Scan Results</h2>
          <pre>{JSON.stringify(scanResult, null, 2)}</pre>
        </div>
      )}

      {scanResult && (
        <button onClick={handleMatchVulnerabilities} disabled={isLoading}>
          {isLoading ? "Matching..." : "Match Vulnerabilities"}
        </button>
      )}

      {vulnerabilities.length > 0 && (
        <div>
          <h2>Vulnerabilities Found</h2>
          <pre>{JSON.stringify(vulnerabilities, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
