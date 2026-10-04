export const BUSINESS_KEY='safar-business-v1';
export const DEMO_BUSINESS={name:'Noor’s farm · Demo',description:'A sample farm visit with coffee tasting and local stories.',meetingPoint:'Illustrative location only. Confirm a real meeting point with the operator.',latitude:33.69,longitude:73.05,demo:true};
export function validateBusiness(input){
 const latitude=Number(input.latitude),longitude=Number(input.longitude);
 if(!input.name?.trim())throw new Error('Please add a business name.');
 if(String(input.latitude).trim()===''||String(input.longitude).trim()===''||!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude< -90||latitude>90||longitude< -180||longitude>180)throw new Error('Enter valid coordinates: latitude −90 to 90, longitude −180 to 180.');
 return {name:input.name.trim().slice(0,100),description:input.description.trim().slice(0,500),meetingPoint:input.meetingPoint.trim().slice(0,500),latitude,longitude,demo:Boolean(input.demo)};
}
export function loadBusiness(){try{const data=localStorage.getItem(BUSINESS_KEY);return data?validateBusiness(JSON.parse(data)):{...DEMO_BUSINESS}}catch{return {...DEMO_BUSINESS}}}
export function mapLink(p){return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(p.latitude)}&mlon=${encodeURIComponent(p.longitude)}#map=15/${encodeURIComponent(p.latitude)}/${encodeURIComponent(p.longitude)}`}
