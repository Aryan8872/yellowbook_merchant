export type Category = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string;
  imageUrl: string;
}

export type Merchant = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  branches: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
  }>;
}

export type Offer={
    id:string;
    title:string;
    categoryId?:string;
    category?: Category;
    description:string;
    terms?:string;
    estimatedSavingsNpr?:number;
    originalPriceNpr?:number;
    discountPercentage?:number;
    coverImage?:string;
    images?:string[];
    highlights?:string[];
    rating?:number;
    reviewsCount?:number;
    isActive?:boolean;
    isFeatured?:boolean;
    availabilityJson?:string;
    validFrom?:string;
    validUntil?:string;
    viewCount?:number;
    redemptionCount?:number;
    trendingScore?:number;
    createdAt?:string;
    updatedAt?:string;
    merchantId?:string;
    merchantName?:string;
    merchant?: Merchant;
} 