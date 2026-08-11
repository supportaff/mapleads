"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import countries from "world-atlas/countries-110m.json";

type Lead={name:string;lat:number|null;lng:number|null;rating:number|null;review_count:number;city:string;state:string;domain:string};
type Props={location:string;onLocation:(name:string)=>void;leads?:Lead[]};
type Country={type:"Feature";id?:string|number;properties?:Record<string,any>;geometry:any};
const names:Record<string,string>={"356":"India","840":"United States","124":"Canada","826":"United Kingdom","36":"Australia","276":"Germany","392":"Japan","76":"Brazil","156":"China"};
const focus:Record<string,[number,number]>={India:[78.9,20.5],"United States":[-100,39],Canada:[-106,57],"United Kingdom":[-3,55],Australia:[134,-25],Germany:[10.4,51.2],France:[2,46],Singapore:[103.8,1.35],Japan:[138,36],China:[104,35],Brazil:[-52,-10],"United Arab Emirates":[54,24],"Saudi Arabia":[45,24],"South Africa":[24,-30]};

export default function Globe({location,onLocation,leads=[]}:Props){
 const [rotation,setRotation]=useState<[number,number]>([0,0]);
 const [zoom,setZoom]=useState(1);
 const [hover,setHover]=useState("");
 const [playing,setPlaying]=useState(true);
 const [drag,setDrag]=useState(false);
 const start=useRef({x:0,y:0,lon:0,lat:0});
 const frame=useRef<number|null>(null);
 const geo=useMemo(()=>((feature(countries as any,(countries as any).objects.countries) as any).features as Country[]),[]);
 const width=900,height=620,cx=450,cy=310,base=245;
 const projection=useMemo(()=>geoOrthographic().translate([cx,cy]).scale(base*zoom).clipAngle(90).rotate([-rotation[0],-rotation[1],0]),[rotation,zoom]);
 const path=useMemo(()=>geoPath(projection),[projection]);
 const countryName=(g:Country)=>String(g.properties?.name||g.properties?.NAME||g.properties?.ADMIN||names[String(g.id??"")]||"Region");
 useEffect(()=>{const f=focus[location];if(f){setRotation([f[0],f[1]]);setZoom(1.18)}},[location]);
 useEffect(()=>{if(!playing||drag)return;let last=performance.now();const tick=(now:number)=>{const dt=Math.min(50,now-last);last=now;setRotation(r=>[r[0]+dt*0.0045,r[1]]);frame.current=requestAnimationFrame(tick)};frame.current=requestAnimationFrame(tick);return()=>{if(frame.current)cancelAnimationFrame(frame.current)}},[playing,drag]);
 const pointerDown=(e:React.PointerEvent<SVGSVGElement>)=>{setDrag(true);e.currentTarget.setPointerCapture(e.pointerId);start.current={x:e.clientX,y:e.clientY,lon:rotation[0],lat:rotation[1]};setPlaying(false)};
 const pointerMove=(e:React.PointerEvent<SVGSVGElement>)=>{if(!drag)return;const dx=e.clientX-start.current.x,dy=e.clientY-start.current.y;setRotation([start.current.lon-dx*0.32,Math.max(-75,Math.min(75,start.current.lat+dy*0.22))])};
 const pointerUp=()=>setDrag(false);
 const reset=()=>{setPlaying(false);setRotation([0,0]);setZoom(1)};
 const wheel=(e:React.WheelEvent<SVGSVGElement>)=>{e.preventDefault();setZoom(z=>Math.max(.72,Math.min(2.7,z*(e.deltaY<0?1.08:.92))))};
 return <div className="globe-canvas" style={{position:"relative",width:"100%",height:"100%",touchAction:"none"}}>
  <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={wheel} style={{display:"block",cursor:drag?"grabbing":"grab"}}>
   <defs><radialGradient id="globeGlow"><stop offset="0" stopColor="#eafff6"/><stop offset=".78" stopColor="#d5f6e8"/><stop offset="1" stopColor="#b8ead6"/></radialGradient><filter id="shadow"><feDropShadow dx="0" dy="14" stdDeviation="18" floodOpacity=".12"/></filter></defs>
   <circle cx={cx} cy={cy} r={base*zoom+12} fill="#d8f4e9" opacity=".55" filter="url(#shadow)"/>
   <circle cx={cx} cy={cy} r={base*zoom} fill="url(#globeGlow)" stroke="#72c6a6" strokeWidth="1.2"/>
   {geo.map(g=>{const d=path(g as any);if(!d)return null;const n=countryName(g);const selected=n.toLowerCase()===location.toLowerCase();return <path key={String(g.id)} d={d} onPointerEnter={()=>setHover(n)} onPointerLeave={()=>setHover("")} onClick={(e)=>{e.stopPropagation();setPlaying(false);onLocation(n);const f=focus[n];if(f){setRotation(f);setZoom(1.22)}}} fill={selected?"#79d6ad":"#ffffff"} stroke={selected?"#087f68":"#72b89f"} strokeWidth={selected?1.6:.65} style={{transition:"fill .18s,stroke .18s"}} className="country-shape"/>})}
   {leads.filter(l=>l.lat!=null&&l.lng!=null).map((l,i)=>{const p=projection([Number(l.lng),Number(l.lat)]);return p&&Math.abs(Number(p[0])-cx)<base*zoom+.1?<circle key={`${l.name}-${i}`} cx={p[0]} cy={p[1]} r={4.5} fill="#087f68" stroke="#fff" strokeWidth="2"><title>{l.name} · {l.rating??"—"}★ · {l.review_count} reviews</title></circle>:null})}
  </svg>
  <div className="globe-overlay"><span>{leads.length?"LIVE DISCOVERY GLOBE":"EXPLORE THE WORLD"}</span><b>{location}</b><small>{hover?`Hovering ${hover}`:"Drag to rotate · scroll to zoom · click a country"}</small></div>
  <div className="map-tools"><button className="world-reset" onClick={reset}>⌖ Center</button><button className="world-reset" onClick={()=>setPlaying(v=>!v)}>{playing?"❚❚ Pause":"▶ Rotate"}</button>{leads.length>0&&<span className="map-result-badge">● {leads.length} discovered</span>}</div>
  <div className="map-legend"><span><i className="legend-dot selected-dot"/> Selected</span><span><i className="legend-dot border-dot"/> Countries</span>{leads.length>0&&<span><i className="legend-dot lead-dot"/> Leads</span>}</div>
 </div>
}