from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
import os

app = Flask(__name__)
CORS(app)

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "AI Speaking Coach API is running!"})

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    data = request.json
    messages = data.get('messages', [])
    system = data.get('system', 'You are a helpful English speaking coach.')
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=800,
        system=system,
        messages=messages
    )
    
    return jsonify({
        "content": [{"text": response.content[0].text}]
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
