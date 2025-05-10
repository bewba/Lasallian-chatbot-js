export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
      throw new TypeError('cosineSimilarity: inputs must be arrays');
    }
  
    if (vecA.length !== vecB.length) {
      throw new Error('cosineSimilarity: vectors must be the same length');
    }
  
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
    return dotProduct / (magnitudeA * magnitudeB);
  }
  