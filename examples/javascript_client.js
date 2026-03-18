/**
 * OmniAgent JavaScript Client
 * Simple script to interact with OmniAgent API using your API key
 */

class OmniAgentClient {
  constructor(apiKey, baseUrl = "https://omniagent.example.com") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };
  }

  /**
   * Ask the agent a question
   * @param {string} question - Your question
   * @returns {Promise<Object>} - Answer, coins used, and remaining coins
   */
  async ask(question) {
    const response = await fetch(`${this.baseUrl}/api/agent/ask`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ question })
    });

    if (response.status === 401) {
      throw new Error("Invalid API key");
    } else if (response.status === 402) {
      throw new Error("Insufficient coins");
    } else if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get current coin balance
   * @returns {Promise<number>} - Current coins
   */
  async getBalance() {
    const response = await fetch(`${this.baseUrl}/api/agent/balance`, {
      method: "GET",
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.coins;
  }

  /**
   * Add coins to account
   * @param {number} amount - Amount of coins to add
   * @param {string} reason - Reason for adding coins
   * @returns {Promise<Object>} - Success status and new balance
   */
  async addCoins(amount, reason = "API credit") {
    const response = await fetch(`${this.baseUrl}/api/agent/add-coins`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ amount, reason })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  }
}

// Example usage
async function main() {
  // Initialize client with your API key
  const API_KEY = "sk_your_api_key_here"; // Replace with your actual API key
  const BASE_URL = "https://omniagent.example.com"; // Replace with actual URL

  const client = new OmniAgentClient(API_KEY, BASE_URL);

  try {
    // Check balance
    const balance = await client.getBalance();
    console.log(`Current balance: ${balance} coins`);

    // Ask a question
    console.log("\nAsking agent a question...");
    const result = await client.ask("Create a Node.js API server");

    console.log(`\nAnswer:`);
    console.log(result.answer);
    console.log(`\nCoins used: ${result.coinsCost}`);
    console.log(`Coins remaining: ${result.coinsRemaining}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Run if executed directly
if (typeof require !== "undefined" && require.main === module) {
  main();
}

// Export for use as module
if (typeof module !== "undefined" && module.exports) {
  module.exports = OmniAgentClient;
}
