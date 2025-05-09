import json
import os
from sentence_transformers import SentenceTransformer
import numpy as np

# Paths
input_path = "src/lib/parsed-handbook/stopreadingthesourcecode.txt"
output_path = "src/lib/parsed-handbook/handbook-embeddings.json"

# Load text and split into 500-word chunks
with open(input_path, "r", encoding="utf-8") as f:
    text = f.read()

words = text.split()
chunks = [' '.join(words[i:i + 500]) for i in range(0, len(words), 500)]

# Load model and embed
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(chunks, normalize_embeddings=True)

# Save to JSON
data = {
    "chunks": chunks,
    "embeddings": embeddings.tolist()
}

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"✅ Saved {len(chunks)} chunks and embeddings to {output_path}")
