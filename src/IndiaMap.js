import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const IndiaMap = () => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch(
      "http://localhost:8080/geoserver/india/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=india:india_states&outputFormat=application/json"
    )
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  return (
    <MapContainer center={[22.5, 78.9]} zoom={4.5} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {geoData && <GeoJSON data={geoData} />}
    </MapContainer>
  );
};

export default IndiaMap;
