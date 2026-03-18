#!/usr/bin/env python3
"""
OmniAgent Python Client
Simple script to interact with OmniAgent API using your API key
"""

import requests
import json
from typing import Optional

class OmniAgentClient:
    def __init__(self, api_key: str, base_url: str = "https://omniagent.example.com"):
        """
        Initialize OmniAgent client
        
        Args:
            api_key: Your API key (generated from admin panel)
            base_url: Base URL of OmniAgent server
        """
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def ask(self, question: str) -> dict:
        """
        Ask the agent a question
        
        Args:
            question: Your question
            
        Returns:
            dict with answer, coins used, and remaining coins
        """
        response = requests.post(
            f"{self.base_url}/api/agent/ask",
            headers=self.headers,
            json={"question": question}
        )
        
        if response.status_code == 401:
            raise Exception("Invalid API key")
        elif response.status_code == 402:
            raise Exception("Insufficient coins")
        elif response.status_code != 200:
            raise Exception(f"Error: {response.status_code} - {response.text}")
        
        return response.json()
    
    def get_balance(self) -> int:
        """Get current coin balance"""
        response = requests.get(
            f"{self.base_url}/api/agent/balance",
            headers=self.headers
        )
        
        if response.status_code != 200:
            raise Exception(f"Error: {response.status_code}")
        
        return response.json()["coins"]
    
    def add_coins(self, amount: int, reason: str = "API credit") -> dict:
        """Add coins to account"""
        response = requests.post(
            f"{self.base_url}/api/agent/add-coins",
            headers=self.headers,
            json={"amount": amount, "reason": reason}
        )
        
        if response.status_code != 200:
            raise Exception(f"Error: {response.status_code}")
        
        return response.json()


# Example usage
if __name__ == "__main__":
    # Initialize client with your API key
    API_KEY = "sk_your_api_key_here"  # Replace with your actual API key
    BASE_URL = "https://omniagent.example.com"  # Replace with actual URL
    
    client = OmniAgentClient(API_KEY, BASE_URL)
    
    try:
        # Check balance
        balance = client.get_balance()
        print(f"Current balance: {balance} coins")
        
        # Ask a question
        print("\nAsking agent a question...")
        result = client.ask("Create a Python script for web scraping")
        
        print(f"\nAnswer:")
        print(result["answer"])
        print(f"\nCoins used: {result['coinsCost']}")
        print(f"Coins remaining: {result['coinsRemaining']}")
        
    except Exception as e:
        print(f"Error: {e}")
