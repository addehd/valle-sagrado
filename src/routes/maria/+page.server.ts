import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const artPieces = [
		{
			id: 1,
			artist: "Maria Ocampo",
			shortDescription: "This abstract oil painting features muted earth tones—creams, beiges, ochres, and warm browns—with loose, gestural brushwork creating a dreamy, ethereal effect. Lighter passages float across the middle while warmer tones anchor below. The overall mood is contemplative and naturalistic, evoking earth, mist, or water with a weathered, organic quality that remains beautifully ambiguous.",
			shortDescriptionSv: "Denna abstrakta oljemålning har dova jordfärger—gräddfärg, beige, ockra och varma bruna toner—med lösa, gestuella penseldrag som skapar en drömmande, eterisk effekt. Ljusare partier flyter över mitten medan varmare toner förankrar nedtill. Den övergripande stämningen är kontemplativ och naturalistisk, framkallar jord, dimma eller vatten med en vittrad, organisk kvalitet som förblir vackert tvetydig.",
			artPieceImg: "/2025/1.webp",
			primaryColor: "#B8860B",
			accentColor: "#CD853F",
			colors: ["#B8860B", "#CD853F", "#DEB887", "#D2691E", "#A0522D", "#8B4513", "#696969", "#556B2F", "#2F4F4F"]
		},
		{
			id: 2,
			artist: "Maria Ocampo",
			shortDescription: "This luminous landscape captures light and atmosphere through clear zones: moody blue-grey sky, misty middle ground with soft yellows and greens, and dark water with golden landforms. Using translucent layers and soft blending, Ocampo creates a visual symphony—the serene sky suggests quiet passages, the luminous middle builds toward crescendo, while dark water and golden forms provide grounding resolution with meditative stillness.",
			shortDescriptionSv: "Detta ljusa landskap fångar ljus och atmosfär genom tydliga zoner: stämningsfull blågrå himmel, dimmig mellangrund med mjuka gula och gröna toner, och mörkt vatten med gyllene landformer. Med translucenta lager och mjuk blandning skapar Ocampo en visuell symfoni—den fridfulla himlen antyder tysta passager, den lysande mitten bygger mot crescendo, medan mörkt vatten och gyllene former ger förankrad upplösning med meditativ stillhet.",
			artPieceImg: "/2025/2.webp",
			primaryColor: "#FFD700",
			accentColor: "#FF8C00",
			colors: ["#FFD700", "#FF8C00", "#FFA500", "#DAA520", "#B8860B", "#4682B4", "#708090", "#8B4513", "#2F4F4F"]
		},
		{
			id: 3,
			artist: "Maria Ocampo",
			shortDescription: "A luminous, expansive landscape with cool teal-blue sky and a bright, glowing center of yellows and creams suggesting breaking light. Warm earth tones anchor the foreground with visible, directional brushwork creating movement and energy. The cool-warm contrast evokes sunrise or sunset drama—a crescendo where luminous center and textured surface create both visual splendor and symphonic emotion.",
			shortDescriptionSv: "Ett lysande, vidsträckt landskap med sval turkosblå himmel och ett ljust, glödande centrum av gula och gräddfärger som antyder brytande ljus. Varma jordfärger förankrar förgrunden med synliga, riktade penseldrag som skapar rörelse och energi. Den svala-varma kontrasten framkallar soluppgångs- eller solnedgångsdrama—ett crescendo där det lysande centrumet och den texturerade ytan skapar både visuell prakt och symfonisk känsla.",
			artPieceImg: "/2025/4.webp",
			primaryColor: "#696969",
			accentColor: "#9370DB",
			colors: ["#696969", "#9370DB", "#708090", "#B0C4DE", "#D3D3D3", "#E6E6FA", "#F0E68C", "#4682B4", "#2F4F4F"]
		},
		{
			id: 4,
			artist: "Maria Ocampo",
			shortDescription: "Ocampo's most minimalist work, dominated by soft greys and pale creams suggesting misty landscape or foggy moorland. Horizontal brushstrokes create stillness, with subtle warm yellows below providing quiet warmth. The composition is understated and meditative—like a hushed musical note—demonstrating profound ability to evoke deep emotion through restraint and minimal color.",
			shortDescriptionSv: "Ocampos mest minimalistiska verk, dominerat av mjuka gråtoner och bleka gräddfärger som antyder dimlandskap eller dimmig hed. Horisontella penseldrag skapar stillhet, med subtila varma gula toner nedanför som ger tyst värme. Kompositionen är avskalad och meditativ—som en dämpad musikalisk ton—demonstrerar djup förmåga att framkalla stark känsla genom återhållsamhet och minimala färger.",
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