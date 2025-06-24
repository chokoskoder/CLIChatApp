import { str2ab , ab2str } from "../utils/utils";

import { getRandomValues, webcrypto } from "crypto";

export async function generateIdentityKeyPair() : Promise<CryptoKeyPair>{
    console.log("generating long-term identity key pair....");

    const keyPair = await webcrypto.subtle.generateKey(
        {
            name : 'ECDH',
            namedCurve : "P-256",
        },
        true, // the key is extractable so we can save it 
        ["deriveKey"]  // we will use these keys to derive shared secrets which are then used to create e2e encryption and start chats
    );
    console.log("Identity key pair generated.");
    return keyPair;
}

export async function importPublicKey(key : JsonWebKey) : Promise<CryptoKey> {
    const privateKey = await webcrypto.subtle.importKey(
        "jwk",
        key , 
        {name : "ECDH" ,  namedCurve : "P-256"},
        true , 
        ["deriveKey"]
    )
    return privateKey;
}


export async function exportPublicKey(key : CryptoKey) : Promise<JsonWebKey>{
    const exportedKey = await webcrypto.subtle.exportKey("jwk" , key);
    return exportedKey
}

/**
 * exports a cryptokey  , specifically here the public key , in a shareable format JSON 
 * this is sent to the server to store in the DB and shared whenever we want to create the shared secret which 
 * we will generate using AES-GCM , will create a function for it 
 * @param {CryptoKey} the public key we will be sharing 
 * @returns {promise<JsonWebKey>} just as talked above nothing new
 */

export async function deriveSharedSecret(myPrivateKey : CryptoKey , theirPublicKey : CryptoKey) : Promise<CryptoKey> {
    console.log("creating a shared secret so that you can your homie chat...");
    const sharedSecret = await webcrypto.subtle.deriveKey(
        {
            name : "ECDH",  
            //namedCurve : "P-256",                //this explains which algo we used to  create the key pair 
            public : theirPublicKey,
        },
        myPrivateKey,
        {
            name : "AES-GCM",               //this is used to create a symmetrical key , unlike the one created by ECDH
                                            //this is in itself a huge topic to go into 
            length : 256,
        },
        true,
        ["encrypt" , "decrypt"]
    );
    console.log("shared key derived successfully you can chat now !");
    return sharedSecret;
}

export async function encryptMessage(plaintext : string , sharedSecret : CryptoKey) : Promise<{ciphertext : ArrayBuffer , iv : Uint8Array}>{
    const iv = await getRandomValues(new Uint8Array(12));

    const ciphertext = await webcrypto.subtle.encrypt(
        {
            name : "AES-GCM",
            iv : iv,
        },
        sharedSecret,
        str2ab(plaintext)
    );

    return { ciphertext , iv};
}


export async function decryptMessage(ciphertext : ArrayBuffer ,  iv : Uint8Array ,  sharedSecret : CryptoKey ) : Promise<string> {
    const decryptBuffer = await webcrypto.subtle.decrypt(
        {
            name : "AES-GCM",
            iv : iv,
        },
        sharedSecret,
        ciphertext
    );

    return ab2str(decryptBuffer);
}