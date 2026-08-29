import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LandItem, LocationCoordinates } from '../../types';

interface MapViewerProps {
  center: LocationCoordinates;
  radiusKm?: number;
  showRadiusCircle?: boolean;
  lands?: LandItem[];
  selectedLandId?: string;
  onSelectLand?: (land: LandItem) => void;
  interactivePicker?: boolean;
  onLocationPick?: (coords: { latitude: number; longitude: number; address?: string }) => void;
  height?: string;
  className?: string;
  userType?: 'FARMER' | 'LANDLORD' | 'ADMIN';
}

// Preset hubs for quick navigation & demo verification
export const LOCATION_PRESETS = [
  {
    name: 'Thiruvallur / Chennai Belt (Default)',
    lat: 13.0827,
    lng: 80.2707,
    district: 'Thiruvallur',
    state: 'Tamil Nadu',
  },
  {
    name: 'Coimbatore / Pollachi Agro Hub',
    lat: 10.9982,
    lng: 76.9629,
    district: 'Coimbatore',
    state: 'Tamil Nadu',
  },
  {
    name: 'Bangalore Rural / Mandya Belt',
    lat: 12.5218,
    lng: 76.8951,
    district: 'Mandya',
    state: 'Karnataka',
  },
  {
    name: 'Nashik / Niphad Grape & Agro Valley',
    lat: 20.0768,
    lng: 74.1084,
    district: 'Nashik',
    state: 'Maharashtra',
  },
  {
    name: 'Ludhiana / Punjab Fertile Plains',
    lat: 30.9010,
    lng: 75.8573,
    district: 'Ludhiana',
    state: 'Punjab',
  },
];

export const MapViewer: React.FC<MapViewerProps> = ({
  center,
  radiusKm = 20,
  showRadiusCircle = true,
  lands = [],
  selectedLandId,
  onSelectLand,
  interactivePicker = false,
  onLocationPick,
  height = '460px',
  className = '',
  userType = 'FARMER',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.latitude, center.longitude],
        zoom: 11,
        zoomControl: false,
      });

      // OpenStreetMap Tiles (Fast, high-contrast, beautiful for agriculture terrain)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add Zoom Control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Handle map clicks if in interactive picker mode
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (interactivePicker && onLocationPick) {
          onLocationPick({
            latitude: parseFloat(e.latlng.lat.toFixed(4)),
            longitude: parseFloat(e.latlng.lng.toFixed(4)),
          });
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center, User Marker, and 20 KM Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = center.latitude;
    const lng = center.longitude;

    map.setView([lat, lng], map.getZoom() || 11);

    // 1. Remove previous user marker & circle
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (circleRef.current) {
      circleRef.current.remove();
    }

    // 2. Custom Farmer / Landlord Center Marker Icon
    const centerIconHtml =
      userType === 'FARMER'
        ? `<div class="relative flex items-center justify-center w-11 h-11 bg-[#1b4332] text-white rounded-full border-2 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
            <span class="text-xl">👨‍🌾</span>
            <span class="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#95d5b2] opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#40916c] border border-white"></span>
            </span>
           </div>`
        : `<div class="relative flex items-center justify-center w-11 h-11 bg-[#1b4332] text-white rounded-full border-2 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2">
            <span class="text-xl">🏠</span>
           </div>`;

    const customCenterIcon = L.divIcon({
      html: centerIconHtml,
      className: 'custom-center-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([lat, lng], {
      icon: customCenterIcon,
      draggable: interactivePicker,
    }).addTo(map);

    marker.bindTooltip(
      `<b>${userType === 'FARMER' ? '👨‍🌾 Your Location' : '🏠 Base Location'}</b><br/>${center.village || center.district || 'Current Center'}`,
      { permanent: false, direction: 'top', offset: [0, -18] }
    );

    if (interactivePicker) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onLocationPick) {
          onLocationPick({
            latitude: parseFloat(pos.lat.toFixed(4)),
            longitude: parseFloat(pos.lng.toFixed(4)),
          });
        }
      });
    }

    userMarkerRef.current = marker;

    // 3. Draw 20 KM Geofence Radius Circle
    if (showRadiusCircle && radiusKm > 0) {
      const radiusMeters = radiusKm * 1000;
      const circle = L.circle([lat, lng], {
        radius: radiusMeters,
        color: '#1b4332',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#95d5b2',
        fillOpacity: 0.18,
      }).addTo(map);

      circle.bindTooltip(`📍 <b>Permitted 20 KM Rental Radius</b>`, {
        permanent: false,
        direction: 'center',
        className: 'radius-tooltip',
      });

      circleRef.current = circle;
    }
  }, [center.latitude, center.longitude, radiusKm, showRadiusCircle, userType, interactivePicker]);

  // Update Land Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    lands.forEach((land) => {
      const isSelected = selectedLandId === land.id;
      const isWithinRadius = land.isWithin20Km ?? (land.distanceKm !== undefined ? land.distanceKm <= 20 : true);

      let pinColorClass = 'bg-[#1b4332]';
      if (land.status === 'RESERVED') pinColorClass = 'bg-amber-600';
      if (land.status === 'RENTED') pinColorClass = 'bg-blue-600';
      if (land.status === 'MAINTENANCE' || !isWithinRadius) pinColorClass = 'bg-stone-500';

      const iconHtml = `
        <div class="relative flex items-center justify-center w-9 h-9 ${pinColorClass} text-white rounded-full border-2 ${
        isSelected ? 'border-amber-300 ring-4 ring-[#95d5b2] scale-125' : 'border-white'
      } shadow-lg transition-transform hover:scale-115">
          <span class="text-sm">🌾</span>
          ${
            isWithinRadius
              ? `<span class="absolute -top-1 -right-1 bg-[#40916c] text-[9px] font-bold text-white px-1 rounded-full border border-white">20k</span>`
              : `<span class="absolute -top-1 -right-1 bg-red-500 text-[9px] font-bold text-white px-1 rounded-full border border-white">&gt;20</span>`
          }
        </div>
      `;

      const landIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-land-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const landMarker = L.marker([land.location.latitude, land.location.longitude], {
        icon: landIcon,
      });

      // Modern Popup Card
      const popupHtml = `
        <div class="w-64 overflow-hidden rounded-2xl bg-white text-stone-900 shadow-md border border-[#e2e8dc]">
          <div class="h-28 w-full relative bg-stone-200 overflow-hidden">
            <img src="${land.images[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}" 
                 class="w-full h-full object-cover" 
                 alt="${land.name}" 
                 onerror="this.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'" />
            <span class="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shadow-sm ${
              land.status === 'AVAILABLE'
                ? 'bg-[#1b4332] text-white'
                : land.status === 'RESERVED'
                ? 'bg-amber-600 text-white'
                : 'bg-blue-600 text-white'
            }">
              ${land.status}
            </span>
            ${
              land.distanceKm !== undefined
                ? `<span class="absolute bottom-2 right-2 px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#1b4332]/90 text-[#95d5b2] backdrop-blur-sm">
                    📍 ${land.distanceKm} KM
                  </span>`
                : ''
            }
          </div>
          <div class="p-3">
            <div class="flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span>${land.landCode}</span>
              <span>${land.totalArea} ${land.areaUnit}</span>
            </div>
            <h4 class="font-bold text-sm text-stone-900 mt-0.5 line-clamp-1">${land.name || 'Land Plot'}</h4>
            <p class="text-xs text-stone-600 mt-1 flex items-center gap-1">
              🌱 ${land.soilType || 'Loamy'} • 💧 ${land.waterAvailability ? land.waterAvailability.split(' ')[0] : 'Available'}
            </p>
            <div class="mt-2 pt-2 border-t border-[#e2e8dc] flex items-center justify-between">
              <div>
                <span class="text-xs text-stone-500">Rent: </span>
                <span class="font-bold text-[#1b4332] text-sm">₹${land.rentAmount ? land.rentAmount.toLocaleString() : '0'}</span>
                <span class="text-[10px] text-stone-400">/${land.rentPeriod || 'yr'}</span>
              </div>
              <button 
                id="btn-popup-${land.id}" 
                class="px-2.5 py-1 text-xs font-semibold bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg transition-colors cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        </div>
      `;

      landMarker.bindPopup(popupHtml, { maxWidth: 280 });

      landMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${land.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectLand) {
              onSelectLand(land);
            }
          };
        }
      });

      markersLayer.addLayer(landMarker);
    });
  }, [lands, selectedLandId, onSelectLand]);

  const fitBoundsToAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const points: [number, number][] = [[center.latitude, center.longitude]];
    lands.forEach((l) => points.push([l.location.latitude, l.location.longitude]));

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([center.latitude, center.longitude], 12);
    }
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-[#e2e8dc] shadow-sm bg-[#f8f9f5] ${className}`}>
      {/* Interactive Map Canvas */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-[#e2e8dc] shadow-md text-xs flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-2 font-bold text-[#1b4332] pb-1 border-b border-[#e2e8dc]">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1b4332]"></span>
          <span>20 KM Geofence Map</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <span className="text-sm">👨‍🌾</span>
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <span className="w-3 h-3 rounded-full bg-[#1b4332] inline-block border border-white"></span>
          <span>Available Land (&le;20 KM)</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <span className="w-3 h-3 rounded-full bg-amber-600 inline-block border border-white"></span>
          <span>Reserved Land</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <span className="w-3 h-3 rounded-full bg-stone-400 inline-block border border-white"></span>
          <span>Outside 20 KM Zone</span>
        </div>
      </div>

      {/* Quick Action Button: Center Map */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={fitBoundsToAll}
          className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-stone-800 text-xs font-semibold rounded-xl border border-[#e2e8dc] shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>🎯</span> Fit All ({lands.length} Lands)
        </button>
      </div>
    </div>
  );
};
