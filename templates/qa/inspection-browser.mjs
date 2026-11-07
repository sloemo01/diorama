// Rendered helper regression, not a substitute for the subject's own QA/UI.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const project=path.resolve(process.env.DIORAMA_TEST_PROJECT||process.cwd());
const require=createRequire(path.join(project,'package.json'));
const { build }=require('esbuild');const { chromium }=require('playwright-core');
const templates=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out=path.resolve(process.env.DIORAMA_QA_OUT||path.join(project,'qa','skill-inspection'));
await mkdir(out,{recursive:true});
const imported=name=>JSON.stringify(path.join(templates,name));
const fixture=`
import * as THREE from 'three';
import { createInspection } from ${imported('inspection.js')};
import { createStrokedToon } from ${imported('stroked-toon.js')};
import { createPixelStroke } from ${imported('pixel-stroke.js')};
import { PixelPost } from ${imported('post.js')};
const preset=new URLSearchParams(location.search).get('preset');
const canvas=document.querySelector('canvas');
const renderer=new THREE.WebGLRenderer({canvas,antialias:preset==='stroked-toon',preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(600,400,false);
let look;
if(preset==='pixel-stroke')look=createPixelStroke(renderer,{width:300,height:200});
else if(preset==='pixel'){look=new PixelPost(renderer);look.setSize(600,400);renderer.toneMapping=THREE.NoToneMapping;}
else look=createStrokedToon(renderer,{dpr:1,maxDpr:1});
const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x505b69,1.5));
const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(-3,5,8);scene.add(light);
const camera=new THREE.OrthographicCamera(-4.5,4.5,3,-3,.1,100);camera.position.set(5,4,9);camera.lookAt(0,0,0);
const ramp=new THREE.DataTexture(new Uint8Array([68,122,184,246]),4,1,THREE.RedFormat);ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
const shared=new THREE.MeshToonMaterial({color:0x87633d,gradientMap:ramp});shared.userData.outlineParameters={visible:true,thickness:.003};
const basic=new THREE.MeshBasicMaterial({color:0x315444});basic.userData.outlineParameters={visible:false};
const a=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1),shared);a.position.x=-2.1;
const sibling=new THREE.Mesh(new THREE.BoxGeometry(.4,.4,.4),shared);sibling.position.set(-2.1,1,0);
const b=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1),basic);
const multi=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1),[shared,basic,shared,basic,shared,basic]);multi.position.x=2.1;
const meshes=[a,sibling,b,multi];meshes.forEach((m,i)=>{m.name='fixture-piece-'+i;scene.add(m)});
// An unregistered opaque foreground object must keep occluding depth-tested edges.
const direction=camera.position.clone().normalize();
const occluder=new THREE.Mesh(new THREE.BoxGeometry(.36,.36,.3),new THREE.MeshBasicMaterial({color:0x242424}));occluder.position.copy(a.position).add(new THREE.Vector3(.65,0,.5)).addScaledVector(direction,1.2);scene.add(occluder);
const parts=new Map([['shared',{meshes:[a,sibling]}],['basic',{meshes:[b]}],['multi',{meshes:[multi]}]]);
function render(){look.render(scene,camera)}
const inspect=createInspection(THREE,{parts,onChange:render});
const part=document.querySelector('#part'),piece=document.querySelector('#piece');
function entries(){piece.replaceChildren(new Option('Whole assembly',''));if(inspect.selection)for(const e of inspect.piecePickerEntries(inspect.selection.partId))piece.add(new Option(e.label,e.value));}
part.onchange=()=>{inspect.select({partId:part.value});entries()};
piece.onchange=()=>inspect.select({partId:part.value,mesh:inspect.piecePickerEntries(part.value).find(e=>e.value===piece.value)?.mesh||null});
// Explicit fixture Home/End adapter avoids an OS-native popup in headless runs;
// this proves this adapter only, not keyboard operation of a consuming scene.
piece.onkeydown=event=>{if(!['Home','End'].includes(event.key))return;event.preventDefault();piece.selectedIndex=event.key==='End'?piece.options.length-1:0;piece.dispatchEvent(new Event('change',{bubbles:true}));};
document.querySelector('#clear').onclick=()=>{inspect.clear();entries()};
function pixels(){render();const gl=renderer.getContext(),data=new Uint8Array(600*400*4);gl.readPixels(0,0,600,400,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;}
function region(mesh){const p=mesh.getWorldPosition(new THREE.Vector3()).project(camera);return{x:Math.round((p.x+1)*300),y:Math.round((p.y+1)*200)};}
function meanDifference(a,b,region){let total=0,count=0;for(let y=region.y-30;y<=region.y+30;y++)for(let x=region.x-30;x<=region.x+30;x++){const i=(y*600+x)*4;total+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);count+=3;}return total/count;}
render();
window.fixture={inspect,renderer,scene,camera,parts,pixels,region,meanDifference,
check(id){inspect.clear();const base=pixels();inspect.select({partId:id});const selected=pixels();const mesh=parts.get(id).meshes[0];const delta=meanDifference(base,selected,region(mesh));const occlusion=region(occluder),j=(occlusion.y*600+occlusion.x)*4;
const patchDelta=data=>{let worst=0;for(let y=occlusion.y-4;y<=occlusion.y+4;y++)for(let x=occlusion.x-4;x<=occlusion.x+4;x++)for(let k=0;k<3;k++)worst=Math.max(worst,Math.abs(base[(y*600+x)*4+k]-data[(y*600+x)*4+k]));return worst;};
const depthDelta=patchDelta(selected),occluderDark=base[j]<60&&base[j+1]<60&&base[j+2]<60;
let negativeDepthDetected=null;
if(id==='shared'){const edge=a.children.find(x=>x.userData.inspectionOverlay);edge.material.depthTest=false;negativeDepthDetected=patchDelta(pixels())>8;edge.material.depthTest=true;render();}
inspect.clear();const restored=pixels();let restoredDiff=0;for(let i=0;i<base.length;i++)if(base[i]!==restored[i])restoredDiff++;return{id,delta,depthDelta,occluderDark,negativeDepthDetected,restoredDiff};},
move(){a.position.y=.2;scene.updateMatrixWorld(true);const e=a.children.find(x=>x.userData.inspectionOverlay);if(!e)return false;return e.getWorldPosition(new THREE.Vector3()).distanceTo(a.getWorldPosition(new THREE.Vector3()))<1e-10;},
render};
`;
const result=await build({stdin:{contents:fixture,resolveDir:templates,sourcefile:'inspection-fixture.js'},bundle:true,write:false,format:'iife',platform:'browser',nodePaths:[path.join(project,'node_modules')]});
const bundle=result.outputFiles[0].text;
await writeFile(path.join(out,'fixture.html'),`<!doctype html><meta charset="utf-8"><title>Inspection regression fixture</title><style>body{background:#f7f7f5;font:14px system-ui}canvas{display:block;width:600px;height:400px}button,select{font:inherit;margin:8px}</style><canvas width="600" height="400"></canvas><label>Assembly<select id="part"><option>shared</option><option>basic</option><option>multi</option></select></label><label>Piece<select id="piece"></select></label><button id="clear">Clear</button><script>${bundle.replace(/<\/script/gi,'<\\/script')}</script>`);
const report={command:'node templates/qa/inspection-browser.mjs',bundleSha256:createHash('sha256').update(bundle).digest('hex'),helperSha256:createHash('sha256').update(await readFile(path.join(templates,'inspection.js'))).digest('hex'),checks:[],screenshots:[],errors:[],limits:['Synthetic helper fixture only, not a complete educational UI or scene.','Rendered colour difference and depth assertions do not prove every subject-specific part readable; inspect the captures and repeat in the real scene.','No camera focus, orbit, mechanical contact, deformation or manufacturing certification.']};
const executablePath=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await chromium.launch({executablePath,headless:true});
try{
 for(const preset of ['stroked-toon','pixel','pixel-stroke']){
  const page=await browser.newPage({viewport:{width:640,height:530},deviceScaleFactor:1});
  page.on('pageerror',e=>report.errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
  await page.goto(pathToFileURL(path.join(out,'fixture.html')).href+'?preset='+preset);await page.waitForFunction(()=>window.fixture);
  for(const id of ['shared','basic','multi']){
   const check=await page.evaluate(id=>window.fixture.check(id),id);assert.ok(check.delta>8,`${preset}/${id} rendered emphasis invisible: ${check.delta}`);assert.ok(check.occluderDark,`${preset}: occluder fixture not sampled`);assert.ok(check.depthDelta<=1,`${preset}: opaque occluder lost`);if(id==='shared')assert.equal(check.negativeDepthDetected,true,`${preset}: injected depth override was not detected`);assert.equal(check.restoredDiff,0,`${preset}: restored render differs`);report.checks.push({preset,status:'PASS',...check});
   await page.selectOption('#part',id);await page.screenshot({path:path.join(out,`${preset}-${id}.png`)});report.screenshots.push(`${preset}-${id}.png`);
  }
  await page.selectOption('#part','shared');await page.focus('#piece');await page.keyboard.press('End');
  assert.equal(await page.evaluate(()=>window.fixture.inspect.selection.mesh?.name),'fixture-piece-1');
  await page.selectOption('#piece',await page.locator('#piece option').nth(1).getAttribute('value'));
  assert.equal(await page.evaluate(()=>window.fixture.move()),true);await page.focus('#clear');await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>window.fixture.inspect.stats.overlays),0);await page.close();
 }
 assert.equal(report.checks.length,9,'all three fixtures in all three presets must run');
 assert.deepEqual(report.errors,[]);report.status='PASS';console.log(JSON.stringify(report,null,2));
}catch(error){report.status='FAIL';report.failure=error.stack;process.exitCode=1;console.error(error);}
finally{await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();}
