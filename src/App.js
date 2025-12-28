import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  WMSTileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { BaseLayer, Overlay } = LayersControl;

// Custom icons
const startIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const endIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function LocationSelector({ setPoints }) {
  useMapEvents({
    click(e) {
      setPoints((prev) => {
        if (prev.length === 2) return [e.latlng]; // reset after 2 clicks
        return [...prev, e.latlng];
      });
    },
  });
  return null;
}

export default function App() {
  const [points, setPoints] = useState([]);
  const [route, setRoute] = useState(null);
  const [directions, setDirections] = useState([]);
  const [totalDist, setTotalDist] = useState(null);

  // Fetch route
  useEffect(() => {
    if (points.length === 2) {
      const src = `${points[0].lng},${points[0].lat}`;
      const dst = `${points[1].lng},${points[1].lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${src};${dst}?overview=full&geometries=geojson&steps=true`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            const routeData = data.routes[0];
            const coords = routeData.geometry.coordinates.map((c) => [
              c[1],
              c[0],
            ]);
            setRoute(coords);
            setTotalDist((routeData.distance / 1000).toFixed(2)); // in km

            // Parse instructions
            const steps = routeData.legs[0].steps.map((step, idx) => {
              let action = "Go straight";
              if (step.maneuver) {
                const type = step.maneuver.type || "";
                const modifier = step.maneuver.modifier || "";

                if (type === "depart") action = "Start";
                else if (type === "arrive") action = "You have arrived";
                else if (type === "turn") action = `Turn ${modifier}`;
                else if (type === "new name")
                  action = `Continue ${modifier}`;
                else if (type === "roundabout")
                  action = `Take roundabout exit ${step.maneuver.exit || ""}`;
                else action = `${type} ${modifier}`.trim();
              }

              return {
                id: idx,
                action,
                dist: (step.distance / 1000).toFixed(2),
              };
            });
            setDirections(steps);
          }
        });
    }
  }, [points]);

  // Midpoint for showing distance label
  const midPoint =
    route && route.length > 0
      ? route[Math.floor(route.length / 2)]
      : null;

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={[22, 78]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <LayersControl position="topright">
          {/* Base Map */}
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          {/* India States */}
          <Overlay checked name="India States">
            <WMSTileLayer
              url="http://localhost:8080/geoserver/india/wms"
              layers="india:india_state"
              format="image/png"
              transparent={true}
            />
          </Overlay>

          {/* Southern India Roads */}
          <Overlay name="Southern India Roads">
            <WMSTileLayer
              url="http://localhost:8080/geoserver/osm/wms"
              layers="osm:gis_osm_roads_free_1"
              format="image/png"
              transparent={true}
            />
          </Overlay>

          {/* Inland Waterways */}
          <Overlay name="Inland Waterways">
            <WMSTileLayer
              url="http://localhost:8080/geoserver/india/wms"
              layers="india:IND_water_lines"
              format="image/png"
              transparent={true}
            />
          </Overlay>
        </LayersControl>

        <LocationSelector setPoints={setPoints} />

        {/* Start & End Markers */}
        {points.map((p, i) => (
          <Marker key={i} position={p} icon={i === 0 ? startIcon : endIcon} />
        ))}

        {/* Route polyline + distance tooltip */}
        {route && (
          <>
            <Polyline positions={route} color="red" weight={5} />
            {midPoint && totalDist && (
              <Marker position={midPoint} opacity={0}>
                <Tooltip permanent direction="top">
                  Total Distance: {totalDist} km
                </Tooltip>
              </Marker>
            )}
          </>
        )}
      </MapContainer>

      {/* Floating Directions Panel */}
      {directions.length > 0 && (
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 120, // moved down so it doesn’t overlap toggle
            zIndex: 1000,
            background: "white",
            padding: "10px",
            borderRadius: "8px",
            maxHeight: "75%",
            overflowY: "auto",
            width: "260px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <h4>Directions</h4>
          <ol>
            {directions.map((step) => (
              <li key={step.id} style={{ marginBottom: "6px" }}>
                {step.action} ({step.dist} km)
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
