# OmniAgent API Usage Guide

## Quick Start

### 1. Generate API Key (Admin Only)

1. Log in as admin (sasaburk4659@gmail.com)
2. Go to Admin Panel
3. Scroll to "API Management" section
4. Click "Generate Key" and give it a name
5. Copy the generated key (format: `sk_...`)

### 2. Use API Key in Your Scripts

Replace `sk_your_api_key_here` with your actual API key in any of the examples below.

---

## Python Examples

### Simple Usage

```python
import requests

API_KEY = "sk_your_api_key_here"
BASE_URL = "https://omniagent.example.com"

# Ask a question
response = requests.post(
    f"{BASE_URL}/api/agent/ask",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"question": "Create a Python script for web scraping"}
)

result = response.json()
print(result["answer"])
print(f"Coins used: {result['coinsCost']}")
```

### Using the Client Class

```python
from python_client import OmniAgentClient

client = OmniAgentClient("sk_your_api_key_here")

# Check balance
balance = client.get_balance()
print(f"Balance: {balance} coins")

# Ask question
result = client.ask("Create a Minecraft mod")
print(result["answer"])
```

### Error Handling

```python
import requests

try:
    response = requests.post(
        "https://omniagent.example.com/api/agent/ask",
        headers={"Authorization": "Bearer sk_your_api_key_here"},
        json={"question": "Your question"}
    )
    
    if response.status_code == 401:
        print("Invalid API key")
    elif response.status_code == 402:
        print("Insufficient coins")
    else:
        print(response.json()["answer"])
        
except requests.exceptions.RequestException as e:
    print(f"Network error: {e}")
```

---

## JavaScript/Node.js Examples

### Simple Usage

```javascript
const API_KEY = "sk_your_api_key_here";
const BASE_URL = "https://omniagent.example.com";

async function askAgent(question) {
  const response = await fetch(`${BASE_URL}/api/agent/ask`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  const data = await response.json();
  return data;
}

// Usage
const result = await askAgent("Create a Node.js server");
console.log(result.answer);
```

### Using the Client Class

```javascript
const OmniAgentClient = require("./javascript_client");

const client = new OmniAgentClient("sk_your_api_key_here");

// Check balance
const balance = await client.getBalance();
console.log(`Balance: ${balance} coins`);

// Ask question
const result = await client.ask("Build a React component");
console.log(result.answer);
```

---

## cURL Examples

### Ask a Question

```bash
curl -X POST https://omniagent.example.com/api/agent/ask \
  -H "Authorization: Bearer sk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"question": "Your question here"}'
```

### Check Balance

```bash
curl -X GET https://omniagent.example.com/api/agent/balance \
  -H "Authorization: Bearer sk_your_api_key_here"
```

### Add Coins

```bash
curl -X POST https://omniagent.example.com/api/agent/add-coins \
  -H "Authorization: Bearer sk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "reason": "Testing"}'
```

---

## API Endpoints Reference

### POST /api/agent/ask

Ask the agent a question.

**Request:**
```json
{
  "question": "Your question here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "answer": "The agent's response...",
  "coinsCost": 50,
  "coinsRemaining": 950
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing API key
- `402 Payment Required` - Insufficient coins
- `400 Bad Request` - Missing or invalid question

---

### GET /api/agent/balance

Get your current coin balance.

**Response (200 OK):**
```json
{
  "coins": 1000
}
```

---

### POST /api/agent/add-coins

Add coins to your account.

**Request:**
```json
{
  "amount": 100,
  "reason": "Testing API"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "newBalance": 1100
}
```

---

## Cost Estimation

The API automatically estimates the cost based on question complexity:

| Complexity | Coins | Examples |
|-----------|-------|----------|
| Simple | 10-50 | "What is Python?", "Explain REST API" |
| Medium | 50-200 | "Create a web scraper", "Build a chatbot" |
| Complex | 200-500 | "Create a Minecraft mod", "Build ML model" |

---

## Best Practices

1. **Keep API keys secret** - Never commit them to version control
2. **Use environment variables** - Store keys in `.env` files
3. **Handle errors gracefully** - Check response status codes
4. **Monitor usage** - Check balance before making requests
5. **Rate limiting** - Currently no rate limits, but be reasonable

---

## Troubleshooting

### "Invalid API key"
- Check that your API key is correct
- Make sure it starts with `sk_`
- Verify the key hasn't been deleted

### "Insufficient coins"
- Check your balance with `/api/agent/balance`
- Ask admin to add more coins
- Earn 300 coins daily by logging in

### "Network error"
- Check the base URL is correct
- Verify your internet connection
- Check if the server is running

---

## Examples Directory

Check the `examples/` folder for:
- `python_client.py` - Full Python client class
- `javascript_client.js` - Full JavaScript client class
- `curl_examples.sh` - cURL command examples

---

## Support

For issues or questions, contact: sasaburk4659@gmail.com
