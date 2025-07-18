// types/music.ts
export interface Song {
  id: string;
  name: string;
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
  album: {
    id: string;
    name: string;
    url: string;
  };
  duration: number;
  playCount: number;
  image: Image[];
  downloadUrl: DownloadUrl[];
  hasLyrics: boolean;
  lyricsId?: string;
  url: string;
  copyright: string;
  year: number;
  releaseDate: string;
  label: string;
  explicitContent: boolean;
  language: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  image: Image[];
  type: string;
  url: string;
}

export interface Album {
  id: string;
  name: string;
  description: string;
  year: number;
  type: string;
  playCount: number;
  language: string;
  explicitContent: boolean;
  songCount: number;
  url: string;
  image: Image[];
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
  songs: Song[];
}

export interface Image {
  quality: string;
  url: string;
}

export interface DownloadUrl {
  quality: string;
  url: string;
}

export interface SearchResult {
  topQuery: {
    results: Song[];
    position: number;
  };
  songs: {
    results: Song[];
    position: number;
  };
  albums: {
    results: Album[];
    position: number;
  };
  artists: {
    results: Artist[];
    position: number;
  };
  playlists: {
    results: Playlist[];
    position: number;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  type: string;
  year: number;
  playCount: number;
  language: string;
  explicitContent: boolean;
  songCount: number;
  url: string;
  image: Image[];
  songs: Song[];
}
