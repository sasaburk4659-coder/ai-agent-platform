#!/bin/bash

# OmniAgent cURL Examples
# Replace API_KEY and BASE_URL with your actual values

API_KEY="sk_your_api_key_here"
BASE_URL="https://omniagent.example.com"

echo "=== OmniAgent API Examples ==="
echo ""

# Example 1: Check balance
echo "1. Checking balance..."
curl -X GET "$BASE_URL/api/agent/balance" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Example 2: Ask a question
echo "2. Asking agent a question..."
curl -X POST "$BASE_URL/api/agent/ask" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Create a Python script for web scraping"
  }'
echo ""
echo ""

# Example 3: Add coins
echo "3. Adding coins..."
curl -X POST "$BASE_URL/api/agent/add-coins" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "reason": "Testing API"
  }'
echo ""
echo ""

# Example 4: Complex question with jq parsing (if jq is installed)
echo "4. Asking complex question and parsing response..."
curl -s -X POST "$BASE_URL/api/agent/ask" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I create a REST API with Node.js?"
  }' | jq '.answer'
