from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("HASHPAY_API_KEY")
ACCOUNT_ID = os.getenv("HASHPAY_ACCOUNT_ID")


@app.route("/")
def home():
    return "Backend running 🚀"


@app.route("/stkpush", methods=["POST"])
def stkpush():
    data = request.json

    phone = data.get("phone")
    amount = data.get("amount")
    reference = data.get("reference", "PAYMENT")

    if not phone or not amount:
        return jsonify({
            "success": False,
            "message": "Phone and amount are required"
        }), 400

    payload = {
        "api_key": API_KEY,
        "account_id": ACCOUNT_ID,
        "amount": str(amount),
        "msisdn": phone,
        "reference": reference
    }

    try:
        response = requests.post(
            "https://api.hashback.co.ke/initiatestk",
            json=payload,
            timeout=30
        )

        return jsonify(response.json())

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "STK push failed",
            "error": str(e)
        }), 500


@app.route("/transaction-status", methods=["POST"])
def transaction_status():
    data = request.json

    checkout_id = data.get("checkoutId")

    if not checkout_id:
        return jsonify({
            "success": False,
            "message": "checkoutId is required"
        }), 400

    payload = {
        "api_key": API_KEY,
        "account_id": ACCOUNT_ID,
        "checkoutid": checkout_id
    }

    try:
        response = requests.post(
            "https://api.hashback.co.ke/transactionstatus",
            json=payload,
            timeout=30
        )

        return jsonify(response.json())

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Transaction status check failed",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)