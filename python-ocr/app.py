from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import numpy as np
import cv2
import requests

app = Flask(__name__)

# Initialize OCR engine (English + angle detection)
ocr_engine = PaddleOCR(use_angle_cls=True, lang='en')


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

        print("🔍 Running PaddleOCR...")

        # PaddleOCR prediction
        result = ocr_engine.predict(img)
        print("📝 Raw OCR Result:", result)

        # Correct extraction for PaddleOCR v3
        extracted_text = []

        for block in result:
            if isinstance(block, dict) and "rec_texts" in block:
                extracted_text.extend(block["rec_texts"])

        final_text = " ".join(extracted_text)
        print("📄 Final Extracted Text:", final_text)

        return jsonify({'text': final_text}), 200

    except requests.exceptions.RequestException as e:
        print(f"⚠️ Image download error: {e}")
        return jsonify({'error': f'Image download failed: {str(e)}'}), 500

    except Exception as e:
        print(f"🔥 OCR Processing Error: {e}")
        return jsonify({'error': f'OCR processing error: {str(e)}'}), 500


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))  # Render gives PORT env var
    print(f"🚀 OCR Server running on port {port}")
    app.run(host="0.0.0.0", port=port)
