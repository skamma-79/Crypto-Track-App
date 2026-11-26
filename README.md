# CryptoTrack — Cryptocurrency Market Tracker

A responsive cryptocurrency market tracking application built using **HTML, CSS, and Vanilla JavaScript**. CryptoTrack fetches live cryptocurrency market data from the CoinGecko API and allows users to search, sort, view coin details, and manage their personal watchlist.

## 🚀 Live Demo

Live Demo: https://crypto-track-app-phi.vercel.app/

## 📌 GitHub Repository

[CryptoTrack — GitHub Repository](https://github.com/skamma-79/Crypto-Track-App)

## ✨ Features

- **Live Market Data:** Displays the top 20 cryptocurrencies by market capitalization.
- **Search Functionality:** Search cryptocurrencies by name or symbol.
- **Debounced Search:** Reduces unnecessary API requests while typing.
- **Sorting:** Sort cryptocurrencies by price, market capitalization, and 24-hour price change.
- **Ascending & Descending Order:** Change sorting direction.
- **Coin Details:** View individual cryptocurrency information, including price, market cap, rank, trading volume, circulating supply, and description.
- **Personal Watchlist:** Add and remove cryptocurrencies from your watchlist.
- **LocalStorage:** Saves watchlist data across browser refreshes.
- **Loading State:** Displays a loading animation while fetching data.
- **Error Handling:** Displays error messages when API requests fail.
- **Empty State:** Handles searches with no matching results.
- **Responsive Design:** Supports desktop, tablet, and mobile screens.

## 📸 Screenshots

### Home / Market Dashboard
![Home](screenshots/home.png)

### Watchlist
![Watchlist](screenshots/watchlist.png)

### Coin Details
![Coin Details](screenshots/coin-details.png)

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- Async/Await
- DOM Manipulation
- LocalStorage
- CoinGecko API
- Git & GitHub

## 🌐 API Used

**CoinGecko API**

CryptoTrack uses the CoinGecko API to retrieve cryptocurrency market information.

API Documentation: https://docs.coingecko.com/

Main API endpoints:

- `/coins/markets` — Fetch top cryptocurrency market data.
- `/search` — Search cryptocurrencies.
- `/coins/{id}` — Fetch individual cryptocurrency details.

## 📂 Project Structure

```text
crypto-market-tracker/
│
├── assets/
│
├── css/
│   └── style.css
│
├── js/
│   ├── Api.js
│   ├── App.js
│   └── storage.js
│
├── index.html
└── README.md
```

## 💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/skamma-79/Crypto-Track-App.git
```

### 2. Open the project folder

```bash
cd Crypto-Track-App
```

### 3. Run the application

Open `index.html` using VS Code Live Server.

No additional frameworks or JavaScript libraries are required.

## 📱 Responsive Design

CryptoTrack is designed to provide a consistent experience across desktop, tablet, and mobile devices.

## 📚 Learning Outcomes

This project demonstrates practical implementation of:

- JavaScript fundamentals and ES6+ features.
- Array methods such as `map()`, `filter()`, `sort()`, and `find()`.
- Asynchronous JavaScript using `async/await`.
- API integration using Fetch API.
- Dynamic DOM manipulation.
- Event delegation.
- LocalStorage for persistent data.
- Error handling and UI state management.
- Git and GitHub version control.

## 👨‍💻 Author

**Sandeep Kamma**

Full Stack Web Development Learner

## 📄 License

This project was developed as part of the Milestone 2 — JavaScript Mastery project.