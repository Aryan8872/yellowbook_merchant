import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
export interface StatCardProps{
    title:string;
    subtitle?:string;
    statData:number;
    change?:number;
}
export default function StatCard({statData}:{statData:StatCardProps[]}){
    return(
       statData.map((data,index)=>(
         <Card key={index}>
            <CardHeader>
                <CardTitle>
                     {data.title}
                </CardTitle>
                {data.subtitle ? (
                    <CardDescription>
                        {data.subtitle}
                    </CardDescription>
                ) : null}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data.statData}</div>
            </CardContent>
        </Card>
       ))
    )
}