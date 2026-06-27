import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const locations = {
  thamel: [85.3123, 27.7154],
  ratnapark: [85.3120, 27.7089],
  kalanki: [85.2833, 27.6937],
  bhaktapur: [85.4270, 27.6710],
  kathmandu: [85.3240, 27.7172]
};

export default function App() {
  const mapContainer = useRef(null);

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const mapRef = useRef(null);

  const findRoute = async () => {
  const src = locations[source.toLowerCase()] || locations.kathmandu;
  const dst = locations[destination.toLowerCase()] || locations.kathmandu;

  const url = `
https://router.project-osrm.org/route/v1/driving/
${src[0]},${src[1]};${dst[0]},${dst[1]}
?overview=full&geometries=geojson
`.replace(/\s/g, "");

  const res = await fetch(url);
  const data = await res.json();

  const route = data.routes[0].geometry;

  const map = mapRef.current;

  const geojson = {
    type: "Feature",
    geometry: route
  };

  if (map.getSource("route")) {
    map.getSource("route").setData(geojson);
  } else {
    map.addSource("route", {
      type: "geojson",
      data: geojson
    });

    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#2563eb",
        "line-width": 5
      }
    });
  }

  map.fitBounds([src, dst], {
    padding: 80
  });
};

useEffect(() => {
  const map = new maplibregl.Map({
    container: mapContainer.current,
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256
        }
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm"
        }
      ]
    },
    center: [85.324, 27.7172],
    zoom: 12
  });

  map.addControl(new maplibregl.NavigationControl());

  mapRef.current = map;

  return () => map.remove();
}, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>

      {/* MAP */}
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%" }}
      />

      {/* UI OVERLAY */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        right: 20,
        background: "white",
        padding: 12,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      }}>

        <input
          placeholder="Source (e.g. Thamel)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />

        <input
          placeholder="Destination (e.g. Kalanki)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />

        <button
      onClick={findRoute}
      style={{
        width: "100%",
        padding: 10,
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: 8
      }}
    >
      Find Route
</button>

      </div>

    </div>
  );
}
