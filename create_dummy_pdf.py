from reportlab.pdfgen import canvas
import os

os.makedirs("backend/app/data", exist_ok=True)
pdf_path = "backend/app/data/bhagavad_gita.pdf"

if not os.path.exists(pdf_path):
    c = canvas.Canvas(pdf_path)
    c.drawString(100, 750, "The Bhagavad Gita")
    c.drawString(100, 730, "Chapter 2")
    c.drawString(100, 710, "Verse 47")
    c.drawString(100, 690, "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.")
    c.save()
    print(f"Created dummy PDF at {pdf_path}")
else:
    print("PDF already exists")
