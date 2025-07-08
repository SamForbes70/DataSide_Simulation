```markdown
# ProjectDeck

ProjectDeck is a visual demonstration platform that simulates real-time data integration between HubSpot CRM and Xero accounting systems. It showcases live updates and unified analytics displayed in a Power BI-style dashboard. Users can experience real-time data synchronization and visualization by editing data in source systems, reflected in a centralized reporting interface.

## Overview

ProjectDeck is designed with a modern architecture using the following technologies:

- **Frontend**: ReactJS with Vite build tool, Tailwind CSS for styling, and Shadcn UI component library. Client-side routing is handled via `react-router-dom`.
- **Backend**: Express-based server implementing REST API endpoints.
- **Database**: MongoDB with Mongoose for database operations.
- **Visualization**: Power BI-style dashboard for unified analytics.
- **Data Integration**: Simulated API endpoints for HubSpot and Xero with mock data.
- **Real-Time Updates**: Instant UI refresh and live synchronization.

The project structure is divided into two main parts:
1. **Frontend (Client)**: Located in the `client/` folder.
2. **Backend (Server)**: Located in the `server/` folder.

The application runs both the frontend and backend concurrently for synchronized operation.

## Features

- **Main Dashboard Landing**:
  - KPI Cards displaying metrics like Total Deals, Total Invoices, and Total Variance.
  - Refresh Data button to trigger data synchronization.
  - Customer Filter dropdown to filter results by specific customers.

- **Data Integration Table**:
  - Merged data view with sortable columns and visual indicators for positive variances.
  - Edit buttons for HubSpot deals and Xero invoices, opening respective modal editors.

- **HubSpot Deal Editor Modal**:
  - Form fields for editing deal amount and stage.
  - Save and cancel actions with loading indicators.

- **Xero Invoice Editor Modal**:
  - Form fields for editing invoice amount and status.
  - Save and cancel actions with loading indicators.

- **Live Update Experience**:
  - Real-time KPI card updates and table animations on data changes.
  - Immediate recalculations for variances with success notifications.

- **Optional AI Insights Panel**:
  - Automated analysis showing customers with the highest variance, total customers with positive variance, and average deal size.

- **Optional Time Trend Visualization**:
  - Line chart displaying variance trends over months with interactive tooltips.

- **OAuth Integration Simulation**:
  - Visual-only connection status indicators and reconnect buttons for HubSpot and Xero.

## Getting Started

### Requirements

Ensure the following are installed on your system:
- Node.js (v14.x or higher)
- npm (v6.x or higher)
- MongoDB (running locally or accessible remotely)

### Quickstart

1. **Clone the repository**:
    ```sh
    git clone <repository-url>
    cd projectdeck
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Setup environment variables**:
    - Create a `.env` file in the `server/` folder and configure it with your MongoDB URI and other necessary API credentials.

4. **Start the application**:
    ```sh
    npm run start
    ```

   This will concurrently start the frontend on port 5173 and the backend on port 3000.

5. **Access the application**:
    - Open your browser and navigate to `http://localhost:5173`.

### License

The project is proprietary (not open source). Copyright (c) 2024.
```