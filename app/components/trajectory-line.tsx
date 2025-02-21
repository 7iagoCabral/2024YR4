"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function TrajectoryLine({
  startPoint,
  endPoint,
}: {
  startPoint: [number, number, number]
  endPoint: [number, number, number]
}) {
  const points = []
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...startPoint),
    new THREE.Vector3(
      (startPoint[0] + endPoint[0]) * 0.5,
      (startPoint[1] + endPoint[1]) * 0.5 + 1,
      (startPoint[2] + endPoint[2]) * 0.5,
    ),
    new THREE.Vector3(...endPoint),
  ])

  for (let i = 0; i <= 50; i++) {
    points.push(curve.getPoint(i / 50))
  }

  const lineRef = useRef<THREE.Line>(null)
  const dashOffset = useRef(0)

  useFrame(() => {
    if (lineRef.current) {
      dashOffset.current -= 0.01
      lineRef.current.material.dashOffset = dashOffset.current
    }
  })

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineDashedMaterial color="red" dashSize={0.2} gapSize={0.1} opacity={0.7} transparent linewidth={1} />
    </line>
  )
}

