export type ArtPiece = {
	id: number;
	artname: string;
	artist: string;
	shortDescription: string;
	artPieceImg: string;
	primaryColor: string;
	accentColor: string;
};

export type PageData = {
	artPieces: ArtPiece[];
};
