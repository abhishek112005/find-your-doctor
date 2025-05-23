"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AppointmentReminder() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [user, setUser] = useState(null)
  const router = useRouter()

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

        // Get upcoming appointments in the next 24 hours
        const now = new Date()
        const next24Hours = new Date(now)
        next24Hours.setHours(now.getHours() + 24)

        const upcoming = parsedAppointments.filter((appointment) => {
          if (appointment.status === "cancelled") return false

          // Parse appointment date and time
          const appointmentDate = new Date(appointment.date)
          const [timePart, ampm] = appointment.time.split(" ")
          const [hours, minutes] = timePart.split(":").map(Number)

          // Convert to 24-hour format
          let hour = hours
          if (ampm === "PM" && hours !== 12) hour += 12
          if (ampm === "AM" && hours === 12) hour = 0

          appointmentDate.setHours(hour, minutes, 0)

          // Check if appointment is in the next 24 hours
          return appointmentDate > now && appointmentDate <= next24Hours
        })

        setUpcomingAppointments(upcoming)
      }
    }
  }, [])

  if (!user || upcomingAppointments.length === 0) {
    return null
  }

  return (
    <Card className="p-4 mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
      <div className="flex items-start">
        <div className="mr-4 mt-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-500"
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
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-lg text-yellow-800 mb-1">Upcoming Appointment Reminder</h3>
          {upcomingAppointments.map((appointment, index) => (
            <div key={index} className="mb-2">
              <p className="text-yellow-700">
                You have an appointment with <span className="font-medium">{appointment.doctorName}</span> on{" "}
                <span className="font-medium">
                  {new Date(appointment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>{" "}
                at <span className="font-medium">{appointment.time}</span>
              </p>
            </div>
          ))}
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-yellow-100 border-yellow-300 text-yellow-700"
              onClick={() => router.push("/my-appointments")}
            >
              View All Appointments
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
