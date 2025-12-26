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
    let time = 0

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
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

    // Particle class for floating data points
    class Particle {
      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.opacity = Math.random() * 0.3 + 0.15
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulsePhase = Math.random() * Math.PI * 2
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

        // Pulsing opacity
        this.currentOpacity = this.opacity + Math.sin(this.pulsePhase) * 0.1
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`
        ctx.fill()

        // Glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Graph line class for market trend visualization
    class GraphLine {
      constructor() {
        this.reset()
      }

      reset() {
        this.points = []
        this.numPoints = 20 + Math.floor(Math.random() * 30)
        this.startX = Math.random() * canvas.width
        this.startY = Math.random() * canvas.height
        this.amplitude = 50 + Math.random() * 100
        this.frequency = 0.01 + Math.random() * 0.02
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.opacity = Math.random() * 0.25 + 0.15
        this.speed = 0.2 + Math.random() * 0.3
        this.offset = Math.random() * Math.PI * 2

        // Generate points for smooth curve
        for (let i = 0; i < this.numPoints; i++) {
          this.points.push({
            x: this.startX + i * (canvas.width / this.numPoints),
            y: this.startY
          })
        }
      }

      update() {
        this.offset += this.speed * 0.01

        // Update points to create wave motion
        this.points.forEach((point, i) => {
          point.y = this.startY + Math.sin(i * this.frequency + this.offset) * this.amplitude
          point.x += this.speed

          // Wrap around
          if (point.x > canvas.width) {
            point.x = 0
            this.startX = 0
          }
        })
      }

      draw() {
        ctx.beginPath()
        ctx.moveTo(this.points[0].x, this.points[0].y)

        // Draw smooth curve through points
        for (let i = 1; i < this.points.length; i++) {
          const prev = this.points[i - 1]
          const curr = this.points[i]
          const next = this.points[i + 1] || curr

          const cp1x = prev.x + (curr.x - prev.x) / 2
          const cp1y = prev.y
          const cp2x = curr.x - (next.x - curr.x) / 2
          const cp2y = curr.y

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y)
        }

        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`
        ctx.lineWidth = 1.5
        ctx.shadowBlur = 15
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.5})`
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }

    // Initialize particles - ensure minimum visibility
    const numParticles = Math.max(30, Math.floor((canvas.width * canvas.height) / 15000))
    console.log('[AnimatedBackground] Initializing', numParticles, 'particles')
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle())
    }

    // Initialize graph lines
    const numGraphLines = 3 + Math.floor(Math.random() * 3)
    console.log('[AnimatedBackground] Initializing', numGraphLines, 'graph lines')
    for (let i = 0; i < numGraphLines; i++) {
      graphLines.push(new GraphLine())
    }

    // Animation loop
    const animate = () => {
      time += 0.01

      // Clear canvas with slight fade for trail effect
      // Use a darker base to ensure particles stand out
      ctx.fillStyle = 'rgba(18, 18, 18, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw graph lines
      graphLines.forEach(line => {
        line.update()
        line.draw()
      })

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Draw connections between nearby particles (network effect)
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.15
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(100, 200, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

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

