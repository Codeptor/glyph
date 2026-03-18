import type { ParticleConfig, ParticleType } from '@/types'
import { simplex2 } from '@/engine/noise'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16) || 255,
    parseInt(h.substring(2, 4), 16) || 255,
    parseInt(h.substring(4, 6), 16) || 255,
  ]
}

export class ParticleSystem {
  private particles: Particle[] = []
  private type: ParticleType = 'embers'
  private config: ParticleConfig = {
    enabled: false, type: 'embers', count: 200,
    speed: 1, size: 2, color: '#ffffff', lifetime: 3, gravity: 0.1,
  }
  private time = 0

  setConfig(config: ParticleConfig): void {
    if (config.type !== this.type) {
      this.particles = []
      this.type = config.type
    }
    this.config = config
  }

  update(dt: number, w: number, h: number): void {
    if (!this.config.enabled) {
      this.particles = []
      return
    }
    this.time += dt

    // Emit new particles
    const deficit = this.config.count - this.particles.length
    if (deficit > 0) {
      const toEmit = Math.min(deficit, Math.ceil(this.config.count * dt * 2))
      for (let i = 0; i < toEmit; i++) {
        this.particles.push(this._spawn(w, h))
      }
    }

    // Update existing
    const speed = this.config.speed
    const gravity = this.config.gravity
    const alive: Particle[] = []

    for (const p of this.particles) {
      p.life -= dt / p.maxLife

      switch (this.type) {
        case 'explosion':
          p.vx *= 0.98
          p.vy *= 0.98
          p.vy += gravity * 20 * dt
          break
        case 'embers':
          p.vy -= gravity * 30 * dt  // rises
          p.vx += (Math.random() - 0.5) * speed * 15 * dt
          break
        case 'flow-field': {
          const nx = p.x / w * 3
          const ny = p.y / h * 3
          const angle = simplex2(nx + this.time * 0.3, ny) * Math.PI * 2
          p.vx += Math.cos(angle) * speed * 40 * dt
          p.vy += Math.sin(angle) * speed * 40 * dt
          p.vx *= 0.95
          p.vy *= 0.95
          break
        }
        case 'boids':
          this._updateBoid(p, w, h, dt)
          break
        case 'orbit': {
          const cx = w / 2, cy = h / 2
          const dx = p.x - cx, dy = p.y - cy
          const dist = Math.sqrt(dx * dx + dy * dy) + 1
          const angle = Math.atan2(dy, dx) + speed * 2 * dt / (dist * 0.01 + 1)
          p.x = cx + Math.cos(angle) * dist
          p.y = cy + Math.sin(angle) * dist
          p.vx = 0; p.vy = 0
          break
        }
      }

      p.x += p.vx * dt
      p.y += p.vy * dt

      // Wrap around edges
      if (p.x < 0) p.x += w
      if (p.x > w) p.x -= w
      if (p.y < 0) p.y += h
      if (p.y > h) p.y -= h

      if (p.life > 0) alive.push(p)
    }

    this.particles = alive
  }

  render(ctx: CanvasRenderingContext2D, _w: number, _h: number): void {
    if (!this.config.enabled || this.particles.length === 0) return

    const [cr, cg, cb] = hexToRgb(this.config.color)
    const baseSize = this.config.size

    ctx.save()
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life))
      const size = baseSize * p.size * (0.5 + alpha * 0.5)
      if (size < 0.3 || alpha < 0.02) continue

      ctx.globalAlpha = alpha * 0.8
      ctx.fillStyle = `rgb(${Math.round(cr * alpha)},${Math.round(cg * alpha)},${Math.round(cb * alpha)})`

      if (this.type === 'flow-field' || this.type === 'boids') {
        // Draw as small lines showing direction
        const len = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (len > 0.5) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx / len * size * 3, p.y - p.vy / len * size * 3)
          ctx.lineWidth = size * 0.5
          ctx.strokeStyle = ctx.fillStyle
          ctx.stroke()
        } else {
          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size)
        }
      } else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }

  private _spawn(w: number, h: number): Particle {
    const speed = this.config.speed
    const life = this.config.lifetime * (0.5 + Math.random() * 0.5)

    switch (this.type) {
      case 'explosion': {
        const angle = Math.random() * Math.PI * 2
        const sp = (1 + Math.random() * 4) * speed * 50
        return {
          x: w / 2, y: h / 2,
          vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp,
          life: 1, maxLife: life, size: 0.5 + Math.random(),
        }
      }
      case 'embers':
        return {
          x: Math.random() * w, y: h + Math.random() * 20,
          vx: (Math.random() - 0.5) * speed * 20, vy: -Math.random() * speed * 40,
          life: 1, maxLife: life, size: 0.3 + Math.random() * 0.7,
        }
      case 'flow-field':
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: 0, vy: 0,
          life: 1, maxLife: life, size: 0.4 + Math.random() * 0.6,
        }
      case 'boids':
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed * 30,
          vy: (Math.random() - 0.5) * speed * 30,
          life: 1, maxLife: life * 3, size: 0.5 + Math.random() * 0.5,
        }
      case 'orbit': {
        const cx = w / 2, cy = h / 2
        const angle = Math.random() * Math.PI * 2
        const radius = 30 + Math.random() * Math.min(w, h) * 0.35
        return {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          vx: 0, vy: 0,
          life: 1, maxLife: life * 5, size: 0.3 + Math.random() * 0.7,
        }
      }
    }
  }

  private _updateBoid(p: Particle, w: number, h: number, _dt: number): void {
    const perception = Math.min(w, h) * 0.08
    const maxSpeed = this.config.speed * 60
    let sepX = 0, sepY = 0, aliX = 0, aliY = 0, cohX = 0, cohY = 0
    let count = 0

    for (const other of this.particles) {
      if (other === p) continue
      const dx = other.x - p.x
      const dy = other.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > perception || dist < 0.1) continue
      count++
      if (dist < perception * 0.4) {
        sepX -= dx / (dist * dist)
        sepY -= dy / (dist * dist)
      }
      aliX += other.vx
      aliY += other.vy
      cohX += other.x
      cohY += other.y
    }

    if (count > 0) {
      p.vx += sepX * 1.5 + (aliX / count - p.vx) * 0.05 + (cohX / count - p.x) * 0.005
      p.vy += sepY * 1.5 + (aliY / count - p.vy) * 0.05 + (cohY / count - p.y) * 0.005
    }

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    if (speed > maxSpeed) {
      p.vx = (p.vx / speed) * maxSpeed
      p.vy = (p.vy / speed) * maxSpeed
    }
  }

  reset(): void {
    this.particles = []
    this.time = 0
  }
}
