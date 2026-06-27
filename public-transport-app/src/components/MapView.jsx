import MapView from "../components/MapView";
import SearchPanel from "../components/SearchPanel";
import { useState } from "react";

export default function MapPage({ mapRef, mapContainer, findRoute }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>

      <MapView mapContainer={mapContainer} />

      <SearchPanel
        source={source}
        setSource={setSource}
        destination={destination}
        setDestination={setDestination}
        findRoute={() => findRoute(source, destination)}
      />

    </div>
  );
}