// types/artistDetails.ts

export interface Image {
  quality: string;
  url: string;
}

export interface Bio {
  text: string;
  title: string;
  sequence: number;
}

export interface DownloadUrl {
  quality: string;
  url: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  image: Image[];
  type: string;
  url: string;
}

export interface Artists {
  primary: Artist[];
  featured: Artist[];
  all: Artist[];
}

export interface Album {
  id: string;
  name: string;
  url: string;
}

export interface TopSong {
  id: string;
  name: string;
  type: string;
  year: string;
  releaseDate: string | null;
  duration: number;
  label: string;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string;
  album: Album;
  artists: Artists;
  image: Image[];
  downloadUrl: DownloadUrl[];
}

export interface ArtistDetail {
  id: string;
  name: string;
  url: string;
  type: string;
  followerCount: number;
  fanCount: string;
  isVerified: boolean;
  dominantLanguage: string;
  dominantType: string;
  bio: Bio[];
  dob: string;
  fb: string | null;
  twitter: string | null;
  wiki: string;
  availableLanguages: string[];
  isRadioPresent: boolean;
  image: Image[];
  topSongs: TopSong[];
}

export interface ArtistDetailResponse {
  success: boolean;
  data: ArtistDetail;
}
