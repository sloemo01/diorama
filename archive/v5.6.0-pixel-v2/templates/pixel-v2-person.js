import * as THREE from 'three';

// Independently authored V2 figure. Local +Z faces forward; feet sit at Y=0.
// Shader integration must interpret userData.pixelRole='cast': metadata alone
// does not disable a compositor's dither or supply stepped lighting.
const UP = new THREE.Vector3(0, 1, 0);
function segment(parent, a, b, radius, material) {
  const delta = b.clone().sub(a), length = delta.length();
  const object = new THREE.Mesh(new THREE.CapsuleGeometry(radius, Math.max(.001, length - 2 * radius), 4, 8), material);
  object.position.copy(a).add(b).multiplyScalar(.5);
  if (length > 1e-6) object.quaternion.setFromUnitVectors(UP, delta.normalize());
  object.castShadow = object.receiveShadow = true;
  object.userData.pixelRole = 'cast';
  parent.add(object);
  return object;
}
function ball(parent, radius, material, scale = [1, 1, 1]) {
  const object = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), material);
  object.scale.set(...scale);
  object.castShadow = object.receiveShadow = true;
  object.userData.pixelRole = 'cast';
  parent.add(object);
  return object;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
export function createV2Person({ shirt = 0xa74538, stripe = 0xe5d7b3,
  trousers = 0x34364c, skin = 0xc58c67, hair = 0x31252b, shoes = 0xd9d4c6,
  height = 1.8, striped = false } = {}) {
  if (!Number.isFinite(height) || height <= 0) throw new RangeError('Positive figure height required');
  const root = new THREE.Group();
  root.name = 'v2-person'; root.userData.pixelRole = 'cast';
  root.scale.setScalar(height / 1.8);
  const materials = [shirt, stripe, trousers, skin, hair, shoes].map(color => new THREE.MeshLambertMaterial({color}));
  const [top, band, pants, flesh, cap, sole] = materials;
  const body = new THREE.Group(); root.add(body);
  const torso = segment(body, V(0,.84,0), V(0,1.37,0), .19, top);
  torso.scale.x = 1.12; torso.scale.z = .76;
  const pelvis = ball(body,.19,pants,[1,.7,.8]); pelvis.position.y=.84;
  // Broad geometry bands stay in garment space, including under body lean.
  if (striped) for (const y of [1.04,1.22]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(.195,.195,.07,12),band);
    ring.scale.set(1.12,1,.76); ring.position.y=y;
    ring.castShadow=ring.receiveShadow=true;ring.userData.pixelRole='cast';body.add(ring);
  }
  const neck=segment(body,V(0,1.34,0),V(0,1.48,0),.065,flesh);
  const head=ball(body,.15,flesh,[.92,1.12,.94]);head.position.set(0,1.58,.012);
  const hairCap=ball(head,.151,cap,[.96,.7,.97]);hairCap.position.set(0,.06,-.018);
  const nose=ball(head,.027,flesh,[.65,.6,1]);nose.position.set(0,-.006,.14);
  // Real joint hierarchy; shoulder/hip pitch is local X rotation.
  function limb(anchor, upperLength, lowerLength, radius, upperMaterial, lowerMaterial, isLeg) {
    const pivot=new THREE.Group();pivot.position.copy(anchor);body.add(pivot);
    segment(pivot,V(0,0,0),V(0,-upperLength,0),radius,upperMaterial);
    const bend=new THREE.Group();bend.position.y=-upperLength;pivot.add(bend);
    segment(bend,V(0,0,0),V(0,-lowerLength,0),radius*.78,lowerMaterial);
    const tip=new THREE.Group();tip.position.y=-lowerLength;bend.add(tip);
    const end=ball(tip,isLeg?.085:.063,isLeg?sole:flesh,isLeg?[1,.65,1.7]:[.85,1.1,.8]);
    if(isLeg)end.position.z=.055;
    return {pivot,bend,tip};
  }
  const legs=[-.105,.105].map(x=>limb(V(x,.84,0),.39,.395,.078,pants,pants,true));
  const arms=[-.235,.235].map(x=>limb(V(x,1.32,0),.275,.25,.065,top,flesh,false));
  function pose({ crouch=0, lean=0, hip=[0,0], knee=[0,0], shoulder=[0,0], elbow=[.13,.13], headYaw=0 }={}) {
    body.position.y=-Math.max(0,Math.min(1,crouch))*.25;
    body.rotation.x=lean;
    for(let i=0;i<2;i++) {
      legs[i].pivot.rotation.x=hip[i]; legs[i].bend.rotation.x=knee[i];
      arms[i].pivot.rotation.x=shoulder[i];arms[i].bend.rotation.x=elbow[i];
    }
    head.rotation.y=headYaw;
    root.updateMatrixWorld(true);
  }
  // Low-level deterministic pose sample. For travelling walks use a foot-lock/IK
  // controller: this preview cycle alone is NOT planted-foot locomotion.
  function sample(time,{action='idle',phase=0,amount=1}={}) {
    if(!Number.isFinite(time)||!Number.isFinite(phase))throw new RangeError('Finite pose time required');
    const p=Math.min(1,Math.max(0,phase));
    if(action==='walk-preview') {
      const a=Math.sin(time*Math.PI*2),b=-a;
      pose({hip:[a*.42,b*.42],knee:[-Math.max(0,-a)*.6,-Math.max(0,-b)*.6],shoulder:[b*.28,a*.28]});
    } else if(action==='reach') {
      const reach=Math.sin(Math.PI*p)*amount;
      pose({shoulder:[-reach*1.3,.06],elbow:[.2+reach*.25,.14],lean:reach*.06});
    } else if(action==='idle') pose({headYaw:Math.sin(time*.6)*.055,shoulder:[.035,-.035]});
    else throw new Error('Unknown V2 action: '+action);
  }
  pose();
  return {root,body,legs,arms,head,pose,sample,
    grips:arms.map(a=>a.tip),feet:legs.map(l=>l.tip),
    dispose(){const geometries=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();}
  };
}
