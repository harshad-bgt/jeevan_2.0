import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { MapPin, Droplet, Loader2 } from 'lucide-react';

const LiveDonorMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [viewMode, setViewMode] = useState('radar'); // 'cluster', 'heatmap', or 'radar'
  const layersRef = useRef({ clusterLayer: null, heatLayer: null, radarLayer: null });

  // Fetch anonymized donor data and active requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donorsRes, requestsRes] = await Promise.all([
          api.get('/donors/live'),
          api.get('/requests/active').catch(() => ({ data: { success: true, requests: [] } }))
        ]);
        
        if (donorsRes.data && donorsRes.data.success) {
          setDonors(donorsRes.data.donors);
        }
        if (requestsRes.data && requestsRes.data.success) {
          setRequests(requestsRes.data.requests);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load Leaflet from CDN and initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS and Plugins
    const loadDependencies = async () => {
      // 1. Leaflet Core
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // 2. MarkerCluster CSS
      if (!document.getElementById('leaflet-cluster-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-cluster-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
        document.head.appendChild(link);
        
        const link2 = document.createElement('link');
        link2.rel = 'stylesheet';
        link2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
        document.head.appendChild(link2);
      }

      // 3. MarkerCluster JS
      if (!window.L.markerClusterGroup) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // 4. Heatmap JS
      if (!window.L.heatLayer) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      return window.L;
    };

    loadDependencies().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;
      
      const map = L.map(mapRef.current, {
        center: [13.05, 80.25], // Default: Chennai
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Use CartoDB dark tiles or light tiles
      const isDark = document.documentElement.classList.contains('dark');
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      // Fix map size on load
      setTimeout(() => map.invalidateSize(), 200);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add markers when both map and donors are ready
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || donors.length === 0) return;

    const L = window.L;
    if (!L) return;

    // Create custom blood-drop SVG icon
    const createBloodDropIcon = (bloodGroup, isAvailable, status) => {
      const color = isAvailable ? '#dc2626' : '#94a3b8';
      const opacity = isAvailable ? '1' : '0.5';
      const statusColor = status === 'Eligible' ? '#16a34a' : status === 'Temporarily Deferred' ? '#f59e0b' : '#6b21a8';

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <filter id="shadow" x="-25%" y="-15%" width="150%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
            </filter>
          </defs>
          <path d="M18 2 C18 2 4 16 4 26 C4 33.73 10.27 40 18 40 C25.73 40 32 33.73 32 26 C32 16 18 2 18 2Z" fill="${color}" opacity="${opacity}" filter="url(#shadow)" stroke="white" stroke-width="1.5"/>
          <circle cx="18" cy="26" r="8" fill="white"/>
          <text x="18" y="29" text-anchor="middle" fill="${color}" font-size="8" font-weight="900" font-family="Outfit, sans-serif">${bloodGroup}</text>
          <circle cx="28" cy="12" r="4" fill="${statusColor}" stroke="white" stroke-width="1.5"/>
        </svg>
      `;

      return L.divIcon({
        html: svg,
        className: 'blood-drop-marker',
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -40]
      });
    };

    // Create pulsing emergency beacon icon
    const createBeaconIcon = (urgency) => {
      const color = urgency === 'emergency' ? '#dc2626' : '#f59e0b';
      const svg = `
        <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; background:${color}; border-radius:50%; opacity:0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width:16px; height:16px; background:${color}; border-radius:50%; border:2px solid white; z-index:2; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
        </div>
        <style>
          @keyframes ping {
            75%, 100% { transform: scale(2.5); opacity: 0; }
          }
        </style>
      `;
      return L.divIcon({ html: svg, className: 'hospital-beacon', iconSize: [48, 48], iconAnchor: [24, 24], popupAnchor: [0, -15] });
    };

    // Clear existing layers
    if (layersRef.current.clusterLayer) mapInstanceRef.current.removeLayer(layersRef.current.clusterLayer);
    if (layersRef.current.heatLayer) mapInstanceRef.current.removeLayer(layersRef.current.heatLayer);
    if (layersRef.current.radarLayer) mapInstanceRef.current.removeLayer(layersRef.current.radarLayer);

    const bounds = [];

    // Base Donor Rendering (used in cluster and radar mode)
    const renderDonors = (targetLayer, drawLinesToRequests = false) => {
      donors.forEach((donor) => {
        if (!donor.coordinates || !donor.coordinates.lat || !donor.coordinates.lng) return;

        const icon = createBloodDropIcon(donor.bloodGroup || 'O+', donor.isAvailable, donor.preliminaryStatus);
        const availLabel = donor.isAvailable ? '<span style="color:#16a34a;font-weight:700">Available Now</span>' : '<span style="color:#94a3b8;font-weight:700">Busy</span>';

        const popup = `
          <div style="font-family:Outfit,sans-serif;min-width:160px;padding:4px 0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="background:#dc2626;color:white;font-weight:900;padding:3px 8px;border-radius:8px;font-size:13px">${donor.bloodGroup}</span>
              <span style="font-size:11px;color:#64748b;font-weight:600">${availLabel}</span>
            </div>
            <div style="font-size:11px;color:#475569;margin-bottom:3px"><b>Area:</b> ${donor.location || 'Unknown'}</div>
          </div>
        `;

        const marker = L.marker([donor.coordinates.lat, donor.coordinates.lng], { icon })
          .bindPopup(popup, { closeButton: true, maxWidth: 220, className: 'blood-popup' });

        targetLayer.addLayer(marker);
        bounds.push([donor.coordinates.lat, donor.coordinates.lng]);
      });
    };

    if (viewMode === 'cluster') {
      const clusterGroup = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 });
      renderDonors(clusterGroup);
      mapInstanceRef.current.addLayer(clusterGroup);
      layersRef.current.clusterLayer = clusterGroup;
      
    } else if (viewMode === 'heatmap') {
      const heatData = donors
        .filter(d => d.coordinates?.lat && d.coordinates?.lng)
        .map(d => [d.coordinates.lat, d.coordinates.lng, d.isAvailable ? 1.0 : 0.3]);
      
      const heatLayer = L.heatLayer(heatData, { radius: 25, blur: 20, maxZoom: 15, max: 1.0, gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' } });
      mapInstanceRef.current.addLayer(heatLayer);
      layersRef.current.heatLayer = heatLayer;
      heatData.forEach(pt => bounds.push([pt[0], pt[1]]));
      
    } else if (viewMode === 'radar') {
      const radarGroup = L.layerGroup();
      
      // Draw non-clustered donors
      renderDonors(radarGroup, true);

      // Draw Requests, Radar Rings, and Connection Lines
      requests.forEach((req) => {
        if (!req.coordinates || !req.coordinates.lat || !req.coordinates.lng) return;
        
        // Marker
        const icon = createBeaconIcon(req.urgency);
        const popup = `
          <div style="font-family:Outfit,sans-serif;padding:4px">
            <div style="color:#dc2626;font-weight:900;font-size:14px;margin-bottom:4px">🚨 EMERGENCY</div>
            <div style="font-size:12px;font-weight:700;margin-bottom:2px">${req.patientName} (${req.bloodGroup})</div>
            <div style="font-size:11px;color:#64748b">${req.hospitalAddress}</div>
            <div style="font-size:11px;margin-top:4px;font-weight:600">Need: ${req.unitsRequired} Units</div>
          </div>
        `;
        L.marker([req.coordinates.lat, req.coordinates.lng], { icon, zIndexOffset: 1000 })
          .bindPopup(popup)
          .addTo(radarGroup);

        // Radar Ring (approx 10km radius)
        L.circle([req.coordinates.lat, req.coordinates.lng], {
          radius: 10000,
          color: req.urgency === 'emergency' ? '#dc2626' : '#f59e0b',
          weight: 1,
          opacity: 0.8,
          fillColor: req.urgency === 'emergency' ? '#dc2626' : '#f59e0b',
          fillOpacity: 0.05,
          dashArray: '5, 10'
        }).addTo(radarGroup);

        bounds.push([req.coordinates.lat, req.coordinates.lng]);

        // Draw connections to matching donors within range roughly
        donors.forEach(donor => {
          if (!donor.coordinates || !donor.isAvailable) return;
          // Simple visual matching: same blood group and roughly within 0.1 deg lat/lng (~11km)
          const latDiff = Math.abs(donor.coordinates.lat - req.coordinates.lat);
          const lngDiff = Math.abs(donor.coordinates.lng - req.coordinates.lng);
          
          if (latDiff < 0.1 && lngDiff < 0.1 && (donor.bloodGroup === req.bloodGroup || donor.bloodGroup === 'O-')) {
            L.polyline([
              [req.coordinates.lat, req.coordinates.lng],
              [donor.coordinates.lat, donor.coordinates.lng]
            ], {
              color: '#dc2626',
              weight: 1.5,
              opacity: 0.4,
              dashArray: '4, 8'
            }).addTo(radarGroup);
          }
        });
      });

      mapInstanceRef.current.addLayer(radarGroup);
      layersRef.current.radarLayer = radarGroup;
    }

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [mapReady, donors, requests, viewMode]);

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-600" />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
            Live Donor Map
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2" style={{ border: '1px solid var(--card-border)' }}>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === 'radar' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Radar
            </button>
            <button
              onClick={() => setViewMode('cluster')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'cluster' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Clusters
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'heatmap' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Heatmap
            </button>
          </div>
          <div className="flex items-center gap-3 hidden sm:flex">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 inline-block"></span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Busy</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        Anonymized blood-drop markers showing eligible donor locations. Personal details are not exposed.
      </p>

      {/* Map Container */}
      <div
        className="card-panel overflow-hidden relative"
        style={{ height: '420px', border: '1px solid var(--card-border)' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Loading donor locations...</span>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        />
      </div>
    </div>
  );
};

export default LiveDonorMap;
