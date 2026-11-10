/* Interactive Kern lanyard stage. */
"use client"

/* eslint-disable react-hooks/refs, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState, startTransition } from "react"
import * as THREE from "three"
import { useReducedMotionPreference, ContentProps, FoilMode, CardFinish, SleeveTexture, StageStatus, FailReason, ArtKey, ArtFailure, StageFailure, KernLanyardPassProps, TicketDraw, SWING_STRENGTH, PAPER, INK, ACCENT, STRAP, DEMO_LOGO, DEMO_PHOTO, NAME_MIN, NAME_MAX, META_MIN, META_MAX, NUM_MIN, NUM_MAX, MM_PER_UNIT, THICK_MIN, THICK_MAX, NARROW_AT, JOINTS, SEG_LEN, CARD_W, CARD_H, SLEEVE_PAD_W, SLEEVE_LIP, SLEEVE_HEAD, SLEEVE_PAD_H, SLEEVE_PAD_D, SLEEVE_SHIFT, HOLE, ROPE_ITERS, GRAVITY, AIR, DT, STRAP_SEGS, STRAP_RADIAL, STRAP_HALF_W, STRAP_HALF_T, CORD_R, CORD_REPEAT, TEX_W, TEX_H, STRAP_TEX_W, STRAP_TEX_H, STRAP_REPEAT, CAM_X, CAM_Y, CAM_Z, CAM_LOOK_Y, IDLE_SPRING, IDLE_DAMP, DEFAULT_CONTENT, DEFAULT_NAME_FONT, DEFAULT_META_FONT, DEFAULT_NUMBER_FONT, DEFAULT_LOOK, DEFAULT_LIGHT, DEFAULT_LAYOUT, DEFAULT_PREVIEW, DEFAULT_ENTRANCE, ENTRY_SIDE, ENTRY_GAP, ART_WAIT, entrancePlayed, markEntrance, signalCatch, webglAvailable, failureNote, fallbackStatus, artNote, motionEnabled, clamp, clampSize, clampPad, clampStackGap, asText, visibleText, parsePx, asPrintFont, fontFamilyOf, fontWeightOf, fontStyleOf, letterSpacingOf, imageSrc, asFoil, asStrapStyle, asFinish, asSleeveTexture, asPhotoFit, foilHasMarks, foilHasEdges, reverseLine } from "./lanyard/config"
import { makeStudioEnvironment, makeFoilMaterial, makeNormalTexture, makeHoloTexture, drawStrap, drawFront, drawBack, edgeTone, softWobble, crispWobble, linenWeave } from "./lanyard/artwork"
import { applyMaxDist, applyMinDist, particle, integrateParticle, makeTubeGeometry, updateWebbing } from "./lanyard/physics"
import type { Particle } from "./lanyard/physics"

import { registerLanyardControls } from "./lanyard/controls"

export default function Kern_LanyardPass(props: KernLanyardPassProps) {
    const content = { ...DEFAULT_CONTENT, ...props.content }
    const look = { ...DEFAULT_LOOK, ...props.look }
    const light = { ...DEFAULT_LIGHT, ...props.light }
    const layout = { ...DEFAULT_LAYOUT, ...props.layout }
    const preview = { ...DEFAULT_PREVIEW, ...props.preview }
    const entrance = { ...DEFAULT_ENTRANCE, ...props.entrance }
    const { style } = props
    void preview.exploreMore
    void preview.madeForFramer

    const attendeeName = visibleText(content.attendeeName) ?? "â€”"
    const ticketType = visibleText(content.ticketType)
    const ticketNumber = visibleText(content.ticketNumber)
    const eventName = visibleText(content.eventName)
    const eventDate = visibleText(content.eventDate)
    const barcodeValue = visibleText(content.barcodeValue) ?? ""
    const reverse = reverseLine(
        visibleText(content.backText),
        (content as ContentProps & { backLine?: unknown }).backLine,
        ticketNumber,
        attendeeName,
        eventName
    )
    const strapText = visibleText(content.strapText) ?? eventName

    const paper = asText(look.paper) || PAPER
    const ink = asText(look.ink) || INK
    const accent = asText(look.accent) || ACCENT
    const strapColor = asText(look.strapColor) || STRAP
    const strapStyle = asStrapStyle(look.strapStyle)
    const finish = asFinish(look.finish)
    const sleeveTexture = asSleeveTexture(look.sleeveTexture)
    const photoFit = asPhotoFit(look.photoFit)
    const foil = asFoil(look.foil)
    const sleeveOn = Boolean(look.sleeve)
    const lightAngle = clamp(
        typeof light.angle === "number" ? light.angle : DEFAULT_LIGHT.angle,
        -180,
        180
    )
    const lightHeight = clamp(
        typeof light.height === "number" ? light.height : DEFAULT_LIGHT.height,
        -20,
        85
    )
    const lightIntensity = clamp(
        typeof light.intensity === "number"
            ? light.intensity
            : DEFAULT_LIGHT.intensity,
        0,
        2
    )
    const rimOn = light.rim !== false
    const logoSrc = imageSrc(look.logo) ?? DEMO_LOGO
    const photoSrc = imageSrc(look.photo) ?? DEMO_PHOTO
    const backArtSrc = imageSrc(look.backArt)
    const size = clampSize(
        typeof layout.size === "number" ? layout.size : DEFAULT_LAYOUT.size
    )
    const padding = clampPad(
        typeof layout.padding === "number"
            ? layout.padding
            : DEFAULT_LAYOUT.padding
    )
    const stackGap = clampStackGap(
        typeof layout.stackGap === "number"
            ? layout.stackGap
            : DEFAULT_LAYOUT.stackGap
    )
    const nameFont = asPrintFont(look.nameFont, DEFAULT_NAME_FONT)
    const metaFont = asPrintFont(look.metaFont, DEFAULT_META_FONT)
    const numberFont = asPrintFont(look.numberFont, DEFAULT_NUMBER_FONT)
    const typeKey = [
        fontFamilyOf(nameFont),
        nameFont.fontSize,
        fontWeightOf(nameFont, 600),
        fontStyleOf(nameFont),
        letterSpacingOf(nameFont, "-0.045em"),
        nameFont.lineHeight,
        fontFamilyOf(metaFont),
        metaFont.fontSize,
        fontWeightOf(metaFont, 400),
        fontStyleOf(metaFont),
        letterSpacingOf(metaFont, "0.01em"),
        fontFamilyOf(numberFont),
        numberFont.fontSize,
        fontWeightOf(numberFont, 600),
        fontStyleOf(numberFont),
        letterSpacingOf(numberFont, "-0.04em"),
    ].join("|")
    const thicknessMm = clamp(
        typeof layout.thickness === "number"
            ? layout.thickness
            : DEFAULT_LAYOUT.thickness,
        THICK_MIN,
        THICK_MAX
    )
    const depth = thicknessMm / MM_PER_UNIT

    const physicsOn = motionEnabled(props.motion)
    const isStatic = false
    const prefersReducedMotion = useReducedMotionPreference()
    const reducedMotion = Boolean(prefersReducedMotion)
    const freeze = isStatic || !physicsOn || reducedMotion
    const [status, setStatus] = useState<StageStatus>("boot")
    // The loading label is client-only, so crawlers and the page's Markdown never read it.
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        startTransition(() => setMounted(true))
    }, [])
    const [failure, setFailure] = useState<StageFailure | null>(null)
    const [artFailures, setArtFailures] = useState<
        Partial<Record<ArtKey, ArtFailure>>
    >({})
    const [artTick, setArtTick] = useState(0)
    const flatRef = useRef<HTMLCanvasElement>(null)

    const rootRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<{
        paint: () => void
        freezeChanged: () => void
    } | null>(null)
    const freezeRef = useRef(freeze)
    freezeRef.current = freeze
    const staticRef = useRef(isStatic)
    staticRef.current = isStatic
    const entranceRef = useRef({
        drop: entrance.entrance === "drop",
        once: entrance.entrancePlay === "session",
    })
    entranceRef.current = {
        drop: entrance.entrance === "drop",
        once: entrance.entrancePlay === "session",
    }
    const ticketRef = useRef<TicketDraw>({
        attendeeName,
        ticketType,
        ticketNumber,
        eventName,
        eventDate,
        barcodeValue,
        paper,
        ink,
        accent,
        pad: padding,
        stackGap,
        nameFont,
        metaFont,
        numberFont,
        reverseLine: reverse,
        strapColor,
        strapStyle,
        strapText,
        logo: null,
        photo: null,
        backArt: null,
        photoFit,
    })
    ticketRef.current = {
        attendeeName,
        ticketType,
        ticketNumber,
        eventName,
        eventDate,
        barcodeValue,
        paper,
        ink,
        accent,
        pad: padding,
        stackGap,
        nameFont,
        metaFont,
        numberFont,
        reverseLine: reverse,
        strapColor,
        strapStyle,
        strapText,
        logo: ticketRef.current.logo,
        photo: ticketRef.current.photo,
        backArt: ticketRef.current.backArt,
        photoFit,
    }
    const artRef = useRef<{
        logo: HTMLImageElement | null
        photo: HTMLImageElement | null
        backArt: HTMLImageElement | null
    }>({ logo: null, photo: null, backArt: null })
    // The entrance only drops a finished card: every image loaded and the type in.
    const artReadyRef = useRef({
        logo: false,
        photo: false,
        backArt: false,
        type: false,
        failed: false,
    })
    const foilRef = useRef<FoilMode>(foil)
    foilRef.current = foil
    const sleeveRef = useRef(sleeveOn)
    sleeveRef.current = sleeveOn
    const finishRef = useRef<CardFinish>(finish)
    finishRef.current = finish
    const sleeveTexRef = useRef<SleeveTexture>(sleeveTexture)
    sleeveTexRef.current = sleeveTexture
    const lightRef = useRef({
        angle: lightAngle,
        height: lightHeight,
        intensity: lightIntensity,
        rim: rimOn,
    })
    lightRef.current = {
        angle: lightAngle,
        height: lightHeight,
        intensity: lightIntensity,
        rim: rimOn,
    }
    const depthRef = useRef(depth)
    depthRef.current = depth

    // Without WebGL the front face is still painted, flat, so the pass never goes blank.
    const paintFlat = (): void => {
        const canvas = flatRef.current
        if (!canvas) return
        const ticket = ticketRef.current
        ticket.logo = artRef.current.logo
        ticket.photo = artRef.current.photo
        ticket.backArt = artRef.current.backArt
        drawFront(canvas, null, ticket)
    }

    const stageH = useMemo(() => Math.round(size * 1.72), [size])

    useEffect(() => {
        if (typeof window === "undefined") return
        const host = rootRef.current
        if (!host) return
        let cancelled = false
        let dispose: (() => void) | undefined
        let built: THREE.WebGLRenderer | null = null
        const fail = (reason: FailReason, detail: string): void => {
            if (cancelled) return
            startTransition(() => {
                setFailure({ reason, detail })
                setStatus("fail")
            })
        }
        // The entrance drop: the card waits at the top of the stage until the loop first runs, then
        // lets itself down on its strap, which pays out (seg) up to its own length; the page is told once.
        const arrival = {
            pending: false,
            started: false,
            told: true,
            seg: SEG_LEN,
            since: 0,
        }
        const tellPage = (dropped: boolean): void => {
            if (arrival.told) return
            arrival.told = true
            signalCatch(dropped)
        }

        void (async () => {
            try {
                const stage = rootRef.current
                if (cancelled || !stage) return
                const stageEl: HTMLDivElement = stage
                // Framer renders an instance per breakpoint: a hidden copy neither drops, claims the
                // session nor tells the page. The canvas and the static export stay silent too.
                const shown =
                    stageEl.clientWidth > 0 && stageEl.clientHeight > 0
                const plan = entranceRef.current
                const willDrop =
                    shown &&
                    !freezeRef.current &&
                    plan.drop &&
                    !(plan.once && entrancePlayed())
                if (shown && !staticRef.current && !willDrop) signalCatch(false)
                arrival.told = !willDrop
                if (!webglAvailable()) {
                    fail("no-webgl", "")
                    tellPage(false)
                    return
                }

                const clipY = 2.05
                const cardHalfH = CARD_H / 2
                function hangY(): number {
                    return cardHalfH + (sleeveRef.current ? SLEEVE_HEAD : 0)
                }
                function drop(): number {
                    return hangY() - HOLE
                }
                const clip = particle(0, clipY, 0, true)
                const joints: Particle[] = []
                for (let i = 0; i < JOINTS; i++) {
                    joints.push(particle(0, clipY - SEG_LEN * (i + 1), 0))
                }

                const scene = new THREE.Scene()
                const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80)
                camera.position.set(CAM_X, CAM_Y, CAM_Z)
                camera.up.set(0, 1, 0)
                camera.lookAt(0, CAM_LOOK_Y, 0)
                camera.updateMatrixWorld(true)
                const renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true,
                    powerPreference: "high-performance",
                })
                built = renderer
                renderer.setPixelRatio(
                    Math.min(window.devicePixelRatio || 1, 2)
                )
                renderer.setClearColor(0x000000, 0)
                if ("SRGBColorSpace" in THREE) {
                    renderer.outputColorSpace = THREE.SRGBColorSpace
                }
                renderer.shadowMap.enabled = false
                renderer.domElement.style.width = "100%"
                renderer.domElement.style.height = "100%"
                renderer.domElement.style.display = "block"
                renderer.domElement.setAttribute("aria-hidden", "true")
                // The page scrolls under the stage; only a touch that starts on the card holds it (see onTouch).
                renderer.domElement.style.touchAction = "manipulation"
                stageEl.appendChild(renderer.domElement)

                const envMap = makeStudioEnvironment(THREE, renderer)
                if (envMap) {
                    scene.environment = envMap
                    scene.environmentIntensity = 1.05
                }
                const hemi = new THREE.HemisphereLight(0xdfe6f2, 0x0b0c0f, 0.22)
                scene.add(hemi)
                const key = new THREE.DirectionalLight(0xf6f8ff, 1.25)
                key.position.set(1.6, 6.4, 3.8)
                scene.add(key)
                const fill = new THREE.DirectionalLight(0x9fb4d6, 0.22)
                fill.position.set(-3.4, 0.6, 3.2)
                scene.add(fill)
                const rim = new THREE.DirectionalLight(0xbcd3ff, 1.4)
                rim.position.set(-3.2, 2.2, -2.6)
                scene.add(rim)
                const kicker = new THREE.DirectionalLight(0xffffff, 0.55)
                kicker.position.set(2.4, -1.2, -3.4)
                scene.add(kicker)

                const frontCanvas = document.createElement("canvas")
                frontCanvas.width = TEX_W
                frontCanvas.height = TEX_H
                const backCanvas = document.createElement("canvas")
                backCanvas.width = TEX_W
                backCanvas.height = TEX_H
                const frontMaskCanvas = document.createElement("canvas")
                frontMaskCanvas.width = TEX_W
                frontMaskCanvas.height = TEX_H
                const backMaskCanvas = document.createElement("canvas")
                backMaskCanvas.width = TEX_W
                backMaskCanvas.height = TEX_H
                drawFront(frontCanvas, frontMaskCanvas, ticketRef.current)
                drawBack(backCanvas, backMaskCanvas, ticketRef.current)
                const frontMap = new THREE.CanvasTexture(frontCanvas)
                const backMap = new THREE.CanvasTexture(backCanvas)
                const frontMaskMap = new THREE.CanvasTexture(frontMaskCanvas)
                const backMaskMap = new THREE.CanvasTexture(backMaskCanvas)
                frontMap.anisotropy = 8
                backMap.anisotropy = 8
                frontMap.colorSpace = THREE.SRGBColorSpace
                backMap.colorSpace = THREE.SRGBColorSpace
                frontMaskMap.colorSpace = THREE.NoColorSpace
                backMaskMap.colorSpace = THREE.NoColorSpace
                frontMap.needsUpdate = true
                backMap.needsUpdate = true
                frontMaskMap.needsUpdate = true
                backMaskMap.needsUpdate = true

                const edgeMat = new THREE.MeshStandardMaterial({
                    color: edgeTone(THREE, ticketRef.current.paper),
                    roughness: 0.34,
                    metalness: 0.04,
                    envMapIntensity: 1.3,
                })
                const frontMat = new THREE.MeshPhysicalMaterial({
                    map: frontMap,
                    roughness: 0.26,
                    metalness: 0,
                    clearcoat: 1,
                    clearcoatRoughness: 0.1,
                    envMapIntensity: 1.55,
                })
                const backMat = new THREE.MeshPhysicalMaterial({
                    map: backMap,
                    roughness: 0.26,
                    metalness: 0,
                    clearcoat: 1,
                    clearcoatRoughness: 0.1,
                    envMapIntensity: 1.55,
                })
                let cardGeo = new THREE.BoxGeometry(
                    CARD_W,
                    CARD_H,
                    depthRef.current
                )
                const cardMesh: THREE.Mesh<
                    THREE.BoxGeometry,
                    THREE.Material[]
                > = new THREE.Mesh(cardGeo, [
                    edgeMat,
                    edgeMat,
                    edgeMat,
                    edgeMat,
                    frontMat,
                    backMat,
                ])
                scene.add(cardMesh)

                const holoMap = makeHoloTexture(THREE)
                const holoFrontMat = makeFoilMaterial(
                    THREE,
                    holoMap,
                    frontMaskMap
                )
                const holoBackMat = makeFoilMaterial(
                    THREE,
                    holoMap,
                    backMaskMap
                )
                const edgeHoloMap = holoMap.clone()
                edgeHoloMap.repeat.set(0.05, 0.12)
                edgeHoloMap.needsUpdate = true
                const edgeHoloMat = makeFoilMaterial(THREE, edgeHoloMap, null)
                edgeHoloMat.opacity = 0.9
                edgeHoloMat.depthWrite = true
                const holoGeo = new THREE.PlaneGeometry(
                    CARD_W * 0.99,
                    CARD_H * 0.99
                )
                const holoFront = new THREE.Mesh(holoGeo, holoFrontMat)
                holoFront.position.z = depthRef.current / 2 + 0.003
                holoFront.renderOrder = 1
                cardMesh.add(holoFront)
                const holoBack = new THREE.Mesh(holoGeo, holoBackMat)
                holoBack.rotation.y = Math.PI
                holoBack.position.z = -(depthRef.current / 2 + 0.003)
                holoBack.renderOrder = 1
                cardMesh.add(holoBack)

                const wobble = makeNormalTexture(
                    THREE,
                    256,
                    softWobble,
                    3,
                    0.7,
                    1
                )
                const wobbleCrisp = makeNormalTexture(
                    THREE,
                    256,
                    crispWobble,
                    3.4,
                    1,
                    1.25
                )
                const linen = makeNormalTexture(
                    THREE,
                    256,
                    linenWeave,
                    1.4,
                    4,
                    6
                )
                const sleeveMat = new THREE.MeshPhysicalMaterial({
                    color: 0x0b0c0f,
                    transparent: true,
                    opacity: 1,
                    blending: THREE.AdditiveBlending,
                    roughness: 0.07,
                    metalness: 0,
                    depthWrite: false,
                    clearcoat: 1,
                    clearcoatRoughness: 0.05,
                    envMapIntensity: 1.8,
                    specularIntensity: 1,
                    normalMap: wobble ?? undefined,
                    normalScale: new THREE.Vector2(0.012, 0.012),
                    clearcoatNormalMap: wobble ?? undefined,
                    clearcoatNormalScale: new THREE.Vector2(0.02, 0.02),
                })
                let sleeveGeo = new THREE.BoxGeometry(
                    CARD_W + SLEEVE_PAD_W,
                    CARD_H + SLEEVE_PAD_H,
                    depthRef.current + SLEEVE_PAD_D
                )
                const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat)
                sleeveMesh.position.y = SLEEVE_SHIFT
                sleeveMesh.renderOrder = 2
                sleeveMesh.visible = sleeveRef.current
                cardMesh.add(sleeveMesh)

                const seamW = 0.045
                const seamOuter = new THREE.Shape()
                const sw = (CARD_W + SLEEVE_PAD_W) / 2
                const sh = (CARD_H + SLEEVE_PAD_H) / 2
                seamOuter.moveTo(-sw, -sh)
                seamOuter.lineTo(sw, -sh)
                seamOuter.lineTo(sw, sh)
                seamOuter.lineTo(-sw, sh)
                seamOuter.closePath()
                const seamInner = new THREE.Path()
                seamInner.moveTo(-sw + seamW, -sh + seamW)
                seamInner.lineTo(sw - seamW, -sh + seamW)
                seamInner.lineTo(sw - seamW, sh - seamW)
                seamInner.lineTo(-sw + seamW, sh - seamW)
                seamInner.closePath()
                seamOuter.holes.push(seamInner)
                const openingY = cardHalfH + 0.02 - SLEEVE_SHIFT
                const opening = new THREE.Shape()
                opening.moveTo(-sw + seamW, openingY - 0.008)
                opening.lineTo(sw - seamW, openingY - 0.008)
                opening.lineTo(sw - seamW, openingY + 0.008)
                opening.lineTo(-sw + seamW, openingY + 0.008)
                opening.closePath()
                const seamGeo = new THREE.ShapeGeometry([seamOuter, opening])
                const seamMat = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.14,
                    roughness: 0.55,
                    metalness: 0,
                    depthWrite: false,
                    clearcoat: 0.4,
                    clearcoatRoughness: 0.4,
                    envMapIntensity: 0.9,
                })
                const seamFront = new THREE.Mesh(seamGeo, seamMat)
                const seamBack = new THREE.Mesh(seamGeo, seamMat)
                seamBack.rotation.y = Math.PI
                for (const seam of [seamFront, seamBack]) {
                    seam.renderOrder = 3
                    sleeveMesh.add(seam)
                }
                function placeSeams(d: number): void {
                    const z = (d + SLEEVE_PAD_D) / 2 + 0.0015
                    seamFront.position.z = z
                    seamBack.position.z = -z
                }
                placeSeams(depthRef.current)

                const clipMat = new THREE.MeshStandardMaterial({
                    color: 0xd6d2ca,
                    metalness: 0.92,
                    roughness: 0.2,
                })
                const clipShape = new THREE.Shape()
                const cw = 0.26
                const ch = 0.078
                const cr = 0.022
                clipShape.moveTo(-cw / 2 + cr, -ch / 2)
                clipShape.lineTo(cw / 2 - cr, -ch / 2)
                clipShape.quadraticCurveTo(
                    cw / 2,
                    -ch / 2,
                    cw / 2,
                    -ch / 2 + cr
                )
                clipShape.lineTo(cw / 2, ch / 2 - cr)
                clipShape.quadraticCurveTo(cw / 2, ch / 2, cw / 2 - cr, ch / 2)
                clipShape.lineTo(-cw / 2 + cr, ch / 2)
                clipShape.quadraticCurveTo(
                    -cw / 2,
                    ch / 2,
                    -cw / 2,
                    ch / 2 - cr
                )
                clipShape.lineTo(-cw / 2, -ch / 2 + cr)
                clipShape.quadraticCurveTo(
                    -cw / 2,
                    -ch / 2,
                    -cw / 2 + cr,
                    -ch / 2
                )
                const clipGeo = new THREE.ExtrudeGeometry(clipShape, {
                    depth: 0.08,
                    bevelEnabled: true,
                    bevelThickness: 0.008,
                    bevelSize: 0.007,
                    bevelSegments: 3,
                    curveSegments: 6,
                })
                clipGeo.center()
                const badgeClip = new THREE.Mesh(clipGeo, clipMat)
                badgeClip.position.set(0, cardHalfH + 0.016, 0)
                cardMesh.add(badgeClip)
                const clipSlot = new THREE.Mesh(
                    new THREE.BoxGeometry(0.16, 0.018, 0.1),
                    new THREE.MeshStandardMaterial({
                        color: 0x1a1a1a,
                        metalness: 0.2,
                        roughness: 0.8,
                    })
                )
                clipSlot.position.set(0, 0.04, 0)
                badgeClip.add(clipSlot)
                const clipMesh = new THREE.Mesh(
                    new THREE.TorusGeometry(0.07, 0.016, 10, 22),
                    clipMat
                )
                clipMesh.position.set(0, clipY, 0)
                clipMesh.rotation.x = Math.PI / 2
                scene.add(clipMesh)

                const strap = makeTubeGeometry(THREE, STRAP_SEGS, STRAP_RADIAL)
                const strapCanvas = document.createElement("canvas")
                strapCanvas.width = STRAP_TEX_W
                strapCanvas.height = STRAP_TEX_H
                drawStrap(strapCanvas, ticketRef.current)
                const strapMap = new THREE.CanvasTexture(strapCanvas)
                strapMap.colorSpace = THREE.SRGBColorSpace
                strapMap.wrapS = THREE.RepeatWrapping
                strapMap.wrapT = THREE.RepeatWrapping
                strapMap.repeat.set(1, STRAP_REPEAT)
                strapMap.anisotropy = 8
                strapMap.needsUpdate = true
                const strapMat = new THREE.MeshStandardMaterial({
                    map: strapMap,
                    roughness: 0.82,
                    metalness: 0,
                })
                const strapMesh = new THREE.Mesh(strap.geometry, strapMat)
                scene.add(strapMesh)

                const raycaster = new THREE.Raycaster()
                const pointer = new THREE.Vector2()
                const dragPlane = new THREE.Plane()
                const planeHit = new THREE.Vector3()
                const camDir = new THREE.Vector3()
                const holeWorld = new THREE.Vector3()
                const clipAxis = new THREE.Vector3()
                const faceNormal = new THREE.Vector3()
                const viewDir = new THREE.Vector3()
                const jointPts = [
                    new THREE.Vector3(),
                    new THREE.Vector3(),
                    new THREE.Vector3(),
                    new THREE.Vector3(),
                ]
                const grabOff = { x: 0, y: 0, z: 0 }
                const grabState = {
                    down: false,
                    pointerId: -1,
                    lastT: 0,
                    lastNdcX: 0,
                    vx: 0,
                    vy: 0,
                    vz: 0,
                }
                let acc = 0
                let spinY = 0.16
                let spinVel = 0
                let simT = 0

                let lastDepth = depthRef.current

                function paintTicket(): void {
                    ticketRef.current.logo = artRef.current.logo
                    ticketRef.current.photo = artRef.current.photo
                    ticketRef.current.backArt = artRef.current.backArt
                    drawFront(frontCanvas, frontMaskCanvas, ticketRef.current)
                    drawBack(backCanvas, backMaskCanvas, ticketRef.current)
                    drawStrap(strapCanvas, ticketRef.current)
                    frontMap.needsUpdate = true
                    backMap.needsUpdate = true
                    frontMaskMap.needsUpdate = true
                    backMaskMap.needsUpdate = true
                    strapMap.needsUpdate = true
                    edgeMat.color.copy(edgeTone(THREE, ticketRef.current.paper))
                    applyCardLook()
                    if (freezeRef.current) presentStill()
                }

                function presentStill(): void {
                    frameCamera()
                    // A drop that hasn't started waits above the stage until it's in view.
                    if (!arrival.pending) poseHang(0)
                    syncVisuals()
                    renderer.render(scene, camera)
                }

                function applyCardLook(): void {
                    const d = depthRef.current
                    if (Math.abs(d - lastDepth) > 1e-4) {
                        lastDepth = d
                        const nextCard = new THREE.BoxGeometry(
                            CARD_W,
                            CARD_H,
                            d
                        )
                        cardMesh.geometry.dispose()
                        cardMesh.geometry = nextCard
                        cardGeo = nextCard
                        const nextSleeve = new THREE.BoxGeometry(
                            CARD_W + SLEEVE_PAD_W,
                            CARD_H + SLEEVE_PAD_H,
                            d + SLEEVE_PAD_D
                        )
                        sleeveMesh.geometry.dispose()
                        sleeveMesh.geometry = nextSleeve
                        sleeveGeo = nextSleeve
                        holoFront.position.z = d / 2 + 0.003
                        holoBack.position.z = -(d / 2 + 0.003)
                        badgeClip.scale.z = Math.max(1, (d + 0.03) / 0.08)
                        placeSeams(d)
                    }
                    const mode = foilRef.current
                    const marks = foilHasMarks(mode)
                    const edges = foilHasEdges(mode)
                    holoFront.visible = marks
                    holoBack.visible = marks
                    cardMesh.material = edges
                        ? [
                              edgeHoloMat,
                              edgeHoloMat,
                              edgeHoloMat,
                              edgeHoloMat,
                              frontMat,
                              backMat,
                          ]
                        : [
                              edgeMat,
                              edgeMat,
                              edgeMat,
                              edgeMat,
                              frontMat,
                              backMat,
                          ]
                    applyLight()
                    sleeveMesh.visible = sleeveRef.current
                    const sleeved = sleeveRef.current
                    badgeClip.position.y = hangY() + 0.016
                    let clearcoat: number
                    let roughness: number
                    let envMapIntensity: number
                    let faceNormal: THREE.Texture | null
                    let faceNormalScale: number
                    switch (finishRef.current) {
                        case "gloss":
                            clearcoat = 1
                            roughness = 0.26
                            envMapIntensity = 1.55
                            faceNormal = null
                            faceNormalScale = 0
                            break
                        case "matte":
                            clearcoat = 0
                            roughness = 0.82
                            envMapIntensity = 0.7
                            faceNormal = null
                            faceNormalScale = 0
                            break
                        case "linen":
                            clearcoat = 0.22
                            roughness = 0.68
                            envMapIntensity = 0.92
                            faceNormal = linen
                            faceNormalScale = 0.18
                            break
                        default: {
                            const exhaustive: never = finishRef.current
                            return exhaustive
                        }
                    }
                    if (sleeved) {
                        clearcoat = Math.min(clearcoat, 0.08)
                        roughness = Math.max(roughness, 0.62)
                        envMapIntensity = Math.min(envMapIntensity, 0.5)
                    }
                    for (const face of [frontMat, backMat]) {
                        face.clearcoat = clearcoat
                        face.roughness = roughness
                        face.envMapIntensity = envMapIntensity
                        if (face.normalMap !== faceNormal) {
                            face.normalMap = faceNormal
                            face.needsUpdate = true
                        }
                        face.normalScale.set(faceNormalScale, faceNormalScale)
                    }

                    let pvcNormal: THREE.Texture | null
                    let pvcScale: number
                    let pvcCoatScale: number
                    let pvcRough: number
                    let pvcCoatRough: number
                    let pvcHaze: number
                    switch (sleeveTexRef.current) {
                        case "clear":
                            pvcNormal = wobble
                            pvcScale = 0.012
                            pvcCoatScale = 0.02
                            pvcRough = 0.07
                            pvcCoatRough = 0.05
                            pvcHaze = 0x0b0c0f
                            break
                        case "frosted":
                            pvcNormal = wobble
                            pvcScale = 0.012
                            pvcCoatScale = 0.02
                            pvcRough = 0.42
                            pvcCoatRough = 0.5
                            pvcHaze = 0x16171a
                            break
                        case "textured":
                            pvcNormal = wobbleCrisp
                            pvcScale = 0.022
                            pvcCoatScale = 0.03
                            pvcRough = 0.1
                            pvcCoatRough = 0.08
                            pvcHaze = 0x0b0c0f
                            break
                        default: {
                            const exhaustive: never = sleeveTexRef.current
                            return exhaustive
                        }
                    }
                    if (sleeveMat.normalMap !== pvcNormal) {
                        sleeveMat.normalMap = pvcNormal
                        sleeveMat.clearcoatNormalMap = pvcNormal
                        sleeveMat.needsUpdate = true
                    }
                    sleeveMat.normalScale.set(pvcScale, pvcScale)
                    sleeveMat.clearcoatNormalScale.set(
                        pvcCoatScale,
                        pvcCoatScale
                    )
                    sleeveMat.roughness = pvcRough
                    sleeveMat.clearcoatRoughness = pvcCoatRough
                    sleeveMat.color.setHex(pvcHaze)
                }

                let lastLightKey = ""
                function applyLight(): void {
                    const l = lightRef.current
                    const sig = `${l.angle}|${l.height}|${l.intensity}|${l.rim}`
                    if (sig === lastLightKey) return
                    lastLightKey = sig
                    const az = (l.angle * Math.PI) / 180
                    const el = (l.height * Math.PI) / 180
                    const r = 7.5
                    const x = r * Math.cos(el) * Math.sin(az)
                    const y = r * Math.sin(el)
                    const z = r * Math.cos(el) * Math.cos(az)
                    key.position.set(x, y, z)
                    key.intensity = 1.25 * l.intensity
                    fill.position.set(
                        -x * 0.7,
                        Math.max(0.4, y * 0.1),
                        Math.abs(z) * 0.85
                    )
                    fill.intensity = 0.22 * l.intensity
                    rim.position.set(
                        -x * 0.75,
                        Math.max(1.2, y * 0.35),
                        -Math.abs(z) * 0.7
                    )
                    rim.intensity = l.rim ? 1.4 * l.intensity : 0
                    kicker.position.set(x * 0.6, -1.2, -Math.abs(z) * 0.9)
                    kicker.intensity = l.rim
                        ? 0.55 * l.intensity
                        : 0.2 * l.intensity
                    hemi.intensity = 0.22 * l.intensity
                    scene.environmentIntensity = 1.05 * l.intensity
                    scene.environmentRotation.set(
                        0,
                        ((l.angle - DEFAULT_LIGHT.angle) * Math.PI) / 180,
                        0
                    )
                }

                function poseHang(angle: number): void {
                    for (let i = 0; i < JOINTS; i++) {
                        const dist = SEG_LEN * (i + 1)
                        const j = joints[i]
                        j.x = Math.sin(angle) * dist
                        j.y = clipY - Math.cos(angle) * dist
                        j.z = 0
                        j.ox = j.x
                        j.oy = j.y
                        j.oz = j.z
                        j.pinned = false
                    }
                }

                // Just above the stage's top edge, out of sight, a little to the side of the clip, the strap
                // strung straight to it, nothing moving. Gravity brings it in through the edge from here.
                function poseEntrance(): void {
                    const ray = raycaster.ray
                    raycaster.setFromCamera(pointer.set(0, 1), camera)
                    const top =
                        ray.origin.y +
                        ray.direction.y * (-ray.origin.z / ray.direction.z)
                    const holeY =
                        top +
                        drop() +
                        CARD_H / 2 +
                        (sleeveRef.current ? SLEEVE_LIP : 0) +
                        ENTRY_GAP
                    // On a narrow stage, closer to the clip so the whole card starts in frame.
                    raycaster.setFromCamera(pointer.set(-1, 1), camera)
                    const left =
                        ray.origin.x +
                        ray.direction.x * (-ray.origin.z / ray.direction.z)
                    const side = Math.min(
                        0,
                        Math.max(
                            ENTRY_SIDE,
                            left + (CARD_W + SLEEVE_PAD_W) / 2 + 0.04
                        )
                    )
                    for (let i = 0; i < JOINTS; i++) {
                        const j = joints[i]
                        j.x = (side * (i + 1)) / JOINTS
                        j.y = clipY + ((holeY - clipY) * (i + 1)) / JOINTS
                        j.z = 0
                        j.ox = j.x
                        j.oy = j.y
                        j.oz = j.z
                        j.pinned = false
                    }
                    arrival.seg = Math.hypot(side, clipY - holeY) / JOINTS
                    // Already at its resting turn: on the way down only the strap moves it.
                    spinY =
                        Math.round(spinY / (Math.PI * 2)) * Math.PI * 2 +
                        Math.sin(simT * 0.55) * 0.07
                    spinVel = 0
                }

                // Its first visible frame is the finished card: draw it once at rest in a frame that never
                // reaches the screen (shaders compiled, textures uploaded), then put it back above the stage.
                function startDrop(): void {
                    poseHang(0)
                    syncVisuals()
                    renderer.render(scene, camera)
                    poseEntrance()
                    arrival.pending = false
                    arrival.started = true
                    if (entranceRef.current.once) markEntrance()
                }

                function solveRope(): void {
                    const seg = arrival.seg
                    const min = seg * 0.34
                    const chain = [clip, ...joints]
                    for (let n = 0; n < ROPE_ITERS; n++) {
                        for (let i = 0; i < chain.length - 1; i++) {
                            applyMaxDist(chain[i], chain[i + 1], seg)
                            applyMinDist(chain[i], chain[i + 1], min)
                        }
                    }
                    const floor = clipY - SEG_LEN * JOINTS * 1.45
                    for (const joint of joints) {
                        if (joint.y > clipY - 0.03) joint.y = clipY - 0.03
                        if (joint.y < floor) joint.y = floor
                        joint.z *= 0.92
                    }
                }

                function simulate(): void {
                    const hole = joints[JOINTS - 1]
                    if (arrival.pending) {
                        // Waits out of sight for its art and type, then drops; gives up to the rest pose if they
                        // fail or don't come in time.
                        const art = artReadyRef.current
                        const now = performance.now()
                        arrival.since = arrival.since || now
                        if (art.failed || now - arrival.since > ART_WAIT) {
                            endEntrance()
                            return
                        }
                        if (!(art.logo && art.photo && art.backArt && art.type))
                            return
                        startDrop()
                    }
                    hole.pinned = grabState.down
                    // Falling, the card meets no air; the damping returns with the catch.
                    const air = arrival.seg < SEG_LEN ? 1 : AIR
                    for (const joint of joints) {
                        integrateParticle(joint, DT, GRAVITY, air)
                    }
                    if (arrival.seg < SEG_LEN) {
                        // Paying out: the strap gives the falling card all the length it takes, up to its own,
                        // and runs straight from the clip to it without pulling. At full length it goes taut and
                        // catches the card.
                        const reach = Math.hypot(
                            hole.x - clip.x,
                            hole.y - clip.y,
                            hole.z - clip.z
                        )
                        arrival.seg = Math.min(SEG_LEN, reach / JOINTS)
                        if (arrival.seg === SEG_LEN) tellPage(true)
                        for (let i = 0; i < JOINTS - 1; i++) {
                            const t = (i + 1) / JOINTS
                            const j = joints[i]
                            j.x = clip.x + (hole.x - clip.x) * t
                            j.y = clip.y + (hole.y - clip.y) * t
                            j.z = clip.z + (hole.z - clip.z) * t
                            j.ox = clip.x + (hole.ox - clip.x) * t
                            j.oy = clip.y + (hole.oy - clip.y) * t
                            j.oz = clip.z + (hole.oz - clip.z) * t
                        }
                    }
                    if (arrival.seg === SEG_LEN) solveRope()
                    simT += DT
                    if (!grabState.down) {
                        const turn = Math.PI * 2
                        const home = Math.round(spinY / turn) * turn
                        const sway = Math.sin(simT * 0.55) * 0.07
                        const target = home + sway
                        const fast = Math.abs(spinVel) > 1.6
                        if (fast) {
                            spinVel *= 0.985
                        } else {
                            spinVel += (target - spinY) * IDLE_SPRING * DT
                            spinVel *= Math.pow(IDLE_DAMP, DT * 60)
                        }
                        spinY += spinVel * DT
                        hole.x += Math.sin(simT * 0.7) * 0.00045
                    }
                }

                function settle(): void {
                    poseHang(0)
                    for (let i = 0; i < 48; i++) simulate()
                    spinY = 0.16
                    spinVel = 0
                }

                function cardCenter(): { x: number; y: number; z: number } {
                    const hole = joints[JOINTS - 1]
                    return { x: hole.x, y: hole.y - drop(), z: hole.z }
                }

                function syncVisuals(): void {
                    const hole = joints[JOINTS - 1]
                    const reach = SEG_LEN * JOINTS || 1
                    const swing = clamp(hole.x / reach, -1, 1)
                    // Level while the strap pays out: on the way down the card just hangs from it.
                    const lift =
                        arrival.seg < SEG_LEN
                            ? 0
                            : clamp(
                                  (clipY - SEG_LEN * JOINTS - hole.y) / reach,
                                  -1,
                                  1
                              )
                    cardMesh.position.set(hole.x, hole.y - drop(), hole.z)
                    cardMesh.rotation.set(
                        -0.18 + lift * 0.22,
                        spinY,
                        swing * 0.12
                    )
                    cardMesh.updateMatrixWorld(true)
                    jointPts[0].set(clip.x, clip.y, clip.z)
                    jointPts[1].set(joints[0].x, joints[0].y, joints[0].z)
                    jointPts[2].set(joints[1].x, joints[1].y, joints[1].z)
                    holeWorld.set(0, hangY() + 0.02, 0)
                    holeWorld.applyMatrix4(cardMesh.matrixWorld)
                    jointPts[3].copy(holeWorld)
                    clipAxis.set(1, 0, 0)
                    clipAxis.transformDirection(cardMesh.matrixWorld)
                    const cord = ticketRef.current.strapStyle === "cord"
                    updateWebbing(
                        THREE,
                        jointPts,
                        camera,
                        clipAxis,
                        cord ? CORD_R : STRAP_HALF_W,
                        cord ? CORD_R : STRAP_HALF_T,
                        strap
                    )
                    // While the strap pays out, its print stays with the card and new print comes out at the top.
                    const paid = arrival.seg / SEG_LEN
                    const repeat = (cord ? CORD_REPEAT : STRAP_REPEAT) * paid
                    const offset =
                        (cord ? CORD_REPEAT : STRAP_REPEAT) * (1 - paid)
                    if (
                        strapMap.repeat.y !== repeat ||
                        strapMap.offset.y !== offset
                    ) {
                        strapMap.repeat.set(1, repeat)
                        strapMap.offset.set(0, offset)
                        strapMat.roughness = cord ? 0.7 : 0.82
                        badgeClip.scale.x = cord ? 0.6 : 1
                    }
                    applyCardLook()
                    const mode = foilRef.current
                    if (foilHasMarks(mode) || foilHasEdges(mode)) {
                        faceNormal.set(0, 0, 1)
                        faceNormal.transformDirection(cardMesh.matrixWorld)
                        viewDir
                            .subVectors(camera.position, cardMesh.position)
                            .normalize()
                        const facing = faceNormal.dot(viewDir)
                        const glance = clamp(
                            (0.92 - Math.abs(facing)) / 0.6,
                            0,
                            1
                        )
                        const sweep = glance * glance * (3 - 2 * glance)
                        holoMap.offset.x = spinY * 0.35 + facing * 0.9
                        holoMap.offset.y = spinY * 0.12 - facing * 0.25
                        edgeHoloMap.offset.x = holoMap.offset.x * 0.6
                        const foilAlpha = 0.5 + 0.35 * sweep
                        const glow = 0.32 + 0.9 * sweep
                        const thick: [number, number] = [
                            110 + sweep * 120,
                            460 + Math.abs(spinY) * 24,
                        ]
                        holoFrontMat.opacity = foilAlpha
                        holoBackMat.opacity = foilAlpha
                        holoFrontMat.emissiveIntensity = glow
                        holoBackMat.emissiveIntensity = glow
                        holoFrontMat.iridescenceThicknessRange = thick
                        holoBackMat.iridescenceThicknessRange = thick
                        edgeHoloMat.emissiveIntensity = 0.18 + 0.55 * sweep
                        edgeHoloMat.iridescenceThicknessRange = thick
                    }
                }

                function frameCamera(): void {
                    const w = Math.max(1, stageEl.clientWidth)
                    const h = Math.max(1, stageEl.clientHeight)
                    renderer.setSize(w, h, false)
                    camera.aspect = w / h
                    camera.position.set(CAM_X, CAM_Y, CAM_Z)
                    camera.lookAt(0, CAM_LOOK_Y, 0)
                    camera.updateProjectionMatrix()
                    camera.updateMatrixWorld(true)
                }

                function pointerNdc(event: PointerEvent): void {
                    const rect = renderer.domElement.getBoundingClientRect()
                    const w = rect.width || 1
                    const h = rect.height || 1
                    pointer.x = ((event.clientX - rect.left) / w) * 2 - 1
                    pointer.y = -((event.clientY - rect.top) / h) * 2 + 1
                }

                function onDown(event: PointerEvent): void {
                    if (freezeRef.current) return
                    pointerNdc(event)
                    raycaster.setFromCamera(pointer, camera)
                    const hits = raycaster.intersectObject(cardMesh, true)
                    if (hits.length === 0) return
                    event.preventDefault()
                    renderer.domElement.setPointerCapture(event.pointerId)
                    grabState.down = true
                    syncCursor()
                    // A grab mid-drop takes over: the drop is done as far as the page is concerned.
                    if (arrival.started) tellPage(true)
                    grabState.pointerId = event.pointerId
                    grabState.lastT = performance.now()
                    grabState.vx = 0
                    grabState.vy = 0
                    grabState.vz = 0
                    grabState.lastNdcX = pointer.x
                    const center = cardCenter()
                    const hit = hits[0].point
                    grabOff.x = center.x - hit.x
                    grabOff.y = center.y - hit.y
                    grabOff.z = center.z - hit.z
                    camera.getWorldDirection(camDir)
                    dragPlane.setFromNormalAndCoplanarPoint(camDir, hit)
                }

                function onMove(event: PointerEvent): void {
                    if (
                        !grabState.down ||
                        event.pointerId !== grabState.pointerId
                    )
                        return
                    pointerNdc(event)
                    raycaster.setFromCamera(pointer, camera)
                    const hit = raycaster.ray.intersectPlane(
                        dragPlane,
                        planeHit
                    )
                    if (!hit) return
                    const travel = stageEl.clientWidth < NARROW_AT ? 0.52 : 1
                    const give = 1 + 0.28 * SWING_STRENGTH
                    const maxR = SEG_LEN * JOINTS * 0.85 * travel * give
                    const tx = hit.x + grabOff.x
                    const ty = hit.y + grabOff.y
                    const tz = clamp(hit.z + grabOff.z, -0.4, 0.4)
                    const restY = clipY - SEG_LEN * JOINTS - drop()
                    const dx = tx
                    const dy = ty - restY
                    const reach = Math.hypot(dx, dy)
                    let gx = tx
                    let gy = ty
                    if (reach > maxR) {
                        gx = (dx / reach) * maxR
                        gy = restY + (dy / reach) * maxR
                    }
                    const now = performance.now()
                    const stepDt = Math.max(DT, (now - grabState.lastT) / 1000)
                    const hole = joints[JOINTS - 1]
                    const nx = gx
                    const ny = gy + drop()
                    const nz = tz
                    grabState.vx = (nx - hole.x) / stepDt
                    grabState.vy = (ny - hole.y) / stepDt
                    grabState.vz = (nz - hole.z) / stepDt
                    const dYaw = (pointer.x - grabState.lastNdcX) * 3.4
                    spinY += dYaw
                    spinVel = dYaw / stepDt
                    grabState.lastNdcX = pointer.x
                    grabState.lastT = now
                    hole.x = nx
                    hole.y = ny
                    hole.z = nz
                    hole.ox = nx
                    hole.oy = ny
                    hole.oz = nz
                }

                function onUp(event: PointerEvent): void {
                    if (
                        !grabState.down ||
                        event.pointerId !== grabState.pointerId
                    )
                        return
                    grabState.down = false
                    probeHover()
                    syncCursor()
                    try {
                        renderer.domElement.releasePointerCapture(
                            event.pointerId
                        )
                    } catch {
                        /* already released */
                    }
                    const travel = stageEl.clientWidth < NARROW_AT ? 0.55 : 1
                    const scale = 0.55 * SWING_STRENGTH * travel
                    const hole = joints[JOINTS - 1]
                    hole.pinned = false
                    const vx = clamp(grabState.vx * scale, -10, 10)
                    const vy = clamp(grabState.vy * scale, -12, 12)
                    const vz = clamp(grabState.vz * scale, -4, 4)
                    hole.ox = hole.x - vx * DT
                    hole.oy = hole.y - vy * DT
                    hole.oz = hole.z - vz * DT
                    spinVel += clamp(-vx * 0.28, -8, 8)
                }

                // Marks the canvas data-beneath-media="true" while the pointer is on the card, clip
                // or strap, so a page cursor (Beneath Reveal's Over media) can treat them as media.
                const hoverTargets = [cardMesh, clipMesh, strapMesh]
                const hoverPointer = new THREE.Vector2()
                // in: a mouse or pen is on the page. touch: the last pointer was a finger, which has no
                // hover to aim with, so the whole stage takes the pointer (a touch screen starts that way).
                const hover = {
                    x: 0,
                    y: 0,
                    in: false,
                    on: false,
                    mark: "",
                    touch: !window.matchMedia("(hover: hover)").matches,
                }

                function aim(clientX: number, clientY: number): void {
                    const rect = renderer.domElement.getBoundingClientRect()
                    hoverPointer.x =
                        ((clientX - rect.left) / (rect.width || 1)) * 2 - 1
                    hoverPointer.y =
                        -((clientY - rect.top) / (rect.height || 1)) * 2 + 1
                    raycaster.setFromCamera(hoverPointer, camera)
                }

                function probeHover(): void {
                    let on = grabState.down
                    if (!on && hover.in) {
                        aim(hover.x, hover.y)
                        // The pointer can be anywhere on the page; only inside the stage is it on the card.
                        on =
                            Math.abs(hoverPointer.x) <= 1 &&
                            Math.abs(hoverPointer.y) <= 1 &&
                            raycaster.intersectObjects(hoverTargets, true)
                                .length > 0
                    }
                    // "true" when it can be pulled, "still" when Motion is off or reduced (media, but no pull).
                    const mark = on
                        ? freezeRef.current
                            ? "still"
                            : "true"
                        : "false"
                    if (on === hover.on && mark === hover.mark) return
                    hover.on = on
                    hover.mark = mark
                    renderer.domElement.setAttribute("data-beneath-media", mark)
                    syncCursor()
                }

                // Grab only over the card, clip or strap; the rest of the stage keeps the page cursor
                // and lets the pointer through, so links and buttons under the stage stay clickable.
                function syncCursor(): void {
                    const el = renderer.domElement
                    el.style.cursor = freezeRef.current
                        ? ""
                        : grabState.down
                          ? "grabbing"
                          : hover.on
                            ? "grab"
                            : ""
                    el.style.pointerEvents =
                        hover.touch || hover.on || grabState.down
                            ? "auto"
                            : "none"
                }

                // Watched on the window: off the card the canvas lets the pointer through, so it sees nothing.
                function onHover(event: PointerEvent): void {
                    if (event.pointerType === "touch") return
                    hover.x = event.clientX
                    hover.y = event.clientY
                    hover.in = true
                    if (hover.touch) {
                        hover.touch = false
                        syncCursor()
                    }
                    probeHover()
                }

                // After a touch the whole stage takes the pointer again, until a mouse or pen moves.
                function onPress(event: PointerEvent): void {
                    if (event.pointerType !== "touch" || hover.touch) return
                    hover.touch = true
                    hover.in = false
                    probeHover()
                    syncCursor()
                }

                // A touch that starts on the card holds the page still; anywhere else the page scrolls.
                function onTouch(event: TouchEvent): void {
                    if (!event.cancelable || freezeRef.current) return
                    const t = event.touches[0]
                    if (!grabState.down && event.type === "touchstart" && t) {
                        aim(t.clientX, t.clientY)
                        if (
                            raycaster.intersectObject(cardMesh, true).length ===
                            0
                        )
                            return
                    } else if (!grabState.down) return
                    event.preventDefault()
                }

                // Off the page, not just from one element to the next.
                function onHoverLeave(event: PointerEvent): void {
                    if (event.relatedTarget) return
                    hover.in = false
                    probeHover()
                }

                paintTicket()
                settle()
                frameCamera()
                if (willDrop) {
                    poseEntrance()
                    arrival.pending = true
                }
                syncVisuals()
                renderer.render(scene, camera)

                let raf = 0
                let last = performance.now()
                const running = { on: false }

                function loop(now: number): void {
                    raf = requestAnimationFrame(loop)
                    const dt = Math.min(0.05, (now - last) / 1000)
                    last = now
                    if (!freezeRef.current) {
                        acc += dt
                        let steps = 0
                        while (acc >= DT && steps < 2) {
                            simulate()
                            acc -= DT
                            steps += 1
                        }
                        if (acc >= DT) acc = 0
                    } else {
                        acc = 0
                        poseHang(0)
                    }
                    syncVisuals()
                    renderer.render(scene, camera)
                    // The card can swing under a still pointer.
                    if (hover.in) probeHover()
                }

                function startLoop(): void {
                    if (running.on) return
                    running.on = true
                    last = performance.now()
                    acc = 0
                    raf = requestAnimationFrame(loop)
                }

                function stopLoop(): void {
                    running.on = false
                    if (raf) cancelAnimationFrame(raf)
                    raf = 0
                }

                const live = { inView: true, pageHidden: document.hidden }

                function shouldRun(): boolean {
                    return !freezeRef.current && live.inView && !live.pageHidden
                }

                function syncLoop(): void {
                    if (shouldRun()) {
                        startLoop()
                        return
                    }
                    stopLoop()
                    presentStill()
                }

                syncLoop()

                const io = new IntersectionObserver(
                    (entries) => {
                        const entry = entries[0]
                        live.inView = Boolean(entry && entry.isIntersecting)
                        syncLoop()
                    },
                    { threshold: 0.01 }
                )
                io.observe(stageEl)

                function onVis(): void {
                    live.pageHidden = document.hidden
                    syncLoop()
                }
                document.addEventListener("visibilitychange", onVis)

                const ro = new ResizeObserver(() => {
                    if (running.on) {
                        frameCamera()
                        return
                    }
                    presentStill()
                })
                ro.observe(stageEl)

                const canvas = renderer.domElement
                // A lost context (GPU reset, too many WebGL views) blanks the canvas: show the flat
                // pass until the browser restores it, then repaint and carry on.
                function onContextLost(event: Event): void {
                    event.preventDefault()
                    stopLoop()
                    fail("context-lost", "")
                    endEntrance()
                }
                // Lost context or Motion turned off mid-entrance: the pass hangs at rest and the page moves on.
                function endEntrance(): void {
                    if (arrival.pending) {
                        arrival.pending = false
                        poseHang(0)
                    }
                    arrival.seg = SEG_LEN
                    tellPage(false)
                }
                function onContextRestored(): void {
                    if (cancelled) return
                    paintTicket()
                    syncLoop()
                    startTransition(() => {
                        setFailure(null)
                        setStatus("ready")
                    })
                }
                canvas.addEventListener("webglcontextlost", onContextLost)
                canvas.addEventListener(
                    "webglcontextrestored",
                    onContextRestored
                )
                canvas.addEventListener("pointerdown", onDown)
                stageEl.addEventListener("touchstart", onTouch, {
                    passive: false,
                })
                stageEl.addEventListener("touchmove", onTouch, {
                    passive: false,
                })
                window.addEventListener("pointermove", onHover)
                window.addEventListener("pointerout", onHoverLeave)
                window.addEventListener("pointerdown", onPress)
                window.addEventListener("pointermove", onMove)
                window.addEventListener("pointerup", onUp)
                window.addEventListener("pointercancel", onUp)
                syncCursor()

                engineRef.current = {
                    paint: paintTicket,
                    freezeChanged: () => {
                        if (freezeRef.current) endEntrance()
                        syncLoop()
                    },
                }

                if (!cancelled) startTransition(() => setStatus("ready"))

                dispose = () => {
                    engineRef.current = null
                    stopLoop()
                    io.disconnect()
                    document.removeEventListener("visibilitychange", onVis)
                    ro.disconnect()
                    canvas.removeEventListener(
                        "webglcontextlost",
                        onContextLost
                    )
                    canvas.removeEventListener(
                        "webglcontextrestored",
                        onContextRestored
                    )
                    canvas.removeEventListener("pointerdown", onDown)
                    stageEl.removeEventListener("touchstart", onTouch)
                    stageEl.removeEventListener("touchmove", onTouch)
                    canvas.removeAttribute("data-beneath-media")
                    window.removeEventListener("pointermove", onHover)
                    window.removeEventListener("pointerout", onHoverLeave)
                    window.removeEventListener("pointerdown", onPress)
                    window.removeEventListener("pointermove", onMove)
                    window.removeEventListener("pointerup", onUp)
                    window.removeEventListener("pointercancel", onUp)
                    cardGeo.dispose()
                    strap.geometry.dispose()
                    badgeClip.geometry.dispose()
                    sleeveGeo.dispose()
                    seamGeo.dispose()
                    seamMat.dispose()
                    wobble?.dispose()
                    wobbleCrisp?.dispose()
                    linen?.dispose()
                    holoGeo.dispose()
                    holoMap.dispose()
                    edgeHoloMap.dispose()
                    holoFrontMat.dispose()
                    holoBackMat.dispose()
                    edgeHoloMat.dispose()
                    frontMaskMap.dispose()
                    backMaskMap.dispose()
                    frontMap.dispose()
                    backMap.dispose()
                    edgeMat.dispose()
                    frontMat.dispose()
                    backMat.dispose()
                    clipMat.dispose()
                    clipSlot.geometry.dispose()
                    ;(clipSlot.material as THREE.Material).dispose()
                    strapMap.dispose()
                    strapMat.dispose()
                    sleeveMat.dispose()
                    clipMesh.geometry.dispose()
                    renderer.dispose()
                    if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
                }
                if (cancelled) dispose()
            } catch (error) {
                // A half-built engine must not leave a blank canvas or a live GPU context behind.
                if (built && !dispose) {
                    built.forceContextLoss()
                    built.dispose()
                    built.domElement.remove()
                }
                fail(
                    "setup",
                    error instanceof Error ? error.message : String(error)
                )
                tellPage(false)
            }
        })()

        return () => {
            cancelled = true
            dispose?.()
        }
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return
        let cancelled = false
        const settle = (key: ArtKey, failed: ArtFailure | null): void => {
            startTransition(() => {
                setArtTick((tick) => tick + 1)
                setArtFailures((prev) => {
                    if ((prev[key] ?? null) === failed) return prev
                    const next = { ...prev }
                    if (failed) next[key] = failed
                    else delete next[key]
                    return next
                })
            })
        }
        const ready = artReadyRef.current
        ready.failed = false
        const load = (src: string | null, key: ArtKey): void => {
            ready[key] = false
            if (!src) {
                artRef.current[key] = null
                engineRef.current?.paint()
                ready[key] = true
                settle(key, null)
                return
            }
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => {
                if (cancelled) return
                artRef.current[key] = img
                engineRef.current?.paint()
                ready[key] = true
                settle(key, null)
            }
            img.onerror = () => {
                if (cancelled) return
                artRef.current[key] = null
                engineRef.current?.paint()
                ready.failed = true
                // The same URL without crossOrigin tells a blocked host (CORS) from a broken link.
                const plain = new Image()
                plain.onload = () => {
                    if (!cancelled) settle(key, "cors")
                }
                plain.onerror = () => {
                    if (!cancelled) settle(key, "unreachable")
                }
                plain.src = src
            }
            img.src = src
        }
        load(logoSrc, "logo")
        load(photoSrc, "photo")
        load(backArtSrc, "backArt")
        return () => {
            cancelled = true
        }
    }, [logoSrc, photoSrc, backArtSrc])

    useEffect(() => {
        if (status === "fail") paintFlat()
    }, [status, artTick])

    useEffect(() => {
        engineRef.current?.paint()
        paintFlat()
    }, [
        attendeeName,
        ticketType,
        ticketNumber,
        eventName,
        eventDate,
        barcodeValue,
        paper,
        ink,
        accent,
        reverse,
        strapColor,
        strapStyle,
        strapText,
        foil,
        finish,
        sleeveOn,
        sleeveTexture,
        padding,
        stackGap,
        typeKey,
        photoFit,
        backArtSrc,
        lightAngle,
        lightHeight,
        lightIntensity,
        rimOn,
        depth,
        size,
    ])

    useEffect(() => {
        if (typeof document === "undefined") return
        if (!document.fonts?.load) {
            artReadyRef.current.type = true
            return
        }
        artReadyRef.current.type = false
        let cancelled = false
        const specs = [nameFont, metaFont, numberFont].map((font, i) => {
            const fallback = i === 0 ? 108 : i === 1 ? 22 : 48
            const min = i === 0 ? NAME_MIN : i === 1 ? META_MIN : NUM_MIN
            const max = i === 0 ? NAME_MAX : i === 1 ? META_MAX : NUM_MAX
            const px = parsePx(font.fontSize, fallback, min, max)
            return `${fontStyleOf(font)} ${fontWeightOf(font, 400)} ${px}px ${fontFamilyOf(font)}`
        })
        void Promise.all(specs.map((spec) => document.fonts.load(spec))).then(
            () => {
                if (cancelled) return
                engineRef.current?.paint()
                paintFlat()
                artReadyRef.current.type = true
            }
        )
        return () => {
            cancelled = true
        }
    }, [typeKey])

    useEffect(() => {
        engineRef.current?.freezeChanged()
    }, [freeze])

    const missing = (Object.keys(artFailures) as ArtKey[]).flatMap((key) => {
        const failed = artFailures[key]
        return failed ? [{ key, failed }] : []
    })
    // Notes for the editor: the canvas only, never the published site.
    const notes = isStatic
        ? [
              ...(failure ? [failureNote(failure)] : []),
              ...missing.map(({ key, failed }) => artNote(key, failed)),
          ]
        : []
    // Loading is seen and read; the fallback reason is read only (the flat pass already shows it).
    const statusText = !mounted
        ? ""
        : status === "boot"
          ? "Loading pass"
          : status === "fail"
            ? fallbackStatus(failure)
            : ""

    return (
        <div
            ref={rootRef}
            data-lanyard-stage="true"
            data-lanyard-state={status}
            data-lanyard-error={failure?.reason}
            data-lanyard-missing={
                missing.length
                    ? missing
                          .map(({ key, failed }) => `${key}:${failed}`)
                          .join(" ")
                    : undefined
            }
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: stageH,
                overflow: "hidden",
                background: "transparent",
                touchAction: "manipulation",
                userSelect: "none",
            }}
        >
            {/* The pass as one image, beside the status region (an img role hides its children).
                The canvases draw it and stay hidden from assistive tech. */}
            <div
                role="img"
                aria-label={`${eventName ?? "Event"} pass for ${attendeeName}`}
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                }}
            />
            {status === "fail" ? (
                <canvas
                    ref={flatRef}
                    width={TEX_W}
                    height={TEX_H}
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        height: "56%",
                        transform: "translate(-50%, -46%)",
                        borderRadius: "3.5% / 2.6%",
                        boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)",
                        pointerEvents: "none",
                    }}
                />
            ) : null}
            {notes.length ? (
                <div
                    style={{
                        position: "absolute",
                        left: 8,
                        right: 8,
                        bottom: 8,
                        zIndex: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "#1D1D1F",
                        color: "#FFFFFF",
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 12,
                        lineHeight: 1.4,
                        pointerEvents: "none",
                    }}
                >
                    {notes.map((note) => (
                        <span key={note}>{note}</span>
                    ))}
                </div>
            ) : null}
            <div
                role="status"
                aria-live="polite"
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    opacity: status === "boot" ? 1 : 0,
                    color: ink,
                    fontFamily: fontFamilyOf(metaFont),
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    // Only the visible label is set in capitals; the read-only reason stays plain.
                    textTransform: status === "boot" ? "uppercase" : "none",
                }}
            >
                {statusText}
            </div>
        </div>
    )
}


Kern_LanyardPass.displayName = "Lanyard Pass"
registerLanyardControls(Kern_LanyardPass)
