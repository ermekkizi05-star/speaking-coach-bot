from flask import Flask, request, jsonify, make_response
import anthropic
import os

app = Flask(__name__)

def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.after_request
def after_request(response):
    return add_cors(response)

@app.route('/', methods=['GET', 'OPTIONS'])
def home():
    return jsonify({"status": "ok"})

@app.route('/chat', methods=['GET', 'POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors(response)
    
    try:
        data = request.json
        messages = data.get('messages', [])
        system = data.get('system', 'You are a helpful English speaking coach.')

        client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )

        result = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            system=system,
            messages=messages
        )

        return jsonify({
            "content": [{"text": result.content[0].text, "type": "text"}]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
