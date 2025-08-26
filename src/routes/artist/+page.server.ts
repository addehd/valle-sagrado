import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const artPieces = [
		{
			id: 1,
			artname: "Sunset Symphony",
			artist: "Elena Rodriguez",
			shortDescription: "A vibrant abstract piece capturing the essence of a golden hour sunset with bold brushstrokes and warm colors.",
			artPieceImg: "/2025/1.webp",
			primaryColor: "#FF6B35", // Orange-red
			accentColor: "#F7931E" // Golden yellow
		},
		{
			id: 2,
			artname: "Ocean Dreams",
			artist: "Marcus Chen",
			shortDescription: "Deep blue watercolor painting inspired by the mysterious depths of the ocean and marine life.",
			artPieceImg: "/2025/2.webp",
			primaryColor: "#1B4B7C", // Deep blue
			accentColor: "#4A90B8" // Light blue
		},
		{
			id: 3,
			artname: "Forest Whispers",
			artist: "Sarah Thompson",
			shortDescription: "Mixed media artwork featuring layered textures that evoke the tranquil atmosphere of an ancient forest.",
			artPieceImg: "/2025/4.webp",
			primaryColor: "#2D5A27", // Forest green
			accentColor: "#7CB342" // Light green
		},
		{
			id: 4,
			artname: "Urban Pulse",
			artist: "Diego Martinez",
			shortDescription: "Contemporary street art piece reflecting the energy and chaos of modern city life through geometric patterns.",
			artPieceImg: "/2025/5.webp",
			primaryColor: "#8E24AA", // Purple
			accentColor: "#BA68C8" // Light purple
		},
		{
			id: 5,
			artname: "Midnight Reflections",
			artist: "Yuki Tanaka",
			shortDescription: "Minimalist ink painting exploring themes of solitude and contemplation under the night sky.",
			artPieceImg: "/2025/6.webp",
			primaryColor: "#1A1A2E", // Dark navy
			accentColor: "#16213E" // Lighter navy
		},
		{
			id: 6,
			artname: "Desert Bloom",
			artist: "Amara Hassan",
			shortDescription: "Vibrant acrylic painting celebrating the unexpected beauty of desert flowers in full bloom.",
			artPieceImg: "/2025/1.webp",
			primaryColor: "#D84315", // Red-orange
			accentColor: "#FF7043" // Coral
		},
		{
			id: 7,
			artname: "Crystal Formations",
			artist: "Oliver Schmidt",
			shortDescription: "Digital art piece inspired by geological formations and the interplay of light through crystal structures.",
			artPieceImg: "/2025/2.webp",
			primaryColor: "#00ACC1", // Cyan
			accentColor: "#4DD0E1" // Light cyan
		},
		{
			id: 8,
			artname: "Emotional Spectrum",
			artist: "Luna Vasquez",
			shortDescription: "Abstract expressionist painting that maps the full range of human emotions through color and movement.",
			artPieceImg: "/2025/4.webp",
			primaryColor: "#E91E63", // Pink
			accentColor: "#F06292" // Light pink
		}
	];

	return {
		artPieces
	};
};
