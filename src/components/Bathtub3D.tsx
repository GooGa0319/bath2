/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BathtubParams, MATERIAL_DATA } from '../types';

interface Bathtub3DProps {
  params: BathtubParams;
}

const Bathtub3D: React.FC<Bathtub3DProps> = ({ params }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(200, 200, 200);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    // Groups
    const group = new THREE.Group();
    scene.add(group);

    // Update function
    const updateBathtub = () => {
      // Clear previous meshes
      while (group.children.length > 0) {
        group.children.pop();
      }

      const { length, width, height: bHeight, wallThickness, cylinderDiameter, cylinderRotation, waterFill, materialType } = params;
      const matColor = MATERIAL_DATA[materialType].color;
      const material = new THREE.MeshPhongMaterial({ 
        color: matColor, 
        transparent: true, 
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      const wireMaterial = new THREE.MeshBasicMaterial({ color: '#64748b', wireframe: true });

      // Convert cm to normalized units (e.g., 1 unit = 1cm)
      
      // 1. Base Box (Approximating with 5 planes/boxes for the non-rotating part)
      const mainLength = length - cylinderDiameter;
      
      // Bottom
      const bottomGeo = new THREE.BoxGeometry(mainLength, wallThickness, width);
      const bottom = new THREE.Mesh(bottomGeo, material);
      bottom.position.set(-cylinderDiameter/2, wallThickness/2, 0);
      group.add(bottom);

      // Back Wall (Left in visualization)
      const backWallGeo = new THREE.BoxGeometry(wallThickness, bHeight, width);
      const backWall = new THREE.Mesh(backWallGeo, material);
      backWall.position.set(-length/2 + wallThickness/2, bHeight/2, 0);
      group.add(backWall);

      // Side Walls
      const sideWallGeo = new THREE.BoxGeometry(mainLength, bHeight, wallThickness);
      
      const frontSide = new THREE.Mesh(sideWallGeo, material);
      frontSide.position.set(-cylinderDiameter/2, bHeight/2, width/2 - wallThickness/2);
      group.add(frontSide);

      const backSide = new THREE.Mesh(sideWallGeo, material);
      backSide.position.set(-cylinderDiameter/2, bHeight/2, -width/2 + wallThickness/2);
      group.add(backSide);

      // 2. Rotating Cylinder
      const cylRadius = cylinderDiameter / 2;
      const cylHeight = bHeight;

      // Group for rotating part
      const rotatingGroup = new THREE.Group();
      rotatingGroup.position.set(length/2 - cylRadius, 0, 0);
      rotatingGroup.rotation.y = THREE.MathUtils.degToRad(cylinderRotation);
      group.add(rotatingGroup);

      // Hollow Cylinder (Simplified with a TubeGeometry or Ring + Mesh)
      const outerCylGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 64, 1, true, 0, Math.PI * 1.6);
      const outerCyl = new THREE.Mesh(outerCylGeo, material);
      outerCyl.position.set(0, cylHeight/2, 0);
      rotatingGroup.add(outerCyl);

      // Inner Cylinder (back side of the hollow wall)
      const innerCylGeo = new THREE.CylinderGeometry(cylRadius - wallThickness, cylRadius - wallThickness, cylHeight, 64, 1, true, 0, Math.PI * 1.6);
      const innerCyl = new THREE.Mesh(innerCylGeo, material);
      innerCyl.position.set(0, cylHeight/2, 0);
      rotatingGroup.add(innerCyl);

      // Cylinder Floor
      const cylFloorGeo = new THREE.CircleGeometry(cylRadius, 32);
      const cylFloor = new THREE.Mesh(cylFloorGeo, material);
      cylFloor.rotation.x = -Math.PI/2;
      cylFloor.position.set(0, wallThickness/2, 0);
      rotatingGroup.add(cylFloor);

      // Handle on the cylinder
      const handleGeo = new THREE.CapsuleGeometry(2, 15, 4, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8, roughness: 0.2 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(cylRadius + 2, cylHeight/2, 0);
      rotatingGroup.add(handle);

      // Hinge Visualization
      const hingeGeo = new THREE.CylinderGeometry(3, 3, cylHeight + 10, 16);
      const hingeMat = new THREE.MeshStandardMaterial({ color: '#475569' });
      const hinge = new THREE.Mesh(hingeGeo, hingeMat);
      hinge.position.set(length/2 - cylRadius, cylHeight/2, 0);
      group.add(hinge);

      // Add simple wireframe helper
      const boxHelper = new THREE.BoxHelper(group, 0x64748b);
      scene.add(boxHelper);

      // Axes Helper
      const axesHelper = new THREE.AxesHelper(100);
      scene.add(axesHelper);
      
      // 3. Water
      if (waterFill > 0) {
        const waterLevelHeight = (bHeight - wallThickness) * (waterFill / 100);
        const waterMaterial = new THREE.MeshPhongMaterial({ 
          color: '#3b82f6', 
          transparent: true, 
          opacity: 0.5 
        });

        const waterGeo = new THREE.BoxGeometry(mainLength - wallThickness, waterLevelHeight, width - wallThickness * 2);
        const water = new THREE.Mesh(waterGeo, waterMaterial);
        water.position.set(-cylinderDiameter/2, waterLevelHeight/2 + wallThickness, 0);
        group.add(water);

        // Water in cylinder
        const waterCylGeo = new THREE.CylinderGeometry(cylRadius - wallThickness, cylRadius - wallThickness, waterLevelHeight, 32);
        const waterCyl = new THREE.Mesh(waterCylGeo, waterMaterial);
        waterCyl.position.set(length/2 - cylRadius, waterLevelHeight/2 + wallThickness, 0);
        group.add(waterCyl);
      }

      // Add Gravity Vector Arrow
      const dir = new THREE.Vector3(0, -1, 0);
      const origin = new THREE.Vector3(0, bHeight + 20, 0);
      const arrowHelper = new THREE.ArrowHelper(dir, origin, 40, 0xff0000);
      group.add(arrowHelper);
    };

    updateBathtub();

    // Resize Handler
    const handleResize = () => {
      const w = mountRef.current?.clientWidth || 0;
      const h = mountRef.current?.clientHeight || 0;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let requestID: number;
    const animate = () => {
      requestID = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestID);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [params]);

  return <div ref={mountRef} className="w-full h-full min-h-[400px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner" id="bathtub-3d-viewport" />;
};

export default Bathtub3D;
