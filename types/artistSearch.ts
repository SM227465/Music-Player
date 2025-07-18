interface Image {
  quality: string;
  url: string;
}
export interface ArtistResult {
  id: string;
  name: string;
  role: string;
  image: Image[];
  type: string;
  url: string;
}
interface ArtistSearchData {
  total: number;
  start: number;
  results: ArtistResult[];
}
export interface ArtistSearchResponse {
  success: boolean;
  data: ArtistSearchData;
}
