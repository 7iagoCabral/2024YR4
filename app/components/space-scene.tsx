"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Stars, Html } from "@react-three/drei"
import * as THREE from "three"
import { getNeoData } from "../actions"
import { TrajectoryLine } from "./trajectory-line"

function Earth() {
  const earthTexture = useLoader(THREE.TextureLoader, "/assets/3d/texture_earth.jpg")
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={earthTexture} />
    </mesh>
  )
}

function SimulatedAsteroid() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [time, setTime] = useState(0)
  const startPosition: [number, number, number] = [8, 4, -8]
  const impactPosition: [number, number, number] = [0, 0, 0]

  useFrame((state) => {
    if (meshRef.current) {
      setTime((t) => t + 0.001)

      // Calculate position along trajectory
      const progress = (Math.sin(time) + 1) / 2 // Oscillate between 0 and 1
      meshRef.current.position.x = THREE.MathUtils.lerp(startPosition[0], impactPosition[0], progress)
      meshRef.current.position.y = THREE.MathUtils.lerp(startPosition[1], impactPosition[1], progress)
      meshRef.current.position.z = THREE.MathUtils.lerp(startPosition[2], impactPosition[2], progress)

      // Rotate the asteroid
      meshRef.current.rotation.x += 0.02
      meshRef.current.rotation.y += 0.02
    }
  })

  return (
    <>
      <TrajectoryLine startPoint={startPosition} endPoint={impactPosition} />
      <group>
        <mesh ref={meshRef} position={startPosition}>
          <octahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial color="red" roughness={0.7} />
        </mesh>
        <Html
          position={[startPosition[0], startPosition[1] + 0.5, startPosition[2]]}
          center
          className="pointer-events-none"
        >
          <div className="bg-black/75 text-red-500 px-2 py-1 rounded text-sm whitespace-nowrap">
            Simulated Trajectory
          </div>
        </Html>
      </group>
    </>
  )
}

function Asteroid({ position, size, name }: { position: [number, number, number]; size: number; name: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color="gray" roughness={0.8} metalness={0.2} />
      </mesh>
      <Html position={[position[0], position[1] + 0.5, position[2]]} center className="pointer-events-none">
        <div className="bg-black/75 text-white px-2 py-1 rounded text-sm whitespace-nowrap">{name}</div>
      </Html>
    </group>
  )
}

function AsteroidField() {
  const [asteroids, setAsteroids] = useState<
    Array<{
      name: string
      distance: number
      diameter: number
      position: [number, number, number]
    }>
  >([])

  useEffect(() => {
    getNeoData().then((neos) => {
      const processedAsteroids = neos.map((neo) => {
        // Convert astronomical units to a reasonable scale for visualization
        const distance = neo.distance * 3 + 2 // Scale and offset from Earth
        const angle = Math.random() * Math.PI * 2

        return {
          name: neo.name,
          distance: neo.distance,
          diameter: neo.diameter,
          position: [Math.cos(angle) * distance, (Math.random() - 0.5) * 2, Math.sin(angle) * distance] as [
            number,
            number,
            number,
          ],
        }
      })
      setAsteroids(processedAsteroids)
    })
  }, [])

  return (
    <>
      {asteroids.map((asteroid, index) => (
        <Asteroid
          key={index}
          position={asteroid.position}
          size={asteroid.diameter * 0.1} // Scale down the actual diameter for visualization
          name={asteroid.name}
        />
      ))}
    </>
  )
}

export default function SpaceScene() {
  return (
    <div className="w-full h-screen bg-black relative">
      <div className="absolute top-4 left-4 z-10 bg-black/75 text-white p-4 rounded-lg max-w-md">
        <h1 className="text-xl font-bold mb-2">Space Visualization</h1>
        <p className="text-sm text-gray-300">
          This is an educational visualization showing real near-Earth asteroids (in gray) and a simulated trajectory
          (in red). The red trajectory is purely for demonstration purposes and does not represent any real threat.
        </p>
      </div>
      <Canvas camera={{ position: [0, 2, 5] }}>
        <color attach="background" args={["#000010"]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
        <Earth />
        <AsteroidField />
        <SimulatedAsteroid />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  )
}

