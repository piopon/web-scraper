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
SERVER_PORT=[APP_PORT:INTEGER]
SESSION_SHA=[SHA_SECRET:STRING]
JWT_SECRET=[JWT_SECRET:STRING]
DB_ADDRESS=[ADDRESS:IP STRING]
DB_NAME=[NAME:STRING]
DB_PORT=[DB_PORT:INTEGER]
DEMO_MODE=[overwrite|duplicate]
DEMO_BASE=[BASE_USER:EMAIL STRING]
DEMO_USER=[DEMO_USER:EMAIL STRING]
DEMO_PASS=[DEMO_SECRET:STRING]
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
├── .github/workflows/  #
├── docs/               #
├── public              #
├── src/                #
├── test/               #
├── users/              # Directory for storing scraped data
├── .gitignore          #
├── CODEOWNERS          #
├── LICENSE             #
├── package-lock.json   #
├── package.json        # Node.js dependencies and run/test scripts
└── README.md           # Project documentation
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