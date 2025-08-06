// components/ProductReviews.tsx
"use client";

import { useState } from 'react';
import { Review } from '@/lib/types'; // FIXED: Importing the shared type

import { StarRating } from '@/components/StarRating';

interface ProductReviewsProps {
  productId: string;       
  initialReviews: Review[];
}

export default function ProductReviews({ productId, initialReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: name,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const { review } = await response.json();

      setReviews((prev) => [review, ...prev]);
      setName("");
      setRating(5);
      setComment("");
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };



return (
  <div className="py-8">
    {/* Section Header */}
    <h2 className="text-3xl font-bold mb-6 border-b pb-2 border-gray-300">
      Customer Reviews
    </h2>

    {/* Conditional Rendering: Display reviews if available */}
    {reviews.length > 0 ? (
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-secondary  p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            {/* Review Header: Name + Stars */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold">
                {review.customer_name}
              </span>
              <div className="flex text-primary">
                {/* Render stars based on rating */}
                {Array.from({ length: review.rating }, (_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <p className="leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    ) : (
      // If no reviews yet
      <p className="text-center text-gray-500 mb-16">No reviews yet. Be the first to leave one!</p>
    )}

    {/* Divider between reviews and form */}
    <hr className="my-12 border-gray-100" />

    {/* Thank You Message after Submission */}
    {isSubmitted ? (
      <div className="mt-10 p-6 bg-green-50 rounded-lg text-green-800 border border-green-200 text-center max-w-xl mx-auto shadow-md">
        <h3 className="text-2xl font-bold mb-2">Thank you for your review!</h3>
        <p>Your feedback has been successfully submitted.</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-4 text-sm text-green-700 hover:underline"
        >
          Submit another review
        </button>
      </div>
    ) : (
      // Review Submission Form
      <div className="mt-10 bg-secondary p-8 rounded-lg shadow-md w-full mx-auto">
        <h3 className="text-2xl font-bold mb-6 ">Leave a Review</h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Your Name
            </label>
            <div className="border-accent border-3 rounded-md">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 resize-none bg-transparent outline-none text-inherit placeholder:text-muted"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Star Rating Component */}
          <StarRating rating={rating} setRating={setRating} isSubmitting={isSubmitting} />

          {/* Comment Textarea */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="comment">
              Comment
            </label>
            <div className="border-3 border-accent rounded-md p-1">
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full resize-none bg-transparent outline-none text-inherit placeholder:text-muted"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent font-semibold px-5 py-3 rounded-md hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    )}
  </div>
);

}