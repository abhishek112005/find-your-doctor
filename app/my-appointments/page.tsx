"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthModal } from "@/components/auth-modal"

export default function MyAppointmentsPage() {
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Load appointments from localStorage
      const userEmail = parsedUser.email
      const appointmentsJSON = localStorage.getItem(`appointments_${userEmail}`)
      if (appointmentsJSON) {
        const parsedAppointments = JSON.parse(appointmentsJSON)
        setAppointments(parsedAppointments)
      }
    } else {
      setIsAuthModalOpen(true)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthModalOpen(false)

    // Load appointments after login
    const userEmail = userData.email
    const appointmentsJSON = localStorage.getItem(`appointments_${userEmail}`)
    if (appointmentsJSON) {
      const parsedAppointments = JSON.parse(appointmentsJSON)
      setAppointments(parsedAppointments)
    }
  }

  const handleCloseAuthModal = () => {
    if (!user) {
      router.push("/")
    } else {
      setIsAuthModalOpen(false)
    }
  }

  const handleCancelAppointment = (appointmentId) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      // Update appointment status to cancelled
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === appointmentId) {
          return { ...appointment, status: "cancelled" }
        }
        return appointment
      })

      // Save to localStorage
      const userEmail = user.email
      localStorage.setItem(`appointments_${userEmail}`, JSON.stringify(updatedAppointments))

      // Update state
      setAppointments(updatedAppointments)
    }
  }

  const getFilteredAppointments = () => {
    const now = new Date()

    if (activeTab === "upcoming") {
      return appointments.filter((appointment) => {
        // Parse appointment date and time
        const appointmentDate = new Date(appointment.date)
        const [timePart, ampm] = appointment.time.split(" ")
        const [hours, minutes] = timePart.split(":").map(Number)

        // Convert to 24-hour format
        let hour = hours
        if (ampm === "PM" && hours !== 12) hour += 12
        if (ampm === "AM" && hours === 12) hour = 0

        appointmentDate.setHours(hour, minutes, 0)

        // Add 3 hours to appointment time to consider it "past" after the visit
        const appointmentEndTime = new Date(appointmentDate)
        appointmentEndTime.setHours(appointmentEndTime.getHours() + 3)

        return appointmentEndTime > now && appointment.status !== "cancelled"
      })
    } else if (activeTab === "past") {
      return appointments.filter((appointment) => {
        // Parse appointment date and time
        const appointmentDate = new Date(appointment.date)
        const [timePart, ampm] = appointment.time.split(" ")
        const [hours, minutes] = timePart.split(":").map(Number)

        // Convert to 24-hour format
        let hour = hours
        if (ampm === "PM" && hours !== 12) hour += 12
        if (ampm === "AM" && hours === 12) hour = 0

        appointmentDate.setHours(hour, minutes, 0)

        // Add 3 hours to appointment time to consider it "past" after the visit
        const appointmentEndTime = new Date(appointmentDate)
        appointmentEndTime.setHours(appointmentEndTime.getHours() + 3)

        return appointmentEndTime <= now && appointment.status !== "cancelled"
      })
    } else if (activeTab === "cancelled") {
      return appointments.filter((appointment) => appointment.status === "cancelled")
    }

    return appointments
  }

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  const filteredAppointments = getFilteredAppointments()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => router.push("/")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </Button>

          <Button onClick={() => router.push("/#doctors")}>Book New Appointment</Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">My Appointments</h1>

          <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onCancel={() => handleCancelAppointment(appointment.id)}
                      showCancelButton={true}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="You don't have any upcoming appointments"
                  actionText="Book an Appointment"
                  onAction={() => router.push("/#doctors")}
                />
              )}
            </TabsContent>

            <TabsContent value="past">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} showCancelButton={false} />
                  ))}
                </div>
              ) : (
                <EmptyState message="You don't have any past appointments" actionText={null} onAction={null} />
              )}
            </TabsContent>

            <TabsContent value="cancelled">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} showCancelButton={false} />
                  ))}
                </div>
              ) : (
                <EmptyState message="You don't have any cancelled appointments" actionText={null} onAction={null} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} onLogin={handleLogin} />
    </div>
  )
}

function AppointmentCard({ appointment, onCancel, showCancelButton }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">{appointment.doctorName}</h3>
              <p className="text-blue-600">{appointment.doctorSpecialty}</p>
            </div>
          </div>

          <div className="ml-13 pl-13">
            <div className="flex items-center text-gray-700 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 2 0 002 2z"
                />
              </svg>
              {new Date(appointment.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="flex items-center text-gray-700 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {appointment.time}
            </div>

            <div className="flex items-center text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
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
              {appointment.doctorLocation}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end">
          <div className="mb-4">
            {appointment.status === "confirmed" ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelled
              </span>
            )}
          </div>

          {showCancelButton && appointment.status === "confirmed" && (
            <Button variant="outline" onClick={onCancel}>
              Cancel Appointment
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Update the EmptyState component to remove the "Book an Appointment" button for past and cancelled tabs
function EmptyState({ message, actionText, onAction }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg border">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 mx-auto text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-600 mb-6">No appointments found in this category.</p>
      {actionText && onAction && <Button onClick={onAction}>{actionText}</Button>}
    </div>
  )
}
