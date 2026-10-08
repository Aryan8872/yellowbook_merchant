"use client";

import Image from "next/image";
import { Offer } from "@/lib/types/offer";
import CustomSpinner from "@/components/merchant/custom-spinner";

export default function OfferDetails({ offer }: { offer: Offer }) {
  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      
      {/* 🔥 Hero Section */}
      <div className="relative w-full h-[300px] rounded-xl overflow-hidden">
        {/* <Image
          src={offer.imageUrl}
          alt={offer.title}
          fill
          className="object-cover"
        /> */}

        {/* Discount badge */}
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
          {offer.discountPercentage}% OFF
        </div>
      </div>

      {/* 🧾 Title + Merchant */}
      <div>
        <h1 className="text-2xl font-bold">{offer.title}</h1>
      </div>

      {/* ⭐ Rating */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">⭐ {offer.rating}</span>
        <span className="text-muted-foreground">
          ({offer.reviewsCount} reviews)
        </span>
      </div>

      {/* 💰 Pricing */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-green-600">
          Rs. {offer.discountedPriceNpr}
        </span>
        <span className="line-through text-muted-foreground">
          Rs. {offer.originalPriceNpr}
        </span>
        <span className="text-sm text-green-600">
          Save Rs. {offer.estimatedSavingsNpr}
        </span>
      </div>

      {/* 📄 Description */}
      <div>
        <h2 className="font-semibold mb-1">Description</h2>
        <p className="text-muted-foreground">{offer.description}</p>
      </div>

      {/* 🔥 Highlights */}
      <div>
        <h2 className="font-semibold mb-2">Highlights</h2>
        <ul className="list-disc pl-5 space-y-1">
          {offer.highlights?.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>

      {/* 🏪 Merchant */}
      {/* <div className="border rounded-lg p-4 flex items-center gap-4">
        <img
          src={offer.merchant?.logoUrl}
          alt="merchant"
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold">{offer.merchant?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {offer.merchant?.description}
          </p>
        </div>
      </div> */}

      {/* 📅 Validity */}
      {offer.validFrom && offer.validUntil && (
        <div className="text-sm text-muted-foreground">
          Valid:{" "}
          {new Date(offer.validFrom).toLocaleDateString()} -{" "}
          {new Date(offer.validUntil).toLocaleDateString()}
        </div>
      )}

      {/* 📜 Terms */}
      <div>
        <h2 className="font-semibold mb-1">Terms & Conditions</h2>
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {offer.terms}
        </p>
      </div>

      {/* 🔘 CTA */}
      <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90">
        Redeem Offer
      </button>
    </div>
  );
}