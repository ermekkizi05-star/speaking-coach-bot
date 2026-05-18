from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "ok", "message": "AI Speaking Coach API running!"})

@app.route('/chat', methods=['POST', 'OPTIONS', 'GET'])
def chat():
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS, GET'
        response.headers['Access-Control-Allow-Headers'] = '*'
        return response, 200

    if request.method == 'GET':
        return jsonify({"status": "chat endpoint ready"})

    try:
        data = request.json
        messages = data.get('messages', [])
        system = data.get('system', 'You are a helpful English speaking coach.')

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            system=system,
            messages=messages
        )

        result = jsonify({
            "content": [{"text": response.content[0].text, "type": "text"}]
        })
        result.headers['Access-Control-Allow-Origin'] = '*'
        return result

    except Exception as e:
        err = jsonify({"error": str(e)})
        err.headers['Access-Control-Allow-Origin'] = '*'
        return err, 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
