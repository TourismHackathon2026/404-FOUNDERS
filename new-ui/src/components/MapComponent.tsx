"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/geoapifyTypes";

interface MapComponentProps {
  apiKey: string;
  center: MapPoint;
  zoom?: number;
  origin?: MapPoint | null;
  destination?: MapPoint | null;
  routePath?: MapPoint[];
}

const LeafletGeoMap = dynamic(() => import("@/components/LeafletGeoMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
      Loading map...
    </div>
  ),
});

export default function MapComponent({
  apiKey,
  center,
  zoom = 13,
  origin,
  destination,
  routePath,
}: MapComponentProps) {
  if (!apiKey.trim()) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        Geoapify map key is missing.
      </div>
    );
  }

  return (
    <div className="relative z-0 h-full w-full">
      <LeafletGeoMap
        apiKey={apiKey}
        center={center}
        zoom={zoom}
        origin={origin}
        destination={destination}
        routePath={routePath}
      />
    </div>
  );
}
