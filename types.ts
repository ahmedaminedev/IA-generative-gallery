export enum AppView {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  GALLERY = 'GALLERY',
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ProductConfig {
  name: string;
  theme: string;
  description: string;
  elements: string;
}

export interface GeneratedResult {
  id: string;
  imageUrl: string;
  prompt: string;
  date: Date;
}