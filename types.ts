import React from 'react';

export type ScreenName =
  | 'home'
  | 'city'
  | 'market'
  | 'my_garage'
  | 'vehicle_detail'
  | 'add_vehicle'
  | 'insurance_hub'
  | 'insurance_detail'
  | 'insurance_purchase'
  | 'claim_report'
  | 'emergency_hub'
  | 'roadside_standard'
  | 'towing_service'
  | 'battery_jumpstart'
  | 'flat_tire_service'
  | 'fuel_delivery'
  | 'service_tracking'
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

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  color: string;
  image: string;
  insuranceStatus: 'Active' | 'Expired' | 'Pending';
  insuranceExpiry?: string;
  mileage: number;
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showMap?: boolean;
  icon?: 'success' | 'warning' | 'error' | 'info' | 'location';
}