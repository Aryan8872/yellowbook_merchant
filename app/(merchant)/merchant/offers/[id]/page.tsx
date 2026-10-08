import { apiClient } from "@/lib/api/client";
import OfferDetails from "./offerdetails";
import { notFound } from "next/navigation";
import { ApiError } from "next/dist/server/api-utils";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    let data;
    try {
        const res = await apiClient.get(`/api/v1/offers/${id}`);
        if (!res.data) notFound();
        data = res.data;
    } catch (e) {
        if (e instanceof ApiError && e.statusCode === 404) notFound();
        throw e;
    }

    return (
        <div>
            <OfferDetails offer={data} />
        </div>
    )
}