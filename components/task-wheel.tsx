"use client"

import { useRef, useEffect, useState } from "react"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface TaskWheelProps {
  tasks: Task[]
  isSpinning: boolean
}

export function TaskWheel({ tasks, isSpinning }: TaskWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const [wheelSize, setWheelSize] = useState(500)

  // Adjust wheel size based on screen size
  useEffect(() => {
    const updateWheelSize = () => {
      const containerWidth = wheelRef.current?.parentElement?.clientWidth || window.innerWidth
      const maxSize = Math.min(500, containerWidth - 40)
      setWheelSize(maxSize)
    }

    updateWheelSize()
    window.addEventListener("resize", updateWheelSize)

    return () => window.removeEventListener("resize", updateWheelSize)
  }, [])

  // Colors for the wheel segments
  const colors = [
    "#3B82F6", // blue-500
    "#2563EB", // blue-600
    "#1D4ED8", // blue-700
    "#1E40AF", // blue-800
    "#4F46E5", // indigo-600
    "#4338CA", // indigo-700
  ]

  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = wheelSize
    canvas.height = wheelSize

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // If no tasks, draw empty wheel
    if (tasks.length === 0) {
      ctx.beginPath()
      ctx.arc(wheelSize / 2, wheelSize / 2, wheelSize / 2 - 5, 0, Math.PI * 2)
      ctx.fillStyle = "#E5E7EB" // gray-200
      ctx.fill()

      ctx.font = `bold ${isMobile ? "14px" : "16px"} 'M PLUS Rounded 1c', sans-serif`
      ctx.fillStyle = "#6B7280" // gray-500
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("No tasks available", wheelSize / 2, wheelSize / 2)
      return
    }

    // Draw wheel segments
    const centerX = wheelSize / 2
    const centerY = wheelSize / 2
    const radius = wheelSize / 2 - 5
    const anglePerSegment = (Math.PI * 2) / tasks.length

    tasks.forEach((task, index) => {
      const startAngle = index * anglePerSegment
      const endAngle = (index + 1) * anglePerSegment

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      // Fill segment
      ctx.fillStyle = colors[index % colors.length]
      ctx.fill()

      // Add task title
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + anglePerSegment / 2)

      // Text styling
      const fontSize = isMobile ? 12 : 14
      ctx.font = `bold ${fontSize}px 'M PLUS Rounded 1c', sans-serif`
      ctx.fillStyle = "white"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"

      // Truncate text if too long
      let title = task.title
      const maxLength = isMobile ? 15 : 20
      if (title.length > maxLength) {
        title = title.substring(0, maxLength - 3) + "..."
      }

      // Position text in segment
      const textDistance = radius * 0.75
      ctx.fillText(title, textDistance, 0)

      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.15, 0, Math.PI * 2)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.strokeStyle = "#3B82F6" // blue-500
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw pointer
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius - 10)
    ctx.lineTo(centerX - 10, centerY - radius + 10)
    ctx.lineTo(centerX + 10, centerY - radius + 10)
    ctx.closePath()
    ctx.fillStyle = "#EF4444" // red-500
    ctx.fill()
  }, [tasks, wheelSize, isMobile])

  // Spin animation
  useEffect(() => {
    if (!wheelRef.current) return

    if (isSpinning) {
      // Random number of rotations between 2 and 5
      const rotations = 2 + Math.random() * 3
      // Random ending angle
      const endAngle = Math.random() * 360
      // Total rotation in degrees
      const totalRotation = rotations * 360 + endAngle

      // Apply animation
      wheelRef.current.style.transition = "transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)"
      wheelRef.current.style.transform = `rotate(${totalRotation}deg)`
    } else {
      // Reset for next spin
      wheelRef.current.style.transition = "none"
    }
  }, [isSpinning])

  return (
    <div ref={wheelRef} className="relative w-full aspect-square mx-auto">
      {/* Wheel container */}
      <div className={cn("absolute inset-0 transition-transform", isSpinning ? "animate-spin-slow" : "")}>
        <canvas ref={canvasRef} className="w-full h-full touch-none" />
      </div>

      {/* Static pointer overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 z-10">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500" />
      </div>
    </div>
  )
}

