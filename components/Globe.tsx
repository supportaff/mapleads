"use client";
import { Fragment, useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from '@vnedyalk0v/react19-simple-maps';
import countries from 'world-atlas/countries-110m.json';

type Lead={name:string;lat:number|null;lng:number|null;rating:number|null;review_count:number;city:string;state:string;domain:string};
type Props={location:string;onLocation:(name:string)=>void;leads?:Lead[]};
const fallback:Record<string,string>={'356':'India','840':'United States','124':'Canada','826':'United Kingdom','36':'Australia','276':'Germany','392':'Japan','76':'Brazil','156':'China'};
const focus:Record<string,[number,number,number]>={India:[78.96,20.59,1.65],'United States':[-100,39,1.45],Canada:[-106,57,1.3],'United Kingdom':[-3,55,2.2],Australia:[134,-25,1.5],Germany:[10.4,51.2,2],France:[2,46,1.9],Singapore:[103.8,1.35,3.5],Japan:[138,36,1.9],China:[104,35,1.55],Brazil:[-52,-10,1.45],'United Arab Emirates':[54,24,2.6],'Saudi Arabia':[45,24,1.9],'South Africa':[24,-30,1.5]};
export default function Globe({location,onLocation,leads=[]}:Props){
 const [view,setView]=useState<[number,number,number]>([0,20,1]);
 const [hover,setHover]=useState('');
 const [autoRotate,setAutoRotate]=useState(true);
 const [dragging,setDragging]=useState(false);
 useEffect(()=>{if(!autoRotate||dragging)return;const id=window.setInterval(()=>setView(v=>[v[0]+0.18,v[1],v[2]]),45);return()=>window.clearInterval(id)},[autoRotate,dragging]);
 useEffect(()=>{setView(focus[location]||[0,20,1])},[location]);
 const countryName=(geo:any)=>String(geo.properties?.name||geo.properties?.NAME||geo.properties?.ADMIN||fallback[String(geo.id??'')]||'Region');
 const rotation:any=[-view[0],-view[1],0];
 return <div className="flat-map globe-canvas">
   <ComposableMap projection="geoOrthographic" projectionConfig={{scale:235,rotate:rotation}} width={900} height={620} style={{width:'100%',height:'100%'}}>
     <ZoomableGroup center={[0,0] as any} zoom={view[2]} minZoom={0.75} maxZoom={3.8} onMoveStart={()=>{setDragging(true);setAutoRotate(false)}} onMoveEnd={({coordinates,zoom}:any)=>{setDragging(false);setView([Number(coordinates[0]),Number(coordinates[1]),Number(zoom)])}}>
       <circle cx="450" cy="310" r="235" fill="#eefaf5" opacity=".7" pointerEvents="none" />
       <Geographies geography={countries as any}>{({geographies}:any)=><Fragment>{geographies.map((geo:any)=>{const name=countryName(geo);const selected=name.toLowerCase()===location.toLowerCase();return <Geography key={geo.rsmKey} geography={geo} onMouseEnter={()=>setHover(name)} onMouseLeave={()=>setHover('')} onClick={()=>{setAutoRotate(false);onLocation(name);setView(focus[name]||[0,20,1])}} style={{default:{fill:selected?'#c8f2e0':'#fbfffd',stroke:selected?'#087f68':'#62ad91',strokeWidth:selected?1.4:0.55,outline:'none'},hover:{fill:'#8fe2bf',stroke:'#087f68',strokeWidth:1.25,outline:'none'},pressed:{fill:'#64cea1',outline:'none'}}}/>})}</Fragment>)}</Geographies>
       {leads.filter(l=>l.lat!=null&&l.lng!=null).map((l,i)=><Marker key={`${l.name}-${i}`} coordinates={[Number(l.lng),Number(l.lat)] as any}><circle r={4} fill="#087f68" stroke="#fff" strokeWidth={1.5}/><title>{l.name} · {l.rating??'—'}★ · {l.review_count} reviews</title></Marker>)}
     </ZoomableGroup>
   </ComposableMap>
   <div className="globe-overlay"><span>{leads.length?'LIVE DISCOVERY GLOBE':'EXPLORE THE WORLD'}</span><b>{location}</b><small>{hover?`Hovering ${hover}`:'Auto-rotating · drag to explore · click a country · zoom'}</small></div>
   <div className="map-tools"><button className="world-reset" onClick={()=>{setAutoRotate(false);setView([0,20,1])}}>⌖ Center globe</button><button className="world-reset" onClick={()=>setAutoRotate(v=>!v)}>{autoRotate?'❚❚ Pause':'▶ Rotate'}</button>{leads.length>0&&<span className="map-result-badge">● {leads.length} discovered</span>}</div>
   <div className="map-legend"><span><i className="legend-dot selected-dot"/> Selected</span><span><i className="legend-dot border-dot"/> Borders</span>{leads.length>0&&<span><i className="legend-dot lead-dot"/> Leads</span>}</div>
 </div>;
}