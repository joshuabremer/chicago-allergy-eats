<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type * as Leaflet from 'leaflet';
	import type { Restaurant } from '$lib/types';

	let {
		places,
		selectedSlug = null,
		onSelect
	}: {
		places: Restaurant[];
		selectedSlug?: string | null;
		onSelect?: (slug: string) => void;
	} = $props();

	let mapElement: HTMLDivElement | null = null;
	let leaflet: typeof Leaflet | null = null;
	let map: Leaflet.Map | null = null;
	let markersLayer: Leaflet.LayerGroup | null = null;

	onMount(() => {
		if (!mapElement) {
			return;
		}

		void initializeMap();

		return () => {
			map?.remove();
			map = null;
			markersLayer = null;
		};
	});

	$effect(() => {
		places;
		selectedSlug;
		refreshMarkers();
	});

	function refreshMarkers() {
		if (!leaflet || !map || !markersLayer) {
			return;
		}

		markersLayer.clearLayers();

		if (places.length === 0) {
			map.setView([41.8781, -87.6298], 11);
			return;
		}

		if (places.length === 1) {
			addMarker(places[0]);
			map.setView([places[0].latitude, places[0].longitude], 14);
			return;
		}

		const bounds = leaflet.latLngBounds([]);

		for (const place of places) {
			addMarker(place);
			bounds.extend([place.latitude, place.longitude]);
		}

		map.fitBounds(bounds.pad(0.2), { animate: false });
	}

	function addMarker(place: Restaurant) {
		if (!leaflet || !markersLayer) {
			return;
		}

		const isSelected = place.slug === selectedSlug;
		const marker = leaflet.circleMarker([place.latitude, place.longitude], {
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
		leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19
		}).addTo(map);

		markersLayer = leaflet.layerGroup().addTo(map);
		refreshMarkers();
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
		box-shadow: 0 12px 30px rgb(15 23 42 / 0.16) !important;
	}

	:global(.leaflet-control-zoom a) {
		color: #0f172a !important;
	}
</style>
