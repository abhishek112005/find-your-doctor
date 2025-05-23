"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { symptoms } from "@/data/symptoms"

export function SymptomSearch({ onSymptomSelect }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([])

  const toggleSymptom = (symptomId) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter((id) => id !== symptomId))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId])
    }
  }

  const handleSearch = () => {
    const selectedSymptomObjects = symptoms.filter((symptom) => selectedSymptoms.includes(symptom.id))
    onSymptomSelect(selectedSymptomObjects)
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-3">Search by Symptoms</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {symptoms.map((symptom) => (
          <Button
            key={symptom.id}
            variant={selectedSymptoms.includes(symptom.id) ? "default" : "outline"}
            className="rounded-full flex items-center gap-1"
            onClick={() => toggleSymptom(symptom.id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={symptom.icon} />
            </svg>
            {symptom.name}
          </Button>
        ))}
      </div>
      <Button onClick={handleSearch} className="w-full">
        Search by Selected Symptoms
      </Button>
    </div>
  )
}
