import { Offer } from "@/lib/types/offer"
import { DataTable } from "./data-table"
import { columns } from "./column"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfferTable({offerData}:{offerData:Offer[]}){
    return(
        <div>
            <Card className="px-3 py-6">
                <CardHeader>
                    <CardTitle>Most Redeemed Offers</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={offerData}/>
                </CardContent>
            </Card>
        </div>
    )
}