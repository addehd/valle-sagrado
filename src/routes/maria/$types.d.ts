export type ArtPiece = {
	id: number;
	artname?: string;
	artist: string;
	shortDescription: string;
	shortDescriptionSv?: string;
	alt: string;
	artPieceImg: string;
	primaryColor: string;
	accentColor: string;
};

export type PageData = {
	artPieces: ArtPiece[];
};
