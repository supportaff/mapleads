"use client";
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import countries from 'world-atlas/countries-110m.json';
const GlobeGL = dynamic(() => import('react-globe.gl'), { ssr:false });
type Props={location:string;onLocation:(name:string)=>void};
type CountryFeature=Feature<Geometry,{name?:string;NAME?:string;ADMIN?:string;NAME_EN?:string}>;
type Topology={type:'Topology';objects:{countries:unknown};arcs:unknown[];transform?:unknown};
const fallbackNames:Record<string,string>={'356':'India','840':'United States','124':'Canada','826':'United Kingdom','36':'Australia','276':'Germany','392':'Japan','76':'Brazil','156':'China'};
const centers:Record<string,[number,number,number]>={India:[78.96,20.59,2.15],'United States':[-100,39,1.65],Canada:[-106,57,1.45],'United Kingdom':[-3,55,3.7],Australia:[134,-25,1.9],Germany:[10.4,51.2,4],France:[2,46,3.1],Singapore:[103.8,1.35,12],Japan:[138,36,2.9],China:[104,35,1.75],Brazil:[-52,-10,1.5],'United Arab Emirates':[54,24,6],'Saudi Arabia':[45,24,2.8],'South Africa':[24,-30,2]};
export default function Globe({location,onLocation}:Props){
 const ref=useRef<any>(null);const [recent,setRecent]=useState<string[]>([]);
 const geo=useMemo(()=>{const t=countries as unknown as Topology;const c=feature(t as never,t.objects.countries as never) as unknown as FeatureCollection<Geometry,Record<string,unknown>>;return c.features as CountryFeature[]},[]);
 const nameOf=(d:object)=>{const p=(d as CountryFeature).properties||{};return p.name||p.NAME||p.ADMIN||p.NAME_EN||fallbackNames[String((d as CountryFeature).id??'')]||'Region'};
 const selected=(d:object)=>nameOf(d).toLowerCase()===location.toLowerCase();
 const choose=(name:string)=>{setRecent(r=>[name,...r.filter(x=>x!==name)].slice(0,5));onLocation(name)};
 useEffect(()=>{const [lng,lat,alt]=centers[location]||[0,20,1.8];ref.current?.pointOfView({lat,lng,altitude:alt},900);setRecent(r=>[location,...r.filter(x=>x!==location)].slice(0,5))},[location]);
 return <div className="globe flat-map"><GlobeGL ref={ref} backgroundColor="rgba(255,255,255,0)" globeImageUrl="" showGlobe={false} polygonsData={geo} polygonAltitude={(d:object)=>selected(d)?0.012:0.002} polygonCapColor={(d:object)=>selected(d)?'#c8f0df':'#fff'} polygonSideColor={(d:object)=>selected(d)?'#0f9f6e':'#d9ebe4'} polygonStrokeColor={(d:object)=>selected(d)?'#087c56':'#83bda7'} polygonLabel={(d:object)=>`<div style="font-family:system-ui;padding:7px 10px;border:1px solid #d7e8e0;border-radius:8px;background:#fff;color:#17352b"><b>${nameOf(d)}</b><br><small>Click to select</small></div>`} onPolygonClick={(d:object)=>choose(nameOf(d))} polygonsTransitionDuration={180} showAtmosphere={false} enablePointerInteraction animateIn={false} rendererConfig={{antialias:true,alpha:true}}/><div className="globe-overlay"><span>SELECT A REGION</span><b>{location}</b><small>Click a bordered country or use the selector. The map focuses automatically.</small></div><div className="map-tools"><button className="world-reset" onClick={()=>ref.current?.pointOfView({lat:20,lng:0,altitude:1.8},900)}>⌖ World view</button><div className="recent-title">RECENT REGIONS</div><div className="recent-list">{recent.map(r=><button key={r} className={r===location?'recent active':'recent'} onClick={()=>choose(r)}>{r}</button>)}</div></div><div className="map-legend"><span><i className="legend-dot selected-dot"/> Selected</span><span><i className="legend-dot border-dot"/> Available</span></div></div>;
}