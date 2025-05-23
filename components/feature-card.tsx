"use client"

import { Card } from "@/components/ui/card"

export function FeatureCard({ feature, onClick }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all cursor-pointer" onClick={onClick}>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
          </svg>
        </div>
        <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
        <p className="text-gray-600">{feature.description}</p>
      </div>
    </Card>
  )
}
