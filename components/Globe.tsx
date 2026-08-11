"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import countries from 'world-atlas/countries-110m.json';

const GlobeGL = dynamic(() => import('react-globe.gl'), { ssr: false });

type Props = { location: string; onLocation: (name: string) => void };
type CountryFeature = Feature<Geometry, { name?: string; NAME?: string; ADMIN?: string; NAME_EN?: string }>;
type Topology = { type: 'Topology'; objects: { countries: unknown }; arcs: unknown[]; transform?: unknown };

const fallbackNames: Record<string, string> = {
  '356': 'India', '840': 'United States', '124': 'Canada', '826': 'United Kingdom',
  '36': 'Australia', '276': 'Germany', '392': 'Japan', '76': 'Brazil', '156': 'China'
};

export default function Globe({ location, onLocation }: Props) {
  const geo = useMemo(() => {
    const topology = countries as unknown as Topology;
    const collection = feature(topology as never, topology.objects.countries as never) as unknown as FeatureCollection<Geometry, Record<string, unknown>>;
    return collection.features as CountryFeature[];
  }, []);

  const nameOf = (d: object) => {
    const p = (d as CountryFeature).properties || {};
    const raw = p.name || p.NAME || p.ADMIN || p.NAME_EN;
    if (raw) return raw;
    const id = String((d as CountryFeature).id ?? '');
    return fallbackNames[id] || `Region ${id}`;
  };

  const isSelected = (d: object) => nameOf(d).toLowerCase() === location.toLowerCase();

  return <div className="globe">
    <GlobeGL
      backgroundColor="rgba(255,255,255,0)"
      globeImageUrl=""
      showGlobe={false}
      polygonsData={geo}
      polygonAltitude={(d: object) => isSelected(d) ? 0.035 : 0.008}
      polygonCapColor={(d: object) => isSelected(d) ? '#b8ead7' : '#ffffff'}
      polygonSideColor={(d: object) => isSelected(d) ? '#0f9f6e' : '#d4e4de'}
      polygonStrokeColor={(d: object) => isSelected(d) ? '#087c56' : '#7fb6a1'}
      polygonLabel={(d: object) => `<div style="font-family:system-ui;padding:7px 10px;border:1px solid #d7e8e0;border-radius:8px;background:#fff;color:#17352b"><b>${nameOf(d)}</b><br><small>Click to select this region</small></div>`}
      onPolygonClick={(d: object) => onLocation(nameOf(d))}
      onPolygonHover={() => {}}
      polygonsTransitionDuration={180}
      showAtmosphere={false}
      enablePointerInteraction
      animateIn
      rendererConfig={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
    />
    <div className="globe-overlay"><span>SELECT A REGION</span><b>{location}</b><small>Click a bordered region to search it</small></div>
  </div>;
}