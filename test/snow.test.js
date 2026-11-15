import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { SnowScenario } from '../js/scenarios/snow.js';

// Fester Zufall, damit Bäume und Verstecke bei jedem Lauf gleich aussehen.
const rnd = () => 0.5;

function setup() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  const sc = new SnowScenario({ scene, camera });
  sc.groundAt = () => 0;
  camera.position.set(0, 3.6, 0);
  camera.lookAt(0, 1.2, -22);
  return { sc, scene, camera };
}

// Seam: die Verstecke, die nach dem Aufbau der Szene übrig bleiben.
test('removes a spot that sits behind a tree as seen from the camera', () => {
  const { sc } = setup();
  sc._willow(0, -12, 1, rnd);
  sc.spots = [{ x: 0, z: -14 }];
  sc._pruneHiddenSpots();
  assert.equal(sc.spots.length, 0);
});

test('keeps a spot that is in open view next to a tree', () => {
  const { sc } = setup();
  sc._willow(0, -12, 1, rnd);
  sc.spots = [{ x: 10, z: -14 }];
  sc._pruneHiddenSpots();
  assert.equal(sc.spots.length, 1);
});

test('keeps a spot that is only partly behind a tree (less than the allowed share)', () => {
  const { sc } = setup();
  sc._willow(0, -12, 1, rnd);
  sc.spots = [{ x: -0.8, z: -14 }];
  sc._pruneHiddenSpots();
  assert.equal(sc.spots.length, 1);
});

test('removes a spot that is mostly behind a tree (more than the allowed share)', () => {
  const { sc } = setup();
  sc._willow(0, -12, 1, rnd);
  sc.spots = [{ x: -0.6, z: -14 }];
  sc._pruneHiddenSpots();
  assert.equal(sc.spots.length, 0);
});

// Sichtfeld: Verstecke am Bildrand dürfen nicht gewählt werden, wenn sie außerhalb liegen.
const front = [-15, -10, -5.5, 5.5, 10, 15].map((x) => ({ x, z: -10.4 }));

test('visible spots drop spots outside a 16:9 view', () => {
  const { sc, camera } = setup();
  camera.aspect = 16 / 9; camera.updateProjectionMatrix();
  sc.spots = front;
  const xs = sc._visibleSpots().map((s) => s.x);
  assert.deepEqual(xs, [-5.5, 5.5]);
});

test('visible spots keep more spots in an ultrawide view', () => {
  const { sc, camera } = setup();
  camera.aspect = 21 / 9; camera.updateProjectionMatrix();
  sc.spots = front;
  assert.equal(sc._visibleSpots().length, 4);
});

test('picked spots are distinct and in view', () => {
  const { sc, camera } = setup();
  camera.aspect = 4 / 3; camera.updateProjectionMatrix();
  sc.spots = [...front, { x: 0, z: -23.2 }, { x: 4.5, z: -14 }, { x: -3.5, z: -13.4 }];
  const visible = new Set(sc._visibleSpots());
  for (let i = 0; i < 200; i++) {
    const picked = sc._pickSpots(4);
    assert.equal(new Set(picked).size, 4);
    assert.ok(picked.every((s) => visible.has(s)));
  }
});
