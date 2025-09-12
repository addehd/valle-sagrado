import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const artPieces = [
		{
			id: 1,
			artname: "Tormenta Andina",
			artist: "Maria Ocampo",
			shortDescription: "Óleo sobre lino. Una atmósfera tormentosa envuelve el paisaje montañoso en tonos ocres y grises, donde la tierra y el cielo se funden en un drama natural de texturas expresivas.",
			artPieceImg: "/2025/1.webp",
			primaryColor: "#B8860B",
			accentColor: "#CD853F",
			colors: ["#B8860B", "#CD853F", "#DEB887", "#D2691E", "#A0522D", "#8B4513", "#696969", "#556B2F", "#2F4F4F"]
		},
		{
			id: 2,
			artname: "Inti Raymi",
			artist: "Maria Ocampo",
			shortDescription: "Óleo sobre lino. La luz dorada emerge entre nubes oscuras, creando un resplandor místico que evoca la celebración ancestral del sol en los Andes.",
			artPieceImg: "/2025/2.webp",
			primaryColor: "#FFD700",
			accentColor: "#FF8C00",
			colors: ["#FFD700", "#FF8C00", "#FFA500", "#DAA520", "#B8860B", "#4682B4", "#708090", "#8B4513", "#2F4F4F"]
		},
		{
			id: 3,
			artname: "Phuyu Phuyu",
			artist: "Maria Ocampo",
			shortDescription: "Óleo sobre lino. Un cielo sereno dominado por nubes grises y azules se extiende sobre un paisaje suave, donde pequeñas aves cruzan el horizonte infinito.",
			artPieceImg: "/2025/3.jpg",
			primaryColor: "#708090",
			accentColor: "#9370DB",
			colors: ["#708090", "#9370DB", "#B0C4DE", "#D3D3D3", "#E6E6FA", "#DEB887", "#F0E68C", "#4682B4", "#2F4F4F"]
		},
		{
			id: 4,
			artname: "Wayra Tiempo",
			artist: "Maria Ocampo",
			shortDescription: "Óleo sobre lino. Las nubes se desplazan lentamente sobre la pampa, creando un paisaje contemplativo donde el tiempo parece suspendido entre cielo y tierra.",
			artPieceImg: "/2025/4.webp",
			primaryColor: "#696969",
			accentColor: "#9370DB",
			colors: ["#696969", "#9370DB", "#708090", "#B0C4DE", "#D3D3D3", "#E6E6FA", "#F0E68C", "#4682B4", "#2F4F4F"]
		},
		{
			id: 5,
			artname: "Yakana Puriynin",
			artist: "Maria Ocampo",
			shortDescription: "Óleo sobre lino. Un paisaje místico en verdes y azules profundos, donde las formas abstractas sugieren la constelación andina de la llama cruzando el cielo nocturno.",
			artPieceImg: "/2025/5.webp",
			primaryColor: "#008B8B",
			accentColor: "#5F9EA0",
			colors: ["#008B8B", "#5F9EA0", "#20B2AA", "#48D1CC", "#40E0D0", "#7B68EE", "#483D8B", "#2F4F4F", "#191970"]
		}
	];

	return {
		artPieces
	};
};