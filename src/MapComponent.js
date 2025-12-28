import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css"; // Make sure this is created

const roadsGeoJSON = "/data/roads.geojson"; // public/data/roads.geojson
const stateGeoJSON = "/data/state_boundaries.geojson"; // public/data/state_boundaries.geojson

function App() {
  const [showRoads, setShowRoads] = useState(true);
  const [showStates, setShowStates] = useState(true);

  return (
    <div>
      <div style={{ padding: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={showRoads}
            onChange={() => setShowRoads(!showRoads)}
          />
          Roads
        </label>
        &nbsp;&nbsp;
        <label>
          <input
            type="checkbox"
            checked={showStates}
            onChange={() => setShowStates(!showStates)}
          />
          State Boundaries
        </label>
      </div>

      <div id="map-container">
        <MapContainer
          center={[22.9734, 78.6569]}
          zoom={5}
          scrollWheelZoom={true}
          id="map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {showRoads && (
            <GeoJSON
              data={require("./data/roads.geojson")}
              style={{ color: "red", weight: 2 }}
            />
          )}

          {showStates && (
            <GeoJSON
              data={require("./data/state_boundaries.geojson")}
              style={{ color: "blue", weight: 1 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
