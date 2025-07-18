interface Image {
  quality: string;
  url: string;
}
interface Artist {
  id: string;
  name: string;
  role: string;
  image: Image[];
  type: string;
  url: string;
}
interface ArtistsGroup {
  primary: Artist[];
  featured: Artist[];
  all: Artist[];
}
export interface AlbumResult {
  id: string;
  name: string;
  description: string;
  url: string;
  year: number;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  artists: ArtistsGroup;
  image: Image[];
}
interface AlbumSearchData {
  total: number;
  start: number;
  results: AlbumResult[];
}
export interface AlbumSearchResponse {
  success: boolean;
  data: AlbumSearchData;
}
