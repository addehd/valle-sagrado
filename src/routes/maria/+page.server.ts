import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async () => {
	const artPieces = [
		{
			id: 1,
			artist: "Maria Ocampo",
			shortDescription: "Abstract oil painting in warm browns, creams, and ochres. Loose brushwork gives it a soft, hazy quality—like looking at earth or water through mist.",
			shortDescriptionSv: "Abstrakt oljemålning i varma bruna toner, gräddfärg och ockra. Lösa penseldrag ger den en mjuk, disig känsla—som att titta på jord eller vatten genom dimma.",
			artPieceImg: "/2025/2.webp",
			primaryColor: "#B8860B",
			accentColor: "#CD853F",
			colors: ["#B8860B", "#CD853F", "#DEB887", "#D2691E", "#A0522D", "#8B4513", "#696969", "#556B2F", "#2F4F4F"]
		},
		{
			id: 2,
			artist: "Maria Ocampo",
			shortDescription: "A landscape split into layers: grey-blue sky, hazy yellow-green middle, and dark water with golden patches of land. Quiet and still, like early morning by a lake.",
			shortDescriptionSv: "Ett landskap delat i lager: gråblå himmel, disig gul-grön mitt, och mörkt vatten med gyllene fläckar av land. Lugnt och stilla, som tidig morgon vid en sjö.",
			artPieceImg: "/2025/1.webp",
			primaryColor: "#FFD700",
			accentColor: "#FF8C00",
			colors: ["#FFD700", "#FF8C00", "#FFA500", "#DAA520", "#B8860B", "#4682B4", "#708090", "#8B4513", "#2F4F4F"]
		},
		{
			id: 3,
			artist: "Maria Ocampo",
			shortDescription: "Wide landscape with a teal sky and a bright glow of yellows and creams at the center—like the sun breaking through. Warm earthy tones in the foreground, visible brushstrokes throughout.",
			shortDescriptionSv: "Vidsträckt landskap med turkos himmel och ett ljust sken av gult och gräddfärg i mitten—som solen som bryter igenom. Varma jordiga toner i förgrunden, synliga penseldrag genomgående.",
			artPieceImg: "/2025/4.webp",
			primaryColor: "#696969",
			accentColor: "#9370DB",
			colors: ["#696969", "#9370DB", "#708090", "#B0C4DE", "#D3D3D3", "#E6E6FA", "#F0E68C", "#4682B4", "#2F4F4F"]
		},
		{
			id: 4,
			artist: "Maria Ocampo",
			shortDescription: "The simplest of the four. Soft greys and pale creams with horizontal strokes—feels like fog over flat land. A hint of warm yellow keeps it from being cold.",
			shortDescriptionSv: "Den enklaste av de fyra. Mjuka gråtoner och bleka gräddfärger med horisontella drag—känns som dimma över platt land. En antydan av varmt gult håller den från att bli kall.",
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