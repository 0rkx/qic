import React from 'react';

export type ScreenName = 
  | 'home'
  | 'city'
  | 'market'
  | 'insurance_hub'
  | 'insurance_detail'
  | 'emergency_hub'
  | 'roadside_standard'
  | 'ev_assistance'
  | 'charging_navigator'
  | 'ev_towing'
  | 'mobile_charging'
  | 'success_confirmation'
  | 'feature_placeholder';

export type TabName = 'main' | 'cars' | 'emergency' | 'insurance' | 'city';

export interface ServiceCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  image?: string;
  badge?: string;
  coins?: number;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface NavigationState {
  screen: ScreenName;
  params?: any;
}

export interface Charger {
  id: string;
  name: string;
  address: string;
  speed: 'Fast' | 'Slow';
  kw: number;
  status: 'Available' | 'Busy' | 'Offline';
  distance: string;
  lat: number;
  lng: number;
}