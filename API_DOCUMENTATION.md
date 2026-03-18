# OmniAgent API Documentation

## Overview

OmniAgent provides a REST API that allows you to interact with the AI agent programmatically. You can ask questions, get responses, and manage your API keys and coins.

## Authentication

All API requests require an API Key. Include it in the `Authorization` header:

```
Authorization: Bearer sk_your_api_key_here
```

## Endpoints

### 1. Ask Agent a Question

**POST** `/api/agent/ask`

Ask the agent a question and get an AI-generated response.

**Request:**
```json
{
  "question": "Create a Minecraft mod for jumping"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Here's how to create a Minecraft mod...",
  "coinsCost": 50,
  "coinsRemaining": 950
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (missing question)
- `401` - Invalid API key
- `402` - Insufficient coins

---

### 2. Get User Balance

**GET** `/api/agent/balance`

Get your current coin balance.

**Response:**
```json
{
  "coins": 1000
}
```

---

### 3. Add Coins

**POST** `/api/agent/add-coins`

Add coins to your account (for testing or admin purposes).

**Request:**
```json
{
  "amount": 100,
  "reason": "Testing"
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 1100
}
```

---

## Python Examples

### Basic Usage

```python
import requests

API_KEY = "sk_your_api_key_here"
BASE_URL = "https://omniagent.example.com"

# Ask the agent a question
response = requests.post(
    f"{BASE_URL}/api/agent/ask",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"question": "Create a Python script for web scraping"}
)

result = response.json()
print(f"Answer: {result['answer']}")
print(f"Coins used: {result['coinsCost']}")
print(f"Coins remaining: {result['coinsRemaining']}")
```

### Check Balance

```python
response = requests.get(
    f"{BASE_URL}/api/agent/balance",
    headers={"Authorization": f"Bearer {API_KEY}"}
)

coins = response.json()['coins']
print(f"Your balance: {coins} coins")
```

### Error Handling

```python
response = requests.post(
    f"{BASE_URL}/api/agent/ask",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"question": "Your question here"}
)

if response.status_code == 401:
    print("Invalid API key")
elif response.status_code == 402:
    print("Insufficient coins")
elif response.status_code == 200:
    print(response.json()['answer'])
else:
    print(f"Error: {response.status_code}")
```

---

## JavaScript/Node.js Examples

```javascript
const API_KEY = "sk_your_api_key_here";
const BASE_URL = "https://omniagent.example.com";

// Ask the agent
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
const result = await askAgent("Create a Node.js API");
console.log(result.answer);
```

---

## cURL Examples

```bash
# Ask the agent
curl -X POST https://omniagent.example.com/api/agent/ask \
  -H "Authorization: Bearer sk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"question": "Your question here"}'

# Check balance
curl -X GET https://omniagent.example.com/api/agent/balance \
  -H "Authorization: Bearer sk_your_api_key_here"
```

---

## Cost Estimation

The API automatically estimates the cost of each request based on complexity:

- **Simple questions** (10-50 coins): Basic information, simple explanations
- **Medium complexity** (50-200 coins): Code generation, detailed analysis
- **High complexity** (200-500 coins): Complex projects, advanced implementations

Each user starts with **1000 coins** and earns **300 coins daily**.

---

## Rate Limiting

Currently, there are no rate limits. However, this may change in the future.

---

## Support

For issues or questions, contact the admin at `sasaburk4659@gmail.com`.
