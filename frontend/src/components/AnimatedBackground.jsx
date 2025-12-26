import { useEffect, useRef } from 'react'
import './AnimatedBackground.css'

/**
 * Animated background component for prediction markets app
 * Features:
 * - Market-themed animations (graph lines, data points, probability curves)
 * - Neon colors with opacity variations
 * - Subtle, elegant movements
 * - Canvas-based particles and CSS-based overlays
 */
export default function AnimatedBackground() {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('[AnimatedBackground] Canvas ref is null')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('[AnimatedBackground] Could not get 2d context')
      return
    }
    
    console.log('[AnimatedBackground] Starting animation')
    let particles = []
    let graphLines = []
    let geometricShapes = []
    let glowingOrbs = []
    let pulsingRings = []
    let time = 0

    // Set canvas size - use getBoundingClientRect to match CSS sizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      console.log('[AnimatedBackground] Canvas resized to:', canvas.width, 'x', canvas.height)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Neon color palette
    const colors = [
      { r: 0, g: 255, b: 255 },      // Cyan
      { r: 255, g: 0, b: 255 },      // Magenta
      { r: 138, g: 43, b: 226 },     // BlueViolet
      { r: 0, g: 255, b: 127 },      // SpringGreen
      { r: 255, g: 20, b: 147 },     // DeepPink
    ]

    // Particle class for floating data points with varied opacity
    class Particle {
      constructor() {
        this.reset()
      }

      reset() {
        // More dynamic initial positions - cluster some, spread others
        const cluster = Math.random() < 0.3 // 30% chance to cluster
        if (cluster) {
          const clusterX = Math.random() * canvas.width
          const clusterY = Math.random() * canvas.height
          const spread = 100
          this.x = clusterX + (Math.random() - 0.5) * spread
          this.y = clusterY + (Math.random() - 0.5) * spread
        } else {
          this.x = Math.random() * canvas.width
          this.y = Math.random() * canvas.height
        }
        
        this.size = Math.random() * 3 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.8
        this.speedY = (Math.random() - 0.5) * 0.8
        this.color = colors[Math.floor(Math.random() * colors.length)]
        
        // Varied opacity levels - some very subtle, some more visible
        const opacityType = Math.random()
        if (opacityType < 0.3) {
          this.opacity = Math.random() * 0.15 + 0.05 // Very subtle (5-20%)
        } else if (opacityType < 0.7) {
          this.opacity = Math.random() * 0.25 + 0.15 // Medium (15-40%)
        } else {
          this.opacity = Math.random() * 0.3 + 0.4 // More visible (40-70%)
        }
        
        this.pulseSpeed = Math.random() * 0.03 + 0.01
        this.pulsePhase = Math.random() * Math.PI * 2
        this.pulseAmplitude = Math.random() * 0.2 + 0.1
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulsePhase += this.pulseSpeed

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0

        // Pulsing opacity with varied amplitude
        this.currentOpacity = this.opacity + Math.sin(this.pulsePhase) * this.pulseAmplitude
      }

      draw() {
        // Add subtle trail effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2)
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`)
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity * 0.5})`)
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`)

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Glow effect
        ctx.shadowBlur = 8
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity * 0.6})`
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Graph line class for market trend visualization - more dynamic and less distracting
    class GraphLine {
      constructor() {
        this.reset()
      }

      reset() {
        this.points = []
        this.numPoints = 15 + Math.floor(Math.random() * 20) // Fewer points for smoother lines
        
        // More dynamic positioning - prefer edges and corners
        const positionType = Math.random()
        if (positionType < 0.4) {
          // Start from edges
          const edge = Math.floor(Math.random() * 4)
          if (edge === 0) { // Top
            this.startX = Math.random() * canvas.width
            this.startY = -50
          } else if (edge === 1) { // Right
            this.startX = canvas.width + 50
            this.startY = Math.random() * canvas.height
          } else if (edge === 2) { // Bottom
            this.startX = Math.random() * canvas.width
            this.startY = canvas.height + 50
          } else { // Left
            this.startX = -50
            this.startY = Math.random() * canvas.height
          }
        } else {
          this.startX = Math.random() * canvas.width
          this.startY = Math.random() * canvas.height
        }
        
        this.amplitude = 20 + Math.random() * 80 // Smaller amplitude
        this.frequency = 0.003 + Math.random() * 0.015 // Lower frequency for smoother waves
        this.color = colors[Math.floor(Math.random() * colors.length)]
        
        // Much more subtle opacity - make them less distracting
        this.opacity = Math.random() * 0.12 + 0.05 // 5-17% - very subtle
        this.baseOpacity = this.opacity
        
        this.speed = 0.05 + Math.random() * 0.25 // Slower movement
        this.offset = Math.random() * Math.PI * 2
        this.life = 0
        this.maxLife = Math.random() * 300 + 200 // Lines fade in/out
        this.fadeIn = true
      }

        // Generate points for smooth curve
        for (let i = 0; i < this.numPoints; i++) {
          this.points.push({
            x: this.startX + i * (canvas.width / this.numPoints),
            y: this.startY
          })
        }
      }

      update() {
        this.life++
        this.offset += this.speed * 0.008 // Slower wave motion

        // Fade in/out effect for less distraction
        const lifeProgress = this.life / this.maxLife
        if (lifeProgress < 0.2) {
          this.opacity = this.baseOpacity * (lifeProgress / 0.2) // Fade in
        } else if (lifeProgress > 0.8) {
          this.opacity = this.baseOpacity * (1 - (lifeProgress - 0.8) / 0.2) // Fade out
        } else {
          this.opacity = this.baseOpacity
        }

        // Reset when faded out
        if (this.life > this.maxLife) {
          this.reset()
          this.life = 0
        }

        // Update points to create smoother, more organic wave motion
        this.points.forEach((point, i) => {
          // Use multiple sine waves for more organic movement
          const wave1 = Math.sin(i * this.frequency + this.offset) * this.amplitude
          const wave2 = Math.sin(i * this.frequency * 2 + this.offset * 1.5) * (this.amplitude * 0.3)
          point.y = this.startY + wave1 + wave2
          point.x += this.speed

          // Wrap around smoothly
          if (point.x > canvas.width + 50) {
            point.x = -50
            this.startX = -50
          } else if (point.x < -50) {
            point.x = canvas.width + 50
            this.startX = canvas.width + 50
          }
        })
      }

      draw() {
        // Only draw if opacity is significant
        if (this.opacity < 0.02) return

        ctx.beginPath()
        ctx.moveTo(this.points[0].x, this.points[0].y)

        // Draw smoother curve through points with better interpolation
        for (let i = 1; i < this.points.length; i++) {
          const prev = this.points[i - 1]
          const curr = this.points[i]
          const next = this.points[i + 1] || curr

          // Better control points for smoother curves
          const cp1x = prev.x + (curr.x - prev.x) * 0.6
          const cp1y = prev.y + (curr.y - prev.y) * 0.6
          const cp2x = curr.x - (next.x - curr.x) * 0.6
          const cp2y = curr.y - (next.y - curr.y) * 0.6

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y)
        }

        // Thinner, more subtle lines
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`
        ctx.lineWidth = 1
        ctx.shadowBlur = 10
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.3})`
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }

    // Initialize particles - ensure minimum visibility
    const numParticles = Math.max(50, Math.floor((canvas.width * canvas.height) / 10000))
    console.log('[AnimatedBackground] Canvas size:', canvas.width, 'x', canvas.height)
    console.log('[AnimatedBackground] Initializing', numParticles, 'particles')
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle())
    }

    // Initialize graph lines - fewer, more subtle
    const numGraphLines = 2 + Math.floor(Math.random() * 2) // 2-3 lines instead of 3-6
    console.log('[AnimatedBackground] Initializing', numGraphLines, 'graph lines')
    for (let i = 0; i < numGraphLines; i++) {
      graphLines.push(new GraphLine())
    }

    // Animation loop
    const animate = () => {
      time += 0.01

      // Clear canvas with slight fade for trail effect
      // Use a darker base to ensure particles stand out
      // Slightly more fade for smoother trails
      ctx.fillStyle = 'rgba(18, 18, 18, 0.25)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw all elements in layers
      // Background layer: glowing orbs
      glowingOrbs.forEach(orb => {
        orb.update()
        orb.draw()
      })

      // Mid layer: graph lines
      graphLines.forEach(line => {
        line.update()
        line.draw()
      })

      // Foreground layer: geometric shapes
      geometricShapes.forEach(shape => {
        shape.update()
        shape.draw()
      })

      // Foreground layer: particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Top layer: pulsing rings
      pulsingRings.forEach(ring => {
        ring.update()
        ring.draw()
      })

      // Draw connections between nearby particles (network effect)
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            // Varied connection opacity based on distance - more subtle
            const baseOpacity = (1 - distance / 120)
            const opacity = baseOpacity * (0.05 + Math.random() * 0.08) // 5-13% range - more subtle
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(100, 200, 255, ${opacity})`
            ctx.lineWidth = 0.3 + Math.random() * 0.4
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Test: Draw a visible test pattern first to verify canvas is working
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'
    ctx.fillRect(10, 10, 50, 50)
    console.log('[AnimatedBackground] Test pattern drawn - if you see a cyan square, canvas is working')
    
    // Clear test pattern after a moment
    setTimeout(() => {
      ctx.fillStyle = 'rgba(18, 18, 18, 1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      console.log('[AnimatedBackground] Test pattern cleared, starting animation')
    }, 1000)

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="animated-background">
      <canvas ref={canvasRef} className="animated-background-canvas" />
      <div className="animated-background-overlay" />
    </div>
  )
}

