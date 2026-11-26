const apiCache = new Map();
const CACHE_DURATION = 60 * 1000;

async function fetchApiData(url, errorType) {
  const cachedData = apiCache.get(url);

  if (cachedData && Date.now() - cachedData.time < CACHE_DURATION) {
    return cachedData.data;
  }

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("API rate limit exceeded. Try again later.");
    }

    throw new Error(
      `${errorType} failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  apiCache.set(url, {
    data,
    time: Date.now()
  });

  return data;
}


export async function fetchTopCoins() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

  try {
    const data = await fetchApiData(url, "Market API");
    return data;

  } catch (error) {
    console.error("Failed to fetch coins:", error);
    throw error;
  }
}



 // User ke search kiye hue coins ka data lane ke liye
export async function searchCoins(query) {

  try {

    // CoinGecko par user ke likhe naam se coin dhundhna
    const data = await fetchApiData(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      "Search API"
    );

    // Search mein mile pehle 10 coins lena
    const matches = data.coins.slice(0, 10);

    // Koi coin nahi mila to khaali array bhejna
    if (matches.length === 0) return [];

    // Mile hue coins ki IDs ko comma se jodna
    const ids = matches.map((coin) => coin.id).join(",");

    // In coins ki price aur market cap ka data lana
    return await fetchApiData(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=false`,
      "Market API"
    );

  } catch (error) {

    // Error aaye to console mein dikhana
    console.error("Search failed:", error);

    // Error ko App.js tak bhejna
    throw error;
  }
}



// Individual coin ki complete details fetch karne ke liye
export async function fetchCoinDetails(coinId) {
  //Tumhare App.js mein jab user kisi coin par click karega, tab us coin ki ID pass ki jaayegi.
  // Ex- fetchCoinDetails("bitcoin");

  try {

    // CoinGecko API se selected coin ki details lena
    return await fetchApiData(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      "Coin Details API"
    );

  } catch (error) {

    // Error ko console mein show karna
    console.error("Failed to fetch coin details:", error);

    // Error ko App.js tak forward karna
    throw error;
  }
}
