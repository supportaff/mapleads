"use client";
import { Fragment, useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from '@vnedyalk0v/react19-simple-maps';
import countries from 'world-atlas/countries-110m.json';

type Lead={name:string;lat:number|null;lng:number|null;rating:number|null;review_count:number;city:string;state:string;domain:string};
type Props={location:string;onLocation:(name:string)=>void;leads?:Lead[]};
const fallback:Record<string,string>={'356':'India','840':'United States','124':'Canada','826':'United Kingdom','36':'Australia','276':'Germany','392':'Japan','76':'Brazil','156':'China'};
const focus:Record<string,[number,number,number]>={India:[78.96,20.59,3.0],'United States':[-100,39,2.25],Canada:[-106,57,2.0],'United Kingdom':[-3,55,5.0],Australia:[134,-25,2.5],Germany:[10.4,51.2,5.0],France:[2,46,4.4],Singapore:[103.8,1.35,10],Japan:[138,36,4.0],China:[104,35,2.7],Brazil:[-52,-10,2.3],'United Arab Emirates':[54,24,7],'Saudi Arabia':[45,24,3.5],'South Africa':[24,-30,3]};
export default function Globe({location,onLocation,leads=[]}:Props){
 const [view,setView]=useState<[number,number,number]>([0,20,1]);
 const [hover,setHover]=useState('');
 const [autoRotate,setAutoRotate]=useState(true);
 const [dragging,setDragging]=useState(false);
 useEffect(()=>{if(!autoRotate||dragging)return;const id=window.setInterval(()=>setView(v=>[v[0]+0.12,v[1],v[2]]),40);return()=>window.clearInterval(id)},[autoRotate,dragging]);
 useEffect(()=>{setView(focus[location]||[0,20,1])},[location]);
 return <div className="flat-map">
   <ComposableMap projection="geoEqualEarth" projectionConfig={{scale:145}} width={900} height={520} style={{width:'100%',height:'100%'}}>
     <ZoomableGroup center={[view[0],view[1]] as any} zoom={view[2]} minZoom={0.7} maxZoom={9} onMoveStart={()=>{setDragging(true);setAutoRotate(false)}} onMoveEnd={({coordinates,zoom}:any)=>{setDragging(false);setView([Number(coordinates[0]),Number(coordinates[1]),Number(zoom)])}}>
       <Fragment>
         <Geographies geography={countries as any}>
           {({geographies}:any)=><Fragment>{geographies.map((geo:any)=>{const name=String(geo.properties?.name||geo.properties?.NAME||geo.properties?.ADMIN||fallback[String(geo.id??'')]||'Region');const selected=name.toLowerCase()===location.toLowerCase();return <Geography key={geo.rsmKey} geography={geo} onMouseEnter={()=>setHover(name)} onMouseLeave={()=>setHover('')} onClick={()=>{setAutoRotate(false);onLocation(name);setView(focus[name]||[0,20,1.5])}} style={{default:{fill:selected?'#d7f5e7':'#fbfffd',stroke:selected?'#146b52':'#5ca88c',strokeWidth:selected?1.8:0.65,outline:'none'},hover:{fill:'#aee8ce',stroke:'#087c56',strokeWidth:1.6,outline:'none'},pressed:{fill:'#7ed2ae',outline:'none'}}}/>})}</Fragment>)}
         </Geographies>
         {leads.filter(l=>l.lat!=null&&l.lng!=null).map((l,i)=><Marker key={`${l.name}-${i}`} coordinates={[Number(l.lng),Number(l.lat)] as any}><circle r={4} fill="#146b52" stroke="#fff" strokeWidth={1.5}/><title>{l.name} · {l.rating??'—'}★ · {l.review_count} reviews</title></Marker>)}
       </Fragment>
     </ZoomableGroup>
   </ComposableMap>
   <div className="globe-overlay"><span>{leads.length?'LIVE DISCOVERY MAP':'EXPLORE THE MARKET'}</span><b>{location}</b><small>{hover?`Hovering ${hover}`:'Drag to explore · click a country · scroll to zoom'}</small></div>
   <div className="map-tools"><button className="world-reset" onClick={()=>{setAutoRotate(false);setView([0,20,1])}}>⌖ World view</button><button className="world-reset" onClick={()=>setAutoRotate(v=>!v)}>{autoRotate?'❚❚ Pause':'▶ Rotate'}</button>{leads.length>0&&<span className="map-result-badge">● {leads.length} discovered</span>}</div>
   <div className="map-legend"><span><i className="legend-dot selected-dot"/> Selected</span><span><i className="legend-dot border-dot"/> Countries</span>{leads.length>0&&<span><i className="legend-dot lead-dot"/> Leads</span>}</div>
 </div>
}