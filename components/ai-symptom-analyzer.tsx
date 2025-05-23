"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { doctors } from "@/data/doctors"
import { symptoms } from "@/data/symptoms"

export function AISymptomAnalyzer({ onDoctorsRecommended }) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your health assistant. Please describe your symptoms, and I'll help you find the right doctor.",
    },
  ])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])

    // Clear input
    setInput("")

    // Start analysis
    setIsAnalyzing(true)

    // Simulate AI processing
    setTimeout(() => {
      analyzeSymptoms(input)
    }, 1500)
  }

  const analyzeSymptoms = (userInput) => {
    // Convert input to lowercase for easier matching
    const lowerInput = userInput.toLowerCase()

    // Check if the input is just a greeting or simple message
    const generalMessages = ["hi", "hello", "hey", "thanks", "thank you", "ok", "okay", "bye", "good", "fine"]
    const isGeneralMessage = generalMessages.some(
      (msg) =>
        lowerInput === msg ||
        lowerInput.includes(`${msg} `) ||
        lowerInput.includes(` ${msg}`) ||
        lowerInput.includes(`${msg}.`) ||
        lowerInput.includes(`${msg}!`),
    )

    if (isGeneralMessage || lowerInput.length < 5) {
      // If it's a general message, respond without recommending doctors
      const aiResponse = {
        role: "assistant",
        content:
          "I'm here to help with medical symptoms. Could you please describe any health concerns or symptoms you're experiencing so I can recommend the right doctor for you?",
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsAnalyzing(false)
      return
    }

    // Find matching symptoms
    const matchedSymptoms = symptoms.filter((symptom) => lowerInput.includes(symptom.name.toLowerCase()))

    // If no symptoms matched, try to match keywords
    let detectedSpecialties = []

    if (matchedSymptoms.length > 0) {
      // Get specialties from matched symptoms
      detectedSpecialties = matchedSymptoms.flatMap((symptom) => symptom.relatedSpecialties)
    } else {
      // Keyword-based matching as fallback
      const specialtyKeywords = {
        heart: ["Cardiologist"],
        "chest pain": ["Cardiologist"],
        bone: ["Orthopedic Surgeon"],
        joint: ["Orthopedic Surgeon"],
        skin: ["Dermatologist"],
        rash: ["Dermatologist"],
        child: ["Pediatrician"],
        children: ["Pediatrician"],
        brain: ["Neurologist"],
        headache: ["Neurologist", "General Physician"],
        migraine: ["Neurologist"],
        women: ["Gynecologist"],
        pregnancy: ["Gynecologist"],
        ear: ["ENT Specialist"],
        nose: ["ENT Specialist"],
        throat: ["ENT Specialist"],
        mental: ["Psychiatrist"],
        anxiety: ["Psychiatrist"],
        depression: ["Psychiatrist"],
        fever: ["General Physician"],
        cold: ["General Physician", "ENT Specialist"],
        cough: ["General Physician", "ENT Specialist"],
      }

      // Check for keyword matches
      for (const [keyword, specialties] of Object.entries(specialtyKeywords)) {
        if (lowerInput.includes(keyword)) {
          detectedSpecialties = [...detectedSpecialties, ...specialties]
        }
      }
    }

    // Remove duplicates
    detectedSpecialties = [...new Set(detectedSpecialties)]

    // If still no specialties detected, default to General Physician
    if (detectedSpecialties.length === 0) {
      detectedSpecialties = ["General Physician"]
    }

    // Find doctors matching the specialties
    const recommendedDoctors = doctors.filter((doctor) => detectedSpecialties.includes(doctor.specialty))

    // Sort by rating
    recommendedDoctors.sort((a, b) => b.rating - a.rating)

    // Generate response
    let aiResponse

    if (matchedSymptoms.length > 0) {
      aiResponse = {
        role: "assistant",
        content: `Based on your symptoms (${matchedSymptoms.map((s) => s.name).join(", ")}), I recommend consulting a ${detectedSpecialties.join(" or ")}. I've found ${recommendedDoctors.length} doctors who can help you.`,
      }
    } else {
      aiResponse = {
        role: "assistant",
        content: `Based on your description, I recommend consulting a ${detectedSpecialties.join(" or ")}. I've found ${recommendedDoctors.length} doctors who can help you.`,
      }
    }

    // Add AI response
    setMessages((prev) => [...prev, aiResponse])

    // End analysis
    setIsAnalyzing(false)

    // Send recommended doctors to parent component
    if (onDoctorsRecommended) {
      onDoctorsRecommended(recommendedDoctors)
    }
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 bg-blue-600 text-white rounded-t-lg flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="font-bold">AI Symptom Analyzer</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white border border-gray-200 rounded-tl-none"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none max-w-[80%]">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms..."
            disabled={isAnalyzing}
            className="flex-1"
          />
          <Button type="submit" disabled={isAnalyzing || !input.trim()}>
            {isAnalyzing ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}
