
export async function fetchTopCoins() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
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
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
    );

    // API se data na mile to error dikhana
    if (!response.ok) {
      throw new Error(`Search Error: ${response.status}`);
    }

    // API ka response JavaScript object mein lena
    const data = await response.json();

    // Search mein mile pehle 10 coins lena
    const matches = data.coins.slice(0, 10);

    // Koi coin nahi mila to khaali array bhejna
    if (matches.length === 0) return [];

    // Mile hue coins ki IDs ko comma se jodna
    const ids = matches.map((coin) => coin.id).join(",");

    // In coins ki price aur market cap ka data lana
    const marketResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=false`
    );

    // Market data na mile to error dikhana
    if (!marketResponse.ok) {
      throw new Error(`Market Error: ${marketResponse.status}`);
    }

    // Price aur market cap wala data wapas bhejna
    return await marketResponse.json();

  } catch (error) {

    // Error aaye to console mein dikhana
    console.error("Search failed:", error);

    // Error ko App.js tak bhejna
    throw error;
  }
}
