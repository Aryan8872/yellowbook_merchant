export interface CreateMerchantDTO{
    name:string;
    address:string;
    city:string;
    lat:number;
    lng:number;
    phone:string;
} 

export interface CreateMerchantStaff{
    name:string;
    email:string;
    role:'MERCHANT_STAFF | MERCHANT_ADMIN'
}