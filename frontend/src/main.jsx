
import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {Search,Smartphone,Laptop,Tablet,Headphones,Watch,GitCompare,Sparkles,Plus,X,ChevronRight,ChevronDown,Camera,BatteryCharging,Gauge,AlertCircle} from "lucide-react";
import "./styles.css";

const API="http://localhost:8080";
const CATEGORIES=[
 {id:"smartphone",label:"Smartphones",icon:Smartphone},{id:"laptop",label:"Laptops",icon:Laptop},
 {id:"tablet",label:"Tablets",icon:Tablet},{id:"headphones",label:"Headphones",icon:Headphones},{id:"smartwatch",label:"Smartwatches",icon:Watch}
];
const PURPOSES=[{id:"gaming",label:"Gaming",icon:Gauge},{id:"photography",label:"Photography",icon:Camera},{id:"dailyUse",label:"Daily use",icon:BatteryCharging}];
const PRESETS=[
 {id:"gaming",label:"Gaming",description:"Performance, graphics & screen",weights:{gaming:70,photography:15,dailyUse:15}},
 {id:"camera",label:"Photography",description:"Camera, zoom & video",weights:{gaming:15,photography:70,dailyUse:15}},
 {id:"everyday",label:"Everyday",description:"Battery, screen & comfort",weights:{gaming:15,photography:15,dailyUse:70}}
];
const FIELDS={
 gaming:[["Processor generation & chip size","cpuArchitecture","Processor generation/process information; used as a CPU visual indicator."],["Processor cores & speed","cpuCoresClock","more cores and higher maximum clock speed"],["Graphics performance","gpu","stronger graphics architecture, more units and higher clock"],["RAM","ram","more memory and newer memory type"],["Cooling","cooling","larger cooling area and more capable cooling"],["Screen smoothness & touch response","displayGaming","higher refresh rate and faster touch response"]],
 photography:[["Main camera sensor","sensorSize","larger sensor can capture more light"],["Main camera aperture","aperture","lower f-number generally helps in low light"],["Pixel size & pixel binning","pixelSize","larger pixels and binning can improve low-light results"],["Image stabilization","stabilization","better stabilization helps reduce blur"],["Zoom range","focalCoverage","more native focal lengths give more framing options"],["Video recording","video","higher resolution, frame rate and HDR/video features"]],
 dailyUse:[["Battery capacity","battery","larger battery can provide more capacity"],["Charging speed","charging","higher wired and wireless charging power"],["Screen detail","resolution","higher resolution and pixel density"],["Screen smoothness","refreshRate","higher refresh rate makes scrolling look smoother"],["Weight","weight","lower weight is easier to carry"],["Storage","storage","more space and faster storage"]]
};
const aliases={
 cpuArchitecture:["cpuArchitecture","cpuGeneration","cpuProcessNm","cpu_process_nm","cpu_generation"],
 cpuCoresClock:["cpuCores","cpuMaxClockGhz","cpuPerformanceCores","cpuEfficiencyCores"],
 gpu:["gpuArchitecture","gpuExecutionUnits","gpuClock","gpuName"],
 ram:["ramGb","ramType"],
 cooling:["coolingType","coolingSurfaceAreaMm2"],
 displayGaming:["displayRefreshRate","touchSamplingRate"],
 sensorSize:["mainSensorSize"],
 aperture:["mainAperture"],
 pixelSize:["pixelSizeUm","pixelBinning"],
 stabilization:["stabilization"],
 focalCoverage:["opticalZoom"],
 video:["videoCapabilities"],
 battery:["batteryMah"],
 charging:["chargingW","wirelessChargingW"],
 resolution:["displayResolution","displayPpi"],
 refreshRate:["displayRefreshRate"],
 weight:["weightG"],
 storage:["storageGb","storageType"]
};
const list=x=>Array.isArray(x)?x:Array.isArray(x?.devices)?x.devices:Array.isArray(x?.results)?x.results:Array.isArray(x?.content)?x.content:Array.isArray(x?.data)?x.data:[];
async function api(path,opt={}){const r=await fetch(API+path,{headers:{"Content-Type":"application/json",...(opt.headers||{})},...opt});if(!r.ok)throw Error(await r.text()||`HTTP ${r.status}`);const t=await r.text();return t?JSON.parse(t):null}
function findValue(obj,keys,depth=0){if(obj===null||obj===undefined||depth>5)return undefined;if(Array.isArray(obj)){for(const item of obj){const v=findValue(item,keys,depth+1);if(v!==undefined&&v!==null&&v!=="")return v}return undefined}if(typeof obj!=="object")return undefined;const normalized=new Map(Object.keys(obj).map(k=>[k.replace(/[^a-zA-Z0-9]/g,"").toLowerCase(),k]));for(const key of keys){const actual=normalized.get(String(key).replace(/[^a-zA-Z0-9]/g,"").toLowerCase());if(actual!==undefined&&obj[actual]!==null&&obj[actual]!==undefined&&obj[actual]!=="")return obj[actual]}for(const value of Object.values(obj)){if(value&&typeof value==="object"){const v=findValue(value,keys,depth+1);if(v!==undefined&&v!==null&&v!=="")return v}}return undefined}
function norm(d){const nested=d?.device??d?.product??d?.data??null;const merged=nested&&typeof nested==="object"?{...d,...nested}:d||{};const id=merged.id??merged.deviceId??merged.productId;const name=merged.name??merged.deviceName??merged.productName??merged.modelName??merged.model??merged.title??findValue(merged,["name","deviceName","productName","modelName","model","title"])??"Unknown device";const brand=merged.brand??merged.manufacturer??merged.brandName??merged.manufacturerName??findValue(merged,["brand","manufacturer","brandName","manufacturerName"])??"";const imageUrl=merged.imageUrl??merged.image??merged.photoUrl??merged.thumbnail??findValue(merged,["imageUrl","image","photoUrl","thumbnail","imageURL"])??"";const price=merged.price??merged.priceUsd??merged.price_usd??merged.currentPrice??merged.current_price??merged.cost??findValue(merged,["price","priceUsd","price_usd","currentPrice","current_price","cost"]);return {...merged,id,name:String(name),brand:String(brand),imageUrl,price,category:merged.category??merged.type??catFallback(merged),specs:merged.specs??merged.specifications??merged.characteristics??{}}}
function catFallback(d){return findValue(d,["category","type","deviceCategory"])??""}
const direct=(d,key)=>{
 if(d && d[key]!==undefined && d[key]!==null && d[key]!=="") return d[key];
 const nested=d?.device??d?.product??d?.data;
 if(nested && nested[key]!==undefined && nested[key]!==null && nested[key]!=="") return nested[key];
 return findValue(d,[key]);
};
function val(d,key){
 const f=k=>direct(d,k);
 let out;
 switch(key){
  case "cpuArchitecture": out=[f("cpuGeneration"),f("cpuProcessNm")!=null?`${f("cpuProcessNm")} nm`:null].filter(Boolean).join(" · "); break;
  case "cpuCoresClock": out=[f("cpuCores")!=null?`${f("cpuCores")} cores`:null,f("cpuMaxClockGhz")!=null?`${f("cpuMaxClockGhz")} GHz max`:null].filter(Boolean).join(" · "); break;
  case "gpu": out=[f("gpuArchitecture"),f("gpuExecutionUnits")!=null?`${f("gpuExecutionUnits")} units`:null,f("gpuClock")!=null?`${f("gpuClock")} MHz`:null].filter(Boolean).join(" · "); break;
  case "ram": out=[f("ramGb")!=null?`${f("ramGb")} GB`:null,f("ramType")].filter(Boolean).join(" · "); break;
  case "cooling": out=[f("coolingType"),f("coolingSurfaceAreaMm2")!=null?`${f("coolingSurfaceAreaMm2")} mm²`:null].filter(Boolean).join(" · "); break;
  case "displayGaming": out=[f("displayRefreshRate")!=null?`${f("displayRefreshRate")} Hz`:null,f("touchSamplingRate")!=null?`${f("touchSamplingRate")} Hz touch`:null].filter(Boolean).join(" · "); break;
  case "sensorSize": out=f("mainSensorSize"); break;
  case "aperture": out=f("mainAperture")!=null?`f/${f("mainAperture")}`:null; break;
  case "pixelSize": out=[f("pixelSizeUm")!=null?`${f("pixelSizeUm")} µm`:null,f("pixelBinning")].filter(Boolean).join(" · "); break;
  case "stabilization": out=f("stabilization"); break;
  case "focalCoverage": out=f("opticalZoom"); break;
  case "video": out=f("videoCapabilities"); break;
  case "battery": out=f("batteryMah")!=null?`${f("batteryMah")} mAh`:null; break;
  case "charging": out=[f("chargingW")!=null?`${f("chargingW")} W`:null,f("wirelessChargingW")!=null?`${f("wirelessChargingW")} W wireless`:null].filter(Boolean).join(" · "); break;
  case "resolution": out=[f("displayResolution"),f("displayPpi")!=null?`${f("displayPpi")} ppi`:null].filter(Boolean).join(" · "); break;
  case "refreshRate": out=f("displayRefreshRate")!=null?`${f("displayRefreshRate")} Hz`:null; break;
  case "weight": out=f("weightG")!=null?`${f("weightG")} g`:null; break;
  case "storage": out=[f("storageGb")!=null?`${f("storageGb")} GB`:null,f("storageType")].filter(Boolean).join(" · "); break;
  default: out=undefined;
 }
 return out===undefined||out===null||out===""?"Not specified":String(out);
}
function numberValue(d,key){
 const n=Number(direct(d,key));
 return Number.isFinite(n)?n:null;
}
function scoreByRange(value,low,high,excellent){
 if(value<=low)return 60;
 if(value>=excellent)return 100;
 if(value<=high)return 60+((value-low)/(high-low))*30;
 return 90+((value-high)/(excellent-high))*10;
}
function scoreInverseByRange(value,worst,good,best){
 if(value>=worst)return 60;
 if(value<=best)return 100;
 if(value>=good)return 60+((worst-value)/(worst-good))*30;
 return 90+((good-value)/(good-best))*10;
}
function roundScore(score){return Math.round(Math.max(0,Math.min(100,score))*10)/10;}

// Frontend mirror of the supplied backend ScoringService. The UI uses the
// same thresholds and weights instead of inventing a second scoring system.
function scoringService(d){
 const gpu=(()=>{
  let total=0,n=0;
  const units=numberValue(d,"gpuExecutionUnits");
  const clock=numberValue(d,"gpuClock");
  if(units!==null){total+=scoreByRange(units,6,10,14);n++;}
  if(clock!==null){total+=scoreByRange(clock,800,1100,1500);n++;}
  return n?total/n:0;
 })();
 const cpu=(()=>{
  let total=0,n=0;
  const cores=numberValue(d,"cpuCores");
  const clock=numberValue(d,"cpuMaxClockGhz");
  if(cores!==null){total+=scoreByRange(cores,6,8,10);n++;}
  if(clock!==null){total+=scoreByRange(clock,3.2,4.0,4.5);n++;}
  return n?total/n:0;
 })();
 const cooling=numberValue(d,"coolingSurfaceAreaMm2");
 const ram=numberValue(d,"ramGb");
 const display=numberValue(d,"displayRefreshRate");
 const gpuScore=gpu;
 const cpuScore=cpu;
 const coolingScore=cooling===null?0:scoreByRange(cooling,1500,2500,3500);
 const ramScore=ram===null?0:scoreByRange(ram,8,12,16);
 const displayScore=display===null?0:scoreByRange(display,90,120,144);
 const sensor=(()=>{
  const raw=direct(d,"mainSensorSize"); if(raw==null)return 0;
  const v=String(raw).toLowerCase();
  if(v.includes("1/1.0")||v.includes("1/1.1")||v.includes("1/1.2"))return 100;
  if(v.includes("1/1.28")||v.includes("1/1.3"))return 90;
  if(v.includes("1/1.4")||v.includes("1/1.5"))return 80;
  if(v.includes("1/1.6")||v.includes("1/1.7"))return 70;
  return 60;
 })();
 const zoom=(()=>{
  const raw=direct(d,"opticalZoom"); if(raw==null)return 0;
  const vals=(String(raw).split(",").map(x=>Number(x.trim().replace(/x/gi,""))).filter(Number.isFinite));
  return vals.length?scoreByRange(Math.max(...vals),2,5,10):0;
 })();
 const video=(()=>{
  const raw=direct(d,"videoCapabilities"); if(raw==null)return 0;
  const v=String(raw).toLowerCase(); let score=50;
  if(v.includes("4k"))score+=15;
  if(v.includes("60fps"))score+=10;
  if(v.includes("120fps"))score+=10;
  if(v.includes("8k"))score+=10;
  if(v.includes("10-bit"))score+=5;
  return Math.min(score,100);
 })();
 const stabilization=(()=>{
  const raw=direct(d,"stabilization"); if(raw==null)return 0;
  const v=String(raw).toLowerCase();
  if(v.includes("sensor-shift"))return 100;
  if(v.includes("ois"))return 90;
  if(v.includes("eis"))return 75;
  return 60;
 })();
 const aperture=(()=>{const v=numberValue(d,"mainAperture");return v===null?0:scoreInverseByRange(v,2.4,1.7,1.4);})();
 const pixel=(()=>{const v=numberValue(d,"pixelSizeUm");return v===null?0:scoreByRange(v,0.8,1.2,1.5);})();
 const battery=(()=>{const v=numberValue(d,"batteryMah");return v===null?0:scoreByRange(v,3500,4500,5500);})();
 const charging=(()=>{const v=numberValue(d,"chargingW");return v===null?0:scoreByRange(v,20,50,100);})();
 const dailyDisplay=(()=>{const v=numberValue(d,"displayRefreshRate");let s=v===null?0:scoreByRange(v,90,120,144);if(direct(d,"displayLtpo")===true)s+=5;return Math.min(s,100);})();
 const storage=(()=>{const v=numberValue(d,"storageGb");return v===null?0:scoreByRange(v,128,512,1024);})();
 const weight=(()=>{const v=numberValue(d,"weightG");return v===null?0:scoreInverseByRange(v,240,200,170);})();
 const ppi=(()=>{const v=numberValue(d,"displayPpi");return v===null?0:scoreByRange(v,350,450,550);})();
 return {
  gaming:roundScore(gpuScore*.40+cpuScore*.25+coolingScore*.15+ramScore*.10+displayScore*.10),
  photography:roundScore(sensor*.25+zoom*.20+video*.20+stabilization*.15+aperture*.10+pixel*.10),
  dailyUse:roundScore(battery*.25+dailyDisplay*.20+storage*.15+weight*.15+charging*.15+ppi*.10),
  components:{gpu:gpuScore,cpu:cpuScore,cooling:coolingScore,ram:ramScore,display:displayScore,sensorSize:sensor,aperture,pixelSize:pixel,stabilization,focalCoverage:zoom,video,battery,charging,resolution:ppi,refreshRate:dailyDisplay,weight,storage,cpuArchitecture:cpuScore,cpuCoresClock:cpuScore,displayGaming:displayScore}
 };
}
function componentScore(d,key){return scoringService(d).components[key]??0;}
function rawMetric(d,key){
 const n=v=>Number(v);
 switch(key){
  case "cpuArchitecture": return numberValue(d,"cpuProcessNm");
  case "cpuCoresClock": {const c=n(direct(d,"cpuCores")),cl=n(direct(d,"cpuMaxClockGhz"));return Number.isFinite(c)&&Number.isFinite(cl)?c*cl:null;}
  case "gpu": {const u=n(direct(d,"gpuExecutionUnits")),c=n(direct(d,"gpuClock"));return Number.isFinite(u)&&Number.isFinite(c)?u*c:null;}
  case "ram": return numberValue(d,"ramGb");
  case "cooling": return numberValue(d,"coolingSurfaceAreaMm2");
  case "displayGaming": {const r=n(direct(d,"displayRefreshRate")),t=n(direct(d,"touchSamplingRate"));return Number.isFinite(r)&&Number.isFinite(t)?r*t:null;}
  case "sensorSize": {const m=String(direct(d,"mainSensorSize")??"").match(/1\s*\/\s*([0-9.]+)/);return m?1/Number(m[1]):null;}
  case "aperture": return numberValue(d,"mainAperture");
  case "pixelSize": return numberValue(d,"pixelSizeUm");
  case "stabilization": {const v=String(direct(d,"stabilization")??"").toLowerCase();return v.includes("sensor-shift")?3:v.includes("ois")?2:v?1:null;}
  case "focalCoverage": {const z=String(direct(d,"opticalZoom")??"");const vals=(z.match(/[0-9]+(?:\.[0-9]+)?x/g)||[]).map(x=>Number(x.replace("x","")));return vals.length?Math.max(...vals)+vals.length*.25:null;}
  case "video": {const v=String(direct(d,"videoCapabilities")??"").toLowerCase();let s=0;if(v.includes("8k"))s+=3;if(v.includes("4k"))s+=2;if(v.includes("120fps"))s+=2;if(v.includes("60fps"))s+=1;if(v.includes("10-bit"))s+=1;if(v.includes("hdr"))s+=1;return s||null;}
  case "battery": return numberValue(d,"batteryMah");
  case "charging": {const w=n(direct(d,"chargingW")),ww=n(direct(d,"wirelessChargingW"));return Number.isFinite(w)?w+(Number.isFinite(ww)?ww*.35:0):null;}
  case "resolution": return numberValue(d,"displayPpi");
  case "refreshRate": return numberValue(d,"displayRefreshRate");
  case "weight": return numberValue(d,"weightG");
  case "storage": return numberValue(d,"storageGb");
  default:return null;
 }
}
function score(devices,d,key){
 // Use the supplied ScoringService component score for the radar and the
 // comparison bars. This keeps both visuals on the same 0-100 scale.
 const v=componentScore(d,key);
 return Number.isFinite(v)?Math.round(v):0;
}
function purposeScore(d,purpose){
 return Math.round(scoringService(d)[purpose]??0);
}
function weightedOverall(d,weights){
 const w=weights||{gaming:0,photography:0,dailyUse:0};
 return roundScore(
  purposeScore(d,"gaming")*Number(w.gaming||0)/100 +
  purposeScore(d,"photography")*Number(w.photography||0)/100 +
  purposeScore(d,"dailyUse")*Number(w.dailyUse||0)/100
 );
}
function bestDevice(devices,purpose,weights,custom=false){
 if(custom)return [...devices].sort((a,b)=>weightedOverall(b,weights)-weightedOverall(a,weights))[0]||null;
 return [...devices].sort((a,b)=>purposeScore(b,purpose)-purposeScore(a,purpose))[0]||null;
}
function Ranking({devices,custom,weights,purpose,quickSelected}){
 if(custom){
  const active=["gaming","photography","dailyUse"].filter(k=>Number(weights[k]||0)>0);
  const ranked=[...devices].map(d=>({...d,_score:weightedOverall(d,weights)})).sort((a,b)=>b._score-a._score);
  return <section className="ranking-section"><div className="heading"><div><p>WEIGHTED VERDICT</p><h2>Which device fits the job?</h2></div><span>{active.map(k=>`${k==='gaming'?"Gaming":k==='photography'?"Photography":"Daily use"} ${weights[k]}%`).join(" · ")}</span></div><div className="weighted-ranking-grid">{ranked.map((d,i)=><div className={`weighted-device ${i===0?"weighted-winner":""}`} key={d.id}><Img d={d}/><div className="weighted-device-info"><b>{d.brand} {d.name}</b><small>{i===0?"Best weighted match":"Based on your selected percentage mix"}</small><div className="weighted-score-line"><strong>{d._score}</strong><span>/100</span></div><div className="weighted-breakdown">{active.map(k=><span key={k}>{k==='gaming'?"Gaming":k==='photography'?"Photo":"Daily"} {purposeScore(d,k)} × {weights[k]}%</span>)}</div></div></div>)}</div></section>
 }
 const groups=[
  {id:"gaming",title:"Best for gaming",icon:Gauge,desc:"Performance, graphics, cooling and display"},
  {id:"photography",title:"Best for photography",icon:Camera,desc:"Camera hardware, zoom and video"},
  {id:"dailyUse",title:"Best for everyday use",icon:BatteryCharging,desc:"Battery, display, storage and weight"}
 ];
 return <section className="ranking-section"><div className="heading"><div><p>QUICK VERDICT</p><h2>Which device fits the job?</h2></div><span>{[...quickSelected].map(k=>PURPOSES.find(p=>p.id===k)?.label).filter(Boolean).join(" · ")}</span></div><div className="ranking-grid">{groups.filter(g=>quickSelected.has(g.id)).map(g=>{const I=g.icon;const ranked=[...devices].map(d=>({...d,_score:purposeScore(d,g.id)})).sort((a,b)=>b._score-a._score);return <div className="rank-card" key={g.id}>{<div className="rank-head"><div className="rank-icon"><I/></div><div><h3>{g.title}</h3><small>{g.desc}</small></div></div>}<div className="rank-list">{ranked.map((d,i)=><div className={`rank-item rank-${i}`} key={d.id}><span className="rank-num">{i+1}</span><Img d={d}/><div className="rank-name"><b>{d.brand} {d.name}</b><small>{i===0?"Best match":"Alternative"}</small></div><strong className="rank-score">{d._score}<small>/100</small></strong></div>)}</div></div>})}</div></section>
}
function Img({d,big}){return d.imageUrl?<img className={big?"img big":"img"} src={d.imageUrl} alt={d.name}/>:<div className={big?"placeholder big":"placeholder"}><Smartphone/></div>}
function PriceComparison({devices}){
 const rows=[...devices].map(d=>({...d,_price:Number(d.price)})).filter(d=>Number.isFinite(d._price)).sort((a,b)=>a._price-b._price);
 const cheapest=rows[0]?._price;
 if(!rows.length)return <div className="price-empty">Price data is not available for the selected devices.</div>;
 return <div className="price-comparison">{rows.map((d,i)=>{const diff=cheapest!=null?d._price-cheapest:0;return <div className={`price-row ${i===0?"price-best":""}`} key={d.id}><div className="price-device"><Img d={d}/><div><b>{d.brand} {d.name}</b><small>{i===0?"Lowest price":"Price from the device database"}</small></div></div><div className="price-value">${d._price.toLocaleString("en-US")}</div><div className="price-diff">{i===0?<span className="price-chip">Lowest</span>:<>+${diff.toLocaleString("en-US")}</>}</div></div>})}</div>
}

function Radar({devices,purpose,weights,custom=false}){
 const [hoverAxis,setHoverAxis]=useState(null);
 const [pointer,setPointer]=useState({x:0,y:0,visible:false});
 const f=FIELDS[purpose],cx=180,cy=180,r=125;
 const best=bestDevice(devices,purpose,weights,custom);
 const pts=a=>a.map((v,i)=>{let ang=-Math.PI/2+i*Math.PI*2/f.length,rr=r*v/100;return`${cx+Math.cos(ang)*rr},${cy+Math.sin(ang)*rr}`}).join(" ");
 const hovered=hoverAxis===null?null:f[hoverAxis];
 const hoverRows=hovered?[...devices].map(d=>({d,score:score(devices,d,hovered[1])})).sort((a,b)=>b.score-a.score):[];
 const move=e=>{const box=e.currentTarget.getBoundingClientRect();setPointer({x:e.clientX-box.left+14,y:e.clientY-box.top+14,visible:true})};
 return <div className="radarwrap">
  <div className="radar-title"><b>Comparison radar</b><span>Hover a side to see the score for every device.</span></div>
  <div className="radar-stage" onMouseMove={move}>
   <svg viewBox="0 0 360 360" className="radar" aria-label="Device comparison radar">
    {[20,40,60,80,100].map(p=><polygon key={p} points={pts(Array(f.length).fill(p))} className="grid"/>)}
    {f.map((x,i)=>{let a=-Math.PI/2+i*Math.PI*2/f.length;return <g key={x[0]} onMouseEnter={()=>setHoverAxis(i)} onMouseMove={move} onMouseLeave={()=>{setHoverAxis(null);setPointer(v=>({...v,visible:false}))}}><line x1={cx} y1={cy} x2={cx+Math.cos(a)*r} y2={cy+Math.sin(a)*r} className="axis"/><line x1={cx} y1={cy} x2={cx+Math.cos(a)*r} y2={cy+Math.sin(a)*r} className="axis-hit-line"/></g>})}
    {devices.map(d=>{const isBest=String(d.id)===String(best?.id);return <polygon key={d.id} points={pts(f.map(x=>score(devices,d,x[1])))} className={`data ${isBest?"best":"mutedData"}`}/>})}
    {f.map((x,i)=>{let a=-Math.PI/2+i*Math.PI*2/f.length;let lx=cx+Math.cos(a)*164,ly=cy+Math.sin(a)*164;let words=x[0].split(" / ")[0].split(" ");let lines=[];let line="";words.forEach(w=>{if((line+" "+w).trim().length>20&&line){lines.push(line);line=w}else line=(line+" "+w).trim()});if(line)lines.push(line);return <g key={x[0]} onMouseEnter={()=>setHoverAxis(i)} onMouseMove={move} onMouseLeave={()=>{setHoverAxis(null);setPointer(v=>({...v,visible:false}))}} className="radar-axis-hit"><circle cx={lx} cy={ly} r="30" className="axis-hit"/><text x={lx} y={ly-(lines.length-1)*4} className={`label ${hoverAxis===i?"activeLabel":""}`} textAnchor="middle">{lines.map((line,j)=><tspan key={j} x={lx} dy={j===0?0:9}>{line}</tspan>)}</text></g>})}
   </svg>
   {hovered&&pointer.visible&&<div className="radar-tooltip follow-tooltip" style={{left:pointer.x,top:pointer.y}}><b>{hovered[0]}</b><small>Score from the current scoring system</small>{hoverRows.map((r,i)=><div className={`tooltip-row ${String(r.d.id)===String(best?.id)?"tooltip-best":""}`} key={r.d.id}><span><i className={`mini-dot ${String(r.d.id)===String(best?.id)?"best-dot":""}`}></i>{r.d.brand} {r.d.name}</span><strong>{r.score}</strong></div>)}</div>}
  </div>
  <div className="radar-caption"><span className="compare-tag">COMPARE</span><span>The highlighted device is the best overall match for the selected goal.</span></div>
  <div className="legend">{devices.map(d=><span key={d.id} className={String(d.id)===String(best?.id)?"legend-best":"legend-muted"}><i className={`dot ${String(d.id)===String(best?.id)?"best-dot":"muted-dot"}`}/>{d.name}{String(d.id)===String(best?.id)&&<b> Best</b>}</span>)}</div>
 </div>
}

function normalizeWeights(next){
 const safe={gaming:Math.max(0,Math.min(100,Math.round(next.gaming||0))),photography:Math.max(0,Math.min(100,Math.round(next.photography||0))),dailyUse:Math.max(0,Math.min(100,Math.round(next.dailyUse||0)))};
 const total=safe.gaming+safe.photography+safe.dailyUse;
 if(total<=100)return safe;
 return safe;
}
function updateCustomWeights(current,key,value,touched){
 const otherKeys=["gaming","photography","dailyUse"].filter(k=>k!==key);
 const locked=otherKeys.filter(k=>touched.has(k));
 const unlocked=otherKeys.filter(k=>!touched.has(k));
 const lockedSum=locked.reduce((sum,k)=>sum+Number(current[k]||0),0);
 const maxAllowed=Math.max(0,100-lockedSum);
 const selected=Math.max(0,Math.min(maxAllowed,Math.round(Number(value))));
 const next={...current,[key]:selected};
 const remaining=Math.max(0,100-selected);
 const stillLocked=locked.reduce((sum,k)=>sum+Number(next[k]||0),0);
 if(unlocked.length){
  const free=Math.max(0,remaining-stillLocked);
  const base=Math.floor((free/unlocked.length)*10)/10;
  unlocked.forEach((k,i)=>{next[k]=i===unlocked.length-1?Math.round((free-base*(unlocked.length-1))*10)/10:base});
 }else if(stillLocked>remaining){
  const factor=remaining/stillLocked;
  otherKeys.forEach(k=>next[k]=Math.round(Number(next[k]||0)*factor));
  let diff=Math.round((100-(next.gaming+next.photography+next.dailyUse))*10)/10;
  if(diff)next[otherKeys[0]]+=diff;
 }
 return next;
}

function dominantPurpose(weights){
 return ["gaming","photography","dailyUse"].sort((a,b)=>weights[b]-weights[a])[0];
}
function App(){
 const [cat,setCat]=useState("smartphone"),[q,setQ]=useState(""),[results,setResults]=useState([]),[sel,setSel]=useState([]),[purpose,setPurpose]=useState("gaming");
 const [comparisonTab,setComparisonTab]=useState("specs");
 const [weights,setWeights]=useState(PRESETS[0].weights),[quickSelected,setQuickSelected]=useState(new Set(["gaming"])),[quickFocus,setQuickFocus]=useState("gaming"),[customWeights,setCustomWeights]=useState({gaming:34,photography:33,dailyUse:33}),[customOpen,setCustomOpen]=useState(false),[touched,setTouched]=useState(new Set()),[customFocus,setCustomFocus]=useState("gaming"),[comparison,setComparison]=useState(null),[ai,setAi]=useState(""),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[aiLoading,setAiLoading]=useState(false),[error,setError]=useState("");
 useEffect(()=>{setSel([]);setResults([]);setComparison(null);setAi("");setQ("")},[cat]);
 const searchSeq=React.useRef(0);
 async function search(term=q){
  const query=String(term||"").trim();
  if(!query){setResults([]);return}
  const seq=++searchSeq.current;
  setLoading(true);setError("");
  try{
   const d=await api(`/api/devices/search?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(query)}`);
   if(seq===searchSeq.current)setResults(list(d).map(norm));
  }catch(e){
   if(seq===searchSeq.current)setError("Cannot reach the backend. Check localhost:8080.");
  }finally{
   if(seq===searchSeq.current)setLoading(false);
  }
 }
 useEffect(()=>{
  const query=q.trim();
  if(!query){setResults([]);setLoading(false);return}
  const timer=setTimeout(()=>search(query),300);
  return ()=>clearTimeout(timer);
 },[q,cat]);
 async function add(id){
  if(sel.some(d=>String(d.id)===String(id)))return;
  if(sel.length>=3)return setError("Maximum 3 devices.");
  setError("");
  try{
   const full=norm(await api(`/api/devices/${id}`));
   setSel(prev=>prev.some(d=>String(d.id)===String(full.id))?prev:[...prev,full]);
  }catch{
   const found=results.find(x=>String(x.id)===String(id));
   if(found)setSel(prev=>prev.some(d=>String(d.id)===String(id))?prev:[...prev,found]);
  }
 }
 function remove(id){setSel(sel.filter(d=>String(d.id)!==String(id)));setComparison(null);setAi("")}
 async function compare(){if(sel.length<2)return setError("Select at least 2 devices.");const selected=["gaming","photography","dailyUse"].filter(k=>quickSelected.has(k));const share=selected.length?100/selected.length:100;const activeWeights=customOpen?customWeights:{gaming:selected.includes("gaming")?share:0,photography:selected.includes("photography")?share:0,dailyUse:selected.includes("dailyUse")?share:0};setBusy(true);setError("");try{setComparison(await api("/api/devices/compare",{method:"POST",body:JSON.stringify({deviceIds:sel.map(d=>d.id),weights:activeWeights})}))}catch(e){setError("Comparison request failed: "+(e?.message||"backend error"))}finally{setBusy(false)}}
 async function overview(){if(sel.length<2)return setError("Select at least 2 devices.");const selected=["gaming","photography","dailyUse"].filter(k=>quickSelected.has(k));const share=selected.length?100/selected.length:100;const activeWeights=customOpen?customWeights:{gaming:selected.includes("gaming")?share:0,photography:selected.includes("photography")?share:0,dailyUse:selected.includes("dailyUse")?share:0};setAiLoading(true);setError("");setAi("");try{const d=await api("/api/ai/recommend",{method:"POST",body:JSON.stringify({deviceIds:sel.map(d=>d.id),weights:activeWeights})});const text=d?.recommendation??d?.text??d?.message??d?.result??d?.content??"";if(!String(text).trim())throw new Error("Backend returned an empty AI response.");setAi(String(text))}catch(e){setError("AI overview failed: "+(e?.message||"Check the Gemini API key and backend logs."))}finally{setAiLoading(false)}}
 return <div><header><div className="brand"><b>TC</b> TechCompare</div><span className="status">● Backend · localhost:8080</span></header><main>
 <section className="hero"><div><p>TECHNOLOGY COMPARISON</p><h1>TechCompare</h1><small>Specs, weighted goals, visual comparison and a plain-language AI overview.</small></div><div className="heroBox"><GitCompare/><b>Up to 3 devices</b><span>Category-aware comparisons. No smartphone vs laptop nonsense.</span></div></section>
 <nav>{CATEGORIES.map(c=>{let I=c.icon;return <button className={cat===c.id?"active":""} onClick={()=>setCat(c.id)} key={c.id}><I/> {c.label}</button>})}</nav>
 <section className="twocol"><div className="panel"><h2>Find devices</h2><p className="muted">Only {CATEGORIES.find(x=>x.id===cat).label.toLowerCase()} are searchable.</p><div className="search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search(q)} placeholder={`Search ${CATEGORIES.find(x=>x.id===cat).label.toLowerCase()}...`}/><button onClick={search}>{loading?"...":"Search"}</button></div><div className="suggestions">
 {loading&&q.trim()&&<div className="suggestionStatus">Searching...</div>}
 {!loading&&q.trim()&&results.length===0&&<div className="suggestionStatus">No matching devices.</div>}
 {results.map(d=><div className="row suggestion" key={d.id} onClick={()=>add(d.id)}>
  <Img d={d}/><div><b>{d.brand} {d.name}</b><small>{d.price??"Details available"}</small></div>
  <button className="plus" onClick={e=>{e.stopPropagation();add(d.id)}}><Plus/></button>
 </div>)}
</div></div>
 <div className="panel"><h2>Your comparison</h2><p className="muted">{sel.length}/3 devices selected</p><div className="cards">{sel.map(d=><div className="card" key={d.id}><button className="x" onClick={()=>remove(d.id)}><X/></button><Img d={d} big/><b>{d.brand} {d.name}</b><small>{d.price??"Price unavailable"}</small></div>)}{[...Array(3-sel.length)].map((_,i)=><div className="card empty" key={i}><Plus/><span>Add a device</span></div>)}</div><button className="primary full" disabled={sel.length<2||busy} onClick={compare}>{busy?"Working...":"Compare devices"} <ChevronRight/></button></div></section>
 <section><div className="heading"><div><p>COMPARISON MODE</p><h2>What are you buying it for?</h2></div><span>{customOpen?"Custom percentage mix":"Quick selection"}</span></div><div className="preset-grid">{PRESETS.map(p=>{const Icon=p.id==="gaming"?Gauge:p.id==="camera"?Camera:BatteryCharging;const key=p.id==="camera"?"photography":p.id==="everyday"?"dailyUse":"gaming";const chosen=!customOpen&&quickSelected.has(key);return <button className={`preset ${chosen?"chosen":""}`} onClick={()=>{setCustomOpen(false);setQuickSelected(prev=>{const next=new Set(prev);if(next.has(key)){next.delete(key)}else{next.add(key)};if(next.size===0)next.add(key);return next});setQuickFocus(key);setPurpose(key);setAi("")}} key={p.id}><span className="preset-icon"><Icon/></span><span><b>{p.label}</b><small>{p.description}</small></span></button>})}</div>
 <button className={`custom-toggle ${customOpen?"open":""}`} onClick={()=>{setCustomOpen(v=>!v);setAi("")}}><span><b>Custom weights</b><small>Set an independent 100% mix.</small></span><ChevronDown/></button>
 {customOpen&&<div className="custom-weights">{[["gaming","Gaming",Gauge],["photography","Photography",Camera],["dailyUse","Daily use",BatteryCharging]].map(([key,label,Icon])=><div className="custom-weight" key={key}><div className="custom-weight-head"><span><Icon/>{label}</span><strong>{customWeights[key]}%</strong></div><input type="range" min="0" max="100" step="1" value={customWeights[key]} onChange={e=>{const next=updateCustomWeights(customWeights,key,e.target.value,touched);setCustomWeights(next);setTouched(new Set([...touched,key]));setPurpose(dominantPurpose(next));setAi("")}}/><div className="range-scale"><span>0%</span><span>100%</span></div></div>)}</div>}
 </section>
 {error&&<div className="error"><AlertCircle/>{error}</div>}
 <section><div className="heading"><div><p>RESULTS</p><h2>Hardware comparison</h2></div><span>{sel.length<2?"Select at least two devices.":customOpen?`Weighted mix: Gaming ${customWeights.gaming}% · Photography ${customWeights.photography}% · Daily use ${customWeights.dailyUse}%`:`Quick selection: ${[...quickSelected].map(k=>PURPOSES.find(p=>p.id===k)?.label).filter(Boolean).join(" · ")}`}</span></div>{sel.length>=2?<><div className="winner-banner"><div className="winner-icon"><Sparkles/></div><div><p>{customOpen?"BEST WEIGHTED MATCH":"BEST MATCH FOR THIS GOAL"}</p><h3>{bestDevice(sel,customOpen?dominantPurpose(customWeights):(quickFocus||purpose),customOpen?customWeights:null,customOpen)?.brand} {bestDevice(sel,customOpen?dominantPurpose(customWeights):(quickFocus||purpose),customOpen?customWeights:null,customOpen)?.name}</h3><span>{customOpen?<>Overall weighted score: <b>{weightedOverall(bestDevice(sel,purpose,customWeights,true),customWeights)}/100</b></>:<>{PURPOSES.find(p=>p.id===(quickFocus||purpose)).label} score: <b>{purposeScore(bestDevice(sel,quickFocus||purpose),quickFocus||purpose)}/100</b></>}</span></div><div className="winner-note">{customOpen?"Calculated from the selected percentages":"Highlighted on the comparison radar"}</div></div><div className="results"><div className="panel"><Radar devices={sel} purpose={customOpen?dominantPurpose(customWeights):(quickFocus||purpose)} weights={customWeights} custom={customOpen}/></div><div className="panel metrics"><div className="compare-heading"><span className="compare-tag">{comparisonTab==="price"?"PRICE":"COMPARISON"}</span><h3>{comparisonTab==="price"?"Price comparison":(customOpen?"Selected weighted aspects":`${PURPOSES.find(p=>p.id===purpose).label} breakdown`)}</h3></div><div className="comparison-tabs"><button className={comparisonTab==="specs"?"active":""} onClick={()=>setComparisonTab("specs")}>Characteristics</button><button className={comparisonTab==="price"?"active":""} onClick={()=>setComparisonTab("price")}>Price</button></div>{comparisonTab==="price"?<PriceComparison devices={sel}/>:(()=>{const active=customOpen?["gaming","photography","dailyUse"].filter(k=>customWeights[k]>0):[...quickSelected];const focus=customOpen?customFocus:quickFocus;const k=active.includes(focus)?focus:active[0];if(!k)return null;const idx=active.indexOf(k);const move=dir=>{const ni=(idx+dir+active.length)%active.length;(customOpen?setCustomFocus:setQuickFocus)(active[ni]);};return <div className="metric-carousel"><div className="metric-carousel-nav"><button className="metric-arrow" onClick={()=>move(-1)} aria-label="Previous aspect"><ChevronRight className="left-arrow"/></button><div className="weighted-group-title"><b>{k==="gaming"?"Gaming":k==="photography"?"Photography":"Daily use"}</b><span>{customOpen?customWeights[k]:100}%</span></div><button className="metric-arrow" onClick={()=>move(1)} aria-label="Next aspect"><ChevronRight/></button></div><div className="metric-pages"><span>{idx+1} / {active.length}</span></div><div className="weighted-group">{FIELDS[k].map(f=><div className="metric" key={f[1]}><b>{f[0]}</b><small>{f[2]}</small>{[...sel].sort((a,b)=>componentScore(b,f[1])-componentScore(a,f[1])).map((d,j)=><div className={`metricrow ${j===0?"metric-best":"metric-muted"}`} key={d.id}><span>{d.name}{j===0&&<em> best</em>}</span><strong>{String(val(d,f[1]))}</strong><i className="bar" style={{width:`${componentScore(d,f[1])}%`}}/></div>)}</div>)}</div></div>})()}</div></div></>:<div className="panel emptyResult"><GitCompare/><h3>Your comparison will appear here</h3><p>Add two or three devices above.</p></div>}</section>
 {sel.length>=2&&<Ranking devices={sel} custom={customOpen} weights={customWeights} purpose={purpose} quickSelected={quickSelected}/>}
 {sel.length>=2&&<section className="ai"><div className="aihead"><Sparkles/><div><p>AI OVERVIEW</p><h2>AI overview</h2><span>Wait a few seconds while TechCompare explains the trade-offs, price and selected goal.</span></div><button className="primary" onClick={overview} disabled={aiLoading}>{aiLoading?"Analyzing…":"Generate AI overview"} <Sparkles/></button></div>{aiLoading?<div className="aiplace ai-loading"><span className="spinner"></span><span><b>AI is analyzing the comparison…</b><br/>Please wait a few seconds while it compares the selected devices and writes the overview.</span></div>:ai?<div className="aitext">{ai}</div>:<div className="aiplace"><b>AI analysis is not instant.</b><br/>It sends the selected devices and your comparison goal to the backend, then Gemini writes the explanation. This can take a few seconds.</div>}</section>}
 </main><footer>TechCompare · frontend :5173 · backend :8080</footer></div>
}
createRoot(document.getElementById("root")).render(<App/>);
