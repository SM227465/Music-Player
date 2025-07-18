export interface GlobalResultsResponse {
  success: boolean;
  data: GlobalResultsData;
}

export interface GlobalResultsData {
  topQuery: SearchCategory<ResultBase>;
  songs: SearchCategory<SongResult>;
  albums: SearchCategory<AlbumResult>;
  artists: SearchCategory<ArtistResult>;
  playlists: SearchCategory<PlaylistResult>;
}

interface SearchCategory<T> {
  results: T[];
  position: number;
}

interface Image {
  quality: string;
  url: string;
}

interface ResultBase {
  id: string;
  title: string;
  image: Image[];
  url?: string;
  type: string;
  description?: string;
}

// Specific result types

export interface SongResult extends ResultBase {
  album: string;
  primaryArtists: string;
  singers: string;
  language: string;
}

export interface AlbumResult extends ResultBase {
  artist: string;
  year: string;
  songIds: string;
  language: string;
}

export interface ArtistResult extends ResultBase {
  position: number;
}

interface PlaylistResult extends ResultBase {
  language: string;
}
