
 // Watchlist ka data browser mein kis naam se save hoga
const STORAGE_KEY = "cryptotrack-watchlist";


// Browser se saved coins ki list lene ke liye
export function getWatchlist() {

  try {

    // Browser mein save ki hui watchlist ko lena
    const data = localStorage.getItem(STORAGE_KEY);

    // Data nahi mila to khaali array wapas bhejna
    if (!data) return [];

    // Saved text ko wapas JavaScript array mein badalna
    const coins = JSON.parse(data);

    // Data array hai to wahi bhejna, warna khaali array
    return Array.isArray(coins) ? coins : [];

  } catch (error) {

    // Saved data padhne mein dikkat aaye to error dikhana
    console.error("Watchlist load failed:", error);

    // Error aane par khaali array bhejna
    return [];
  }
}


// Coin ko watchlist mein add ya remove karne ke liye
export function toggleWatchlist(coin) {

  // Pehle se saved coins ki list lena
  const savedCoins = getWatchlist();

  // Check karna ki ye coin pehle se saved hai ya nahi
  const alreadySaved = savedCoins.some((item) => item.id === coin.id);

  // Saved hai to hatao, nahi hai to list mein jodo
  const updatedCoins = alreadySaved
    ? savedCoins.filter((item) => item.id !== coin.id)
    : [...savedCoins, coin];

  try {

    // Nayi watchlist ko text mein badalkar browser mein save karna
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCoins));

    // Data save ho gaya
    return true;

  } catch (error) {

    // Save karte waqt dikkat aaye to error dikhana
    console.error("Watchlist save failed:", error);

    // Data save nahi hua
    return false;
  }
}
