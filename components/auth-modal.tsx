"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AuthModal({ isOpen, onClose, onLogin }) {
  const [activeTab, setActiveTab] = useState("login")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleLogin = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validate form
    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    // Check if user exists in localStorage
    const usersJSON = localStorage.getItem("users")
    const users = usersJSON ? JSON.parse(usersJSON) : []

    const user = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase())

    if (!user) {
      setError("User not found. Please check your email or sign up.")
      setIsSubmitting(false)
      return
    }

    if (user.password !== loginPassword) {
      setError("Incorrect password. Please try again.")
      setIsSubmitting(false)
      return
    }

    // Set current user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(user))

    // Call onLogin callback
    onLogin(user)

    // Reset form
    setLoginEmail("")
    setLoginPassword("")
    setIsSubmitting(false)
  }

  const handleSignup = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validate form
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    // Check if user already exists
    const usersJSON = localStorage.getItem("users")
    const users = usersJSON ? JSON.parse(usersJSON) : []

    const existingUser = users.find((u) => u.email.toLowerCase() === signupEmail.toLowerCase())

    if (existingUser) {
      setError("User with this email already exists")
      setIsSubmitting(false)
      return
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: signupName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
      createdAt: new Date().toISOString(),
    }

    // Add user to localStorage
    const updatedUsers = [...users, newUser]
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Set current user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(newUser))

    // Call onLogin callback
    onLogin(newUser)

    // Reset form
    setSignupName("")
    setSignupEmail("")
    setSignupPhone("")
    setSignupPassword("")
    setSignupConfirmPassword("")
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{activeTab === "login" ? "Login" : "Create an Account"}</h2>
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

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
