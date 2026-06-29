<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type * as Leaflet from 'leaflet';
	import { themeMode } from '$lib/theme';
	import type { DecisionState, Restaurant } from '$lib/types';

	let {
		places,
		selectedSlug = null,
		onSelect,
		initialCenter,
		initialZoom,
		showHotelMarker = false,
		markerDecisions = {},
		centerOnSelected = false
	}: {
		places: Restaurant[];
		selectedSlug?: string | null;
		onSelect?: (slug: string) => void;
		initialCenter?: [number, number];
		initialZoom?: number;
		showHotelMarker?: boolean;
		markerDecisions?: Partial<Record<string, DecisionState>>;
		centerOnSelected?: boolean;
	} = $props();

	const PALMER_HOUSE = {
		name: 'Palmer House',
		address: '17 E Monroe St, Chicago, IL 60603',
		latitude: 41.8808,
		longitude: -87.6267
	} as const;

	let mapElement: HTMLDivElement | null = null;
	let leaflet: typeof Leaflet | null = null;
	let map: Leaflet.Map | null = null;
	let markersLayer: Leaflet.LayerGroup | null = null;
	let tileLayer: Leaflet.TileLayer | null = null;
	let hasAppliedInitialViewport = false;
	let appliedTheme: 'light' | 'dark' | null = null;

	onMount(() => {
		if (!mapElement) {
			return;
		}

		void initializeMap();

		return () => {
			map?.remove();
			map = null;
			markersLayer = null;
			hasAppliedInitialViewport = false;
		};
	});

	$effect(() => {
		places;
		selectedSlug;
		markerDecisions;
		showHotelMarker;
		renderMarkers();
	});

	$effect(() => {
		$themeMode;
		syncTileLayer();
	});

	$effect(() => {
		places;
		initialCenter;
		initialZoom;
		showHotelMarker;
		syncViewport();
	});

	$effect(() => {
		places;
		selectedSlug;
		centerOnSelected;
		focusSelectedPlace();
	});

	function renderMarkers() {
		if (!leaflet || !map || !markersLayer) {
			return;
		}

		markersLayer.clearLayers();

		if (showHotelMarker) {
			addHotelMarker();
		}

		for (const place of places) {
			addMarker(place);
		}
	}

	function syncViewport() {
		if (!leaflet || !map) {
			return;
		}

		if (places.length === 0) {
			map.setView([41.8781, -87.6298], 11);
			return;
		}

		if (places.length === 1 && !showHotelMarker) {
			map.setView([places[0].latitude, places[0].longitude], 14);
			return;
		}

		const bounds = leaflet.latLngBounds([]);

		if (showHotelMarker) {
			bounds.extend([PALMER_HOUSE.latitude, PALMER_HOUSE.longitude]);
		}

		for (const place of places) {
			bounds.extend([place.latitude, place.longitude]);
		}

		if (initialCenter && initialZoom && !hasAppliedInitialViewport) {
			map.setView(initialCenter, initialZoom, { animate: false });
			hasAppliedInitialViewport = true;
			return;
		}

		map.fitBounds(bounds.pad(0.2), { animate: false });
	}

	function focusSelectedPlace() {
		if (!map || !centerOnSelected || !selectedSlug) {
			return;
		}

		const selectedPlace = places.find((place) => place.slug === selectedSlug);

		if (!selectedPlace) {
			return;
		}

		map.setView([selectedPlace.latitude, selectedPlace.longitude], Math.max(map.getZoom(), 15), {
			animate: true,
			duration: 0.35
		});
	}

	function addMarker(place: Restaurant) {
		if (!leaflet || !markersLayer) {
			return;
		}

		const isSelected = place.slug === selectedSlug;
		const decision = markerDecisions[place.slug];
		const marker =
			decision === 'approved'
				? leaflet.marker([place.latitude, place.longitude], {
						icon: leaflet.divIcon({
							className: 'approved-marker-wrapper',
							html: `<div class="approved-marker${isSelected ? ' selected' : ''}">✅</div>`,
							iconSize: [28, 28],
							iconAnchor: [14, 14]
						})
					})
				: leaflet.circleMarker([place.latitude, place.longitude], {
						radius: isSelected ? 11 : 8,
						fillColor: isSelected ? '#1d4ed8' : '#f97316',
						color: '#ffffff',
						weight: 2,
						fillOpacity: 0.95
					});

		marker.bindTooltip(`${place.name} • ${place.neighborhood}`, {
			direction: 'top',
			offset: [0, -4]
		});

		marker.on('click', () => onSelect?.(place.slug));
		marker.addTo(markersLayer);
	}

	function addHotelMarker() {
		if (!leaflet || !markersLayer) {
			return;
		}

		const hotelMarker = leaflet.marker([PALMER_HOUSE.latitude, PALMER_HOUSE.longitude], {
			icon: leaflet.divIcon({
				className: 'hotel-marker-wrapper',
				html: '<div class="hotel-marker">H</div>',
				iconSize: [28, 28],
				iconAnchor: [14, 14]
			})
		});

		hotelMarker.bindTooltip(`${PALMER_HOUSE.name} • Your hotel`, {
			direction: 'top',
			offset: [0, -6]
		});

		hotelMarker.addTo(markersLayer);
	}

	async function initializeMap() {
		if (!mapElement) {
			return;
		}

		leaflet = await import('leaflet');
		map = leaflet.map(mapElement, {
			attributionControl: false,
			scrollWheelZoom: true,
			zoomControl: false
		});

		leaflet.control.zoom({ position: 'bottomright' }).addTo(map);
		syncTileLayer();
		markersLayer = leaflet.layerGroup().addTo(map);
		renderMarkers();
		syncViewport();
	}

	function syncTileLayer() {
		if (!leaflet || !map) {
			return;
		}

		if (appliedTheme === $themeMode && tileLayer) {
			return;
		}

		appliedTheme = $themeMode;

		if (tileLayer) {
			map.removeLayer(tileLayer);
		}

		tileLayer =
			$themeMode === 'dark'
				? leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
						maxZoom: 19,
						subdomains: 'abcd'
					})
				: leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						maxZoom: 19
					});

		tileLayer.addTo(map);
	}
</script>

<div bind:this={mapElement} class="map"></div>

<style>
	.map {
		height: 100%;
		width: 100%;
		min-height: 32rem;
	}

	:global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: var(--map-control-shadow) !important;
	}

	:global(.leaflet-control-zoom a) {
		color: var(--map-control-text) !important;
		background: var(--map-control-bg) !important;
		border-color: var(--panel-border) !important;
	}

	:global(.leaflet-tooltip) {
		background: var(--panel-bg);
		color: var(--text-primary);
		border: 1px solid var(--panel-border);
		box-shadow: var(--panel-shadow-soft);
	}

	:global(.leaflet-tooltip-top:before) {
		border-top-color: var(--panel-border);
	}

	:global(.hotel-marker-wrapper) {
		background: transparent;
		border: none;
	}

	:global(.approved-marker-wrapper) {
		background: transparent;
		border: none;
	}

	:global(.approved-marker) {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		background: var(--marker-approved-bg);
		border: 2px solid var(--marker-approved-border);
		box-shadow: 0 10px 24px rgb(22 163 74 / 0.24);
		font-size: 0.95rem;
		line-height: 1;
	}

	:global(.approved-marker.selected) {
		border-color: var(--marker-approved-selected-border);
		box-shadow: 0 10px 24px rgb(29 78 216 / 0.28);
	}

	:global(.hotel-marker) {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		background: var(--marker-hotel-bg);
		border: 2px solid var(--marker-hotel-border);
		color: var(--marker-hotel-text);
		font-size: 0.85rem;
		font-weight: 800;
		box-shadow: 0 10px 24px rgb(15 23 42 / 0.3);
	}
</style>
