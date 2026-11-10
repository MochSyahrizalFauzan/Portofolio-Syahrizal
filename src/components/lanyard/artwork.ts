/* Canvas artwork, card materials, and strap textures. */
import * as THREE from "three"
import { ThreeNS, PrintFont, TicketDraw, NAME_MIN, NAME_MAX, META_MIN, META_MAX, NUM_MIN, NUM_MAX, clamp, clampStackGap, parsePx, fontFamilyOf, fontWeightOf, fontStyleOf, letterSpacingOf, lineHeightOf, typeGap, lineAdvance, inkAdvance, setPrintFont } from "./config"

export function drawContained(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    focusY = 0.5
): void {
    if (img.width < 1 || img.height < 1) return
    const ir = img.width / img.height
    const r = w / h
    let dw = w
    let dh = h
    let dx = x
    let dy = y
    if (ir > r) {
        dw = h * ir
        dx = x - (dw - w) / 2
    } else {
        dh = w / ir
        dy = y - (dh - h) * focusY
    }
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    ctx.drawImage(img, dx, dy, dw, dh)
    ctx.restore()
}

export function makeStudioEnvironment(
    three: ThreeNS,
    renderer: THREE.WebGLRenderer
): THREE.Texture | null {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    const sky = ctx.createLinearGradient(0, 0, 0, 256)
    sky.addColorStop(0, "#3a3b40")
    sky.addColorStop(0.42, "#1c1d21")
    sky.addColorStop(0.55, "#101114")
    sky.addColorStop(1, "#050506")
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, 512, 256)
    const softbox = (x: number, y: number, w: number, h: number, a: number) => {
        const g = ctx.createRadialGradient(
            x + w / 2,
            y + h / 2,
            0,
            x + w / 2,
            y + h / 2,
            Math.max(w, h) / 2
        )
        g.addColorStop(0, `rgba(255,252,246,${a})`)
        g.addColorStop(0.6, `rgba(255,252,246,${a * 0.55})`)
        g.addColorStop(1, "rgba(255,252,246,0)")
        ctx.fillStyle = g
        ctx.fillRect(x, y, w, h)
    }
    softbox(70, 20, 150, 90, 1)
    softbox(210, 40, 120, 70, 0.85)
    softbox(200, 150, 220, 40, 0.3)
    softbox(394, 28, 4, 204, 2.3)
    const equirect = new three.Texture(canvas)
    equirect.mapping = three.EquirectangularReflectionMapping
    equirect.colorSpace = three.SRGBColorSpace
    equirect.needsUpdate = true
    const pmrem = new three.PMREMGenerator(renderer)
    const env = pmrem.fromEquirectangular(equirect).texture
    equirect.dispose()
    pmrem.dispose()
    return env
}

type FoilPhysical = THREE.MeshPhysicalMaterial & {
    iridescence: number
    iridescenceIOR: number
    iridescenceThicknessRange: [number, number]
}

export function makeFoilMaterial(
    three: ThreeNS,
    map: THREE.Texture,
    alphaMap: THREE.Texture | null
): FoilPhysical {
    const mat = new three.MeshPhysicalMaterial({
        color: 0x202226,
        map,
        emissive: 0xffffff,
        emissiveMap: map,
        emissiveIntensity: 0.5,
        alphaMap: alphaMap ?? undefined,
        transparent: true,
        opacity: 0.55,
        roughness: 0.2,
        metalness: 0.85,
        depthWrite: false,
        envMapIntensity: 1.6,
    }) as FoilPhysical
    mat.iridescence = 1
    mat.iridescenceIOR = 1.5
    mat.iridescenceThicknessRange = [120, 520]
    return mat
}

export function parseColor(color: string): [number, number, number] | null {
    const hex = color.trim()
    if (hex.startsWith("#") && hex.length === 7) {
        return [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16),
        ]
    }
    const m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(hex)
    if (!m) return null
    return [Number(m[1]), Number(m[2]), Number(m[3])]
}

export function isDark(color: string): boolean {
    const rgb = parseColor(color)
    if (!rgb) return true
    const [r, g, b] = rgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140
}

export function drawCord(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    color: string
): void {
    const dark = isDark(color)
    const hi = dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.4)"
    const lo = dark ? "rgba(0,0,0,0.42)" : "rgba(0,0,0,0.18)"
    const strands = 6
    const pitch = h / 2
    ctx.lineCap = "butt"
    for (let s = 0; s < strands; s++) {
        const x0 = (s / strands) * w
        ctx.lineWidth = w / strands
        ctx.strokeStyle = s % 2 === 0 ? hi : lo
        for (const off of [-w, 0, w]) {
            ctx.beginPath()
            ctx.moveTo(x0 + off, 0)
            ctx.lineTo(x0 + off + w, pitch)
            ctx.moveTo(x0 + off, pitch)
            ctx.lineTo(x0 + off + w, h)
            ctx.stroke()
        }
    }
    ctx.strokeStyle = dark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.28)"
    ctx.lineWidth = 2
    for (let s = 0; s <= strands; s++) {
        const x0 = (s / strands) * w
        for (const off of [-w, 0, w]) {
            ctx.beginPath()
            ctx.moveTo(x0 + off, 0)
            ctx.lineTo(x0 + off + w, pitch)
            ctx.moveTo(x0 + off, pitch)
            ctx.lineTo(x0 + off + w, h)
            ctx.stroke()
        }
    }
}

export function drawStrap(canvas: HTMLCanvasElement, ticket: TicketDraw): void {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = ticket.strapColor
    ctx.fillRect(0, 0, w, h)

    switch (ticket.strapStyle) {
        case "cord":
            drawCord(ctx, w, h, ticket.strapColor)
            return
        case "flat":
            break
        default: {
            const exhaustive: never = ticket.strapStyle
            return exhaustive
        }
    }

    const dark = isDark(ticket.strapColor)
    const lightHatch = dark
        ? "rgba(255,255,255,0.09)"
        : "rgba(255,255,255,0.28)"
    const darkHatch = dark ? "rgba(0,0,0,0.32)" : "rgba(0,0,0,0.12)"
    ctx.lineWidth = 1.2
    for (let i = -h; i < w + h; i += 5) {
        ctx.strokeStyle = i % 10 === 0 ? lightHatch : darkHatch
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + h, h)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(i + h, 0)
        ctx.lineTo(i, h)
        ctx.stroke()
    }
    const selvedge = dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.2)"
    ctx.fillStyle = selvedge
    for (const u of [0, 0.5]) {
        ctx.fillRect(Math.round(w * u) - 3, 0, 6, h)
    }

    const text = ticket.strapText
    if (!text) return
    const print = `${text.toUpperCase()}   Â·   `
    ctx.fillStyle = dark ? "rgba(244,243,240,0.9)" : "rgba(10,10,10,0.82)"
    ctx.textBaseline = "middle"
    ctx.textAlign = "left"
    const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    spaced.letterSpacing = "0.18em"
    ctx.font = `${fontStyleOf(ticket.metaFont)} ${fontWeightOf(ticket.metaFont, 600)} 50px ${fontFamilyOf(ticket.metaFont)}`
    const runW = Math.max(1, ctx.measureText(print).width)
    const runs = Math.max(1, Math.round(h / runW))
    const stretch = h / (runs * runW)
    const bandU = [0.25, 0.75]
    for (const u of bandU) {
        ctx.save()
        ctx.translate(w * u, 0)
        ctx.rotate(Math.PI / 2)
        ctx.scale(stretch, -1)
        for (let i = 0; i < runs; i++) {
            ctx.fillText(print, i * runW, 0)
        }
        ctx.restore()
    }
    spaced.letterSpacing = "0px"
}

export function edgeTone(three: ThreeNS, paper: string): THREE.Color {
    const color = new three.Color(paper)
    if (isDark(paper)) {
        color.lerp(new three.Color(0xffffff), 0.16)
    } else {
        color.multiplyScalar(0.9)
    }
    return color
}

export function makeNormalTexture(
    three: ThreeNS,
    size: number,
    heightAt: (u: number, v: number) => number,
    scale: number,
    repeatX: number,
    repeatY: number
): THREE.CanvasTexture | null {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    const height = new Float32Array(size * size)
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            height[y * size + x] = heightAt(
                (x / size) * Math.PI * 2,
                (y / size) * Math.PI * 2
            )
        }
    }
    const img = ctx.createImageData(size, size)
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const l = height[y * size + ((x + size - 1) % size)]
            const r = height[y * size + ((x + 1) % size)]
            const t = height[((y + size - 1) % size) * size + x]
            const b = height[((y + 1) % size) * size + x]
            const nx = (l - r) * scale
            const ny = (t - b) * scale
            const len = Math.hypot(nx, ny, 1)
            const o = (y * size + x) * 4
            img.data[o] = Math.round(((nx / len) * 0.5 + 0.5) * 255)
            img.data[o + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255)
            img.data[o + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255)
            img.data[o + 3] = 255
        }
    }
    ctx.putImageData(img, 0, 0)
    const map = new three.CanvasTexture(canvas)
    map.wrapS = three.RepeatWrapping ?? 1000
    map.wrapT = three.RepeatWrapping ?? 1000
    map.repeat.set(repeatX, repeatY)
    map.colorSpace = three.NoColorSpace
    map.needsUpdate = true
    return map
}

export function softWobble(u: number, v: number): number {
    return (
        Math.sin(u + Math.cos(v * 2) * 1.1) * 0.6 +
        Math.sin(v * 2 - Math.sin(u) * 0.9) * 0.4
    )
}

export function crispWobble(u: number, v: number): number {
    return (
        Math.sin(u * 1.6 + Math.cos(v * 2) * 1.1) * 0.55 +
        Math.sin(v * 2 - Math.sin(u * 1.5) * 0.9) * 0.32 +
        Math.sin((u + v) * 3.2 + Math.cos(u * 2.4) * 0.6) * 0.08
    )
}

export function linenWeave(u: number, v: number): number {
    const warp = Math.sin(u * 16)
    const weft = Math.sin(v * 16)
    const over = Math.sign(Math.sin(u * 8) * Math.sin(v * 8))
    return (
        warp * warp * 0.42 * (1 + over * 0.22) +
        weft * weft * 0.42 * (1 - over * 0.22)
    )
}

export function makeHoloTexture(three: ThreeNS): THREE.CanvasTexture {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    if (ctx) {
        const w = canvas.width
        const h = canvas.height
        const g = ctx.createLinearGradient(0, 0, w, h * 0.35)
        g.addColorStop(0, "#ff4fa3")
        g.addColorStop(0.16, "#ffb347")
        g.addColorStop(0.3, "#e9ff5a")
        g.addColorStop(0.46, "#3cf2c8")
        g.addColorStop(0.62, "#3aa0ff")
        g.addColorStop(0.8, "#b06cff")
        g.addColorStop(1, "#ff4fa3")
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = "overlay"
        ctx.lineWidth = 1
        for (let i = -h; i < w + h; i += 3) {
            ctx.strokeStyle =
                i % 6 === 0 ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)"
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i + h * 0.6, h)
            ctx.stroke()
        }
        ctx.globalCompositeOperation = "soft-light"
        ctx.strokeStyle = "rgba(255,255,255,0.9)"
        ctx.lineWidth = 14
        for (let i = -h; i < w + h; i += 96) {
            ctx.beginPath()
            ctx.moveTo(i, h)
            ctx.lineTo(i + h * 0.9, 0)
            ctx.stroke()
        }
        ctx.globalCompositeOperation = "source-over"
        for (let n = 0; n < 220; n++) {
            const x = (n * 137) % w
            const y = (n * 89) % h
            ctx.fillStyle = `rgba(255,255,255,${n % 3 === 0 ? 0.95 : 0.5})`
            ctx.fillRect(x, y, n % 4 === 0 ? 2 : 1, 1)
        }
    }
    const map = new three.CanvasTexture(canvas)
    map.wrapS = three.RepeatWrapping ?? 1000
    map.wrapT = three.RepeatWrapping ?? 1000
    map.repeat.set(1.4, 1.9)
    map.anisotropy = 4
    map.needsUpdate = true
    return map
}

export function drawDefaultPhoto(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    accent: string
): void {
    ctx.save()
    ctx.beginPath()
    const rr = 14
    ctx.moveTo(x + rr, y)
    ctx.arcTo(x + w, y, x + w, y + h, rr)
    ctx.arcTo(x + w, y + h, x, y + h, rr)
    ctx.arcTo(x, y + h, x, y, rr)
    ctx.arcTo(x, y, x + w, y, rr)
    ctx.closePath()
    ctx.clip()
    const g = ctx.createLinearGradient(x, y, x + w, y + h)
    g.addColorStop(0, accent)
    g.addColorStop(0.55, "#1a1a1a")
    g.addColorStop(1, "#0A0A0A")
    ctx.fillStyle = g
    ctx.fillRect(x, y, w, h)
    const lights = [
        [0.22, 0.28, 18, 0.35],
        [0.7, 0.22, 26, 0.28],
        [0.48, 0.55, 14, 0.4],
        [0.18, 0.72, 22, 0.22],
        [0.8, 0.68, 16, 0.3],
        [0.4, 0.38, 10, 0.45],
    ] as const
    for (const [px, py, r, a] of lights) {
        const lg = ctx.createRadialGradient(
            x + w * px,
            y + h * py,
            0,
            x + w * px,
            y + h * py,
            r
        )
        lg.addColorStop(0, `rgba(244,243,240,${a})`)
        lg.addColorStop(1, "rgba(244,243,240,0)")
        ctx.fillStyle = lg
        ctx.fillRect(x, y, w, h)
    }
    ctx.restore()
}

export function drawNdMark(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    accent: string,
    paper: string,
    font: PrintFont
): void {
    ctx.fillStyle = accent
    fillRoundRect(ctx, x, y, size, size, Math.round(size * 0.16))
    ctx.fillStyle = paper
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    setPrintFont(ctx, font, Math.round(size * 0.36), fontWeightOf(font, 600))
    ctx.fillText("ND", x + size / 2, y + size / 2 + size * 0.02)
}

export function barcodeBars(value: string): { width: number; ink: boolean }[] {
    const src = value.length > 0 ? value : "PASS"
    const bars: { width: number; ink: boolean }[] = []
    let hash = 2166136261
    for (let i = 0; i < src.length; i++) {
        hash ^= src.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
        const bits = Math.abs(hash)
        bars.push({ width: (bits % 3) + 1, ink: true })
        bars.push({ width: ((bits >>> 3) % 2) + 1, ink: false })
        bars.push({ width: ((bits >>> 5) % 3) + 1, ink: true })
        bars.push({ width: 1, ink: false })
    }
    return bars
}

export function muteInk(ink: string): string {
    return inkAlpha(ink, 0.55)
}

export function inkAlpha(ink: string, alpha: number): string {
    const rgb = parseColor(ink)
    if (!rgb) return ink
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

export function washPaper(
    ctx: CanvasRenderingContext2D,
    paper: string,
    w: number,
    h: number,
    startY: number
): void {
    const g = ctx.createLinearGradient(0, startY, 0, h)
    g.addColorStop(0, inkAlpha(paper, 0))
    g.addColorStop(0.28, inkAlpha(paper, 0.22))
    g.addColorStop(0.58, inkAlpha(paper, 0.88))
    g.addColorStop(1, inkAlpha(paper, 1))
    ctx.fillStyle = g
    ctx.fillRect(0, Math.max(0, startY), w, Math.max(0, h - startY))
}

export function scrimTop(
    ctx: CanvasRenderingContext2D,
    paper: string,
    w: number,
    depth: number
): void {
    const g = ctx.createLinearGradient(0, 0, 0, depth)
    g.addColorStop(0, inkAlpha(paper, 0.55))
    g.addColorStop(0.55, inkAlpha(paper, 0.18))
    g.addColorStop(1, inkAlpha(paper, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, depth)
}

export function pathRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
): void {
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y + h, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)
    ctx.closePath()
}

export function fillRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
): void {
    pathRoundRect(ctx, x, y, w, h, r)
    ctx.fill()
}

export function paintMaskRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    strength = 1
): void {
    const level = Math.round(clamp(strength, 0, 1) * 255)
    ctx.fillStyle = `rgb(${level}, ${level}, ${level})`
    fillRoundRect(ctx, x, y, w, h, r)
}

export function paintMaskImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
): void {
    const scratch = document.createElement("canvas")
    scratch.width = Math.max(1, Math.round(w))
    scratch.height = Math.max(1, Math.round(h))
    const s = scratch.getContext("2d")
    if (!s) return
    drawContained(s, img, 0, 0, scratch.width, scratch.height)
    s.globalCompositeOperation = "source-in"
    s.fillStyle = "#ffffff"
    s.fillRect(0, 0, scratch.width, scratch.height)
    ctx.drawImage(scratch, x, y, w, h)
}

export function fitFont(
    ctx: CanvasRenderingContext2D,
    text: string,
    font: PrintFont,
    startPx: number,
    minPx: number,
    maxW: number
): number {
    let px = startPx
    const weight = fontWeightOf(font, 600)
    while (px > minPx) {
        setPrintFont(ctx, font, px, weight)
        if (ctx.measureText(text).width <= maxW) break
        px -= 2
    }
    setPrintFont(ctx, font, px, weight)
    return px
}

export function wrapName(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxW: number,
    font: PrintFont,
    size: number,
    minSize: number
): { lines: string[]; px: number } {
    const weight = fontWeightOf(font, 600)
    setPrintFont(ctx, font, size, weight)
    if (ctx.measureText(text).width <= maxW) {
        return { lines: [text], px: size }
    }
    const words = text.split(/\s+/).filter(Boolean)
    let lines = [text]
    if (words.length >= 2) {
        let best = 1
        let bestBad = Infinity
        for (let i = 1; i < words.length; i++) {
            const a = words.slice(0, i).join(" ")
            const b = words.slice(i).join(" ")
            const bad = Math.abs(
                ctx.measureText(a).width - ctx.measureText(b).width
            )
            if (bad < bestBad) {
                bestBad = bad
                best = i
            }
        }
        lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")]
    }
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width))
    const px =
        widest <= maxW
            ? size
            : fitFont(
                  ctx,
                  lines.reduce((a, b) => (a.length >= b.length ? a : b)),
                  font,
                  size,
                  minSize,
                  maxW
              )
    return { lines, px }
}

export function hairline(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    color: string
): void {
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + w, y)
    ctx.stroke()
}

export function drawFront(
    canvas: HTMLCanvasElement,
    mask: HTMLCanvasElement | null,
    ticket: TicketDraw
): void {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const pad = ticket.pad
    const col = w - pad * 2
    const mark = Math.round(clamp(pad * 1.7, 64, 104))
    const markX = pad
    const markY = pad
    const gap = Math.round(pad * 0.6)
    const nameSize = parsePx(ticket.nameFont.fontSize, 108, NAME_MIN, NAME_MAX)
    const metaSize = parsePx(ticket.metaFont.fontSize, 22, META_MIN, META_MAX)
    const numberSize = parsePx(ticket.numberFont.fontSize, 48, NUM_MIN, NUM_MAX)
    const cap = Math.round(metaSize * 0.78)
    const barH = Math.max(44, Math.round(numberSize * 1.1))
    const footH = Math.max(barH + cap + 8, numberSize) + gap
    const radius = 4
    const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    const mute = muteInk(ticket.ink)
    const faint = inkAlpha(ticket.ink, 0.38)
    const rule = inkAlpha(ticket.ink, 0.16)
    const headW = col - mark - gap
    const headGap = typeGap(cap, metaSize, pad)
    const headBand = ticket.eventDate ? cap + headGap + metaSize : cap
    const cover = ticket.photoFit !== "inset"
    const photoY = pad + Math.max(mark, headBand) + gap
    const hasRole = Boolean(ticket.ticketType)

    spaced.letterSpacing = letterSpacingOf(ticket.nameFont, "-0.045em")
    const wrapped = wrapName(
        ctx,
        ticket.attendeeName,
        col,
        ticket.nameFont,
        nameSize,
        Math.round(nameSize * 0.55)
    )
    const nameLead = Math.max(
        lineHeightOf(ticket.nameFont, wrapped.px, 1),
        wrapped.px
    )
    setPrintFont(
        ctx,
        ticket.nameFont,
        wrapped.px,
        fontWeightOf(ticket.nameFont, 600)
    )
    let nameStack = 0
    wrapped.lines.forEach((line, i) => {
        const last = i === wrapped.lines.length - 1
        nameStack += last
            ? inkAdvance(ctx, line, wrapped.px)
            : lineAdvance(ctx, line, wrapped.px, nameLead)
    })
    const afterName = Math.round(
        clamp((wrapped.px * clampStackGap(ticket.stackGap)) / 100, 6, 120)
    )
    const metaLead = Math.max(
        lineHeightOf(ticket.metaFont, metaSize, 1.2),
        metaSize
    )
    const afterRole = hasRole
        ? Math.round(clamp(Math.max(gap * 1.15, metaSize * 1.35), 22, 80))
        : 0
    const nameBlock = Math.round(
        nameStack + afterName + (hasRole ? metaLead + afterRole : 0)
    )
    const footTop = h - pad - footH + gap
    let photoH = Math.round(
        clamp(h - photoY - nameBlock - footH - pad, h * 0.18, h * 0.4)
    )
    const nameStart = photoY + photoH + gap
    if (!cover && nameStart + nameBlock > footTop) {
        photoH = Math.max(
            Math.round(h * 0.16),
            footTop - nameBlock - gap - photoY
        )
    }
    const photoX = cover ? 0 : pad
    const photoW = cover ? w : col
    const artY = cover ? 0 : photoY
    const artH = cover ? h : photoH
    const typeTop = cover
        ? Math.max(pad + mark + gap, footTop - nameBlock)
        : photoY + photoH + gap

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = ticket.paper
    ctx.fillRect(0, 0, w, h)

    if (ticket.photo) {
        if (cover) {
            drawContained(ctx, ticket.photo, 0, 0, w, h, 0.28)
        } else {
            ctx.save()
            pathRoundRect(ctx, photoX, artY, photoW, artH, radius)
            ctx.clip()
            drawContained(ctx, ticket.photo, photoX, artY, photoW, artH, 0.22)
            ctx.restore()
        }
    } else {
        drawDefaultPhoto(ctx, photoX, artY, photoW, artH, ticket.accent)
    }

    if (cover) {
        washPaper(
            ctx,
            ticket.paper,
            w,
            h,
            Math.round(Math.min(typeTop - wrapped.px * 0.7, h * 0.52))
        )
        scrimTop(ctx, ticket.paper, w, pad + mark + gap)
    }

    if (ticket.logo) {
        ctx.save()
        pathRoundRect(ctx, markX, markY, mark, mark, radius)
        ctx.clip()
        drawContained(ctx, ticket.logo, markX, markY, mark, mark)
        ctx.restore()
    } else {
        drawNdMark(
            ctx,
            markX,
            markY,
            mark,
            ticket.accent,
            ticket.paper,
            ticket.metaFont
        )
    }

    ctx.textAlign = "right"
    ctx.textBaseline = "top"
    if (ticket.eventName) {
        ctx.fillStyle = faint
        setPrintFont(
            ctx,
            ticket.metaFont,
            cap,
            fontWeightOf(ticket.metaFont, 500)
        )
        spaced.letterSpacing = "0.2em"
        ctx.fillText(ticket.eventName.toUpperCase(), w - pad, pad + 2, headW)
        spaced.letterSpacing = "0px"
    }
    if (ticket.eventDate) {
        ctx.fillStyle = mute
        setPrintFont(ctx, ticket.metaFont, metaSize)
        spaced.letterSpacing = letterSpacingOf(ticket.metaFont, "0.01em")
        ctx.fillText(ticket.eventDate, w - pad, pad + cap + headGap, headW)
        spaced.letterSpacing = "0px"
    }

    let y = typeTop
    ctx.textAlign = "left"
    ctx.textBaseline = "top"

    ctx.fillStyle = ticket.ink
    spaced.letterSpacing = letterSpacingOf(ticket.nameFont, "-0.045em")
    wrapped.lines.forEach((line, i) => {
        const last = i === wrapped.lines.length - 1
        setPrintFont(
            ctx,
            ticket.nameFont,
            wrapped.px,
            fontWeightOf(ticket.nameFont, 600)
        )
        ctx.fillText(line, pad - Math.round(wrapped.px * 0.04), y)
        y += last
            ? inkAdvance(ctx, line, wrapped.px)
            : lineAdvance(ctx, line, wrapped.px, nameLead)
    })
    spaced.letterSpacing = "0px"
    y += afterName

    if (ticket.ticketType) {
        ctx.fillStyle = mute
        setPrintFont(ctx, ticket.metaFont, metaSize)
        spaced.letterSpacing = letterSpacingOf(ticket.metaFont, "0.01em")
        ctx.fillText(ticket.ticketType, pad, y, col)
        spaced.letterSpacing = "0px"
        y += metaLead
    }

    hairline(
        ctx,
        pad,
        hasRole ? y + Math.round(afterRole * 0.4) : footTop - gap * 0.75,
        col,
        rule
    )

    let numberW = 0
    if (ticket.ticketNumber) {
        ctx.fillStyle = ticket.ink
        setPrintFont(
            ctx,
            ticket.numberFont,
            numberSize,
            fontWeightOf(ticket.numberFont, 600)
        )
        spaced.letterSpacing = letterSpacingOf(ticket.numberFont, "-0.04em")
        ctx.textAlign = "right"
        ctx.textBaseline = "alphabetic"
        numberW = ctx.measureText(ticket.ticketNumber).width
        ctx.fillText(ticket.ticketNumber, w - pad, h - pad)
        spaced.letterSpacing = "0px"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
    }

    if (ticket.barcodeValue) {
        const bars = barcodeBars(ticket.barcodeValue)
        const barW = Math.round(
            clamp(col - numberW - gap * 1.5, col * 0.32, col * 0.58)
        )
        const barY = h - pad - cap - 8 - barH
        const total = bars.reduce((sum, bar) => sum + bar.width, 0) || 1
        let x = pad
        for (const bar of bars) {
            const bw = (bar.width / total) * barW
            if (bar.ink) {
                ctx.fillStyle = ticket.ink
                ctx.fillRect(x, barY, Math.max(1, bw), barH)
            }
            x += bw
        }
        ctx.fillStyle = faint
        setPrintFont(ctx, ticket.metaFont, cap)
        spaced.letterSpacing = "0.14em"
        ctx.textBaseline = "alphabetic"
        ctx.fillText(ticket.barcodeValue, pad, h - pad)
        spaced.letterSpacing = "0px"
        ctx.textBaseline = "top"
    }

    if (mask) {
        const m = mask.getContext("2d")
        if (m) {
            m.clearRect(0, 0, w, h)
            m.fillStyle = "#000000"
            m.fillRect(0, 0, w, h)
            if (ticket.logo) {
                paintMaskImage(m, ticket.logo, markX, markY, mark, mark)
            } else {
                paintMaskRect(m, markX, markY, mark, mark, radius)
            }
        }
    }
}

export function drawBack(
    canvas: HTMLCanvasElement,
    mask: HTMLCanvasElement | null,
    ticket: TicketDraw
): void {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const pad = ticket.pad
    const mark = Math.round(w * 0.42)
    const markX = Math.round((w - mark) / 2)
    const markY = Math.round(h * 0.28)
    const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    const darkPaper = isDark(ticket.paper)
    const bg = darkPaper ? ticket.paper : ticket.ink
    const fg = darkPaper ? ticket.ink : ticket.paper
    ctx.clearRect(0, 0, w, h)
    if (ticket.backArt) {
        drawContained(ctx, ticket.backArt, 0, 0, w, h)
        ctx.fillStyle = inkAlpha(bg, 0.46)
        ctx.fillRect(0, 0, w, h)
    } else {
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)
    }

    ctx.strokeStyle = inkAlpha(fg, 0.12)
    ctx.lineWidth = 2
    ctx.strokeRect(pad * 0.45, pad * 0.45, w - pad * 0.9, h - pad * 0.9)

    if (ticket.eventName) {
        ctx.fillStyle = inkAlpha(fg, 0.55)
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        setPrintFont(
            ctx,
            ticket.metaFont,
            parsePx(ticket.metaFont.fontSize, 22, META_MIN, META_MAX),
            fontWeightOf(ticket.metaFont, 500)
        )
        spaced.letterSpacing = "0.2em"
        ctx.fillText(ticket.eventName.toUpperCase(), w / 2, pad, w - pad * 2)
        spaced.letterSpacing = "0px"
    }

    if (ticket.logo) {
        drawContained(ctx, ticket.logo, markX, markY, mark, mark)
    } else {
        drawNdMark(ctx, markX, markY, mark, fg, bg, ticket.metaFont)
    }
    const line = ticket.reverseLine
    if (line) {
        ctx.fillStyle = fg
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        spaced.letterSpacing = letterSpacingOf(ticket.numberFont, "0.04em")
        fitFont(ctx, line, ticket.numberFont, 56, 30, w - pad * 2)
        ctx.fillText(line, w / 2, markY + mark + typeGap(mark * 0.12, 56, pad))
        spaced.letterSpacing = "0px"
    }
    if (mask) {
        const m = mask.getContext("2d")
        if (m) {
            m.clearRect(0, 0, w, h)
            m.fillStyle = "#000000"
            m.fillRect(0, 0, w, h)
            if (ticket.backArt) {
                paintMaskRect(m, 0, 0, w, h, 0, 0.28)
            }
            if (ticket.logo) {
                paintMaskImage(m, ticket.logo, markX, markY, mark, mark)
            } else {
                paintMaskRect(m, markX, markY, mark, mark, 32)
            }
        }
    }
}
