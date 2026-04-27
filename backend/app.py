from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# 🔐 Replace with your real Hashback credentials
API_KEY = "h26510azPSrM1"
ACCOUNT_ID = "HP240798"


@app.route("/")
def home():
    return "Backend running 🚀"


@app.route("/pay", methods=["POST"])
def pay():
    try:
        data = request.json

        phone = data.get("phone")
        amount = data.get("amount")
        reference = data.get("reference", "PAYMENT")

        # Validate input
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

        response = requests.post(
            "https://api.hashback.co.ke/initiatestk",
            json=payload
        )

        return jsonify(response.json())

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)