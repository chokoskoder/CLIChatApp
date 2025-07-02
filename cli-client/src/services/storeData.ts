//functions for : 
// 1. first check and then save the data
//2. share the data 

import { store } from "../cache/cache";
import { importPublicKey } from "./encryption";

export  function storePublicKey(recipientId:string , publicKey : string) {
    store.set(`publicKey.${recipientId}` , publicKey);
}

export async  function usePublicKey(recipientId:string) : Promise<CryptoKey> {
    const publicKey : string  = store.get(`publicKey.${recipientId}`)
    const parsedPublicKey = JSON.parse(publicKey);
    const importedPublicKey = await importPublicKey(parsedPublicKey);
    return importedPublicKey
}

