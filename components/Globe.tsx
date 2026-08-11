"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

const regions = [
  { name: 'India', lat: 22.5, lon: 79, scale: 1.08 },
  { name: 'United States', lat: 39, lon: -98, scale: 1.02 },
  { name: 'Canada', lat: 57, lon: -106, scale: .88 },
  { name: 'United Kingdom', lat: 54, lon: -3, scale: .8 },
  { name: 'Australia', lat: -25, lon: 133, scale: .82 },
  { name: 'Germany', lat: 51, lon: 10, scale: .7 },
  { name: 'Japan', lat: 36, lon: 138, scale: .72 },
  { name: 'Brazil', lat: -10, lon: -52, scale: .9 },
];

function latLon(lat:number, lon:number, r=2.03) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function RegionMarker({ region, selected, onClick }: { region: typeof regions[0], selected:boolean, onClick:()=>void }) {
  const ref = useRef<THREE.Mesh>(null);
  const pos = latLon(region.lat, region.lon);
  useFrame(({ clock }) => { if (ref.current) { const s = selected ? 1.28 + Math.sin(clock.elapsedTime * 4) * .08 : 1; ref.current.scale.setScalar(s * region.scale); } });
  return <mesh ref={ref} position={pos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
    <sphereGeometry args={[selected ? .105 : .055, 16, 16]} /><meshStandardMaterial color={selected ? '#0f9f6e' : '#6f8b83'} emissive={selected ? '#0f9f6e' : '#24443c'} emissiveIntensity={selected ? 1.5 : .3} />
  </mesh>;
}

function GlobeScene({ selected, onSelect }: { selected:string, onSelect:(name:string)=>void }) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const dragging = useRef(false); const last = useRef({x:0,y:0});
  useEffect(() => { camera.position.set(0, .15, 6.1); }, [camera]);
  useFrame(() => { if (group.current && !dragging.current) group.current.rotation.y += .0018; });
  return <group ref={group} onPointerDown={(e) => { dragging.current=true; last.current={x:e.clientX,y:e.clientY}; }} onPointerUp={() => dragging.current=false} onPointerMove={(e) => { if (!dragging.current || !group.current) return; group.current.rotation.y += (e.clientX-last.current.x)*.006; group.current.rotation.x += (e.clientY-last.current.y)*.003; group.current.rotation.x=Math.max(-.65,Math.min(.65,group.current.rotation.x)); last.current={x:e.clientX,y:e.clientY}; }}>
    <mesh><sphereGeometry args={[2, 64, 64]} /><meshStandardMaterial color="#eaf2ef" roughness={1} metalness={0} /></mesh>
    <mesh><sphereGeometry args={[2.015, 48, 48]} /><meshBasicMaterial color="#6e8e83" wireframe transparent opacity={.17} /></mesh>
    <mesh><sphereGeometry args={[2.03, 96, 96]} /><meshBasicMaterial color="#b9d0c8" transparent opacity={.06} wireframe /></mesh>
    {regions.map(r => <RegionMarker key={r.name} region={r} selected={selected===r.name} onClick={() => onSelect(r.name)} />)}
  </group>;
}

export default function Globe({ location, onLocation }: { location:string, onLocation:(name:string)=>void }) {
  return <div className="globe"><Canvas camera={{ position:[0,.15,6.1], fov:35 }}><ambientLight intensity={2.2}/><directionalLight position={[4,3,5]} intensity={2.5}/><GlobeScene selected={location} onSelect={onLocation}/></Canvas><div className="globe-overlay"><span>LIVE REGION SELECTOR</span><b>{location}</b></div></div>;
}