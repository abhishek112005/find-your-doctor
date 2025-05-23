"use client"

import { Button } from "@/components/ui/button"

export function FeatureModal({ isOpen, onClose, feature }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{feature.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <img
            src="/placeholder.svg?height=300&width=600"
            alt={feature.title}
            className="w-full h-auto rounded-lg mb-6"
          />

          <div className="prose max-w-none">
            <p className="text-lg mb-4">{feature.fullDescription}</p>

            <h3 className="text-xl font-semibold mb-2">Key Benefits</h3>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              {feature.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mb-2">How It Works</h3>
            <ol className="list-decimal pl-5 mb-6 space-y-2">
              {feature.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
