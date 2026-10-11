export type V4 = [number,number,number,number];
export type V3 = [number,number,number];
export type Shape = 'cube'|'simplex'|'cross';
export type Plane = 'XW'|'YW'|'ZW'|'XY'|'XZ'|'YZ';
export const planes: Record<Plane,[number,number]>={XW:[0,3],YW:[1,3],ZW:[2,3],XY:[0,1],XZ:[0,2],YZ:[1,2]};
export function rotate(v:V4,plane:Plane,angle:number):V4 {
 const [a,b]=planes[plane],r:V4=[...v],c=Math.cos(angle),s=Math.sin(angle);
 r[a]=c*v[a]-s*v[b]; r[b]=s*v[a]+c*v[b]; return r;
}
export function orient(v:V4,angles:Record<Plane,number>):V4 {
 return (Object.keys(planes) as Plane[]).reduce((p,k)=>rotate(p,k,angles[k]),v);
}
export function polytope(shape:Shape):{vertices:V4[],edges:[number,number][]} {
 let vertices:V4[]=[];
 if(shape==='cube') vertices=Array.from({length:16},(_,i)=>[0,1,2,3].map(k=>i&(1<<k)?1:-1) as V4);
 if(shape==='cross') for(let k=0;k<4;k++) for(const sign of [-1,1]) {const v:V4=[0,0,0,0];v[k]=sign*1.7;vertices.push(v);}
 // Regular 5-cell: all pairwise squared edge lengths are 8.
 if(shape==='simplex') vertices=[[1,1,1,-1/Math.sqrt(5)],[1,-1,-1,-1/Math.sqrt(5)],[-1,1,-1,-1/Math.sqrt(5)],[-1,-1,1,-1/Math.sqrt(5)],[0,0,0,4/Math.sqrt(5)]];
 const edges:[number,number][]=[];
 for(let i=0;i<vertices.length;i++) for(let j=i+1;j<vertices.length;j++) {
 const d=vertices[i].reduce((s,x,k)=>s+(x-vertices[j][k])**2,0);
 if(shape==='simplex'||(shape==='cube'&&Math.abs(d-4)<1e-8)||(shape==='cross'&&Math.abs(d-5.78)<1e-8))edges.push([i,j]);
 }return {vertices,edges};
}
export function section(vertices:V4[],edges:[number,number][],w:number):V3[] {
 const out:V3[]=[]; const eps=1e-8;
 const add=(v:V3)=>{if(!out.some(p=>p.every((x,k)=>Math.abs(x-v[k])<eps)))out.push(v);};
 for(const [i,j]of edges){const a=vertices[i],b=vertices[j],da=a[3]-w,db=b[3]-w;
 if(Math.abs(da)<eps)add(a.slice(0,3) as V3);
 if(Math.abs(db)<eps)add(b.slice(0,3) as V3);
 if((da< -eps&&db>eps)||(da>eps&&db< -eps)){const t=da/(da-db);add([0,1,2].map(k=>a[k]+t*(b[k]-a[k])) as V3);}
 }return out;
}
export function ballSection(center:V4,radius:number,w:number):{center:V3,radius:number}|null {
 const r2=radius**2-(w-center[3])**2;
 return r2< -1e-8?null:{center:center.slice(0,3) as V3,radius:Math.sqrt(Math.max(0,r2))};
}
