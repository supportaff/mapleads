"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import countries from 'world-atlas/countries-110m.json';

const GlobeGL = dynamic(() => import('react-globe.gl'), { ssr: false });

type Props = { location: string; onLocation: (name: string) => void };
type CountryFeature = Feature<Geometry, { name?: string; NAME?: string; ADMIN?: string }>;

type Topology = { type: 'Topology'; objects: { countries: unknown }; arcs: unknown[]; transform?: unknown };

export default function Globe({ location, onLocation }: Props) {
  const geo = useMemo(() => {
    const topology = countries as unknown as Topology;
    const collection = feature(topology as never, topology.objects.countries as never) as unknown as FeatureCollection<Geometry, Record<string, unknown>>;
    return collection.features as CountryFeature[];
  }, []);

  const nameOf = (d: object) => {
    const p = (d as CountryFeature).properties || {};
    return p.name || p.NAME || p.ADMIN || 'Region';
  };

  return <div className="globe">
    <GlobeGL
      backgroundColor="rgba(0,0,0,0)"
      polygonsData={geo}
      polygonAltitude={(d: object) => nameOf(d) === location ? 0.055 : 0.012}
      polygonCapColor={(d: object) => nameOf(d) === location ? '#0f9f6e' : '#e6efeb'}
      polygonSideColor={() => '#b7cbc3'}
      polygonStrokeColor={() => '#ffffff'}
      polygonLabel={(d: object) => `<b>${nameOf(d)}</b>`}
      onPolygonClick={(d: object) => onLocation(nameOf(d))}
      polygonsTransitionDuration={250}
      showAtmosphere
      atmosphereColor="#8bb9aa"
      atmosphereAltitude={0.12}
      enablePointerInteraction
      animateIn
      rendererConfig={{ antialias: true, alpha: true }}
    />
    <div className="globe-overlay"><span>LIVE REGION SELECTOR</span><b>{location}</b></div>
  </div>;
}