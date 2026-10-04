export async function validModelResponse(response,file){
 if(!response?.ok)return false;
 if((response.headers.get('content-type')||'').includes('text/html'))return false;
 if(file.endsWith('.json')){
   try{const data=await response.clone().json();return !!data&&typeof data==='object'&&!Array.isArray(data)}catch{return false}
 }
 return true;
}
