/**
 * plan -> Three.js. The only module here that knows about THREE besides the
 * mesher and the figure.
 *
 *   const d = buildDiorama(plan);
 *   scene.add(d.group);
 *   d.apply(t);            // every frame, or once for a frozen still
 *
 * Static geometry (terrain, every building, prop and tree) is one mesh. Things
 * that move are driven by apply(t), which reads stateAt(plan, t) and the closed
 * forms in ambient.js and writes transforms. It keeps no state between frames.
 *
 * The four slab-edge clip planes are on every material, so a visitor walking on
 * from beyond the edge is cut at the boundary (look contract rule 8).
 */
import * as THREE from 'three';
import { softDiscTexture } from '../detail.js';
import { Mesher, glowMaterial, partsMesh } from './mesher.js';
import { buildFigure, figureShadow, setPose, actorPose, idlePose } from './figure.js';
import { carryPoint, carryYaw } from './cast.js';
import { stateAt } from './generate.js';
import { prop } from './grammar.js';
import { THEMES } from './themes.js';
import { C, tone } from './palette.js';
import { K, CELL, STEP, WATER_Y, BED_Y, BRIDGE_Y, BASE_Y, centre, kindOf, levelOf, inside } from './layout.js';
import { rng as makeRng, hash, fbm, lerp, lerpAngle, smooth, loopFreq, TAU } from './rng.js';
import {
  particleAt, birdAt, puffAt, PUFFS, glintAt, duckAt, boatAt, sailsAngle, beaconAngle,
  dropAt, JETS, DROPS, flameAt, FLAMES, emberAt, EMBERS, fireLight,
} from './ambient.js';

const PI = Math.PI;

/* ---- terrain ------------------------------------------------------------------------------- */

function waterDepth(g, i, k) {
  for (let r = 1; r <= 3; r++) {
    for (let dk = -r; dk <= r; dk++) for (let di = -r; di <= r; di++) {
      if (Math.max(Math.abs(di), Math.abs(dk)) !== r) continue;
      if (inside(g, i + di, k + dk)) {
        const kd = kindOf(g, i + di, k + dk);
        if (kd !== K.WATER && kd !== K.BRIDGE) return r;
      }
    }
  }
  return 4;
}

function cellLook(plan, theme, i, k) {
  const g = plan.grid;
  const kd = kindOf(g, i, k);
  const snow = plan.weather === 'snow';
  const { x, z } = centre(g, i, k);
  if (kd === K.WATER || kd === K.BRIDGE) {
    const d = waterDepth(g, i, k);
    return { wet: true, top: d <= 1 ? 'water2' : d === 2 ? 'water3' : 'water4', side: 'stone3' };
  }
  const y = levelOf(g, i, k) * STEP;
  if (kd === K.ROAD) return { y, top: snow ? 'snowShade' : theme.road, side: theme.groundSide };
  if (kd === K.PLAZA) {
    const p = plan.layout.plaza;
    const ring = Math.max(Math.abs(i - p.i), Math.abs(k - p.k));
    const top = ring === 3 ? 'stone2' : (i + k) % 2 ? theme.plazaTone : 'stone1';
    return { y, top: snow && ring === 3 ? 'snowShade' : top, side: theme.groundSide };
  }
  const n = fbm(hash32Seed(plan.seed), Math.floor(x / 1.0) * 0.45, Math.floor(z / 1.0) * 0.45, 2);
  const top = snow ? (n > 0.55 ? 'snowShade' : 'snow') : n > 0.52 ? theme.ground[1] : theme.ground[0];
  return { y, top, side: theme.groundSide };
}
const hash32Seed = (s) => Math.floor(hash('ground', s) * 1e9);

function terrain(M, plan, theme) {
  const g = plan.grid;
  const TOP = 0.07;
  for (let k = 0; k < g.nz; k++) {
    let i = 0;
    while (i < g.nx) {
      const a = cellLook(plan, theme, i, k);
      let j = i + 1;
      while (j < g.nx) {
        const b = cellLook(plan, theme, j, k);
        if (b.wet !== a.wet || b.y !== a.y || b.top !== a.top) break;
        j++;
      }
      const w = (j - i) * CELL;
      const cx = -g.hx + (i * CELL + w / 2);
      const cz = -g.hz + (k + 0.5) * CELL;
      if (a.wet) {
        M.box(w, BED_Y - BASE_Y, CELL, 'stone3', cx, (BASE_Y + BED_Y) / 2, cz);
        M.box(w, WATER_Y - BED_Y, CELL, a.top, cx, (BED_Y + WATER_Y) / 2, cz);
      } else {
        M.box(w, a.y - TOP - BASE_Y, CELL, a.side, cx, (BASE_Y + a.y - TOP) / 2, cz);
        M.box(w, TOP, CELL, a.top, cx, a.y - TOP / 2, cz);
      }
      i = j;
    }
  }
  // Details per cell: shore foam, stairs, bridge decks, terrace lips.
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let k = 0; k < g.nz; k++) {
    for (let i = 0; i < g.nx; i++) {
      const kd = kindOf(g, i, k);
      const { x, z } = centre(g, i, k);
      if (kd === K.WATER || kd === K.BRIDGE) {
        N4.forEach(([di, dk]) => {
          if (!inside(g, i + di, k + dk)) return;
          const nk = kindOf(g, i + di, k + dk);
          if (nk === K.WATER || nk === K.BRIDGE) return;
          if (di) M.box(0.09, 0.012, CELL, 'water0', x + di * (CELL / 2 - 0.045), WATER_Y + 0.006, z);
          else M.box(CELL, 0.012, 0.09, 'water0', x, WATER_Y + 0.006, z + dk * (CELL / 2 - 0.045));
        });
      }
      if (kd === K.BRIDGE) {
        const alongX = N4.slice(0, 2).some(([di]) => inside(g, i + di, k) && kindOf(g, i + di, k) !== K.WATER);
        const sx = alongX ? CELL : 0.9, sz = alongX ? 0.9 : CELL;
        M.box(sx, 0.08, sz, 'wood1', x, BRIDGE_Y - 0.04, z);
        for (let p = -1; p <= 1; p += 2) {
          M.box(alongX ? CELL : 0.02, 0.02, alongX ? 0.02 : CELL, 'wood3', x + (alongX ? 0 : p * 0.2), BRIDGE_Y + 0.002, z + (alongX ? p * 0.2 : 0));
          // rails and posts on both sides
          const ox = alongX ? 0 : p * 0.46, oz = alongX ? p * 0.46 : 0;
          M.box(alongX ? CELL : 0.05, 0.05, alongX ? 0.05 : CELL, 'wood2', x + ox, BRIDGE_Y + 0.42, z + oz);
          M.box(0.06, 0.46, 0.06, 'wood3', x + ox, BRIDGE_Y + 0.2, z + oz);
        }
        M.box(alongX ? 0.06 : 0.9, BRIDGE_Y - BED_Y, alongX ? 0.9 : 0.06, 'wood3', x, (BED_Y + BRIDGE_Y) / 2 - 0.05, z);
      }
      if (kd === K.ROAD || kd === K.PLAZA) {
        const lv = levelOf(g, i, k);
        N4.forEach(([di, dk]) => {
          if (!inside(g, i + di, k + dk)) return;
          const nk = kindOf(g, i + di, k + dk);
          if (!(nk === K.ROAD || nk === K.PLAZA)) return;
          if (levelOf(g, i + di, k + dk) !== lv + 1) return;
          // two steps in this cell, rising toward the higher neighbour
          for (let s = 1; s <= 2; s++) {
            const off = (s === 1 ? 0.0625 : 0.1875);
            const h = (STEP * s) / 3;
            const px = x + di * off, pz = z + dk * off;
            if (di) M.box(0.125, h, CELL * 0.9, 'stone1', px, lv * STEP + h / 2, pz);
            else M.box(CELL * 0.9, h, 0.125, 'stone1', px, lv * STEP + h / 2, pz);
          }
        });
      }
    }
  }
}

/* ---- the diorama --------------------------------------------------------------------------- */

export function buildDiorama(plan, opts = {}) {
  const theme = THEMES[plan.theme];
  const { hx, hz } = plan.slab;
  const clip = opts.clip ?? [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), hx + 0.002),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), hx + 0.002),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), hz + 0.002),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), hz + 0.002),
  ];
  const loop = plan.loop;
  const w = (f) => loopFreq(loop, f);
  const group = new THREE.Group();
  group.name = 'procedural-diorama';
  const entities = {};

  // ---- static -----------------------------------------------------------------------------
  const M = new Mesher();
  terrain(M, plan, theme);
  for (const p of plan.pieces) M.at(p.at.x, p.at.y, p.at.z, p.at.yaw, p.at.s, (m) => m.parts(p.parts));
  const staticMesh = M.mesh({ clip, name: 'static' });
  group.add(staticMesh);

  // Night windows and lanterns: one unlit mesh per piece, each with its own switch-on threshold.
  const glows = plan.pieces.filter((p) => p.glow.length).map((p) => {
    const m = new Mesher();
    m.at(p.at.x, p.at.y, p.at.z, p.at.yaw, p.at.s, (mm) => mm.parts(p.glow));
    const mesh = m.mesh({ material: glowMaterial(clip), cast: false, receive: false, name: 'glow:' + p.id });
    mesh.visible = false;
    group.add(mesh);
    return { mesh, threshold: p.threshold ?? 0.3, kind: p.kind };
  });

  // ---- light ------------------------------------------------------------------------------
  const hemi = new THREE.HemisphereLight(0xd6ecf6, 0x6f6a60, 0.26);
  const sun = new THREE.DirectionalLight(0xfff8ee, 3.3);
  const half = Math.max(hx, hz) + 1.5;
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 4, far: 90 });
  sun.shadow.bias = -0.00022;
  sun.shadow.normalBias = 0.025;
  sun.shadow.camera.updateProjectionMatrix();
  sun.target.position.set(0, 0, 0);
  const fill = new THREE.DirectionalLight(0xa9cbe2, 0.46);
  fill.position.set(19, 13, -15);
  group.add(hemi, sun, sun.target, fill);

  // Lamp light: a few real point lights near the square, and a warm pool under every lamp.
  const lampPieces = plan.pieces.filter((p) => p.kind === 'lamp');
  const sq = plan.layout.plaza;
  const nearest = lampPieces.slice().sort((a, b) => Math.hypot(a.at.x - sq.x, a.at.z - sq.z) - Math.hypot(b.at.x - sq.x, b.at.z - sq.z)).slice(0, 3);
  const lampLights = nearest.map((p) => {
    const l = new THREE.PointLight(0xffc857, 0, 5.5, 1.6);
    const c = Math.cos(p.at.yaw), s = Math.sin(p.at.yaw);
    l.position.set(p.at.x + 0.28 * s, p.at.y + 1.45, p.at.z + 0.28 * c);
    group.add(l);
    return l;
  });
  const poolTex = softDiscTexture('255,214,120');
  const pools = lampPieces.map((p) => {
    const mat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, clippingPlanes: clip });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), mat);
    m.rotation.x = -PI / 2;
    const c = Math.cos(p.at.yaw), s = Math.sin(p.at.yaw);
    m.position.set(p.at.x + 0.28 * s, p.at.y + 0.025, p.at.z + 0.28 * c);
    m.renderOrder = 2;
    group.add(m);
    return m;
  });

  // ---- cast -------------------------------------------------------------------------------
  const crew = plan.crew.map((c) => {
    const fig = buildFigure(c.look, c.seed, clip);
    fig.group.position.set(c.x, c.y, c.z);
    fig.group.rotation.y = c.yaw;
    fig.group.name = c.id;
    const shadow = figureShadow(group, clip);
    shadow.position.set(c.x, c.y + 0.018, c.z);
    group.add(fig.group);
    entities[c.id] = fig.group;
    return { def: c, fig };
  });
  const actors = plan.actors.map((a) => {
    const fig = buildFigure(a.look, a.seed, clip);
    fig.group.name = a.id;
    const shadow = figureShadow(group, clip);
    group.add(fig.group);
    entities[a.id] = fig.group;
    return { def: a, fig, shadow };
  });
  const actorIndex = new Map(plan.actors.map((a, i) => [a.id, i]));
  const crates = plan.props.map((p) => {
    const mesh = partsMesh(prop('crate', makeRng(plan.seed, p.id), { tone: p.tone, lid: p.lid }).list, { clip, name: p.id });
    mesh.visible = false;
    group.add(mesh);
    return { def: p, mesh };
  });
  const _a = new THREE.Vector3(), _b = new THREE.Vector3();

  // ---- ambient ----------------------------------------------------------------------------
  const A = plan.ambient;
  const unit = new THREE.BoxGeometry(1, 1, 1);
  function instanced(count, material, name) {
    const im = new THREE.InstancedMesh(unit, material, Math.max(1, count));
    im.count = count;
    im.frustumCulled = false;
    im.name = name;
    group.add(im);
    return im;
  }
  const lit = (hex) => new THREE.MeshLambertMaterial({ color: hex, clippingPlanes: clip });
  const unlit = (hex) => new THREE.MeshBasicMaterial({ color: hex, clippingPlanes: clip });
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
  const setI = (im, i, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) => {
    _m4.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz));
    im.setMatrixAt(i, _m4);
  };

  // weather
  const W = A.weather;
  let weatherMesh = null;
  if (W.particles.length) {
    const mat = W.kind === 'fireflies' ? unlit(tone('lampHot')) : W.kind === 'rain' ? unlit(tone('water1')) : lit(0xffffff);
    weatherMesh = instanced(W.particles.length, mat, 'weather');
    if (W.kind !== 'fireflies' && W.kind !== 'rain') {
      W.particles.forEach((p, i) => weatherMesh.setColorAt(i, new THREE.Color(tone(p.tone))));
      weatherMesh.instanceColor.needsUpdate = true;
    }
    weatherMesh.castShadow = false;
  }
  // smoke
  const puffs = plan.smoke.length ? instanced(plan.smoke.length * PUFFS, lit(tone('stone0')), 'smoke') : null;
  // birds: a body and two wings each
  const birds = A.birds.map((b, i) => {
    const g = new THREE.Group();
    const body = partsMesh([{ g: 'box', a: [0.09, 0.08, 0.3], c: b.tone, p: [0, 0, 0] }, { g: 'box', a: [0.05, 0.04, 0.08], c: 'amber', p: [0, 0, 0.18] }], { clip, cast: true });
    const wl = new THREE.Group(), wr = new THREE.Group();
    wl.add(partsMesh([{ g: 'box', a: [0.34, 0.02, 0.14], c: b.tone, p: [-0.17, 0, 0] }], { clip }));
    wr.add(partsMesh([{ g: 'box', a: [0.34, 0.02, 0.14], c: b.tone, p: [0.17, 0, 0] }], { clip }));
    g.add(body, wl, wr);
    g.name = 'bird:' + i;
    group.add(g);
    entities['bird:' + i] = g;
    return { def: b, g, wl, wr };
  });
  // water glints
  const glints = A.glints.length ? instanced(A.glints.length, unlit(tone('water0')), 'glints') : null;
  // ducks
  const ducks = A.ducks.map((d, i) => {
    const g = new THREE.Group();
    const body = partsMesh([
      { g: 'box', a: [0.14, 0.1, 0.24], c: 'paper2', p: [0, 0.04, 0], ch: 0.03 },
      { g: 'box', a: [0.08, 0.04, 0.08], c: 'paper2', p: [0, 0.08, -0.12] },
    ], { clip });
    const headG = new THREE.Group();
    headG.position.set(0, 0.1, 0.1);
    headG.add(partsMesh([
      { g: 'sphere', a: [0.055], c: 'grass4', p: [0, 0.06, 0], ws: 6, hs: 4 },
      { g: 'box', a: [0.04, 0.025, 0.07], c: 'amber', p: [0, 0.05, 0.07] },
    ], { clip }));
    g.add(body, headG);
    g.name = 'duck:' + i;
    group.add(g);
    entities['duck:' + i] = g;
    return { def: d, g, head: headG };
  });
  // boats
  const boats = A.boats.map((b, i) => {
    const mesh = partsMesh(prop('boat', makeRng(plan.seed, 'boat' + i), { tone: b.tone }).list, { clip, name: 'boat:' + i });
    group.add(mesh);
    entities['boat:' + i] = mesh;
    return { def: b, mesh };
  });
  // landmark machines
  const machines = plan.machines.map((d, i) => {
    if (d.kind === 'sails') {
      const g = new THREE.Group();
      g.position.set(d.x, d.y, d.z);
      g.rotation.y = d.yaw;
      const rot = new THREE.Group();
      g.add(rot);
      const list = [];
      for (let s = 0; s < 4; s++) {
        const a = (s / 4) * TAU;
        const ca = Math.cos(a), sa = Math.sin(a);
        list.push({ g: 'box', a: [0.06, d.r, 0.04], c: 'wood3', p: [-sa * d.r / 2, ca * d.r / 2, 0.06], rz: a });
        list.push({ g: 'box', a: [0.3, d.r * 0.72, 0.02], c: 'paper2', p: [-sa * d.r * 0.6 + ca * 0.17, ca * d.r * 0.6 + sa * 0.17, 0.08], rz: a });
        for (let r = 1; r <= 3; r++) list.push({ g: 'box', a: [0.32, 0.02, 0.03], c: 'wood2', p: [-sa * (d.r * (0.25 + r * 0.22)) + ca * 0.17, ca * (d.r * (0.25 + r * 0.22)) + sa * 0.17, 0.095], rz: a });
      }
      list.push({ g: 'cyl', a: [0.1, 0.1, 0.14], c: 'wood4', p: [0, 0, 0.06], rx: PI / 2, seg: 8 });
      rot.add(partsMesh(list, { clip }));
      group.add(g);
      entities.sails = rot;
      return { d, g, rot };
    }
    if (d.kind === 'beacon') {
      const rot = new THREE.Group();
      rot.position.set(d.x, d.y, d.z);
      const beamMat = new THREE.MeshBasicMaterial({ map: softDiscTexture('255,233,168'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, clippingPlanes: clip });
      for (const s of [1, -1]) {
        const beam = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 0.9), beamMat);
        beam.position.x = s * 3.4;
        rot.add(beam);
      }
      group.add(rot);
      entities.beacon = rot;
      return { d, rot, beamMat };
    }
    if (d.kind === 'jets') {
      const im = instanced(JETS * DROPS, unlit(tone('water1')), 'jets');
      return { d, im };
    }
    if (d.kind === 'fire') {
      const flames = [];
      for (let k = 0; k < FLAMES; k++) {
        const f = flameAt(plan, d, k, 0);
        const mesh = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 5), unlit(tone(f.tone)));
        group.add(mesh);
        flames.push(mesh);
      }
      const embers = instanced(EMBERS, unlit(tone('lampHot')), 'embers');
      const light = new THREE.PointLight(0xffa040, 2.2, 6, 1.5);
      light.position.set(d.x, d.y + 0.6, d.z);
      group.add(light);
      entities.fire = flames[0];
      return { d, flames, embers, light };
    }
    return { d };
  });

  // ---- the frame --------------------------------------------------------------------------
  function apply(time) {
    const st = stateAt(plan, time);
    const t = st.t;
    const sky = st.sky;

    // light
    const D = sky.sun.dir;
    sun.position.set(D[0] * 34, D[1] * 34, D[2] * 34);
    sun.color.setHex(sky.sun.color);
    sun.intensity = sky.sun.intensity;
    hemi.color.setHex(sky.hemi.sky);
    hemi.groundColor.setHex(sky.hemi.ground);
    hemi.intensity = sky.hemi.intensity;
    fill.color.setHex(sky.fill.color);
    fill.intensity = sky.fill.intensity;
    glows.forEach((g) => { g.mesh.visible = sky.lamps > g.threshold; });
    lampLights.forEach((l) => { l.intensity = sky.lamps * 2.4; });
    pools.forEach((m) => { m.material.opacity = sky.lamps * 0.42; m.visible = sky.lamps > 0.02; });

    // crew
    crew.forEach((c) => setPose(c.fig, idlePose(t, loop, c.def.seed, st.waves[c.def.lot] || 0, w)));

    // actors
    st.actors.forEach((s, i) => {
      const a = actors[i];
      setPose(a.fig, actorPose(s, a.def.seed, t, loop, w));
      a.fig.group.position.set(s.x, s.y, s.z);
      a.fig.group.rotation.y = s.yaw;
      // A visitor waiting beyond the edge is hidden only once they have fully cleared the slab.
      const off = Math.abs(s.x) > hx + 0.7 || Math.abs(s.z) > hz + 0.7;
      a.fig.group.visible = !off;
      a.shadow.visible = !off;
      a.shadow.position.set(s.x, s.y + 0.018, s.z);
      a.fig.group.updateMatrixWorld(true);
    });

    // crates: in the hands while carried, in the yard once dropped
    st.props.forEach((s, i) => {
      const c = crates[i];
      c.mesh.visible = s.visible;
      if (!s.visible) return;
      const def = c.def;
      if (s.carried) {
        const ai = actorIndex.get(def.carriedBy);
        const a = actors[ai], sa = st.actors[ai];
        a.fig.joints.handL.getWorldPosition(_a);
        a.fig.joints.handR.getWorldPosition(_b);
        _a.add(_b).multiplyScalar(0.5);
        _a.y -= 0.175; // the crate's base: its centre sits between the hands
        const mine = sa.carry && sa.carry.prop === def.id;
        const rest = mine && sa.carry.toward === 'source' ? def.src ?? def.pos : def.pos;
        const low = mine ? sa.carry.lower : 0;
        const q = carryPoint(_a, rest, low);
        c.mesh.position.set(q.x, q.y, q.z);
        c.mesh.rotation.y = carryYaw(sa.yaw, rest, low);
        c.mesh.scale.setScalar(s.grow);
        c.mesh.visible = a.fig.group.visible;
      } else {
        c.mesh.position.set(def.pos.x, def.pos.y, def.pos.z);
        c.mesh.rotation.y = def.pos.yaw ?? 0;
        c.mesh.scale.setScalar(s.scale);
      }
    });

    // smoke
    if (puffs) {
      let n = 0;
      plan.smoke.forEach((em) => {
        for (let k = 0; k < PUFFS; k++) {
          const p = puffAt(plan, em, k, t);
          setI(puffs, n++, p.x, p.y, p.z, p.s, p.s, p.s, 0, k, 0);
        }
      });
      puffs.instanceMatrix.needsUpdate = true;
    }

    // weather
    if (weatherMesh) {
      const sz = W.size;
      W.particles.forEach((p, i) => {
        const q = particleAt(plan, W, p, t);
        setI(weatherMesh, i, q.x, q.y, q.z, sz[0] * q.s, sz[1] * q.s, sz[2] * q.s, q.rx, q.ry, 0);
      });
      weatherMesh.instanceMatrix.needsUpdate = true;
    }

    // birds
    birds.forEach((b) => {
      const q = birdAt(plan, b.def, t);
      b.g.position.set(q.x, q.y, q.z);
      b.g.rotation.set(0, q.yaw, q.bank);
      b.wl.rotation.z = -q.flap * 0.8;
      b.wr.rotation.z = q.flap * 0.8;
    });

    // water
    if (glints) {
      A.glints.forEach((gl, i) => {
        const v = glintAt(plan, gl, t);
        setI(glints, i, gl.x, WATER_Y + 0.012, gl.z, gl.w * v + 1e-4, 0.01, 0.05 * v + 1e-4);
      });
      glints.instanceMatrix.needsUpdate = true;
    }
    ducks.forEach((d) => {
      const q = duckAt(plan, d.def, t);
      d.g.position.set(q.x, q.y, q.z);
      d.g.rotation.y = q.yaw;
      d.head.rotation.x = q.dip * 1.3;
    });
    boats.forEach((b) => {
      const q = boatAt(plan, b.def, t);
      b.mesh.position.set(b.def.x, q.y, b.def.z);
      b.mesh.rotation.set(q.pitch, b.def.yaw, q.roll);
    });

    // landmark machines
    machines.forEach((m) => {
      const d = m.d;
      if (d.kind === 'sails') m.rot.rotation.z = sailsAngle(plan, t);
      else if (d.kind === 'beacon') {
        m.rot.rotation.y = beaconAngle(plan, t);
        m.beamMat.opacity = sky.lamps * 0.5;
        m.rot.visible = sky.lamps > 0.02;
      } else if (d.kind === 'jets') {
        let n = 0;
        for (let j = 0; j < JETS; j++) for (let k = 0; k < DROPS; k++) {
          const q = dropAt(plan, d, j, k, t);
          setI(m.im, n++, q.x, q.y, q.z, 0.05 * q.s, 0.07 * q.s, 0.05 * q.s);
        }
        m.im.instanceMatrix.needsUpdate = true;
      } else if (d.kind === 'fire') {
        m.flames.forEach((mesh, k) => {
          const q = flameAt(plan, d, k, t);
          mesh.position.set(q.x, q.y + q.h / 2, q.z);
          mesh.scale.set(q.r, q.h, q.r);
          mesh.rotation.y = k * 0.7;
        });
        for (let k = 0; k < EMBERS; k++) {
          const q = emberAt(plan, d, k, t);
          setI(m.embers, k, q.x, q.y, q.z, 0.035 * q.s, 0.035 * q.s, 0.035 * q.s);
        }
        m.embers.instanceMatrix.needsUpdate = true;
        m.light.intensity = 2.2 * fireLight(plan, t) * (0.4 + 0.6 * Math.max(sky.night, sky.golden));
      }
    });
    return st;
  }

  function dispose() {
    group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => m.dispose());
    });
  }

  return { group, apply, dispose, entities, clip, fit: plan.fit.map(([x, y, z]) => new THREE.Vector3(x, y, z)), lights: { sun, hemi, fill } };
}
