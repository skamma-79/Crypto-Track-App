
import { fetchTopCoins, searchCoins } from "./Api.js";

const tableBody = document.getElementById("coins-tbody");

// Number formatting
// Api se Coin ki price ko dollar ($) aur commas ke saath dikhane ke liye
const formatPrice = (value) =>

  // Number ko US style mein dikhane ke liye
  new Intl.NumberFormat("en-US", {

    style: "currency", // Price ko paiso ke format mein dikhana

    currency: "USD", // Price ke aage dollar ($) sign lagana

    // Price 1 se kam hai to 6 decimals tak, warna 2 tak
    maximumFractionDigits: value < 1 ? 6 : 2,

  }).format(value); // Price ko upar diye format mein badalna


// Table mein ek naya cell (td) banane ke liye
function createCell(text, className = "") {

  // HTML ka naya <td> element banana
  const td = document.createElement("td");

  // Cell ke andar text dalna
  td.textContent = text;

  // Cell ko CSS class dena
  td.className = className;

  // Bana hua cell wapas bhejna
  return td;
}


 // API se aaye saare coins ko HTML table mein dikhane ke liye
 // init() data leke aata hai rendercoins() data dikhata hai
function renderCoins(coins) {

  // Saari rows ko pehle ek temporary jagah rakhna
  const fragment = document.createDocumentFragment();

  // Har coin ke liye alag table row banana
  coins.forEach((coin, index) => {

    // Table ki nayi row (tr) banana
    const row = document.createElement("tr");

    // Row ko CSS class dena
    row.className = "coin-row";

    // Row mein coin ki unique ID rakhna
    row.dataset.coinId = coin.id;

    // Coin ka rank add karna, rank na mile to index + 1
    row.append(createCell(coin.market_cap_rank ?? index + 1));


    // ===== COIN NAME AUR IMAGE =====

    // Coin ki details ke liye naya cell banana
    const coinCell = document.createElement("td");

    // Coin par click karne ke liye button banana
    const button = document.createElement("button");

    // Button ko CSS class dena
    button.className = "coin-info";

    // Button ko batana ki coin ki details dikhani hain
    button.dataset.action = "view-coin";

    // Coin ka logo dikhane ke liye image banana
    const image = document.createElement("img");

    // API se coin ki image ka URL lena
    image.src = coin.image;

    // Image ke liye coin ka naam rakhna
    image.alt = coin.name;

    // Image ko CSS class dena
    image.className = "coin-icon";

    // Coin ka naam aur symbol ek jagah rakhne ke liye
    const identity = document.createElement("span");

    identity.className = "coin-identity";

    // Coin ka naam dikhane ke liye span banana
    const name = document.createElement("span");

    name.className = "coin-name";

    // API se coin ka naam dalna
    name.textContent = coin.name;

    // Coin ka short symbol dikhane ke liye
    const symbol = document.createElement("span");

    symbol.className = "coin-symbol";

    // API se BTC, ETH jaisa symbol dalna
    symbol.textContent = coin.symbol;

    // Naam aur symbol ko ek saath jodna
    identity.append(name, symbol);

    // Button ke andar image, naam aur symbol rakhna
    button.append(image, identity);

    // Button ko table cell mein dalna
    coinCell.append(button);

    // Coin wala cell table row mein jodna
    row.append(coinCell);


    // ===== COIN PRICE =====

    // Coin ki price ko dollar format mein row mein dalna
    row.append(createCell(formatPrice(coin.current_price), "coin-price"));


    // ===== 24 HOURS PRICE CHANGE =====

    // Pichhle 24 ghante mein price kitni badli, wo lena
    const change = coin.price_change_percentage_24h;

    // Price change dikhane ke liye naya cell banana
    const changeCell = document.createElement("td");

    changeCell.className = "numeric";

    // Percentage dikhane ke liye span banana
    const changeSpan = document.createElement("span");

    // Price badhi to green, ghati to red color lagana
    changeSpan.className = `price-change ${change >= 0 ? "positive" : "negative"}`;

    // Change na mile to --, warna 2 decimals ke saath percentage
    changeSpan.textContent = change == null ? "--" : `${change.toFixed(2)}%`;

    // Percentage ko cell ke andar dalna
    changeCell.append(changeSpan);

    // Price change wala cell row mein jodna
    row.append(changeCell);


    // ===== MARKET CAP =====

    // Coin ki market cap ko dollar format mein dikhana
    row.append(createCell(formatPrice(coin.market_cap), "coin-market-cap"));


    // ===== WATCHLIST STAR BUTTON =====

    // Watchlist star ke liye naya cell banana
    const watchCell = document.createElement("td");

    // Coin ko watchlist mein add karne ke liye button banana
    const star = document.createElement("button");

    // Star button ko CSS class dena
    star.className = "watchlist-toggle";

    // Button par khaali star dikhana
    star.textContent = "☆";

    // Star button ki pehchan rakhna, taaki baad mein click handle ho
    star.dataset.action = "toggle-watchlist";

    // Screen reader ke liye button ka naam rakhna
    star.setAttribute("aria-label", `Add ${coin.name} to watchlist`);

    // Shuru mein star selected nahi hai
    star.setAttribute("aria-pressed", "false");

    // Star button ko cell mein dalna
    watchCell.append(star);

    // Watchlist wala cell row mein jodna
    row.append(watchCell);


    // ===== ROW COMPLETE =====

    // Taiyar row ko temporary fragment mein dalna
    fragment.append(row);
  });


  // ===== TABLE UPDATE =====

  // Purani rows hata kar nayi rows table mein dikhana
  tableBody.replaceChildren(fragment);

  // Data aane ke baad starting wala message chhupana
  document.getElementById("market-placeholder").hidden = true;

  // Website par total kitne coins aaye hain, wo dikhana
  document.getElementById("tracked-count").textContent = coins.length;

  // Market ka status Data loaded dikhana
  document.getElementById("market-status").textContent = "Data loaded";
}



 // Search box ko select karna
const searchInput = document.getElementById("search-input");

// API call chal rahi hai ya nahi, ye check karne ke liye
let isLoading = false;


// Search ya refresh karne par coins ka data lana
async function init(query = "") {

  // Data pehle se aa raha hai to dobara API call nahi karna
  if (isLoading) return;

  // Loading shuru ho gayi
  isLoading = true;

  // Refresh aur retry buttons select karna
  const refreshBtn = document.getElementById("refresh-btn");
  const retryBtn = document.getElementById("retry-btn");

  // Data aane tak dono buttons band rakhna
  refreshBtn.disabled = true;
  retryBtn.disabled = true;

  // Table ke purane coins hata dena
  tableBody.replaceChildren();

  // Purane messages chhupa dena
  document.getElementById("market-placeholder").hidden = true;
  document.getElementById("market-error").hidden = true;
  document.getElementById("market-empty").hidden = true;

  // Loading animation dikhana
  document.getElementById("market-loading").hidden = false;

  // Website par loading status dikhana
  document.getElementById("market-status").textContent = "Loading...";

  try {

    // Search likha hai to search API, warna top 20 coins lana
    const coins = query
      ? await searchCoins(query)
      : await fetchTopCoins();

    // Ek bhi coin nahi mila to empty message dikhana
    if (coins.length === 0) {

      document.getElementById("market-empty").hidden = false;

      document.getElementById("market-status").textContent = "No results";

      document.getElementById("tracked-count").textContent = "0";

    } else {

      // Mile hue coins ko table mein dikhana
      renderCoins(coins);
    }

  } catch (error) {

    // Error ko console mein dikhana
    console.error(error);

    // Website par error message dikhana
    document.getElementById("market-error").hidden = false;

    document.getElementById("market-status").textContent = "Failed to load";

  } finally {

    // Data aaye ya error, loading band karna
    document.getElementById("market-loading").hidden = true;

    // Dono buttons dobara chalu karna
    refreshBtn.disabled = false;
    retryBtn.disabled = false;

    // Ab API call complete ho gayi
    isLoading = false;
  }
}


// Search button par click karne se coin dhundhna
document.getElementById("search-btn").addEventListener("click", () => {
  init(searchInput.value.trim());
});


// Enter dabane par bhi search chalana
searchInput.addEventListener("keydown", (event) => {

  if (event.key === "Enter") {
    init(searchInput.value.trim());
  }
});


// Refresh par current search ya top 20 dobara lana
document.getElementById("refresh-btn").addEventListener("click", () => {
  init(searchInput.value.trim());
});


// Try Again dabane par API dobara call karna
document.getElementById("retry-btn").addEventListener("click", () => {
  init(searchInput.value.trim());
});


// Clear Search dabane par top 20 coins wapas lana
document.getElementById("clear-search-btn").addEventListener("click", () => {

  // Search box khaali karna
  searchInput.value = "";

  // Top 20 coins dobara lana
  init(); // without argument chalega s20 coins wapas lega
});


// Website khulte hi top 20 coins dikhana
init();
