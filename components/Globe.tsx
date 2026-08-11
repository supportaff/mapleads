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
  '356': 'India', '840': 'United States', '124': 'Canada', '826': 'United Kingdom', '36': 'Australia', '276': 'Germany', '392': 'Japan', '76': 'Brazil', '156': 'China'
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
    return fallbackNames[String((d as CountryFeature).id ?? '')] || 'Region';
  };
  const isSelected = (d: object) => nameOf(d).toLowerCase() === location.toLowerCase();

  return <div className="globe flat-map">
    <GlobeGL
      backgroundColor="rgba(255,255,255,0)"
      globeImageUrl=""
      showGlobe={false}
      polygonsData={geo}
      polygonAltitude={(d: object) => isSelected(d) ? 0.012 : 0.002}
      polygonCapColor={(d: object) => isSelected(d) ? '#c8f0df' : '#ffffff'}
      polygonSideColor={(d: object) => isSelected(d) ? '#0f9f6e' : '#d9ebe4'}
      polygonStrokeColor={(d: object) => isSelected(d) ? '#087c56' : '#83bda7'}
      polygonLabel={(d: object) => `<div style="font-family:system-ui;padding:7px 10px;border:1px solid #d7e8e0;border-radius:8px;background:#fff;color:#17352b"><b>${nameOf(d)}</b><br><small>Click to select this region</small></div>`}
      onPolygonClick={(d: object) => onLocation(nameOf(d))}
      onPolygonHover={() => {}}
      polygonsTransitionDuration={180}
      showAtmosphere={false}
      enablePointerInteraction
      animateIn={false}
      rendererConfig={{ antialias: true, alpha: true }}
    />
    <div className="globe-overlay"><span>SELECT A REGION</span><b>{location}</b><small>Choose a country from the list or click its border on the map</small></div>
  </div>;
}