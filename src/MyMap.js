import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ToggleableGeoServerLayer({ url, style, visible }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!visible) return; // only fetch when visible

    fetch(url)
      .then((res) => res.json())
      .then((geojson) => setData(geojson))
      .catch((err) => console.error("Error loading GeoServer layer:", err));
  }, [url, visible]);

  if (!visible || !data) return null;
  return <GeoJSON data={data} style={style} />;
}

export default function App() {
  const [showLayer, setShowLayer] = useState(true);

  return (
    <div>
      {/* Checkbox */}
      <div style={{ padding: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={showLayer}
            onChange={() => setShowLayer((prev) => !prev)}
          />
          Show GeoServer Layer
        </label>
      </div>

      {/* Map */}
      <MapContainer
        center={[22.9734, 78.6569]} // India center
        zoom={5}
        style={{ height: "90vh", width: "100%" }}
      >
        {/* Base map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* GeoServer layer */}
        <ToggleableGeoServerLayer
          url="http://localhost:8080/geoserver/yourworkspace/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=yourworkspace:yourlayer&outputFormat=application/json"
          style={{ color: "blue", weight: 1 }}
          visible={showLayer}
        />
      </MapContainer>
    </div>
  );
}
