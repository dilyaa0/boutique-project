export interface WeatherInfo {
  city: string;
  cityNameKz: string;
  temp: number;
  condition: string;
  windspeed: number;
  success: boolean;
}

export interface OutfitItem {
  category: string; // 'Top' | 'Bottom' | 'Outerwear' | 'Shoes' | 'Accessories'
  name: string;
  color: string; // Hex color
  colorName: string;
  brandName: string;
  brandLink: string;
  priceKzt: number;
}

export interface CapsuleLook {
  title: string;
  styleName: string;
  itemsUsed: string[];
  comment: string;
  imagePrompt: string;
}

export interface StyleResponse {
  styledDescription: string;
  weatherAdvice: string;
  outfitItems: OutfitItem[];
  capsule5Looks: CapsuleLook[];
}

export interface UserParams {
  height: number;
  weight: number;
  gender: 'male' | 'female' | 'unisex';
  bodyType: 'slim' | 'average' | 'athletic' | 'plus';
  colorType: 'spring' | 'summer' | 'autumn' | 'winter';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  destination: string;
  city: string;
  customWeather: boolean;
  manualTemp: number;
  manualCondition: string;
  capsuleItems: string[];
}
