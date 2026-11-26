import { getWatchlist, toggleWatchlist } from "./storage.js";
import { fetchTopCoins, searchCoins, fetchCoinDetails } from "./Api.js";

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

// Watchlist table ki body ko select karna
const watchlistBody = document.getElementById("watchlist-tbody");


// API se aaye saare coins ko HTML table mein dikhane ke liye
// init() data leke aata hai rendercoins() data dikhata hai
// Coins ko Market ya Watchlist ki table mein dikhane ke liye
function renderCoins(coins, targetBody = tableBody) {

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
    //data-action="view-coin" button ko ek label deta hai.
    //JavaScript click event mein us label ko check karta hai.
    //Label match hone par uske andar likha code execute hota hai.

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


    // Coin watchlist mein saved hai ya nahi, ye check karna
    const isSaved = getWatchlist().some((item) => item.id === coin.id);

    // Saved hai to bhara star, warna khaali star dikhana
    star.textContent = isSaved ? "★" : "☆";

    // Star button ko watchlist wali pehchan dena
    star.dataset.action = "toggle-watchlist";

    // Saved coin ke star par alag CSS color lagana
    star.classList.toggle("is-active", isSaved);

    // Screen reader ko batana coin add hoga ya remove
    star.setAttribute(
      "aria-label",
      `${isSaved ? "Remove" : "Add"} ${coin.name} ${isSaved ? "from" : "to"} watchlist`
    );

    // Button selected hai ya nahi, wo batana
    star.setAttribute("aria-pressed", String(isSaved));

    // Star button ko cell mein dalna
    watchCell.append(star);

    // Watchlist wala cell row mein jodna
    row.append(watchCell);


    // ===== ROW COMPLETE =====

    // Taiyar row ko temporary fragment mein dalna
    fragment.append(row);
  });


  // ===== TABLE UPDATE =====

  // Taiyar rows ko jis table mein chahiye, usmein dikhana
  targetBody.replaceChildren(fragment);

  // Watchlist ki table hai to Market ka status change mat karo
  if (targetBody !== tableBody) return;

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

// API se aaye coins ko save karke rakhne ke liye
let currentCoins = [];

// Currently selected coin ki details store karne ke liye
let selectedCoin = null;

let selectedCoinData = null;


// Coins ko price, market cap ya 24h change se sort karne ke liye
function sortCoins() {

  // Coins ka data nahi hai to sorting mat karo
  if (currentCoins.length === 0) return;

  // User ne sorting mein kya select kiya hai, wo lena
  const sortBy = document.getElementById("sort-select").value;

  // Sorting ki direction lene ke liye button select karna
  const directionBtn = document.getElementById("sort-direction-btn");

  // Ascending ya descending direction lena
  const direction = directionBtn.dataset.direction;

  // Coins ki copy banakar unko sort karna
  const sortedCoins = [...currentCoins].sort((a, b) => {

    // Dono coins ki selected value lena
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    // Dono coins ki value missing ho to order same rakhna
    if (aValue == null && bValue == null) return 0;

    // Pehle coin ki value missing ho to use last mein rakhna
    if (aValue == null) return 1;

    // Dusre coin ki value missing ho to use last mein rakhna
    if (bValue == null) return -1;

    // Ascending mein chhoti value pehle, descending mein badi
    return direction === "asc"
      ? aValue - bValue
      : bValue - aValue;
  });

  // Sort kiye hue coins ko table mein dikhana
  renderCoins(sortedCoins);
}


// Search ya refresh karne par coins ka data lana
async function init(query = "") {

  // Data pehle se aa raha hai to dobara API call nahi karna
  if (isLoading) return;

  // Loading shuru ho gayi
  isLoading = true;

  // Nayi search shuru hone par purane coins ka data hata dena
  currentCoins = [];

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

      // API se aaye coins ko save karke rakhna
      currentCoins = coins;

      // Coins ko selected order mein table par dikhana
      sortCoins();
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


// Saved coins ko My Watchlist page par dikhane ke liye
function renderWatchlist() {

  // Browser se saved coins lena
  const savedCoins = getWatchlist();

  // Navigation mein saved coins ki counting dikhana
  document.getElementById("watchlist-count").textContent = savedCoins.length;

  // Coins saved hain to watchlist ki table dikhana
  document.getElementById("watchlist-table-container").hidden =
    savedCoins.length === 0;

  // Koi coin saved nahi hai to empty message dikhana
  document.getElementById("watchlist-empty").hidden =
    savedCoins.length > 0;

  // Saved coins ko Watchlist ki table mein dikhana
  renderCoins(savedCoins, watchlistBody);
}


// Market aur Watchlist page ke beech change karne ke liye
function showView(view) {

  // User Watchlist dekhna chahta hai ya nahi
  const isWatchlist = view === "watchlist";
  const isDetail = view === "detail";


  document.getElementById("home-view").hidden =
    isWatchlist || isDetail;

  document.getElementById("watchlist-view").hidden =
    !isWatchlist;

  document.getElementById("detail-view").hidden =
    !isDetail;

  // Navigation ke dono buttons lena
  const homeBtn = document.getElementById("home-btn");
  const watchlistBtn = document.getElementById("watchlist-btn");

  // Jo page khula hai uske button ko active dikhana
  homeBtn.classList.toggle("is-active", !isWatchlist);
  watchlistBtn.classList.toggle("is-active", isWatchlist);

  // Screen reader ko batana kaunsa page khula hai
  if (isWatchlist) {

    watchlistBtn.setAttribute("aria-current", "page");
    homeBtn.removeAttribute("aria-current");

  } else {

    homeBtn.setAttribute("aria-current", "page");
    watchlistBtn.removeAttribute("aria-current");
  }
}


async function openCoinDetails(coinId) {

  try {

    // Selected coin ki ID save karna
    selectedCoin = coinId;

    // Detail view open karna
    showView("detail");

    // Loading status dikhana
    document.getElementById("detail-coin-name").textContent = "Loading...";

    // API se selected coin ki details fetch karna
    const coin = await fetchCoinDetails(coinId);

    // Agar user ne meanwhile doosra coin select kiya ho
    if (selectedCoin !== coinId) return;

    // Coin ki complete details save karna
    selectedCoin = coin.id;

    selectedCoinData = coin;

    // Details ko UI mein display karna
    renderCoinDetails(coin);

  } catch (error) {

    // API error ko UI mein show karna
    document.getElementById("detail-coin-name").textContent =
      "Unable to load coin details.";

    document.getElementById("detail-description").textContent =
      "Please try again later.";

  }

}


function renderCoinDetails(coin) {

  // Coin ka logo display karna
  const logo = document.getElementById("detail-coin-logo");
  const image = document.createElement("img");

  image.src = coin.image.large;
  image.alt = coin.name;

  logo.replaceChildren(image);

  // Coin ka naam aur symbol
  document.getElementById("detail-coin-name").textContent = coin.name;

  document.getElementById("detail-coin-symbol").textContent =
    coin.symbol.toUpperCase();

  // Market data ko ek variable mein lena
  const market = coin.market_data;

  // Current price
  document.getElementById("detail-price").textContent =
    formatPrice(market.current_price.usd);

  // 24 hours price change
  const change = market.price_change_percentage_24h;
  const changeElement = document.getElementById("detail-change");

  changeElement.textContent =
    change == null ? "--" : `${change.toFixed(2)}%`;

  changeElement.className =
    `price-change ${change >= 0 ? "positive" : "negative"}`;

  // Market statistics
  document.getElementById("detail-market-cap").textContent =
    formatPrice(market.market_cap.usd);

  document.getElementById("detail-rank").textContent =
    coin.market_cap_rank ?? "--";

  document.getElementById("detail-volume").textContent =
    formatPrice(market.total_volume.usd);

  document.getElementById("detail-supply").textContent =
    market.circulating_supply?.toLocaleString("en-US") ?? "--";

  // Coin description
  const description = coin.description?.en || "No description available.";

  document.getElementById("detail-description").textContent =
    description.replace(/<[^>]*>/g, " ").trim();

    // Check karna ki coin watchlist mein saved hai ya nahi
const isSaved = getWatchlist().some(
  (item) => item.id === coin.id
);

// Detail View ka watchlist button update karna
const watchlistBtn = document.getElementById("detail-watchlist-btn");

watchlistBtn.setAttribute("aria-pressed", String(isSaved)); //String() → Boolean ko string mein convert karta hai.

document.getElementById("detail-watchlist-label").textContent =
  isSaved ? "Remove from watchlist" : "Add to watchlist";

watchlistBtn.classList.toggle("is-active", isSaved); //isSaved → true hai toh class add, false hai toh remove.

}


// Kisi bhi coin ke star par click hone ko check karna
document.addEventListener("click", (event) => {

  // Coin details button par click check karna
const coinButton = event.target.closest('[data-action="view-coin"]');

if (coinButton) {

  // Button ki parent row se coin ID lena
  const row = coinButton.closest("tr[data-coin-id]");

  if (!row) return;

  // Selected coin ki details open karna
  openCoinDetails(row.dataset.coinId);

  return;
}

  // Click hua star button dhundhna
  const star = event.target.closest('[data-action="toggle-watchlist"]');

  // Star button par click nahi hua to kuch mat karo
  if (!star) return;

  // Star kis coin ki row mein hai, wo dhundhna
  const row = star.closest("tr[data-coin-id]");

  // Coin ki row nahi mili to abhi kuch mat karo
  if (!row) return;

  // Row se coin ki unique ID lena
  const coinId = row.dataset.coinId;

  // Coin ko current API data ya saved watchlist mein dhundhna
  const coin =
    currentCoins.find((item) => item.id === coinId) ||
    getWatchlist().find((item) => item.id === coinId);

  // Coin ka data nahi mila to kuch mat karo
  if (!coin) return;

  // Coin ko watchlist mein add ya remove karna
  const saved = toggleWatchlist(coin);

  // Save karne mein error aaya to aage mat badho
  if (!saved) return;

  // My Watchlist aur saved coins ki counting update karna
  renderWatchlist();

  // Market ke stars bhi naye saved status ke saath dikhana
  if (currentCoins.length > 0) {
    sortCoins();
  }
});



// Search button par click karne se coin dhundhna
document.getElementById("search-btn").addEventListener("click", () => {
  init(searchInput.value.trim());
});


// Sorting select karne par coins ka order badalna
document.getElementById("sort-select").addEventListener("change", () => {

  // Coins ko naye selected option ke hisaab se sort karna
  sortCoins();
});


// Sorting direction button ko select karna
const sortDirectionBtn = document.getElementById("sort-direction-btn");


// Direction button dabane par order ulta karna
sortDirectionBtn.addEventListener("click", () => {

  // Abhi descending hai to ascending, warna descending karna
  sortDirectionBtn.dataset.direction =
    sortDirectionBtn.dataset.direction === "desc" ? "asc" : "desc";

  // Button par nayi direction ka naam dikhana
  const label = sortDirectionBtn.dataset.direction === "asc"
    ? "Sort direction: ascending"
    : "Sort direction: descending";

  // Button ka naam update karna
  sortDirectionBtn.setAttribute("aria-label", label);

  // Mouse le jane par nayi direction batana
  sortDirectionBtn.title = label;

  // Button ke arrow ko direction ke hisaab se ghumana
  sortDirectionBtn.querySelector("svg").style.transform =
    sortDirectionBtn.dataset.direction === "asc"
      ? "rotate(180deg)"
      : "rotate(0deg)";

  // Nayi direction ke hisaab se coins dikhana
  sortCoins();
});


// Detail View se Home par wapas jaana
document.getElementById("back-btn").addEventListener("click", () => {
  showView("home");
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


// My Watchlist button dabane par saved coins dikhana
document.getElementById("watchlist-btn").addEventListener("click", () => {

  // Watchlist ka latest saved data dikhana
  renderWatchlist();

  // Watchlist page kholna
  showView("watchlist");
});


// Market button dabane par home page dikhana
document.getElementById("home-btn").addEventListener("click", () => {

  // Market page kholna
  showView("home");
});


// Watchlist ke Back button par Market page kholna
document.getElementById("watchlist-back-btn").addEventListener("click", () => {

  // Market page dikhana
  showView("home");
});


// Explore Market button par Market page kholna
document.getElementById("explore-market-btn").addEventListener("click", () => {

  // Market page dikhana
  showView("home");
});


// Page khulte hi saved coins ki counting update karna
renderWatchlist();


// Page khulte hi API se coins lana
init();


// Detail View ke Watchlist button par click
document.getElementById("detail-watchlist-btn").addEventListener("click", () => {

  // Selected coin available hai ya nahi
  if (!selectedCoinData) return;

  // Coin ko LocalStorage mein add/remove karna
  const saved = toggleWatchlist(selectedCoinData);
  //toggleWatchlist → storage.js mein bana hua function hai.
  //selectedCoinData → Current selected coin ka data hai Function ko argument ke roop mein pass ho raha hai

  // Save successful hua to UI update karna
  if (saved) {
    renderWatchlist();
    renderCoinDetails(selectedCoinData);
    sortCoins();
  }

});