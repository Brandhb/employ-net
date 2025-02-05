"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// Dynamically import react-globe.gl to avoid SSR issues
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const GlobeComponent = () => {
  const globeEl = useRef<any>(null);

  const markers = [
    { lat: 37.7749, lng: -122.4194, size: 0.5, color: "#FF0000" }, // San Francisco
    { lat: 48.8566, lng: 2.3522, size: 0.5, color: "#00FF00" },   // Paris
    { lat: 35.6895, lng: 139.6917, size: 0.5, color: "#0000FF" }, // Tokyo
  ];

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2 }, 1000);
    }
  }, []);

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px]">
      <Globe
        ref={globeEl}
        width={400}
        height={500}
        backgroundColor="rgba(0,0,0,0)" // Transparent background
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={markers}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointAltitude={(d: any) => d.size}
        pointColor={(d: any) => d.color}
        pointRadius={0.1}
        atmosphereColor="#3a7bd5"
        atmosphereAltitude={0.2}
      />
    </div>
  );
};

export { GlobeComponent };
