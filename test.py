print("RUNNING PADDLE OCR SCRIPT...")

import cv2
from paddleocr import PaddleOCR

IMAGE_PATH = r"C:\Users\poova\Downloads\ChatGPT Image Nov 14, 2025, 04_14_21 PM.png"

# Initialize OCR
ocr = PaddleOCR(
    use_textline_orientation=True,
    lang="en"
)

# Read image
img = cv2.imread(IMAGE_PATH)

if img is None:
    print("ERROR: Image not found!")
    exit()

print("Image loaded:", img.shape)
print("Running PaddleOCR...")

# Run OCR
result = ocr.predict(img)

# result is a list with ONE dictionary inside
ocr_output = result[0]

texts = ocr_output["rec_texts"]
scores = ocr_output["rec_scores"]

print("\n========== OCR RESULT ==========\n")

for text, score in zip(texts, scores):
    print(f"{text}  (conf: {score:.3f})")
