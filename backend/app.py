"""Mortgage calculator Flask API."""

from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, List, Any
from calculator import calculate_mortgage, MortgageParams

app = Flask(__name__)
CORS(app)


@app.route("/api/calculate", methods=["POST"])
def calculate() -> Dict[str, Any]:
    """
    Calculate mortgage with overpayments and variable interest rates.

    Returns:
        JSON response with calculation results
    """
    try:
        data = request.get_json()

        # Log incoming data for debugging
        app.logger.info(f"Received calculation request")
        app.logger.info(f"Interest rate changes: {data.get('interest_rate_changes', {})}")

        # Convert interest_rate_changes keys from strings to floats (LTV percentages)
        rate_changes = data.get("interest_rate_changes", {})
        if rate_changes:
            rate_changes = {float(k): float(v) for k, v in rate_changes.items()}
            app.logger.info(f"Converted LTV-based rate changes: {rate_changes}")

        # Convert one_off_overpayments keys from strings to integers (years)
        one_off_overpayments = data.get("one_off_overpayments", {})
        if one_off_overpayments:
            one_off_overpayments = {int(k): float(v) for k, v in one_off_overpayments.items()}
            app.logger.info(f"One-off overpayments: {one_off_overpayments}")

        params = MortgageParams(
            mortgage_debt=float(data["mortgage_debt"]),
            mortgage_term=int(data["mortgage_term"]),
            interest_rate=float(data["interest_rate"]),
            mortgage_type=data.get("mortgage_type", "repayment"),
            one_off_overpayments=one_off_overpayments,
            recurring_overpayment=float(data.get("recurring_overpayment", 0)),
            recurring_frequency=data.get("recurring_frequency", "monthly"),
            interest_rate_changes=rate_changes,
            property_value=float(data.get("property_value", 0)),
            product_type=int(data.get("product_type", 5))
        )

        result = calculate_mortgage(params)

        # Add property value and product type to result
        result["property_value"] = float(data.get("property_value", 0))
        result["product_type"] = int(data.get("product_type", 5))

        # Log calculation summary
        app.logger.info(f"Calculation complete - Interest saved: £{result['interest_saved']:.2f}, Years saved: {result['years_saved']}")

        return jsonify(result)

    except (KeyError, ValueError, TypeError) as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/api/health", methods=["GET"])
def health() -> Dict[str, str]:
    """Health check endpoint."""
    return jsonify({"status": "healthy"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
