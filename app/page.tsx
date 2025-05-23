"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorCard } from "@/components/doctor-card"
import { FeatureCard } from "@/components/feature-card"
import { SymptomSearch } from "@/components/symptom-search"
import { RatingFilter } from "@/components/rating-filter"
import { DoctorMap } from "@/components/doctor-map"
import { doctors } from "@/data/doctors"
import { features } from "@/data/features"
import { AuthModal } from "@/components/auth-modal"
import { FeatureModal } from "@/components/feature-modal"
import { AppointmentReminder } from "@/components/appointment-reminder"
import { AISymptomAnalyzer } from "@/components/ai-symptom-analyzer"

export default function HomePage() {
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDoctors, setFilteredDoctors] = useState(doctors)
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [minRating, setMinRating] = useState(0)
  const [userLocation, setUserLocation] = useState(null)
  const [activeTab, setActiveTab] = useState("list")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false)
  const [aiRecommendedDoctors, setAiRecommendedDoctors] = useState([])

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      setUser(JSON.parse(userData))
      setIsLoggedIn(true)
    }
  }, [])

  // Get user location
  const getUserLocation = () => {
    setIsLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userLoc)

          // Calculate distance for each doctor
          const updatedDoctors = doctors.map((doctor) => {
            if (doctor.coordinates) {
              const distance = calculateDistance(
                userLoc.lat,
                userLoc.lng,
                doctor.coordinates.lat,
                doctor.coordinates.lng,
              )
              return { ...doctor, distance }
            }
            return doctor
          })

          // Update doctors with distance
          setFilteredDoctors(filterDoctors(updatedDoctors))
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoadingLocation(false)
          alert("Unable to get your location. Please enable location services.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
      setIsLoadingLocation(false)
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  // Filter doctors based on all criteria
  const filterDoctors = (doctorsToFilter = doctors) => {
    let filtered = doctorsToFilter

    if (searchQuery) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter((doctor) => doctor.location.toLowerCase() === selectedLocation.toLowerCase())
    }

    // Filter by symptoms if any are selected
    if (selectedSymptoms.length > 0) {
      const specialties = selectedSymptoms.flatMap((symptom) => symptom.relatedSpecialties)
      filtered = filtered.filter((doctor) => specialties.includes(doctor.specialty))
    }

    // Filter by minimum rating
    if (minRating > 0) {
      filtered = filtered.filter((doctor) => doctor.rating >= minRating)
    }

    return filtered
  }

  useEffect(() => {
    // Filter doctors based on all criteria
    setFilteredDoctors(filterDoctors())
  }, [searchQuery, selectedLocation, selectedSymptoms, minRating])

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true)
  }

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    setIsAuthModalOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    setUser(null)
    setIsLoggedIn(false)
  }

  const handleOpenFeatureModal = (feature) => {
    setCurrentFeature(feature)
    setIsFeatureModalOpen(true)
  }

  const handleCloseFeatureModal = () => {
    setIsFeatureModalOpen(false)
  }

  const handleBookAppointment = (doctorId) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true)
      return
    }
    router.push(`/book-appointment/${doctorId}`)
  }

  const handleSymptomSelect = (selectedSymptomObjects) => {
    setSelectedSymptoms(selectedSymptomObjects)
  }

  const handleRatingChange = (rating) => {
    setMinRating(rating)
  }

  const handleDoctorsRecommended = (recommendedDoctors) => {
    setAiRecommendedDoctors(recommendedDoctors)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">Find Your Doctor</h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Home
            </a>
            <a href="#features" className="text-gray-700 hover:text-blue-600">
              Features
            </a>
            <a href="#doctors" className="text-gray-700 hover:text-blue-600">
              Doctors
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </a>
          </div>

          <div>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700">Hello, {user.name}</div>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
                <Button onClick={() => router.push("/my-appointments")}>My Appointments</Button>
              </div>
            ) : (
              <Button onClick={handleOpenAuthModal}>Login / Sign Up</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="20" fill="url(#radialGradient)" />
            <circle cx="80" cy="30" r="15" fill="url(#radialGradient)" />
            <circle cx="40" cy="70" r="25" fill="url(#radialGradient)" />
            <circle cx="75" cy="75" r="10" fill="url(#radialGradient)" />
          </svg>
        </div>
        <div className="relative py-16 md:py-24">
          <div className="container mx-auto px-4">
            {isLoggedIn && <AppointmentReminder />}

            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0 text-white">
                <h2 className="text-4xl font-bold mb-4">Find the Right Doctor for Your Health Needs</h2>
                <p className="text-xl mb-6 text-white/90">
                  Discover verified doctors in Hyderabad based on ratings, availability, and location.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    onClick={() => document.getElementById("doctors").scrollIntoView({ behavior: "smooth" })}
                  >
                    Find a Doctor Now
                  </Button>
                  <Button
                    size="lg"
                    className="bg-blue-800 text-white hover:bg-blue-900 border border-white"
                    onClick={() => setShowAIAnalyzer(true)}
                  >
                    Try AI Symptom Analyzer
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-80 h-80 flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-40 w-40 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Symptom Analyzer Section */}
      {showAIAnalyzer && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">AI Symptom Analyzer</h2>
                <Button variant="outline" onClick={() => setShowAIAnalyzer(false)}>
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AISymptomAnalyzer onDoctorsRecommended={handleDoctorsRecommended} />

                <div>
                  <h3 className="text-lg font-medium mb-4">Recommended Doctors</h3>
                  {aiRecommendedDoctors.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {aiRecommendedDoctors.map((doctor) => (
                        <DoctorCard
                          key={doctor.id}
                          doctor={doctor}
                          onBookAppointment={() => handleBookAppointment(doctor.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
                      <p className="text-gray-600">
                        Describe your symptoms to the AI assistant, and I'll recommend doctors who can help you.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section with Gradient Cards */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">Our Features</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Discover the smart healthcare solutions we offer to make your medical journey seamless
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="rounded-lg p-1 overflow-hidden"
                style={{
                  background: `linear-gradient(${45 + index * 30}deg, #4f46e5, #3b82f6, #0ea5e9)`,
                }}
              >
                <div className="bg-white rounded-lg h-full">
                  <FeatureCard feature={feature} onClick={() => handleOpenFeatureModal(feature)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">Find Doctors in Hyderabad</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Browse through our network of qualified doctors across different specialties
          </p>

          <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between">
            <div className="w-full md:w-1/2">
              <Input
                type="text"
                placeholder="Search by doctor name, specialty or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Locations</option>
                <option value="pragati nagar">Pragati Nagar</option>
                <option value="kukatpally">Kukatpally</option>
                <option value="miyapur">Miyapur</option>
                <option value="gachibowli">Gachibowli</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-1">
              <div className="space-y-6">
                {/* Rating Filter */}
                <RatingFilter onRatingChange={handleRatingChange} />

                {/* Symptom Search */}
                <Card className="p-4">
                  <h3 className="font-medium mb-3">Search by Symptoms</h3>
                  <SymptomSearch onSymptomSelect={handleSymptomSelect} />
                </Card>

                {/* Location Button */}
                <Card className="p-4">
                  <h3 className="font-medium mb-3">Find Doctors Near You</h3>
                  <Button onClick={getUserLocation} className="w-full" disabled={isLoadingLocation}>
                    {isLoadingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
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
                        Use My Location
                      </>
                    )}
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-3">AI-Powered Recommendations</h3>
                  <Button
                    onClick={() => setShowAIAnalyzer(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
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
                    Use AI Symptom Analyzer
                  </Button>
                </Card>

                {/* Selected Filters Display */}
                {(selectedSymptoms.length > 0 || minRating > 0) && (
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Active Filters</h3>

                    {minRating > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Minimum Rating:</span>
                          <div className="flex items-center">
                            <div className="flex text-yellow-400 mr-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-3 w-3 ${i < Math.floor(minRating) ? "text-yellow-400" : "text-gray-300"}`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs font-medium">{minRating.toFixed(1)}+</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedSymptoms.length > 0 && (
                      <div>
                        <span className="text-sm">Symptoms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSymptoms.map((symptom) => (
                            <div
                              key={symptom.id}
                              className="bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium text-blue-700 flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d={symptom.icon} />
                              </svg>
                              {symptom.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        setSelectedSymptoms([])
                        setMinRating(0)
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </Card>
                )}
              </div>
            </div>

            <div className="md:col-span-3">
              <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="map" disabled={!userLocation}>
                    Map View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                  {filteredDoctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredDoctors.map((doctor) => (
                        <DoctorCard
                          key={doctor.id}
                          doctor={doctor}
                          onBookAppointment={() => handleBookAppointment(doctor.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No doctors found</h3>
                      <p className="text-gray-600">
                        Try adjusting your search criteria or selecting different symptoms.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="map" className="mt-0">
                  {userLocation ? (
                    <DoctorMap doctors={filteredDoctors} userLocation={userLocation} />
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Location Required</h3>
                      <p className="text-gray-600 mb-4">Please share your location to view doctors on the map.</p>
                      <Button onClick={getUserLocation} disabled={isLoadingLocation}>
                        {isLoadingLocation ? "Getting Location..." : "Share My Location"}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Gradient Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">What Our Users Say</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Read testimonials from patients who found the right healthcare through our platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "I found a great specialist within minutes after searching my symptoms. The appointment booking was seamless!",
                name: "Sarah Johnson",
                location: "Hyderabad",
                gradient: "from-blue-500 to-indigo-600",
              },
              {
                text: "The platform helped me find a doctor who accepted my insurance and had availability the same day. Highly recommend!",
                name: "Michael Chen",
                location: "Hyderabad",
                gradient: "from-indigo-500 to-purple-600",
              },
              {
                text: "As someone new to Hyderabad, this site was invaluable in helping me find quality healthcare providers nearby.",
                name: "Emily Rodriguez",
                location: "Hyderabad",
                gradient: "from-purple-500 to-pink-600",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="rounded-lg p-1 overflow-hidden bg-gradient-to-r"
                style={{ backgroundImage: `linear-gradient(to right, ${testimonial.gradient})` }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="mb-4 flex-1">
                    <div className="flex text-yellow-400 mb-2">
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
                    </div>
                    <p className="text-gray-700 italic">{testimonial.text}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-500"
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
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with Gradient */}
      <footer id="contact" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
          </svg>
        </div>
        <div className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
              <div>
                <h3 className="text-xl font-bold mb-4">Find Your Doctor</h3>
                <p className="mb-4">Making healthcare accessible and convenient for everyone in Hyderabad.</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-white hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.317-7.695 13.999-15.055z" />
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c6.627 0 12-5.373 12-12s-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-.833c0-3.066 2.526-3.167 3.404-3.167.972 0 1.596.083 2.196.167v2.458z" />
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-white hover:text-blue-400">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="text-white hover:text-blue-400">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#doctors" className="text-white hover:text-blue-400">
                      Doctors
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="text-white hover:text-blue-400">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <p className="mb-2">Email: info@findyourdoctor.com</p>
                <p>Phone: +91 9876543210</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Subscribe</h3>
                <p className="mb-4">Stay up to date with the latest healthcare news and updates.</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="bg-gray-700 text-white rounded-l-md py-2 px-4 focus:outline-none"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-md">Subscribe</button>
                </div>
              </div>
            </div>
            <div className="text-center mt-8 text-gray-400">
              &copy; {new Date().getFullYear()} Find Your Doctor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} onLogin={handleLogin} />}

      {/* Feature Modal */}
      {currentFeature && (
        <FeatureModal isOpen={isFeatureModalOpen} onClose={handleCloseFeatureModal} feature={currentFeature} />
      )}
    </div>
  )
}
