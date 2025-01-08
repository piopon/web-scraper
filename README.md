# web-scraper

A versatile web scraping application built to efficiently gather data from a variety of websites.
This project is ideal for automating data extraction tasks and transforming raw HTML data into structured formats.

### Overview

This service application allows users to specify target websites and define the elements to extract, enabling seamless and customizable public data scraping.
The tool is designed to handle a range of web scraping scenarios, from simple data extraction to complex, multi-page crawling tasks.

### Features

- **User-friendly configuration**<br>
  Easily set up scraping tasks through a simple UI or via supported API requests
- **Customizable scraping rules**<br>
  Users can specify target elements using CSS selectors
- **Multiple users support**<br>
  Run scraper tasks for several users at once
- **REST API**<br>
  Output data can be retrieved remotely by sending a request to appropriate REST API endpoint
- **Error handling**<br>
  Built-in mechanisms to manage failed requests and handle dynamic content

### Requirements

- MongoDB instance
- Node.js 18+

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/piopon/web-scraper.git
   ```
2. Navigate to the project directory:
   ```
   cd web-scraper
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Configuration

Before running the application service create an .env file with the following data:
```
SERVER_PORT=[APP_PORT:INTEGER]       # the web-server service port number
SESSION_SHA=[SHA_SECRET:STRING]      # hash for session cookie
JWT_SECRET=[JWT_SECRET:STRING]       # hash for JSON Web Token
DB_ADDRESS=[ADDRESS:IP STRING]       # the IP address for DB (localhost for local DB)
DB_NAME=[NAME:STRING]                # the name for the DB
DB_PORT=[DB_PORT:INTEGER]            # the port for DB
DEMO_MODE=[overwrite|duplicate]      # the demo session mode
DEMO_BASE=[BASE_USER:EMAIL STRING]   # base demo email
DEMO_USER=[DEMO_USER:EMAIL STRING]   # user template email
DEMO_PASS=[DEMO_SECRET:STRING]       # base dome password
```

### Usage

Run the scraper:
```
npm run start
```
Customize your scraping tasks by opening the web-browser and logging to the configured IP:PORT address.
After that add new configuration groups, observers and fill all components data.
Your data is now scraped!
Check the `users` directory for scraped data values or error details if configuration is incorrect.

### Project Structure

```
web-scraper/
├── .github/workflows/     # GitHub workflows for CI/CD
├── docs/                  # Requests documentation and docs assets
├── public                 # Frontend UI source files
├── src/                   # Backend UI source files
├── test/                  # Unit tests logic
├── users/                 # Stored scraped data
├── .gitignore             # List of files ignored by GIT
├── CODEOWNERS             # List of code owners
├── LICENSE                # GPL-2.0 license description
├── package-lock.json      # Node.js snapshot of the dependency tree
├── package.json           # Node.js project metadata
└── README.md              # Top-level project description
```

### Contributing

Contributions are welcome! To contribute:
- Fork the repository.
- Create a new branch for your feature or bugfix.
- Submit a pull request with a clear description of your changes.

### License

This project is licensed under the GPL-2.0 license.
See the [LICENSE](./LICENSE) file for details.

### Contact

For questions or suggestions, feel free to contact me through GitHub.

---
<p align="center">Created by PNK with ❤ @ 2023-2025</p>