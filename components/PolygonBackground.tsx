"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function PolygonBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create floating polygons
        const polygons: THREE.Mesh[] = [];
        const geometries = [
            new THREE.TetrahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(0.8, 0),
            new THREE.IcosahedronGeometry(0.7, 0),
            new THREE.DodecahedronGeometry(0.6, 0),
        ];

        const material = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
        });

        // Create multiple polygons
        for (let i = 0; i < 25; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const mesh = new THREE.Mesh(geometry, material.clone());

            mesh.position.x = (Math.random() - 0.5) * 60;
            mesh.position.y = (Math.random() - 0.5) * 40;
            mesh.position.z = (Math.random() - 0.5) * 20 - 10;

            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;

            const scale = Math.random() * 2 + 0.5;
            mesh.scale.set(scale, scale, scale);

            // Vary colors between blue and purple
            const meshMaterial = mesh.material as THREE.MeshBasicMaterial;
            const hue = 0.6 + Math.random() * 0.15; // Blue to purple range
            meshMaterial.color.setHSL(hue, 0.8, 0.5);
            meshMaterial.opacity = 0.08 + Math.random() * 0.12;

            scene.add(mesh);
            polygons.push(mesh);

            // GSAP animation for each polygon
            gsap.to(mesh.rotation, {
                x: mesh.rotation.x + Math.PI * 2,
                y: mesh.rotation.y + Math.PI * 2,
                duration: 20 + Math.random() * 30,
                repeat: -1,
                ease: "none",
            });

            gsap.to(mesh.position, {
                y: mesh.position.y + (Math.random() - 0.5) * 10,
                duration: 5 + Math.random() * 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        }

        // Add some accent lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.1
        });

        for (let i = 0; i < 10; i++) {
            const points = [];
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 50,
                -20
            ));
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 50,
                -20
            ));

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            scene.add(line);
        }

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener("mousemove", handleMouseMove);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Subtle camera movement based on mouse
            camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
            camera.position.y += (mouseY * 2 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            polygons.forEach(p => {
                p.geometry.dispose();
                (p.material as THREE.Material).dispose();
            });
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ background: "linear-gradient(180deg, #000000 0%, #050505 50%, #0a0a0a 100%)" }}
        />
    );
}
