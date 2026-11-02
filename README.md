# AdhiJevan Services

AdhiJevan is a food ordering and meal-service application with a customer-facing website, an admin dashboard, and a Spring Boot REST API.

## Project structure

```text
aadhiJevan_Services/
├── backend/                         # Spring Boot REST API
│   ├── pom.xml                      # Maven dependencies and build configuration
│   ├── mvnw, mvnw.cmd               # Maven Wrapper for macOS/Linux and Windows
│   └── src/
│       ├── main/
│       │   ├── java/com/adhijevan/
│       │   │   ├── AdhijevanApplication.java
│       │   │   ├── config/          # Security, MongoDB, Cloudinary, WebSocket setup
│       │   │   ├── controller/      # HTTP API endpoints
│       │   │   ├── service/         # Business logic and integrations
│       │   │   ├── repository/      # MongoDB data access
│       │   │   ├── model/           # Domain and persistence models
│       │   │   ├── Enums/           # Shared enum types
│       │   │   ├── exception/       # Application exceptions
│       │   │   └── utils/           # JWT and authentication utilities
│       │   └── resources/
│       │       └── application.properties
│       └── test/                    # Backend tests
├── admin/                           # React + Vite admin dashboard
│   ├── public/                      # Public images and static files
│   └── src/
│       ├── api/                     # Admin API helpers
│       ├── components/              # Shared dashboard components
│       ├── data/                    # Local/demo data
│       ├── pages/                   # Admin screens
│       └── App.jsx, main.jsx        # App setup and entry point
└── user/                            # React + Vite customer website
    ├── public/                      # Images, videos, logos, and static data
    └── src/
        ├── api/                     # API client
        ├── components/              # Reusable customer-facing UI
        ├── context/                 # Shared React state
        ├── hooks/                   # Custom hooks
        ├── pages/                   # Customer pages
        ├── services/                # Frontend service helpers
        └── App.jsx, main.jsx        # App setup and entry point
```

Generated folders such as `backend/target/` and `user/node_modules/` are omitted.

## Technology

- **Backend:** Java 17, Spring Boot 3, Maven, Spring Web, Spring Security, Spring Data MongoDB
- **Frontend:** React 19, Vite 7, JavaScript, Tailwind CSS
- **Other integrations:** MongoDB Atlas, Cloudinary, email/SMTP, Razorpay, WebSocket and push notifications

## Prerequisites

- JDK 17
- Node.js and npm
- Network access and a valid MongoDB Atlas connection, or another correctly configured MongoDB deployment
- Credentials/configuration for any external integrations used by the features you run

## Run locally on Windows

Open a separate PowerShell terminal for each application. Run commands from the indicated folder.

### 1. Configure the backend

Review `backend/src/main/resources/application.properties` and `backend/src/main/java/com/adhijevan/config/MongoConfig.java`. Set valid local configuration for MongoDB and any required external services. Do not commit credentials or paste them into public logs.

The API is configured to use port **8080**.

### 2. Start the backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The API should become available at `http://localhost:8080` once Spring Boot has completed startup and connected to its required services.

### 3. Start the customer website

```powershell
cd user
npm install
npm run dev
```

### 4. Start the admin dashboard

```powershell
cd admin
npm install
npm run dev
```

Vite prints the local URL for each frontend in its terminal. If both frontends are running, Vite may choose a different port for the second one.

Both frontends currently use the backend at `http://localhost:8080`. If you change the API port or host, update the API base URL in the frontend API client files as well.

## Useful commands

Run these commands from the relevant frontend folder (`admin` or `user`):

```powershell
npm run build
npm run lint
npm run preview
```

Run backend tests from `backend`:

```powershell
.\mvnw.cmd test
```

## Troubleshooting

- **Port 8080 is already in use:** Stop the process using that port, or configure a different backend port and update both frontend API base URLs.
- **MongoDB `Failed looking up SRV record`:** Check that the MongoDB Atlas hostname in the connection URI is correct and that DNS can resolve its SRV record. In PowerShell, test it with:

  ```powershell
  nslookup -type=SRV _mongodb._tcp.<your-atlas-host>
  ```

  Use the hostname supplied by Atlas; do not include credentials in the hostname. If the SRV lookup fails, verify the Atlas connection string and your DNS/network settings before restarting the backend.
- **Frontend cannot reach the API:** Confirm the backend has fully started on port 8080 and that the frontend API client points to the same host and port.
- **Build or dependency errors:** Check the installed Java and Node.js versions, then retry the appropriate Maven or npm command and inspect the first reported error.

## Security note

Keep database passwords, API keys, SMTP credentials, JWT signing keys, and push-notification private keys out of source control and documentation. Use environment variables or an untracked local configuration file, and rotate credentials if they have been exposed.
