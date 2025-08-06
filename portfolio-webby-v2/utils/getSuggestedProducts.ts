// utils/getSuggestedProducts.ts
import { Product } from "@/lib/types";

export function getSuggestedProducts(product: Product, allProducts: Product[]): Product[] {
  return allProducts
    .filter(p => p.id !== product.id)
    .map(p => {
      let score = 0;

      const tagMatches = p.tags.filter(tag => product.tags.includes(tag)).length;
      score += tagMatches * 3;

      if (p.material === product.material) score += 2;
      if (p.size === product.size) score += 1;

      const nameWords = p.name.toLowerCase().split(/\s+/);
      const productWords = product.name.toLowerCase().split(/\s+/);
      const nameOverlap = productWords.filter(w => nameWords.includes(w)).length;
      score += nameOverlap * 1.5;

      const priceDiff = Math.abs(p.price - product.price);
      const priceScore = Math.max(0, 5 - priceDiff / 100);
      score += priceScore;

      const productDescWords = new Set(product.description.toLowerCase().split(/\s+/));
      const descMatches = p.description
        .toLowerCase()
        .split(/\s+/)
        .filter(word => productDescWords.has(word)).length;
      score += descMatches * 0.2;

      if (p.additional_info === product.additional_info) score += 0.5;

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(p => p.product);
}
