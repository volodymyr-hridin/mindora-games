import * as T from 'https://esm.sh/three@0.170.0';
import {artwork as original} from './life-empire-artwork.js';
import pack0 from './art-pack-0.js';
import pack1 from './art-pack-1.js';
import pack2 from './art-pack-2.js';
import pack3 from './art-pack-3.js';
import pack4 from './art-pack-4.js';
import pack5 from './art-pack-5.js';
import pack6 from './art-pack-6.js';
import pack7 from './art-pack-7.js';
import pack8 from './art-pack-8.js';
import pack9 from './art-pack-9.js';
import pack10 from './art-pack-10.js';
import pack11 from './art-pack-11.js';
import pack12 from './art-pack-12.js';
import pack13 from './art-pack-13.js';
import pack14 from './art-pack-14.js';
import pack15 from './art-pack-15.js';
const artwork={...original,...pack0,...pack1,...pack2,...pack3,...pack4,...pack5,...pack6,...pack7,...pack8,...pack9,...pack10,...pack11,...pack12,...pack13,...pack14,...pack15};
import extra0 from './art-extra-0.js';
import extra1 from './art-extra-1.js';
import extra2 from './art-extra-2.js';
import extra3 from './art-extra-3.js';
import extra4 from './art-extra-4.js';
import extra5 from './art-extra-5.js';
import extra6 from './art-extra-6.js';
const extras={...extra0,...extra1,...extra2,...extra3,...extra4,...extra5,...extra6};
// Original art geometry; no third-party model downloads.
export function createCity(host,onSelect){
const scene=new T.Scene();scene.background=new T.Color('#badfe9');
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;host.append(renderer.domElement);
const camera=new T.PerspectiveCamera(40,1,.1,700),center=new T.Vector3(-4,0,7);let zoom=1.55,active=true,selected=null;
scene.add(new T.HemisphereLight(0xfff5e7,0x6a9568,2.4));const sun=new T.DirectionalLight(0xffe2b2,3);sun.position.set(-35,60,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:150});sun.shadow.normalBias=.03;scene.add(sun);
const materials=new Map(),geometries=new Map(),lots=[],cars=[],water=[],labels=new Map();
function material(c){if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.8}));return materials.get(c)}
function mesh(g,shape,x,y,z,c){const m=new T.Mesh(shape,material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function box(g,x,y,z,w,h,d,c){const key=[w,h,d].join(',');if(!geometries.has(key))geometries.set(key,new T.BoxGeometry(w,h,d));return mesh(g,geometries.get(key),x,y,z,c)}
function cyl(g,x,y,z,a,b,h,c,n=16){return mesh(g,new T.CylinderGeometry(a,b,h,n),x,y,z,c)}
const crown=new T.IcosahedronGeometry(1,1);
function tree(g,x,z,s=1){cyl(g,x,.65*s,z,.11*s,.17*s,1.3*s,0xa17b51,7);const m=mesh(g,crown,x,1.55*s,z,0x69a95a);m.scale.set(.66*s,.9*s,.66*s);const n=mesh(g,crown,x+.24*s,1.85*s,z-.17*s,0x91c86b);n.scale.setScalar(.56*s)}
function textSprite(text,bg='#35596a'){const k=text+bg;if(!labels.has(k)){const c=document.createElement('canvas');c.width=384;c.height=96;const x=c.getContext('2d');x.fillStyle=bg;x.beginPath();x.roundRect(5,10,374,76,20);x.fill();x.fillStyle='#fff9e8';x.font='bold 33px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,192,48,340);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;labels.set(k,new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}))}const sp=new T.Sprite(labels.get(k));sp.scale.set(4.6,1.15,1);return sp}
function roof(g,w,d,y,color){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,1.35);shape.lineTo(w/2,0);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});return mesh(g,geo,0,y,-d/2,color)}
function window(g,x,y,z,w=.7,h=.8){box(g,x,y,z,w+.12,h+.12,.1,0xffeed6);box(g,x,y,z+.065,w,h,.045,0x4a8b9d);box(g,x,y,z+.1,.055,h,.04,0xffeed6)}
function facade(g,w,h,d,n=3){for(let y=1.4;y<h-.3;y+=1.25)for(let i=0;i<n;i++)window(g,(i-(n-1)/2)*w/n,y,d/2+.04,.7,.78)}
function bench(g,x,z){box(g,x,.4,z,.95,.14,.4,0xba7847);box(g,x,.65,z+.16,.95,.4,.1,0xba7847);for(const a of [-.35,.35])box(g,x+a,.2,z,.1,.4,.35,0x597077)}
function lamp(g,x,z){cyl(g,x,.9,z,.055,.08,1.8,0x52636c,8);mesh(g,new T.SphereGeometry(.15,10,8),x,1.88,z,0xffe3a1)}
function plaza(g,w,d){box(g,0,.07,0,w,.14,d,0xe6d5b4);for(let i=-Math.floor(w/2)+1;i<w/2;i+=1)box(g,i,.146,0,.025,.006,d-.2,0xc8bca2)}
function building(type,i,g){let h=3;const hues=[0xf5c9a5,0xe8b4a1,0xffe0b0,0xc7d8b4,0xbad5df],c=hues[i%hues.length];
if(type==='studio'){h=2.7+(i%3)*.43;box(g,0,h/2,0,3.5,h,3.15,c);roof(g,3.95,3.65,h,[0xc96e53,0x497c99,0x9c725d,0x779578][i%4]);facade(g,3.5,h,3.15,2);box(g,0,.7,1.62,.72,1.4,.13,0x966c55);box(g,1.1,h+.5,-.65,.38,1.5,.4,0xb87a61);box(g,0,.16,2.1,1.5,.18,1,0xd9bc94);}
else if(type==='shop'||type==='bakery'){h=2.5;box(g,0,h/2,0,4.3,h,3.4,type==='shop'?0xf2b58e:0xffdca0);box(g,0,h+.12,0,4.55,.24,3.65,0x805c52);box(g,0,1.1,1.74,3.8,1.65,.12,0x5d9aa6);for(const x of [-1.3,0,1.3])box(g,x,1.12,1.82,.07,1.7,.08,0xffedd6);for(let j=0;j<8;j++)box(g,-1.96+j*.56,2,2.05,.56,.18,.9,j%2?0xfff1d5:type==='shop'?0xd06c55:0x83a66a);const sign=textSprite(type==='shop'?'COFFEE':'BAKERY',type==='shop'?'#a65c42':'#876b40');sign.position.set(0,2.7,1.85);sign.scale.set(3.5,.88,1);g.add(sign);for(const x of [-1.55,1.55]){cyl(g,x,.46,2.7,.43,.43,.1,0xc68d58);cyl(g,x,.23,2.7,.07,.12,.46,0x78634f);}}
else if(type==='fund'){h=3.4;box(g,0,h/2,0,4.6,h,3.5,0xf4e2bd);box(g,0,.2,1.9,5,.4,1.2,0xddd1bb);for(const x of [-1.8,-.6,.6,1.8])cyl(g,x,1.65,1.9,.2,.29,3.1,0xfff3d8);const r=roof(g,5.1,.9,3.3,0x5a788c);r.position.z=1.6;box(g,0,h+.14,-.2,4.9,.28,3.8,0x8c9ca0);box(g,0,1.2,1.78,1.1,2,.1,0x496d7d);}
else if(type==='delivery'){h=2.6;box(g,0,h/2,0,5,h,3.8,0xe2ad79);roof(g,5.3,4.1,h,0x607980);for(const x of [-1.3,1.3]){box(g,x,1.05,1.94,1.8,2.1,.12,0x536b76);for(let j=0;j<6;j++)box(g,x,.24+j*.32,2.02,1.7,.045,.04,0x9eb1b5)}for(const x of [-2,2])box(g,x,.42,2.65,.65,.8,.7,0xc79353);}
else if(type==='software'||type==='work'){h=type==='software'?6.8+i%3:4.4;box(g,0,h/2,0,3.6,h,3.1,type==='software'?0x8bc2ce:0xd2bdbc);for(let y=.7;y<h;y+=.85){box(g,0,y,1.58,3.1,.54,.07,0x477f94);box(g,1.83,y,0,.07,.54,2.6,0x528fa1);box(g,0,y+.34,0,3.85,.13,3.32,0xf0e4ce)}box(g,0,h+.12,0,3.85,.24,3.35,0xf3e5c9);box(g,.7,h+.55,-.4,1.2,.8,1,0x86a6a8);if(type==='software')cyl(g,0,h+.9,0,.045,.07,1.8,0x50737c);}
else if(type==='learn'){h=3;box(g,0,h/2,0,4.5,h,3.3,0xf0ca77);roof(g,4.9,3.8,h,0xb66e55);facade(g,4.5,h,3.3,3);box(g,0,1.1,1.75,1,2.2,.15,0x82614d);cyl(g,0,h+1.2,0,.7,.7,.6,0xf6e7ce);cyl(g,0,h+1.8,0,0,.85,.65,0xa96954);}
else if(type==='rest'){h=1.6;box(g,0,.1,0,3.8,.2,3.8,0xd9d8ae);cyl(g,0,.24,0,1.2,1.4,.36,0xeee2bf);cyl(g,0,.45,0,1.06,1.06,.07,0x67bdcf);cyl(g,0,.69,0,.15,.34,.6,0xf7e8ce);const f=cyl(g,0,.99,0,.52,.2,.13,0xe8dbc1);water.push(f);for(const x of [-2,2])for(const z of [-1.6,1.6])tree(g,x,z,.9);bench(g,1.9,0);bench(g,-1.9,0);}
else {h=2.5;box(g,0,h/2,0,4,h,3.1,0x9dc3a2);roof(g,4.4,3.6,h,0x538d77);facade(g,4,h,3.1,3);box(g,0,.95,1.65,1.5,1.9,.2,0x4f776a)}
return h+(type==='studio'||type==='learn'||type==='delivery'?1.55:.45)}
box(scene,0,-.55,0,100,.95,100,0x9fc181);
// Curated blocks with generous plazas and differently sized footprints.
const catalog={studio:'Homes',shop:'Coffee shop',bakery:'Bakery',fund:'Bank',delivery:'Logistics',software:'Tech studio',work:'Career office',learn:'Academy',rest:'City park',budget:'Market'};
// Asymmetric coastal districts connected by winding avenues.
const spriteLoader=new T.TextureLoader(),worldWidth=430,worldDepth=370;
const routes=[],allArt={...artwork,...extras};
function sprite(parent,key,x,z,h){const tex=spriteLoader.load(allArt[key],t=>{const im=t.image;sp.scale.x=h*im.width/im.height});tex.colorSpace=T.SRGBColorSpace;const sp=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,alphaTest:.22,depthWrite:false,toneMapped:false}));sp.center.set(.5,.05);sp.scale.set(h,h,1);sp.position.set(x,.24,z);parent.add(sp);return sp}

function disc(x,z,r,color,y=.03){return cyl(scene,x,y,z,r,r,.08,color,80)}
function curve(points){return new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],0,p[1]))).getPoints(Math.max(20,Math.ceil(points.length*12))).map(p=>[p.x,p.z])}
function strip(points,width,color,y){const verts=[],indices=[];for(let j=0;j<points.length;j++){const a=points[Math.max(0,j-1)],b=points[Math.min(points.length-1,j+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1;for(const sign of [-1,1])verts.push(points[j][0]-sign*dz/len*width/2,y,points[j][1]+sign*dx/len*width/2);if(j){const k=j*2;indices.push(k-2,k,k-1,k-1,k,k+1)}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshBasicMaterial({color,side:T.DoubleSide}));scene.add(m)}
function avenue(pts,width){strip(pts,width+1.8,0xe2d4b0,.045);strip(pts,width,0x65757d,.07);for(let i=0;i+1<pts.length;i+=2)strip([pts[i],pts[i+1]],.12,0xffe8b1,.095);routes.push(pts)}

const outline=[[-205,-170],[-75,-178],[70,-168],[195,-155],[210,-50],[198,45],[160,95],[95,125],[40,140],[-30,155],[-98,151],[-157,164],[-208,126],[-216,-20]];
function landPolygon(points,color,y){const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const obj=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color,side:T.DoubleSide}));obj.rotation.x=-Math.PI/2;obj.position.y=y;scene.add(obj)}
landPolygon(outline,0x92ba66,-.12);const sea=new T.Mesh(new T.PlaneGeometry(900,900),new T.MeshBasicMaterial({color:0x36a9cc}));sea.rotation.x=-Math.PI/2;sea.position.y=-.5;scene.add(sea);
const centerPlaza=[-4,-9];disc(...centerPlaza,17,0xe6cb9f,.03);disc(...centerPlaza,10,0x82b659,.08);disc(...centerPlaza,5.5,0xd8c0a0,.13);
const fountainKey=Object.keys(extras).find(k=>k.startsWith('park-'));if(fountainKey)sprite(scene,fountainKey,-4,-9,7);
const paths=[
[[-200,-100],[-145,-110],[-95,-83],[-55,-47],[-24,-24],[-4,-29],[17,-24],[38,-8],[72,4],[123,-7],[202,-37]],
[[-205,30],[-150,20],[-100,32],[-56,17],[-24,6],[-4,12],[18,6],[48,30],[95,44],[158,20],[198,4]],
[[-120,-168],[-112,-115],[-97,-74],[-82,-26],[-101,24],[-88,76],[-61,130]],
[[40,-165],[25,-120],[38,-85],[49,-44],[38,-8],[48,30],[65,73],[100,116]],
[[-185,-165],[-171,-118],[-163,-68],[-150,-31],[-159,16],[-179,63],[-194,119]],
[[135,-160],[128,-108],[145,-68],[123,-7],[158,20],[148,62],[123,103]],
[[-200,93],[-155,84],[-115,95],[-75,104],[-34,89],[14,77],[65,73],[115,86],[158,70]],
[[-198,-148],[-140,-145],[-74,-128],[-22,-140],[35,-125],[90,-140],[145,-120],[194,-132]],
[[-55,-160],[-65,-114],[-50,-80],[-55,-47]],
[[-48,18],[-33,52],[-34,89],[-16,135]],
[[85,-138],[78,-96],[88,-60],[72,4]],
[[195,-85],[145,-68],[88,-60],[49,-44],[-1,-62],[-50,-80],[-97,-74],[-163,-68],[-206,-54]]
];
for(let i=0;i<paths.length;i++)avenue(curve(paths[i]),i<2?6:4.5);
const coast=curve([[-200,120],[-153,139],[-105,130],[-58,139],[-15,122],[40,115],[92,94],[150,83],[190,52]]);strip(coast,6,0xe8d3a9,.035);
// Park and river corridor kept clear of buildings.
const river=curve([[-208,69],[-187,49],[-169,59],[-145,104],[-114,118],[-86,148]]);strip(river,12,0x36a9cc,.12);strip(river,8,0x49bfe0,.13);
for(const x of [-180,-145,-110]){const p=river.reduce((a,b)=>Math.abs(b[0]-x)<Math.abs(a[0]-x)?b:a);strip([[p[0]-7,p[1]+6],[p[0]+7,p[1]-6]],4,0xcdb38d,.17)}
function distSeg(x,z,a,b){let dx=b[0]-a[0],dz=b[1]-a[1];let t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)}
function distRoute(x,z,line){let d=Infinity;for(let i=1;i<line.length;i++)d=Math.min(d,distSeg(x,z,line[i-1],line[i]));return d}
const buildingExtra=Object.keys(extras).filter(k=>/^(building|landmark|industry|home|shop|leisure)-/.test(k));
const groups={};for(const key of Object.keys(artwork)){const type=key.split('-')[0];(groups[type]||=[]).push(key)}
const layout=[];const order=['studio','shop','fund','bakery','hospital','budget','learn','delivery','clinic','work','software','rest','pharmacy','dentist','vet','gym','cinema','hotel',...Object.keys(groups)];while(order.some(t=>groups[t]?.length)){for(const t of order)if(groups[t]?.length)layout.push(groups[t].shift())}
// Preserve the existing ownership IDs and distribute the new architecture among them.
const merged=[];for(let i=0;i<Math.max(layout.length,buildingExtra.length);i++){if(layout[i])merged.push(layout[i]);if(buildingExtra[i])merged.push(buildingExtra[i])}

const places=[],candidates=[];let seed=8191;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function inside(x,z){let hit=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
for(let i=0;i<18000;i++){const x=-204+rand()*403,z=-163+rand()*308;if(!inside(x,z)||Math.hypot(x+4,z+9)<23||distRoute(x,z,river)<12||distRoute(x,z,coast)<8)continue;let d=Infinity;for(const line of routes)d=Math.min(d,distRoute(x,z,line));if(d<7||d>28)continue;candidates.push({x,z,d,score:d+rand()*11})}
candidates.sort((a,b)=>a.score-b.score);for(const p of candidates){if(places.every(q=>Math.hypot(q[0]-p.x,q[1]-p.z)>=10.8))places.push([p.x,p.z]);if(places.length>=merged.length)break}
// Industry towards northwest, offices north, residential and commerce mixed along streets.
const positionOrder=places.map((p,i)=>({p,i}));const used=new Set();const assigned=[];for(const key of merged){let type=key.split('-')[0];let ranked=positionOrder.filter(o=>!used.has(o.i));ranked.sort((a,b)=>{const score=o=>{const [x,z]=o.p;let bias=0;if(['industry','delivery'].includes(type))bias=Math.hypot(x+140,z+125)*.8;else if(['software','work','fund'].includes(type))bias=Math.hypot(x-20,z+85)*.55;else if(['hotel','leisure'].includes(type))bias=Math.hypot(x-120,z-75)*.45;else bias=Math.hypot(x,z)*.12;return bias+((o.i*73+key.length*37)%97)*.65};return score(a)-score(b)});if(ranked.length){used.add(ranked[0].i);assigned.push([key,ranked[0].p])}}
const decoration=Object.keys(extras).filter(k=>/^(park|street|terrain|tree)-/.test(k));for(let j=0;j<decoration.length;j++){const key=decoration[j];if(key===fountainKey)continue;let p=null;for(let tries=0;tries<400;tries++){const x=-200+rand()*392,z=-159+rand()*303;if(inside(x,z)&&Math.hypot(x+4,z+9)>7&&places.every(q=>Math.hypot(q[0]-x,q[1]-z)>6)&&routes.every(l=>distRoute(x,z,l)>4)&&distRoute(x,z,river)>6){p=[x,z];break}}if(p)sprite(scene,key,...p,key.startsWith('park')?5.2:key.startsWith('tree')?3.6:2.3)}
for(let n=0;n<assigned.length;n++){const [key,[bx,bz]]=assigned[n];const district=new T.Group();district.position.set(bx,0,bz);scene.add(district);if(n%3===0)tree(district,-4.3,3.8,.65);
const type=key.split('-')[0],economyType=({hospital:'rest',clinic:'rest',pharmacy:'budget',dentist:'rest',vet:'rest',gym:'rest',cinema:'rest',hotel:'studio',home:'studio',industry:'delivery',building:'work',landmark:'rest',leisure:'rest'})[type]||type;const id='art-'+key,g=new T.Group();g.position.set(0,.25,0);district.add(g);const model=new T.Group();g.add(model);const tex=spriteLoader.load(allArt[key],t=>{const im=t.image;sp.scale.x=sp.scale.y*im.width/im.height;});tex.colorSpace=T.SRGBColorSpace;const sp=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,alphaTest:.22,depthWrite:false,toneMapped:false}));sp.center.set(.5,0);sp.scale.set(10.3,9.8,1);model.add(sp);const ring=new T.Mesh(new T.RingGeometry(2.5,2.76,40),new T.MeshBasicMaterial({color:0xffce55,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.024;ring.visible=false;g.add(ring);const title=({hospital:'Hospital',clinic:'Clinic',pharmacy:'Pharmacy',dentist:'Dentist',vet:'Veterinary clinic',gym:'Gym',cinema:'Cinema',hotel:'Hotel'})[type]||catalog[type]||type;const own=textSprite('OWNED','#427a54');own.position.y=8.1;own.visible=false;g.add(own);g.userData.lot=id;lots.push({id,type:economyType,g,model,ring,own,sp,title})}
const vehicleKeys=Object.keys(extras).filter(k=>k.startsWith('vehicle-'));for(let i=0;i<vehicleKeys.length;i++){const g=new T.Group();scene.add(g);sprite(g,vehicleKeys[i],0,0,1.75);cars.push(g)}
function view(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;const f=(w/h<.8?1.25:1)/zoom;camera.position.set(center.x+32*f,49*f,center.z+32*f);camera.lookAt(center);camera.updateProjectionMatrix()}
new ResizeObserver(view).observe(host);view();
const ray=new T.Raycaster(),ndc=new T.Vector2(),pointers=new Map();let drag=false,start=null,pinch=0;const el=renderer.domElement;el.style.touchAction='none';
function select(l){selected=l;for(const a of lots)a.ring.visible=a===l||a.own.visible;onSelect({id:l.id,type:l.type,title:l.title})}
el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===1){drag=false;start=[e.clientX,e.clientY]}if(pointers.size===2){drag=true;const a=[...pointers.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])}});
el.addEventListener('pointermove',e=>{const prev=pointers.get(e.pointerId);if(!prev)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);zoom=T.MathUtils.clamp(zoom*d/Math.max(1,pinch),.27,2.5);pinch=d;view();return}if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>8)drag=true;if(drag){const dx=(e.clientX-prev[0])*.09/zoom,dy=(e.clientY-prev[1])*.09/zoom;center.x=T.MathUtils.clamp(center.x-dx-dy,-worldWidth/2+7,worldWidth/2-7);center.z=T.MathUtils.clamp(center.z+dx-dy,-worldDepth/2+7,worldDepth/2-7);view()}});
el.addEventListener('pointerup',e=>{if(!drag&&pointers.size===1){const r=el.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);for(const hit of ray.intersectObjects(lots.map(l=>l.g),true)){let o=hit.object;while(o&&!o.userData.lot)o=o.parent;if(o){const l=lots.find(l=>l.id===o.userData.lot);if(l){select(l);break}}}}pointers.delete(e.pointerId)});el.addEventListener('pointercancel',e=>pointers.delete(e.pointerId));el.addEventListener('wheel',e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.27,2.5);view()},{passive:false});
function frame(ms){requestAnimationFrame(frame);if(!active||!host.clientWidth)return;const t=ms/1000;cars.forEach((g,i)=>{const pts=routes[i%routes.length];const u=((t*(.016+i%3*.003)+i*.17)%1)*(pts.length-1);const k=Math.min(pts.length-2,Math.floor(u)),f=u-k;const a=pts[k],b=pts[k+1];g.position.set(a[0]+(b[0]-a[0])*f,.1,a[1]+(b[1]-a[1])*f+.8)});water.forEach((f,i)=>f.position.y=.99+Math.sin(t*2+i)*.035);renderer.render(scene,camera)}requestAnimationFrame(frame);
return {sync(state){active=!!state;if(!state)return;for(const l of lots){const own=state.cityOwned?.[l.id]===l.type;const level=own?(state.cityLevels?.[l.id]||0):0;l.own.visible=own;l.ring.visible=own||l===selected;l.model.scale.y=1+level*.13}},slots(){return lots.map(({id,type})=>({id,type}))},cancel(){selected=null;for(const l of lots)l.ring.visible=l.own.visible},move(){},interact(){},resize:view,assetStatus(){return {loaded:0,requested:0,settled:0}}}
}
