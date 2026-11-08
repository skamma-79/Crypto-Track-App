
import { fetchTopCoins } from ".Api.js";

async function init() {
  try {
    const coins = await fetchTopCoins();
    console.log(coins);
  } catch (error) {
    console.error("Unable to load market data:", error);
  }
}

init();
