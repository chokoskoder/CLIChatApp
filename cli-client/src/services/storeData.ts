//functions for : 
// 1. first check and then save the data
//2. share the data 

import { store } from "../cache/cache";
import { importPublicKey } from "./encryption";

export  function storePublicKey(recipientId:string , publicKey : string) {
    console.log(`checking if we are recieving the ${recipientId} and the ${publicKey}`);
    store.set(`publicKey.${recipientId}` , publicKey);
}

export async  function usePublicKey(recipientId:string) : Promise<CryptoKey> {
    console.log("we are here in line 1")
    const publicKey : string  = store.get(`publicKey.${recipientId}`)
    console.log("we are here in line 2")
    const parsedPublicKey = JSON.parse(publicKey);
    console.log("we are here in line 3")
    const importedPublicKey = await importPublicKey(parsedPublicKey);
    console.log("we are here in line 4")
    return importedPublicKey
}

