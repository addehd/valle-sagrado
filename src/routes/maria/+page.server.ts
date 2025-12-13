import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const artPieces = [
		{
			id: 1,
			artist: "Maria Ocampo",
			shortDescription: "This abstract oil painting features muted earth tones—creams, beiges, ochres, and warm browns—with loose, gestural brushwork creating a dreamy, ethereal effect. The overall mood is contemplative and naturalistic, evoking earth, mist, or water.",
			shortDescriptionSv: "Denna abstrakta oljemålning har dova jordfärger—gräddfärg, beige, ockra och varma bruna toner—med lösa, gestuella penseldrag som skapar en drömmande, eterisk effekt. Den övergripande stämningen är kontemplativ och naturalistisk, framkallar jord, dimma eller vatten.",
			artPieceImg: "/2025/1.webp",
			primaryColor: "#B8860B",
			accentColor: "#CD853F",
			colors: ["#B8860B", "#CD853F", "#DEB887", "#D2691E", "#A0522D", "#8B4513", "#696969", "#556B2F", "#2F4F4F"]
		},
		{
			id: 2,
			artist: "Maria Ocampo",
			shortDescription: "This luminous landscape captures light and atmosphere through clear zones: moody blue-grey sky, misty middle ground with soft yellows and greens, and dark water with golden landforms. Ocampo creates a visual symphony with meditative stillness.",
			shortDescriptionSv: "Detta ljusa landskap fångar ljus och atmosfär genom tydliga zoner: stämningsfull blågrå himmel, dimmig mellangrund med mjuka gula och gröna toner, och mörkt vatten med gyllene landformer. Ocampo skapar en visuell symfoni med meditativ stillhet.",
			artPieceImg: "/2025/2.webp",
			primaryColor: "#FFD700",
			accentColor: "#FF8C00",
			colors: ["#FFD700", "#FF8C00", "#FFA500", "#DAA520", "#B8860B", "#4682B4", "#708090", "#8B4513", "#2F4F4F"]
		},
		{
			id: 3,
			artist: "Maria Ocampo",
			shortDescription: "A luminous, expansive landscape with cool teal-blue sky and a bright, glowing center of yellows and creams suggesting breaking light. Warm earth tones anchor the foreground with visible brushwork creating movement. The cool-warm contrast evokes sunrise or sunset drama.",
			shortDescriptionSv: "Ett lysande, vidsträckt landskap med sval turkosblå himmel och ett ljust, glödande centrum av gula och gräddfärger som antyder brytande ljus. Varma jordfärger förankrar förgrunden med synliga penseldrag som skapar rörelse. Den svala-varma kontrasten framkallar soluppgångs- eller solnedgångsdrama.",
			artPieceImg: "/2025/4.webp",
			primaryColor: "#696969",
			accentColor: "#9370DB",
			colors: ["#696969", "#9370DB", "#708090", "#B0C4DE", "#D3D3D3", "#E6E6FA", "#F0E68C", "#4682B4", "#2F4F4F"]
		},
		{
			id: 4,
			artist: "Maria Ocampo",
			shortDescription: "Ocampo's most minimalist work, dominated by soft greys and pale creams suggesting misty landscape or foggy moorland. Horizontal brushstrokes create stillness, with subtle warm yellows providing quiet warmth. The composition is understated and meditative.",
			shortDescriptionSv: "Ocampos mest minimalistiska verk, dominerat av mjuka gråtoner och bleka gräddfärger som antyder dimlandskap eller dimmig hed. Horisontella penseldrag skapar stillhet, med subtila varma gula toner som ger tyst värme. Kompositionen är avskalad och meditativ.",
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