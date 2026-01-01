# UDP CSV Packet Dispatcher

A React + Vite application for uploading CSV files and dispatching them as UDP packets to a server at configurable intervals.

## Features

- 📁 **CSV File Upload**: Upload and parse CSV files
- 🔧 **Server Configuration**: Configure UDP server host and port
- ⏱️ **Interval Control**: Set custom intervals between packet sends (in milliseconds)
- 📊 **CSV Preview**: Preview the first 5 rows of uploaded CSV data
- 🚀 **Batch Sending**: Send all CSV rows as UDP packets automatically
- 🧪 **Test Packet**: Send a single test packet before batch sending
- 📈 **Progress Tracking**: Real-time progress bar and packet count
- ⏹️ **Stop Control**: Stop sending packets at any time

## Prerequisites

- Node.js (v20.18.0 or higher recommended)
- npm or yarn

## Installation

1. Install dependencies for both frontend and backend:

```bash
npm run install:all
```

Or install separately:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

2. Configure environment variables:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your UDP server configuration
# Default values:
# VITE_UDP_SERVER_HOST=localhost
# VITE_UDP_SERVER_PORT=8080
# VITE_API_BASE_URL=http://localhost:3001/api
```

## Running the Application

### Option 1: Run Both Frontend and Backend Together (Recommended)

```bash
npm run dev:all
```

This will start:

- Backend server on `http://localhost:3001`
- Frontend React app on `http://localhost:5173`

### Option 2: Run Separately

**Terminal 1 - Backend Server:**

```bash
npm run server
# Or from backend directory:
cd backend && npm start
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

## Configuration

### Environment Variables

The application uses environment variables for default UDP server configuration. Create a `.env` file in the root directory:

```env
# UDP Server Configuration
VITE_UDP_SERVER_HOST=localhost
VITE_UDP_SERVER_PORT=8080

# Backend API URL
VITE_API_BASE_URL=http://localhost:3001/api
```

**Note:** In Vite, environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

The values in `.env` will be used as default values in the UI, but you can still override them in the application interface.

## Usage

1. **Configure Server Settings**:

   - The default values are loaded from `.env` file
   - You can override them by entering the UDP server host (e.g., `localhost` or IP address)
   - Enter the UDP server port (e.g., `8080`)
   - Set the interval between packets in milliseconds (e.g., `1000` for 1 second)

2. **Upload CSV File**:

   - Click "Upload CSV File" button
   - Select a CSV file from your computer
   - The file will be parsed and displayed in the preview table

3. **Send Packets**:
   - **Test Packet**: Click "Send Test Packet" to send the first row as a test
   - **Start Sending**: Click "Start Sending" to begin sending all rows at the configured interval
   - **Stop Sending**: Click "Stop Sending" to halt the packet sending process

## CSV Format

The application accepts standard CSV files. Each row will be converted to a comma-separated text packet and sent via UDP.

Example CSV:

```csv
Name,Age,City
John,30,New York
Jane,25,Los Angeles
Bob,35,Chicago
```

This will send packets like:

```
Name,Age,City
John,30,New York
Jane,25,Los Angeles
Bob,35,Chicago
```

## API Endpoints

The backend server provides the following endpoints:

- `POST /api/send-packet` - Send a single UDP packet
- `POST /api/start-sending` - Start sending packets at intervals
- `POST /api/stop-sending` - Stop sending packets

## Project Structure

```
qarhami-udp-tester/
├── backend/
│   ├── server.js      # Express backend server for UDP packet sending
│   ├── package.json   # Backend dependencies (express, cors)
│   └── .gitignore     # Backend gitignore
├── src/
│   ├── App.tsx        # Main React component
│   ├── App.css        # Component styles
│   ├── index.css      # Global styles
│   └── main.tsx       # React entry point
├── package.json       # Frontend dependencies and scripts
└── README.md         # This file
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Express** - Backend server
- **PapaParse** - CSV parsing
- **Node.js dgram** - UDP packet sending

## Notes

- The backend server must be running for the frontend to send packets
- UDP packets are sent as UTF-8 encoded strings
- The application converts each CSV row to a comma-separated string
- Progress tracking is approximate and based on time intervals

## License

MIT
