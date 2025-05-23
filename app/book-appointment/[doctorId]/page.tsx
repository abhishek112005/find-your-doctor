"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { doctors } from "@/data/doctors"
import { AuthModal } from "@/components/auth-modal"

export default function BookAppointmentPage({ params }) {
  const router = useRouter()
  const { doctorId } = params
  const [doctor, setDoctor] = useState(null)
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [patientName, setPatientName] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [issue, setIssue] = useState("")
  const [availableTimes, setAvailableTimes] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setPatientName(parsedUser.name || "")
      setPatientPhone(parsedUser.phone || "")
    } else {
      setIsAuthModalOpen(true)
    }

    // Find doctor by ID
    const foundDoctor = doctors.find((doc) => doc.id === Number.parseInt(doctorId))
    if (foundDoctor) {
      setDoctor(foundDoctor)
    } else {
      router.push("/")
    }
  }, [doctorId, router])

  useEffect(() => {
    if (selectedDate) {
      // Generate available time slots based on selected date
      const today = new Date().toISOString().split("T")[0]
      const times = []

      // Morning slots
      for (let hour = 9; hour <= 12; hour++) {
        times.push(`${hour}:00 AM`)
        if (hour !== 12) times.push(`${hour}:30 AM`)
      }

      // Afternoon slots
      for (let hour = 1; hour <= 5; hour++) {
        times.push(`${hour}:00 PM`)
        times.push(`${hour}:30 PM`)
      }

      // If today, filter out past times
      if (selectedDate === today) {
        const currentHour = new Date().getHours()
        const currentMinute = new Date().getMinutes()

        const filteredTimes = times.filter((time) => {
          const [hourStr, rest] = time.split(":")
          const [minuteStr, period] = rest.split(" ")

          let hour = Number.parseInt(hourStr)
          if (period === "PM" && hour !== 12) hour += 12
          if (period === "AM" && hour === 12) hour = 0

          const minute = Number.parseInt(minuteStr)

          if (hour > currentHour) return true
          if (hour === currentHour && minute > currentMinute) return true
          return false
        })

        setAvailableTimes(filteredTimes)
      } else {
        setAvailableTimes(times)
      }
    }
  }, [selectedDate])

  const handleLogin = (userData) => {
    setUser(userData)
    setPatientName(userData.name || "")
    setPatientPhone(userData.phone || "")
    setIsAuthModalOpen(false)
  }

  const handleCloseAuthModal = () => {
    if (!user) {
      router.push("/")
    } else {
      setIsAuthModalOpen(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!selectedDate || !selectedTime || !patientName || !patientAge || !patientGender || !patientPhone) {
      alert("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    // Create appointment object
    const appointment = {
      id: Date.now(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorLocation: doctor.location,
      date: selectedDate,
      time: selectedTime,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      issue,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }

    // Get existing appointments from localStorage
    const userEmail = user.email
    const existingAppointmentsJSON = localStorage.getItem(`appointments_${userEmail}`)
    const existingAppointments = existingAppointmentsJSON ? JSON.parse(existingAppointmentsJSON) : []

    // Add new appointment
    const updatedAppointments = [...existingAppointments, appointment]

    // Save to localStorage
    localStorage.setItem(`appointments_${userEmail}`, JSON.stringify(updatedAppointments))

    // Show success message and redirect
    alert("Appointment booked successfully!")
    router.push("/my-appointments")
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Button variant="outline" className="mb-6" onClick={() => router.back()}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Book an Appointment</h1>

          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6 mb-6">
              <img
                src="/placeholder.svg?height=100&width=100"
                alt={doctor.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
                <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                <div className="flex items-center mt-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-gray-700">
                    {doctor.rating} ({doctor.reviews} reviews)
                  </span>
                </div>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div className="flex items-center text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {doctor.location}
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ₹{doctor.fee} Consultation Fee
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time *</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                    disabled={!selectedDate}
                  >
                    <option value="">Select Time</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {!selectedDate && <p className="text-sm text-gray-500 mt-1">Please select a date first</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient's Name *</label>
                  <Input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient's Age *</label>
                  <Input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <Input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Issue / Symptoms</label>
                <Textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Briefly describe your symptoms or reason for visit"
                  rows={4}
                />
              </div>

              <div className="border-t pt-6">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Important Information</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Please arrive 15 minutes before your appointment time</li>
              <li>Bring any previous medical records related to your condition</li>
              <li>Appointments can be rescheduled up to 4 hours before the scheduled time</li>
              <li>A confirmation will be sent to your email after booking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} onLogin={handleLogin} />
    </div>
  )
}
