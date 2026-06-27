export interface Destination {
  id: string;
  name: string;
  nepaliName: string;
  category: string;
  subcategory: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  visitDuration: number;
  entranceFee: number;
  openingHours: string;
  bestTime: string;
  culturalTips: string[];
  nearestBusStop: string;
  busRoutes: string[];
  gradientColors: [string, string];
  tags: string[];
  rating: number;
  distanceFromCenter: number;
}

export interface BusRoute {
  id: string;
  number: string;
  name: string;
  from: string;
  to: string;
  stops: string[];
  fare: number;
  frequency: number;
  operatingHours: string;
  color: string;
  duration: number;
}

export type ReportType = "crowd" | "delay" | "tip" | "alert";

export interface CommunityReport {
  id: string;
  type: ReportType;
  routeId?: string;
  stopName?: string;
  message: string;
  timestamp: number;
  upvotes: number;
  author: string;
  userUpvoted?: boolean;
}

export type StepType = "walk" | "bus" | "visit" | "eat";

export interface JourneyStepData {
  type: StepType;
  title: string;
  description: string;
  duration: number;
  cost: number;
}

export interface Itinerary {
  id: string;
  title: string;
  totalTime: number;
  totalCost: number;
  destinationCount: number;
  steps: JourneyStepData[];
  savedAt: number;
  query: string;
}
