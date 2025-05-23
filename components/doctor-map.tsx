"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export function DoctorMap({ doctors, userLocation }) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    } else {
      setMapLoaded(true)
    }
  }, [])

  // Initialize map when script is loaded and user location is available
  useEffect(() => {
    if (mapLoaded && userLocation && !map) {
      const mapInstance = new window.google.maps.Map(document.getElementById("doctor-map"), {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 12,
        styles: [
          {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "road",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      setMap(mapInstance)
    }
  }, [mapLoaded, userLocation, map])

  // Add markers for doctors when map is initialized
  useEffect(() => {
    if (map && doctors.length > 0) {
      // Clear existing markers
      markers.forEach((marker) => marker.setMap(null))
      const newMarkers = []

      // Add user marker
      if (userLocation) {
        const userMarker = new window.google.maps.Marker({
          position: { lat: userLocation.lat, lng: userLocation.lng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          },
          title: "Your Location",
        })
        newMarkers.push(userMarker)
      }

      // Add doctor markers
      doctors.forEach((doctor) => {
        if (doctor.coordinates) {
          const marker = new window.google.maps.Marker({
            position: { lat: doctor.coordinates.lat, lng: doctor.coordinates.lng },
            map,
            title: doctor.name,
            icon: {
              url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="%23${getColorForSpecialty(
                doctor.specialty,
              )}" stroke="%23FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
              scaledSize: new window.google.maps.Size(36, 36),
              anchor: new window.google.maps.Point(18, 36),
            },
          })

          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${doctor.name}</h3>
                <p style="color: #3B82F6; margin-bottom: 4px;">${doctor.specialty}</p>
                <p style="margin-bottom: 4px;">${doctor.location}</p>
                <p>₹${doctor.fee} Consultation Fee</p>
              </div>
            `,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })

          newMarkers.push(marker)
        }
      })

      setMarkers(newMarkers)

      // Fit bounds to include all markers
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        newMarkers.forEach((marker) => {
          bounds.extend(marker.getPosition())
        })
        map.fitBounds(bounds)
      }
    }
  }, [map, doctors, userLocation])

  // Helper function to get color for specialty
  function getColorForSpecialty(specialty) {
    const colors = {
      Cardiologist: "EF4444",
      "Orthopedic Surgeon": "F59E0B",
      Dermatologist: "EC4899",
      Pediatrician: "10B981",
      Neurologist: "8B5CF6",
      Gynecologist: "6366F1",
      "ENT Specialist": "06B6D4",
      Psychiatrist: "14B8A6",
      "General Physician": "3B82F6",
    }

    return colors[specialty] || "6B7280"
  }

  return (
    <Card className="overflow-hidden">
      <div id="doctor-map" className="w-full h-[400px]"></div>
      {!mapLoaded && (
        <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </Card>
  )
}
