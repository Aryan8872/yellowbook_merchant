import { apiClient } from "@/lib/api/client";
import { Offer } from "@/lib/types/offer";
import { NextRequest, NextResponse } from "next/server";

interface OfferPaginatedResponse {
    offers: Offer[];
    count: number;
    total: number;
}
export async function GET(nextRequest: NextRequest) {
    const accessToken = nextRequest.cookies.get('accessToken')?.value;
    console.log("accesstoken", accessToken)
    // if(!accessToken){
    //     return NextResponse.json({
    //         success:false,message:"Unauthorized"
    //     },{status:401})
    // }
    try {
        const { searchParams } = new URL(nextRequest.url)

        // Build params object: forward every non-empty query param the client sent.
        // This avoids silently dropping new params (sortBy, city, location, merchantId…).
        const params: Record<string, string | number> = {}
        searchParams.forEach((value, key) => {
            if (value !== "" && value !== null) {
                params[key] = value
            }
        })
        // Apply server-side defaults if the client omitted them
        if (!params.page)  params.page  = 1
        if (!params.limit) params.limit = 10

        const data = await apiClient.get("/api/v1/offers", { params })

        if (!data.success) {
            return NextResponse.json(
                { success: false, message: data.message || "Failed to fetch offers" },
                { status: 400 }
            );
        }
        return NextResponse.json({
            success: true,
            data: data.data as OfferPaginatedResponse,
        });
    } catch (e: any) {
        return NextResponse.json(
            {
                success: false,
                message: e?.message || "Internal server error",
            },
            { status: e?.status || 500 }
        )
    }
}