"use client"

import type React from "react"

import { useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"

export function MobileOptimizations({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile()

  // Adjust viewport meta tag for mobile devices
  useEffect(() => {
    // Find the viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]')

    if (!viewportMeta) {
      // Create it if it doesn't exist
      const meta = document.createElement("meta")
      meta.name = "viewport"
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      document.head.appendChild(meta)
    } else {
      // Update existing viewport meta
      viewportMeta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
    }

    // Add touch action handling
    document.documentElement.style.touchAction = "manipulation"

    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = "none"

    return () => {
      document.documentElement.style.touchAction = ""
      document.body.style.overscrollBehavior = ""
    }
  }, [])

  // Apply mobile-specific optimizations
  useEffect(() => {
    if (isMobile) {
      // Optimize for mobile performance
      document.documentElement.classList.add("mobile-optimized")

      // Disable hover effects on mobile
      const style = document.createElement("style")
      style.innerHTML = `
        @media (hover: none) {
          .hover-effect {
            display: none !important;
          }
        }
      `
      document.head.appendChild(style)

      return () => {
        document.documentElement.classList.remove("mobile-optimized")
        document.head.removeChild(style)
      }
    }
  }, [isMobile])

  return <>{children}</>
}

