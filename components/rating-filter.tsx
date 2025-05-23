"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

export function RatingFilter({ onRatingChange }) {
  const [rating, setRating] = useState(0)

  const handleRatingChange = (value) => {
    setRating(value[0])
    onRatingChange(value[0])
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Minimum Rating</h3>
        <div className="flex items-center">
          <div className="flex text-yellow-400 mr-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-medium">{rating.toFixed(1)}+</span>
        </div>
      </div>
      <Slider defaultValue={[0]} max={5} step={0.1} onValueChange={handleRatingChange} className="w-full" />
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Any</span>
        <span>5.0</span>
      </div>
    </Card>
  )
}
