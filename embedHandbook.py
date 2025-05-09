import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
import numpy as np

# Load the pre-trained SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Function to split the text into chunks of 500 words
def split_text(text: str, max_words=500):
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_words):
        chunk = " ".join(words[i:i + max_words])
        chunks.append(chunk)
    return chunks

# Function to extract text from the PDF
def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text += page.get_text("text")  # Extract text from each page
    return text

# Path to your student handbook PDF
pdf_path = 'student-handbook.pdf'

# Extract the text from the PDF
handbook_text = extract_text_from_pdf(pdf_path)

# Split the text into chunks of 500 words
chunks = split_text(handbook_text)

# Embed each chunk and store the embeddings
embeddings = []
for i, chunk in enumerate(chunks):
    print(f"Embedding chunk {i + 1}/{len(chunks)}...")
    embedding = model.encode(chunk)  # Using SentenceTransformer model
    embeddings.append(embedding)

# Save the embeddings and chunks
np.save('handbook_embeddings.npy', np.array(embeddings))
with open('handbook_chunks.txt', 'w', encoding='utf-8') as f:
    for chunk in chunks:
        f.write(chunk + "\n\n")

print("Embeddings and chunks saved successfully.")
