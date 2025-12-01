from flask import Flask, request, jsonify
import easyocr
import numpy as np
import cv2
import requests
import os

os.environ["FLAGS_allocator_strategy"] = "naive_best_fit"

app = Flask(__name__)

# Initialize EasyOCR engine (English)
print("🔧 Loading OCR model...")
ocr_engine = easyocr.Reader(['en'], gpu=False)
print("📌 OCR model loaded!")

@app.route('/ocr', methods=['POST'])
def ocr_image():
    print("📥 Received OCR request")

    # Node sends JSON → extract it
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request must be JSON'}), 400

    image_url = data.get('imageUrl')
    if not image_url:
        return jsonify({'error': 'imageUrl is missing'}), 400

    try:
        print(f"🔗 Downloading image: {image_url}")

        # Download image bytes
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()

        image_bytes = np.frombuffer(response.content, np.uint8)
        img = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Could not decode image'}), 400

        print("🔍 Running OCR...")

        # OCR prediction
        results = ocr_engine.readtext(img)

        extracted_text = []
        for box, text, score in results:
            extracted_text.append(text)

        final_text = " ".join(extracted_text)
        print("📄 Final Extracted Text:", final_text)

        return jsonify({'text': final_text}), 200

    except requests.exceptions.RequestException as e:
        print(f"⚠️ Image download error: {e}")
        return jsonify({'error': f'Image download failed: {str(e)}'}), 500

    except Exception as e:
        print(f"🔥 OCR Processing Error: {e}")
        return jsonify({'error': f'OCR processing error: {str(e)}'}), 500


@app.route('/')
def home():
    return "Medication OCR API is running!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render assigned PORT
    print(f"🚀 OCR Server running on port {port}")
    app.run(host="0.0.0.0", port=port)
