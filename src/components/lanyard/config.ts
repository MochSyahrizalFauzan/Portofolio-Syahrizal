/* Shared types, defaults, and input normalization for the Kern lanyard. */
import { useEffect, useState, type CSSProperties } from "react"
import * as THREE from "three"

export type ThreeNS = typeof THREE

export const ControlType = {
    Boolean: "boolean",
    Color: "color",
    Enum: "enum",
    Font: "font",
    Link: "link",
    Number: "number",
    Object: "object",
    ResponsiveImage: "responsiveImage",
    String: "string",
} as const

export function useReducedMotionPreference(): boolean {
    const [reduced, setReduced] = useState(false)
    useEffect(() => {
         const media = window.matchMedia("(prefers-reduced-motion: reduce)")
         const update = (): void => setReduced(media.matches)
        update()
        media.addEventListener("change", update)
        return () => media.removeEventListener("change", update)
    }, [])
    return reduced
}

export function addPropertyControls(
    _component: unknown,
    _controls: Record<string, unknown>
): void {
    void _component
    void _controls
}

export interface ContentProps {
    attendeeName: string
    ticketType: string
    ticketNumber: string
    eventName: string
    eventDate: string
    barcodeValue: string
    backText: string
    strapText: string
}

export interface FramerImage {
    src: string
    alt?: string
}

export type FoilMode = "off" | "marks" | "edges" | "marks+edges"
export type StrapStyle = "flat" | "cord"
export type CardFinish = "gloss" | "matte" | "linen"
export type SleeveTexture = "clear" | "frosted" | "textured"
export type PhotoFit = "cover" | "inset"
export type StageStatus = "boot" | "ready" | "fail"
export type FailReason = "no-webgl" | "setup" | "context-lost"
export type ArtKey = "logo" | "photo" | "backArt"
// "cors": the host answers but blocks cross-origin use. "unreachable": the link itself fails.
export type ArtFailure = "cors" | "unreachable"

export interface StageFailure {
    reason: FailReason
    detail: string
}

export interface PrintFont {
    fontFamily?: string
    fontSize?: string | number
    fontWeight?: number | string
    fontStyle?: string
    letterSpacing?: string | number
    lineHeight?: string | number
}

export interface LookProps {
    paper: string
    ink: string
    accent: string
    strapColor: string
    strapStyle: StrapStyle
    logo?: FramerImage | null
    photo?: FramerImage | null
    backArt?: FramerImage | null
    photoFit: PhotoFit
    foil: boolean
    finish: CardFinish
    sleeve: boolean
    sleeveTexture: SleeveTexture
    nameFont: PrintFont
    metaFont: PrintFont
    numberFont: PrintFont
}

export interface LightProps {
    angle: number
    height: number
    intensity: number
    rim: boolean
}

export interface LayoutProps {
    size: number
    padding: number
    stackGap: number
    thickness: number
}

export interface MotionProps {
    physics: boolean
}

export interface PreviewProps {
    exploreMore: string
    madeForFramer: string
}

export type EntranceStyle = "none" | "drop"
export type EntrancePlay = "load" | "session"

export interface EntranceProps {
    entrance: EntranceStyle
    entrancePlay: EntrancePlay
}

export interface KernLanyardPassProps {
    content: ContentProps
    look: LookProps
    light: LightProps
    layout: LayoutProps
    motion: boolean | MotionProps
    entrance: EntranceProps
    preview: PreviewProps
    style?: CSSProperties
}

export interface TicketDraw {
    attendeeName: string
    ticketType: string | null
    ticketNumber: string | null
    eventName: string | null
    eventDate: string | null
    barcodeValue: string
    paper: string
    ink: string
    accent: string
    pad: number
    stackGap: number
    nameFont: PrintFont
    metaFont: PrintFont
    numberFont: PrintFont
    reverseLine: string | null
    strapColor: string
    strapStyle: StrapStyle
    strapText: string | null
    logo: HTMLImageElement | null
    photo: HTMLImageElement | null
    backArt: HTMLImageElement | null
    photoFit: PhotoFit
}

export const FONT = '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
export const STUDIO_URL = "https://www.framer.com/@builtbykern/"
export const AFFILIATE_URL = "https://framer.link/qIg9LiG"
export const PREVIEW_DESCRIPTION =
    "BuiltByKern\n[Explore more components](https://www.framer.com/%40builtbykern/)\n[Made for Framer](https://framer.link/qIg9LiG)"
export const SWING_STRENGTH = 1

export const PAPER = "#131417"
export const INK = "#F2F1EC"
export const ACCENT = "#5B6B86"
export const STRAP = "#1A1A1A"
export const DEMO_LOGO =
    "https://framerusercontent.com/images/NKG7xDji75kOvGGPnoy2SHOaCc.png"
export const DEMO_PHOTO =
    "https://framerusercontent.com/images/GoVUpIyhMQqoCHF6pDVHtX10TJA.jpg"
export const PAD_MIN = 28
export const PAD_MAX = 88
export const NAME_MIN = 48
export const NAME_MAX = 140
export const META_MIN = 14
export const META_MAX = 36
export const NUM_MIN = 24
export const NUM_MAX = 96
export const PRINT_PAD = 48
export const CARD_DEPTH = 0.1
export const MM_PER_UNIT = 54
export const THICK_MIN = 0.8
export const THICK_MAX = 12
export const THICK_DEFAULT = Math.round(CARD_DEPTH * MM_PER_UNIT * 10) / 10

export const SIZE_MIN = 240
export const SIZE_MAX = 560
export const NARROW_AT = 420
export const JOINTS = 3
export const SEG_LEN = 0.82
export const CARD_W = 1.58
export const CARD_H = 2.12
export const SLEEVE_PAD_W = 0.08
export const SLEEVE_LIP = 0.05
export const SLEEVE_HEAD = 0.16
export const SLEEVE_PAD_H = SLEEVE_LIP + SLEEVE_HEAD
export const SLEEVE_PAD_D = 0.03
export const SLEEVE_SHIFT = (SLEEVE_HEAD - SLEEVE_LIP) / 2
export const HOLE = 0.09
export const ROPE_ITERS = 18
export const GRAVITY = -22
export const AIR = 0.986
export const DT = 1 / 60
export const STRAP_SEGS = 40
export const STRAP_RADIAL = 10
export const STRAP_HALF_W = 0.07
export const STRAP_HALF_T = 0.02
export const CORD_R = 0.032
export const CORD_REPEAT = 14
export const TEX_W = 768
export const TEX_H = 1024
export const STRAP_TEX_W = 256
export const STRAP_TEX_H = 1024
export const STRAP_REPEAT = 3
export const CAM_X = 0.7
export const CAM_Y = -0.7
export const CAM_Z = 7.1
export const CAM_LOOK_Y = -1.05
export const IDLE_SPRING = 6
export const IDLE_DAMP = 0.9

export const DEFAULT_CONTENT: ContentProps = {
    attendeeName: "Alex Rivera",
    ticketType: "General admission",
    ticketNumber: "A-0842",
    eventName: "North Dock Sessions",
    eventDate: "12 Mar 2027",
    barcodeValue: "NDS2027A0842",
    backText: "",
    strapText: "",
}

export const DEFAULT_NAME_FONT: PrintFont = {
    fontSize: "108px",
    fontWeight: 600,
    fontStyle: "normal",
    letterSpacing: "-0.045em",
    lineHeight: "1em",
}

export const DEFAULT_META_FONT: PrintFont = {
    fontSize: "22px",
    fontWeight: 400,
    fontStyle: "normal",
    letterSpacing: "0.01em",
    lineHeight: "1.2em",
}

export const DEFAULT_NUMBER_FONT: PrintFont = {
    fontSize: "48px",
    fontWeight: 600,
    fontStyle: "normal",
    letterSpacing: "-0.04em",
    lineHeight: "1em",
}

export const DEFAULT_LOOK: LookProps = {
    paper: PAPER,
    ink: INK,
    accent: ACCENT,
    strapColor: STRAP,
    strapStyle: "flat",
    foil: true,
    photoFit: "cover",
    finish: "gloss",
    sleeve: false,
    sleeveTexture: "clear",
    nameFont: DEFAULT_NAME_FONT,
    metaFont: DEFAULT_META_FONT,
    numberFont: DEFAULT_NUMBER_FONT,
}

export const DEFAULT_LIGHT: LightProps = {
    angle: 25,
    height: 55,
    intensity: 1,
    rim: true,
}

export const TYPE_GAP_MIN = 8
export const TYPE_GAP_MAX = 48
export const TYPE_GAP_DEFAULT = 12

export const DEFAULT_LAYOUT: LayoutProps = {
    size: 360,
    padding: PRINT_PAD,
    stackGap: TYPE_GAP_DEFAULT,
    thickness: THICK_DEFAULT,
}

export const DEFAULT_PREVIEW: PreviewProps = {
    exploreMore: STUDIO_URL,
    madeForFramer: AFFILIATE_URL,
}

export const DEFAULT_ENTRANCE: EntranceProps = {
    entrance: "none",
    entrancePlay: "load",
}

// The drop starts this far left of the clip, so the strap catches it into a swing (right first,
// away from copy on the left) instead of a dead stop.
export const ENTRY_SIDE = -0.45
// The card starts just this far above the stage's top edge, out of sight, and falls in through it.
export const ENTRY_GAP = 0.06
// How long the drop waits, once the stage is showing, for its art and type before it gives up.
export const ART_WAIT = 1500

// "Once per session" remembers the drop here; the page hears "lanyard-pass:catch" when the strap
// catches the card ({ dropped: true }) or at once when this instance won't drop ({ dropped: false }).
export const ENTRANCE_KEY = "lanyard-pass:entrance"
export const CATCH_EVENT = "lanyard-pass:catch"

// Storage can throw (private mode, blocked site data): then the drop plays.
export function entrancePlayed(): boolean {
    try {
        return window.sessionStorage.getItem(ENTRANCE_KEY) === "1"
    } catch {
        return false
    }
}

export function markEntrance(): void {
    try {
        window.sessionStorage.setItem(ENTRANCE_KEY, "1")
    } catch {
        /* blocked: nothing to remember */
    }
}

export function signalCatch(dropped: boolean): void {
    window.dispatchEvent(new CustomEvent(CATCH_EVENT, { detail: { dropped } }))
}

// Probes for WebGL before the engine starts, then frees the probe's context.
export function webglAvailable(): boolean {
    try {
         const probe = document.createElement("canvas")
         const gl = probe.getContext("webgl2") ?? probe.getContext("webgl")
        if (!gl) return false
        gl.getExtension("WEBGL_lose_context")?.loseContext()
        return true
    } catch {
        return false
    }
}

export const ART_LABEL: Record<ArtKey, string> = {
    logo: "Logo",
    photo: "Photo",
    backArt: "Back art",
}

// Shown on the Framer canvas only, so the editor can see why the pass looks wrong.
export function failureNote(failure: StageFailure): string {
    if (failure.reason === "no-webgl")
        return "Lanyard Pass: this browser has no WebGL, so visitors see a flat pass instead of the 3D one."
    if (failure.reason === "context-lost")
        return "Lanyard Pass: the browser dropped the WebGL context (GPU reset or too many 3D views). The flat pass shows until it comes back."
     const detail = failure.detail.replace(/\.+$/, "")
    return `Lanyard Pass: the 3D pass failed to start${detail ? ` (${detail})` : ""}. Visitors see a flat pass.`
}

// What the status region tells screen readers while the flat pass stands in for the 3D one.
export function fallbackStatus(failure: StageFailure | null): string {
    if (failure?.reason === "context-lost")
        return "3D view paused. Showing the flat pass until it recovers."
    return "3D view unavailable. Showing the flat pass."
}

export function artNote(key: ArtKey, failure: ArtFailure): string {
    return failure === "cors"
        ? `${ART_LABEL[key]} didn't load: its host blocks cross-origin use. Upload the image to Framer instead.`
        : `${ART_LABEL[key]} didn't load: the link is broken or unreachable.`
}

export function motionEnabled(value: unknown): boolean {
    if (typeof value === "boolean") return value
    if (value && typeof value === "object" && "physics" in value) {
        return Boolean((value as MotionProps).physics)
    }
    return true
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

export function clampSize(value: number): number {
    if (!Number.isFinite(value)) return DEFAULT_LAYOUT.size
    return Math.round(clamp(value, SIZE_MIN, SIZE_MAX))
}

export function clampPad(value: number): number {
    if (!Number.isFinite(value)) return DEFAULT_LAYOUT.padding
    return Math.round(clamp(value, PAD_MIN, PAD_MAX))
}

export function clampStackGap(value: number): number {
    if (!Number.isFinite(value)) return DEFAULT_LAYOUT.stackGap
    return Math.round(clamp(value, TYPE_GAP_MIN, TYPE_GAP_MAX))
}

export function asText(value: unknown): string {
    return typeof value === "string" ? value : ""
}

export function visibleText(value: unknown): string | null {
     const text = asText(value).trim()
    return text.length > 0 ? text : null
}

export function parsePx(
    value: unknown,
    fallback: number,
    min: number,
    max: number
): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.round(clamp(value, min, max))
    }
    if (typeof value === "string") {
         const n = parseFloat(value)
        if (Number.isFinite(n)) return Math.round(clamp(n, min, max))
    }
    return fallback
}

export function asPrintFont(value: unknown, fallback: PrintFont): PrintFont {
    if (!value || typeof value !== "object") return fallback
    return { ...fallback, ...(value as PrintFont) }
}

export function fontFamilyOf(font: PrintFont): string {
     const family = asText(font.fontFamily).trim()
    return family.length > 0 ? family : FONT
}

export function fontWeightOf(font: PrintFont, fallback: number): number {
    if (
        typeof font.fontWeight === "number" &&
        Number.isFinite(font.fontWeight)
    ) {
        return font.fontWeight
    }
    if (typeof font.fontWeight === "string") {
         const n = parseFloat(font.fontWeight)
        if (Number.isFinite(n)) return n
    }
    return fallback
}

export function fontStyleOf(font: PrintFont): string {
    return font.fontStyle === "italic" ? "italic" : "normal"
}

export function letterSpacingOf(font: PrintFont, fallback: string): string {
    if (typeof font.letterSpacing === "number") return `${font.letterSpacing}px`
     const text = asText(font.letterSpacing).trim()
    return text.length > 0 ? text : fallback
}

export function lineHeightOf(
    font: PrintFont,
    size: number,
    fallbackRatio: number
): number {
     const raw = font.lineHeight
    if (typeof raw === "number" && Number.isFinite(raw)) {
        return raw > 4 ? raw : size * raw
    }
    if (typeof raw === "string") {
         const n = parseFloat(raw)
        if (!Number.isFinite(n)) return size * fallbackRatio
        if (raw.includes("%")) return size * (n / 100)
        if (raw.includes("px")) return n
        if (raw.includes("em")) return size * n
        return n > 4 ? n : size * n
    }
    return size * fallbackRatio
}

export function typeGap(fromPx: number, toPx: number, pad: number): number {
    return Math.round(
        clamp(Math.max(pad * 0.28, fromPx * 0.16, toPx * 0.6), 10, 72)
    )
}

export function lineAdvance(
    ctx: CanvasRenderingContext2D,
    text: string,
    px: number,
    lead: number
): number {
     const m = ctx.measureText(text)
     const ascent = m.actualBoundingBoxAscent
     const descent = m.actualBoundingBoxDescent
     const ink =
        typeof ascent === "number" &&
        Number.isFinite(ascent) &&
        typeof descent === "number" &&
        Number.isFinite(descent)
            ? ascent + descent
            : px
    return Math.round(Math.max(lead, ink + px * 0.08, px))
}

export function inkAdvance(
    ctx: CanvasRenderingContext2D,
    text: string,
    px: number
): number {
     const m = ctx.measureText(text)
     const ascent = m.actualBoundingBoxAscent
     const descent = m.actualBoundingBoxDescent
     const ink =
        typeof ascent === "number" &&
        Number.isFinite(ascent) &&
        typeof descent === "number" &&
        Number.isFinite(descent)
            ? ascent + descent
            : px * 0.8
    return Math.round(clamp(ink, px * 0.7, px))
}

export function setPrintFont(
    ctx: CanvasRenderingContext2D,
    font: PrintFont,
    px: number,
    weight = fontWeightOf(font, 400)
): void {
    ctx.font = `${fontStyleOf(font)} ${weight} ${px}px ${fontFamilyOf(font)}`
}

export function imageSrc(value: unknown): string | null {
    if (typeof value === "string" && /^https?:\/\//.test(value)) return value
    if (!value || typeof value !== "object") return null
     const rec = value as { src?: unknown; url?: unknown }
    if (typeof rec.src === "string" && rec.src.length > 0) return rec.src
    if (typeof rec.url === "string" && rec.url.length > 0) return rec.url
    return null
}

export function asFoil(value: unknown): FoilMode {
    switch (value) {
        case false:
        case "off":
            return "off"
        case "edges":
            return "edges"
        case "marks+edges":
        case "both":
            return "marks+edges"
        case "holo":
        case "marks":
            return "marks"
        case true:
        default:
            return "marks+edges"
    }
}

export function asStrapStyle(value: unknown): StrapStyle {
    return value === "cord" ? "cord" : "flat"
}

export function asFinish(value: unknown): CardFinish {
    if (value === "matte" || value === "linen") return value
    return "gloss"
}

export function asSleeveTexture(value: unknown): SleeveTexture {
    if (value === "frosted" || value === "textured") return value
    return "clear"
}

export function asPhotoFit(value: unknown): PhotoFit {
    return value === "inset" ? "inset" : "cover"
}

export function foilHasMarks(mode: FoilMode): boolean {
    return mode === "marks" || mode === "marks+edges"
}

export function foilHasEdges(mode: FoilMode): boolean {
    return mode === "edges" || mode === "marks+edges"
}

export function reverseLine(
    custom: string | null,
    legacy: unknown,
    ticketNumber: string | null,
    attendeeName: string,
    eventName: string | null
): string | null {
    if (custom) return custom
    switch (legacy) {
        case "name":
            return attendeeName
        case "event":
            return eventName
        case "none":
            return null
        default:
            return ticketNumber
    }
}
