/* Verlet particles and reusable strap geometry helpers. */
import * as THREE from "three"
import type { ThreeNS } from "./config"

export function applyMaxDist(a: Particle, b: Particle, maxDist: number): void {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dz = b.z - a.z
    const dist = Math.hypot(dx, dy, dz)
    if (dist <= maxDist || dist < 1e-8) return
    const frac = (dist - maxDist) / dist
    const ox = dx * frac
    const oy = dy * frac
    const oz = dz * frac
    if (a.pinned && b.pinned) return
    if (a.pinned) {
        b.x -= ox
        b.y -= oy
        b.z -= oz
        return
    }
    if (b.pinned) {
        a.x += ox
        a.y += oy
        a.z += oz
        return
    }
    a.x += ox * 0.5
    a.y += oy * 0.5
    a.z += oz * 0.5
    b.x -= ox * 0.5
    b.y -= oy * 0.5
    b.z -= oz * 0.5
}

export function applyMinDist(a: Particle, b: Particle, minDist: number): void {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dz = b.z - a.z
    const dist = Math.hypot(dx, dy, dz)
    if (dist >= minDist || dist < 1e-8) return
    const frac = (minDist - dist) / dist
    const ox = dx * frac
    const oy = dy * frac
    const oz = dz * frac
    if (a.pinned && b.pinned) return
    if (a.pinned) {
        b.x += ox
        b.y += oy
        b.z += oz
        return
    }
    if (b.pinned) {
        a.x -= ox
        a.y -= oy
        a.z -= oz
        return
    }
    a.x -= ox * 0.5
    a.y -= oy * 0.5
    a.z -= oz * 0.5
    b.x += ox * 0.5
    b.y += oy * 0.5
    b.z += oz * 0.5
}

export interface Particle {
    x: number
    y: number
    z: number
    ox: number
    oy: number
    oz: number
    pinned: boolean
}

export function particle(x: number, y: number, z: number, pinned = false): Particle {
    return { x, y, z, ox: x, oy: y, oz: z, pinned }
}

export function integrateParticle(
    p: Particle,
    dt: number,
    grav: number,
    damp: number
): void {
    if (p.pinned) {
        p.ox = p.x
        p.oy = p.y
        p.oz = p.z
        return
    }
    const vx = (p.x - p.ox) * damp
    const vy = (p.y - p.oy) * damp
    const vz = (p.z - p.oz) * damp
    p.ox = p.x
    p.oy = p.y
    p.oz = p.z
    p.x += vx
    p.y += vy + grav * dt * dt
    p.z += vz
}

export function makeTubeGeometry(
    three: ThreeNS,
    pathSegs: number,
    radialSegs: number
): {
    geometry: THREE.BufferGeometry
    positions: Float32Array
    normals: Float32Array
    pathSegs: number
    radialSegs: number
} {
    const geometry = new three.BufferGeometry()
    const rings = pathSegs + 1
    const cols = radialSegs + 1
    const positions = new Float32Array(rings * cols * 3)
    const normals = new Float32Array(rings * cols * 3)
    const uvs = new Float32Array(rings * cols * 2)
    const index: number[] = []
    for (let i = 0; i <= pathSegs; i++) {
        for (let j = 0; j <= radialSegs; j++) {
            const u = i * cols + j
            uvs[u * 2] = j / radialSegs
            uvs[u * 2 + 1] = i / pathSegs
        }
    }
    for (let i = 0; i < pathSegs; i++) {
        for (let j = 0; j < radialSegs; j++) {
            const a = i * cols + j
            const b = (i + 1) * cols + j
            const c = (i + 1) * cols + j + 1
            const d = i * cols + j + 1
            index.push(a, b, d, b, c, d)
        }
    }
    geometry.setAttribute("position", new three.BufferAttribute(positions, 3))
    geometry.setAttribute("normal", new three.BufferAttribute(normals, 3))
    geometry.setAttribute("uv", new three.BufferAttribute(uvs, 2))
    geometry.setIndex(index)
    return { geometry, positions, normals, pathSegs, radialSegs }
}

export function updateWebbing(
    three: ThreeNS,
    points: THREE.Vector3[],
    camera: THREE.Camera,
    clipSideWorld: THREE.Vector3,
    halfW: number,
    halfT: number,
    strap: {
        geometry: THREE.BufferGeometry
        positions: Float32Array
        normals: Float32Array
        pathSegs: number
        radialSegs: number
    }
): void {
    if (points.length < 2) return
    const curve = new three.CatmullRomCurve3(points, false, "catmullrom", 0.45)
    const cols = strap.radialSegs + 1
    const tan = new three.Vector3()
    const view = new three.Vector3()
    const sideCam = new three.Vector3()
    const sideClip = new three.Vector3()
    const side = new three.Vector3()
    const bin = new three.Vector3()
    const n = new three.Vector3()
    for (let i = 0; i <= strap.pathSegs; i++) {
        const t = i / strap.pathSegs
        const p = curve.getPoint(t)
        tan.copy(curve.getTangent(t))
        if (tan.lengthSq() < 1e-8) tan.set(0, -1, 0)
        else tan.normalize()
        view.subVectors(camera.position, p)
        if (view.lengthSq() < 1e-8) view.set(0, 0, 1)
        else view.normalize()
        sideCam.crossVectors(tan, view)
        if (sideCam.lengthSq() < 1e-8) {
            sideCam.set(1, 0, 0)
            sideCam.cross(tan)
        }
        if (sideCam.lengthSq() < 1e-8) sideCam.set(1, 0, 0)
        else sideCam.normalize()
        sideClip.copy(clipSideWorld)
        sideClip.addScaledVector(tan, -sideClip.dot(tan))
        if (sideClip.lengthSq() < 1e-8) sideClip.copy(sideCam)
        else sideClip.normalize()
        if (sideClip.dot(sideCam) < 0) sideClip.negate()
        const twist = t < 0.55 ? 0 : (t - 0.55) / 0.45
        const k = twist * twist * (3 - 2 * twist)
        side.lerpVectors(sideCam, sideClip, k)
        if (side.lengthSq() < 1e-8) side.copy(sideCam)
        else side.normalize()
        bin.crossVectors(tan, side).normalize()
        for (let j = 0; j <= strap.radialSegs; j++) {
            const v = (j / strap.radialSegs) * Math.PI * 2
            const cx = Math.cos(v)
            const sy = Math.sin(v)
            n.set(
                (cx / halfW) * side.x + (sy / halfT) * bin.x,
                (cx / halfW) * side.y + (sy / halfT) * bin.y,
                (cx / halfW) * side.z + (sy / halfT) * bin.z
            )
            if (n.lengthSq() < 1e-8) n.copy(side)
            else n.normalize()
            const o = (i * cols + j) * 3
            strap.positions[o] = p.x + cx * side.x * halfW + sy * bin.x * halfT
            strap.positions[o + 1] =
                p.y + cx * side.y * halfW + sy * bin.y * halfT
            strap.positions[o + 2] =
                p.z + cx * side.z * halfW + sy * bin.z * halfT
            strap.normals[o] = n.x
            strap.normals[o + 1] = n.y
            strap.normals[o + 2] = n.z
        }
    }
    const pos = strap.geometry.getAttribute("position")
    const nor = strap.geometry.getAttribute("normal")
    pos.needsUpdate = true
    nor.needsUpdate = true
    strap.geometry.computeBoundingSphere()
}

/**
 * Lanyard Pass
 *
 * Ticket badge on a hanging rope lanyard. Grab, throw, bounce.
 *
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 640
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
