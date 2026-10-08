import { apiClient } from "@/lib/api/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const accessToken = request.cookies.get('accessTokens')?.value;
    const offerId = (await context.params).id
    console.log("offerid in nextroutehandler", offerId)
    // if(!accessToken){
    //     return NextResponse.json({
    //         success:false,message:"Unauthorized"
    //     },{status:401})
    // }
    try {
        const data = await apiClient.get(`/api/v1/offers/${offerId}`);
        if (!data.success) {
            return NextResponse.json(
                { success: false, message: data.message || "Failed to fetch offer" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                success: true, data: data.data
            });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Internal server error",
            },
            { status: error?.status || 500 }
        );
    }
}