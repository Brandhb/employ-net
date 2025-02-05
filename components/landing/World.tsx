"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import the GlobeWrapper to avoid SSR issues
const GlobeWrapper = dynamic(() => import("./GlobeWrapper"), { ssr: false });

const Globe = forwardRef((props: any, ref) => (
  <GlobeWrapper {...props} forwardRef={ref} />
));

// ✅ Add a display name to resolve ESLint warning
Globe.displayName = "Globe";

// Country coordinates for arcs
const countries = [
  { name: "USA", lat: 38.9072, lng: -77.0369 },
  { name: "Canada", lat: 45.4215, lng: -75.6972 },
  { name: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Germany", lat: 52.52, lng: 13.405 },
  { name: "Spain", lat: 40.4168, lng: -3.7038 },
  { name: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Japan", lat: 35.6895, lng: 139.6917 },
  { name: "India", lat: 28.6139, lng: 77.209 },
  { name: "Brazil", lat: -23.5505, lng: -46.6333 },
  { name: "South Africa", lat: -26.2041, lng: 28.0473 },
];

// Create arcs between countries
const arcsData = countries.flatMap((origin, i) =>
  countries
    .filter((_, j) => i !== j)
    .map((destination) => ({
      startLat: origin.lat,
      startLng: origin.lng,
      endLat: destination.lat,
      endLng: destination.lng,
      color: ["#74ebd5", "#acb6e5"], // Soft gradient colors
    }))
);

const World = () => {
  const globeRef = useRef<any>(null);
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    if (!globeRef.current) return;

    // Set initial point of view
    globeRef.current.pointOfView(
      {
        lat: 20,
        lng: 0,
        altitude: 2.2,
      },
      1500
    );

    // Disable zoom
    globeRef.current.controls().enableZoom = false;

    // Slow rotation for dynamic feel
    globeRef.current.controls().autoRotate = true;
    globeRef.current.controls().autoRotateSpeed = 0.3;
  }, [globeReady]);

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] flex justify-end items-end my-24 md:my-2">
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
        onGlobeReady={() => setGlobeReady(true)}
        width={500}
        height={500}
        animateIn={true}
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        arcsData={arcsData}
        arcStartLat={(d: any) => d.startLat}
        arcStartLng={(d: any) => d.startLng}
        arcEndLat={(d: any) => d.endLat}
        arcEndLng={(d: any) => d.endLng}
        arcColor={(d: any) => d.color}
        arcDashLength={0.5}
        arcDashGap={0.3}
        arcDashInitialGap={() => Math.random()} // Dynamic start points
        arcDashAnimateTime={3000} // Smooth animation
        arcStroke={0.5} // Thinner for elegant look
        arcsTransitionDuration={1500}
        arcAltitudeAutoScale={0.8} // Adjusted curve height
      />
    </div>
  );
};

export default World;
