import { useState } from "react";
import { FaStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  setRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
  isSubmitting: boolean;
}

export const StarRating = ({ rating, setRating, isSubmitting }: StarRatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Rating</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = hovered ? star <= hovered : star <= rating;

          return (
            <button
              key={star}
              type="button"
              className={`text-2xl transition-colors duration-200 ${
                isActive ? "text-yellow-400" : "text-gray-300"
              } ${isSubmitting ? "cursor-not-allowed opacity-50" : "hover:text-yellow-300"}`}
              onClick={() => !isSubmitting && setRating(star as 1 | 2 | 3 | 4 | 5)}
              onMouseEnter={() => !isSubmitting && setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              disabled={isSubmitting}
            >
              <FaStar />
            </button>
          );
        })}
      </div>
    </div>
  );
};
