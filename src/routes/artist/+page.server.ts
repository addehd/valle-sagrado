import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const artPieces = [
		{
			id: 1,
			artname: "Inti Raymi - Solens ceremoni",
			artist: "Maria Ocampo",
			shortDescription: "Abstrakta former i varma toner som väcker känslor av Inti (solen). Vad ser du i dessa penseldrag? Kanske ríos (floder) av guld, eller barndomens vida (liv) - tolkningen är din.",
			artPieceImg: "/2025/1.webp",
			primaryColor: "#FF6B35",
			accentColor: "#FFD23F",
			colors: ["#FF6B35", "#FFD23F", "#FF8E53", "#FFA726", "#FFCC02", "#F57C00", "#E65100", "#BF360C", "#D84315"]
		},
		{
			id: 2,
			artname: "Mama Cocha - Vattnets moder",
			artist: "Maria Ocampo",
			shortDescription: "Flytande former i azul (blått) och verde (grönt) som rör sig som vatten eller vind. Ser du Mama Cocha, vattnets ande? Eller kanske niebla (dimma) över sagrada (heliga) platser? Varje betraktare finner sin egen historia.",
			artPieceImg: "/2025/2.webp",
			primaryColor: "#1B4B7C",
			accentColor: "#4A90B8",
			colors: ["#1B4B7C", "#4A90B8", "#2E7D9A", "#5DADE2", "#85C1E9", "#AED6F1", "#D5DBDB", "#7986CB", "#3F51B5"]
		},
		{
			id: 3,
			artname: "Sacha Mama - Skogens ande",
			artist: "Maria Ocampo",
			shortDescription: "Lager på lager av verde (gröna) texturer skapar djup och rörelse. Vad viskar dessa former till dig? Kanske Sacha Mama från la selva (djungeln), eller andra recuerdos (minnen) som bara du kan känna igen.",
			artPieceImg: "/2025/4.webp",
			primaryColor: "#2D5A27",
			accentColor: "#7CB342",
			colors: ["#2D5A27", "#7CB342", "#4CAF50", "#66BB6A", "#81C784", "#A5D6A7", "#C8E6C9", "#388E3C", "#1B5E20"]
		},
		{
			id: 4,
			artname: "Apu Tayta - Bergets fader",
			artist: "Maria Ocampo",
			shortDescription: "Geometriska former i morado (lila) som stiger och faller. Känner du kraften från Apu Tayta, bergets ande? Eller ser du något helt annat i dessa abstrakta linjer? Las montañas (bergen) finns där om du vill se dem.",
			artPieceImg: "/2025/5.webp",
			primaryColor: "#8E24AA",
			accentColor: "#BA68C8",
			colors: ["#8E24AA", "#BA68C8", "#9C27B0", "#AB47BC", "#CE93D8", "#E1BEE7", "#F3E5F5", "#7B1FA2", "#4A148C"]
		},
		{
			id: 5,
			artname: "Quilla Mama - Månens reflektion",
			artist: "Maria Ocampo",
			shortDescription: "Mörka toner med subtila ljuspunkter. Vad reflekteras i dessa djupa färger? Kanske Quilla Mama i noche (natt), eller las estrellas (stjärnor) i agua (vatten) - eller något helt personligt för dig.",
			artPieceImg: "/2025/6.webp",
			primaryColor: "#1A1A2E",
			accentColor: "#16213E",
			colors: ["#1A1A2E", "#16213E", "#0F3460", "#533483", "#16537E", "#1A237E", "#283593", "#3949AB", "#5C6BC0"]
		},
		{
			id: 6,
			artname: "Flores del Desierto - Ökenens blomster",
			artist: "Maria Ocampo",
			shortDescription: "Explosiva färger i rojo (rött) och naranja (orange) som pulserar med energi. Ser du flores (blommor) i desierto (öknen)? Känner du esperanza (hopp)? Eller väcker dessa varma toner andra känslor hos dig?",
			artPieceImg: "/2025/1.webp",
			primaryColor: "#D84315",
			accentColor: "#FF7043",
			colors: ["#D84315", "#FF7043", "#FF5722", "#FF6F00", "#FF8F00", "#FFA000", "#FFB300", "#FFC107", "#FFCA28"]
		},
		{
			id: 7,
			artname: "Qori Rumi - Gyllene sten",
			artist: "Maria Ocampo",
			shortDescription: "Kristallina former i celeste (himmelsblå) som fångar och bryter luz (ljus). Vad ser du i dessa geometriska fragment? Kanske Qori (guld) och Rumi (sten), eller helt andra visioner av belleza (skönhet)?",
			artPieceImg: "/2025/2.webp",
			primaryColor: "#00ACC1",
			accentColor: "#4DD0E1",
			colors: ["#00ACC1", "#4DD0E1", "#00BCD4", "#26C6DA", "#4FC3F7", "#81D4FA", "#B3E5FC", "#0097A7", "#006064"]
		},
		{
			id: 8,
			artname: "Sumak Kausay - Det goda livet",
			artist: "Maria Ocampo",
			shortDescription: "En regnbåge av känslor flyter över duken. Vilka emociones (känslor) väcker dessa färger hos dig? Kanske ser du Sumak Kausay (det goda livet), eller helt andra historias (berättelser) från ditt eget corazón (hjärta).",
			artPieceImg: "/2025/4.webp",
			primaryColor: "#E91E63",
			accentColor: "#F06292",
			colors: ["#E91E63", "#F06292", "#EC407A", "#EF5350", "#FF5722", "#FF9800", "#FFC107", "#8BC34A", "#2196F3"]
		}
	];

	return {
		artPieces
	};
};
