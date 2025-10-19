"""Test script for the mortgage calculator API."""

import requests
import json
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5000"


def test_health():
    """Test the health endpoint."""
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Health check: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200


def test_calculate():
    """Test the calculate endpoint."""
    test_data = {
        "mortgage_debt": 351000,
        "mortgage_term": 40,
        "interest_rate": 4.81,
        "mortgage_type": "repayment",
        "monthly_payment": "",
        "one_off_overpayment": 0,
        "recurring_overpayment": 300,
        "recurring_frequency": "monthly",
        "interest_rate_changes": {}
    }

    print("\nTesting calculation with basic data...")
    response = requests.post(
        f"{BASE_URL}/api/calculate",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )

    print(f"Status code: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"Monthly payment: £{result['monthly_payment']:.2f}")
        print(f"Interest saved: £{result['interest_saved']:.2f}")
        print(f"Years saved: {result['years_saved']}")
        print(f"Months saved: {result['months_saved_remainder']}")
        return True
    else:
        print(f"Error: {response.text}")
        return False


def test_with_rate_changes():
    """Test with interest rate changes."""
    test_data = {
        "mortgage_debt": 351000,
        "mortgage_term": 40,
        "interest_rate": 4.81,
        "mortgage_type": "repayment",
        "monthly_payment": None,
        "one_off_overpayment": 0,
        "recurring_overpayment": 300,
        "recurring_frequency": "monthly",
        "interest_rate_changes": {
            "5": 5.5,
            "10": 4.0
        }
    }

    print("\nTesting calculation with rate changes...")
    response = requests.post(
        f"{BASE_URL}/api/calculate",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )

    print(f"Status code: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"Monthly payment: £{result['monthly_payment']:.2f}")
        print(f"Interest saved: £{result['interest_saved']:.2f}")
        print("Rate changes applied successfully!")
        return True
    else:
        print(f"Error: {response.text}")
        return False


if __name__ == "__main__":
    print("Testing Mortgage Calculator API")
    print("=" * 50)

    try:
        if test_health():
            print("✓ Health check passed")
        else:
            print("✗ Health check failed")
            exit(1)

        if test_calculate():
            print("✓ Basic calculation passed")
        else:
            print("✗ Basic calculation failed")
            exit(1)

        if test_with_rate_changes():
            print("✓ Rate changes calculation passed")
        else:
            print("✗ Rate changes calculation failed")
            exit(1)

        print("\n" + "=" * 50)
        print("All tests passed! ✓")

    except requests.exceptions.ConnectionError:
        print("\n✗ Could not connect to backend.")
        print("Make sure the backend is running on port 5000")
        print("Run: python app.py")
        exit(1)
