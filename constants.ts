import { ChartBarIcon, SparklesIcon, PhotoIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', id: 'DASHBOARD', icon: ChartBarIcon },
  { name: 'AI Studio', id: 'GENERATOR', icon: SparklesIcon },
  { name: 'Gallery', id: 'GALLERY', icon: PhotoIcon },
  { name: 'Settings', id: 'SETTINGS', icon: Cog6ToothIcon },
];

export const THEME_PRESETS = [
  { id: 'floral', name: 'Floral Elegance', desc: 'Soft petals, roses, nature', prompt: 'surrounded by lush pink roses and soft petals, romantic atmosphere' },
  { id: 'minimal', name: 'Ultra Minimalist', desc: 'Clean lines, podiums, shadows', prompt: 'on a clean geometric podium, hard shadows, studio lighting, minimal aesthetic' },
  { id: 'luxury', name: 'Dark Luxury', desc: 'Gold, silk, moody lighting', prompt: 'on black silk texture with gold accents, dramatic moody lighting, luxury perfume ad' },
  { id: 'fresh', name: 'Aqua Fresh', desc: 'Water splashes, droplets, blue', prompt: 'surrounded by dynamic water splashes and droplets, fresh blue tones, high speed photography' },
  { id: 'botanical', name: 'Green Botanical', desc: 'Leaves, forest, organic', prompt: 'in a lush green rainforest setting with monstera leaves, dappled sunlight, organic vibe' },
];

export const PLACEHOLDER_IMAGE = "https://picsum.photos/400/400";