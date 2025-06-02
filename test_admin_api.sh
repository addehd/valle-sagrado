#!/bin/bash

# Test script for Valle Sagrado Admin Products API
echo "=== Testing Admin Products API ==="

# Method 1: Simple test (will likely fail due to auth)
echo "1. Testing without authentication (should fail):"
curl -s -X GET "http://localhost:5173/api/admin/products" \
  -H "Content-Type: application/json" | head -100

echo -e "\n"

# Method 2: With browser session cookies (if logged in via browser)
echo "2. Testing with browser session cookies:"
echo "   (This works if you're logged in as admin in your browser)"
curl -s -X GET "http://localhost:5173/api/admin/products" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(curl -s -c - -b - http://localhost:5173/admin/products | grep -o 'Set-Cookie: [^;]*' | cut -d' ' -f2-)" | head -100

echo -e "\n"

# Method 3: Direct Supabase auth (requires environment variables)
echo "3. Using Supabase direct authentication:"
echo "   Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables first"

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
    # Authenticate with Supabase
    AUTH_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
      -H "Content-Type: application/json" \
      -H "apikey: $SUPABASE_ANON_KEY" \
      -d '{
        "email": "adolfo.heriz.ocampo@gmail.com",
        "password": "your_password_here"
      }')
    
    echo "Auth response: $AUTH_RESPONSE"
    
    # Extract token (requires jq or manual parsing)
    if command -v jq &> /dev/null; then
        ACCESS_TOKEN=$(echo $AUTH_RESPONSE | jq -r '.access_token')
        
        # Call admin API with token
        curl -s -X GET "http://localhost:5173/api/admin/products" \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -H "Content-Type: application/json"
    else
        echo "jq not found. Install jq to extract access token automatically."
    fi
else
    echo "Environment variables not set. Skipping Supabase auth test."
fi

echo -e "\n=== End of tests ===" 