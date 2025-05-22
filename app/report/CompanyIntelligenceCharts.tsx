"use client";

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // Import L for custom icons if needed

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface RevenueDataPoint {
  year: string;
  revenue?: number | string;
  profit?: number | string;
  ebitda?: number | string;
  revenue_growth_percent?: number | string;
  profit_growth_percent?: number | string;
  ebitda_growth_percent?: number | string;
}

interface InvestmentDataPoint {
  round_name: string;
  date: string;
  amount_raised?: number | string;
  percent_increase_from_previous?: number | string;
}

interface MarketPresenceDataPoint {
  location: string;
  type: string; // e.g., 'headquarters', 'other'
  latitude?: number;  // Optional: for direct map plotting
  longitude?: number; // Optional: for direct map plotting
}

// Revenue Growth Chart
export function RevenueGrowthChart({ data }: { data: RevenueDataPoint[] }) {
  if (!data || data.length === 0) return <div className="text-gray-400">No revenue growth data available.</div>;

  const chartData = data.map(item => ({
    ...item,
    revenue: parseFloat(String(item.revenue)) || 0,
    profit: parseFloat(String(item.profit)) || 0,
    ebitda: parseFloat(String(item.ebitda)) || 0,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#2563eb" name="Revenue" strokeWidth={2} />
          <Line type="monotone" dataKey="profit" stroke="#22c55e" name="Profit" strokeWidth={2} />
          <Line type="monotone" dataKey="ebitda" stroke="#f59e42" name="EBITDA" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Investment History Chart
export function InvestmentHistoryChart({ data }: { data: InvestmentDataPoint[] }) {
  if (!data || data.length === 0) return <div className="text-gray-400">No investment history data available.</div>;

  const chartData = data.map(item => ({
    ...item,
    amount_raised: parseFloat(String(item.amount_raised)) || 0,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="round_name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount_raised" fill="#2563eb" name="Amount Raised">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#2563eb" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Market Presence Map
export function MarketPresenceMap({ data }: { data: MarketPresenceDataPoint[] }) {
  if (typeof window === 'undefined') return null; // Ensure it only renders on client
  
  console.log("[MarketPresenceMap] Received data:", data);

  const validPoints = data ? data.filter(item => 
    item.latitude != null && !isNaN(Number(item.latitude)) && Math.abs(Number(item.latitude)) <= 90 &&
    item.longitude != null && !isNaN(Number(item.longitude)) && Math.abs(Number(item.longitude)) <= 180
  ).map(item => ({ ...item, latitude: Number(item.latitude), longitude: Number(item.longitude) })) : [];

  console.log("[MarketPresenceMap] Valid geographic points for markers:", validPoints);

  if (!validPoints || validPoints.length === 0) { 
    return <div className="text-gray-400 p-4 bg-gray-50 rounded-md">No valid geographic coordinates found in market presence data to display on map.</div>;
  }

  let mapCenter: L.LatLngTuple = [20, 0]; // Default to a wide view if no points
  let mapZoom = 2;

  if (validPoints.length > 0) {
    // Attempt to calculate a bounding box and center
    const latitudes = validPoints.map(p => p.latitude!);
    const longitudes = validPoints.map(p => p.longitude!);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    mapCenter = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
    
    // Heuristic for zoom. This is very basic.
    // For a more robust solution, libraries like 'leaflet-almost-over' or custom logic based on bounds can be used.
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    if (maxDiff < 0.01 && validPoints.length === 1) mapZoom = 13; // Single point, zoom in
    else if (maxDiff < 1) mapZoom = 10;
    else if (maxDiff < 5) mapZoom = 7;
    else if (maxDiff < 10) mapZoom = 5;
    else if (maxDiff < 20) mapZoom = 4;
    else mapZoom = 2; // Default for very spread out points
    
    // If HQ is present, prefer it as center if it's a single point or for slight bias
    const hq = validPoints.find(loc => loc.type === 'headquarters');
    if (hq) {
      mapCenter = [hq.latitude!, hq.longitude!];
      if (validPoints.length === 1) mapZoom = 13;
    }
  }
  
  console.log(`[MarketPresenceMap] Map center: ${mapCenter}, zoom: ${mapZoom}`);

  return (
    <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validPoints.map((item, index) => (
        <Marker key={index} position={[item.latitude!, item.longitude!]}>
          <Popup>
            <b>{item.location}</b><br />
            Type: {item.type}<br />
            Lat: {item.latitude?.toFixed(4)}, Lng: {item.longitude?.toFixed(4)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// Market Presence Chart (fallback to bar chart by location type)
export function MarketPresenceChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="text-gray-400">No market presence data available.</div>;
  // Count by type
  const typeCounts = data.reduce((acc: Record<string, number>, curr: any) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#2563eb" name="Locations" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 