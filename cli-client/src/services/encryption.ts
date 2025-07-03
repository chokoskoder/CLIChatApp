import { copyFileSync } from "fs";
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

export async function importPublicKey(key: JsonWebKey): Promise<CryptoKey> {
    try {
        // The key being imported is a public key
        const publicKey = await webcrypto.subtle.importKey(
            "jwk",
            key,
            { name: "ECDH", namedCurve: "P-256" },
            true,
            [] 
        );
        return publicKey;
    } catch (error) {
        console.error("🔴 Failed to import public key:", error);
        
        throw new Error("Could not import the provided public key.");
    }
}

export async function exportPublicKey(key : CryptoKey) : Promise<JsonWebKey>{
    const exportedKey = await webcrypto.subtle.exportKey("jwk" , key);
    return exportedKey
}

export async function importPrivateKey(key: JsonWebKey): Promise<CryptoKey> {
    try {
        // Log the key to check its structure
        console.log("importPrivateKey - Key to import:", key);

        const privateKey = await webcrypto.subtle.importKey(
            "jwk",               // Key format (expecting JWK)
            key,                 // The JWK to import
            { name: "ECDH", namedCurve: "P-256" }, // Algorithm
            true,                // extractable
            ["deriveKey"]        // Usage: "deriveKey" is used to generate shared secrets
        );
        return privateKey;
    } catch (e) {
        // Log the error to capture more details
        console.error("Error during key import:", e);
        throw new Error("showin just above");
    }
}


/**
 * exports a cryptokey  , specifically here the public key , in a shareable format JSON 
 * this is sent to the server to store in the DB and shared whenever we want to create the shared secret which 
 * we will generate using AES-GCM , will create a function for it 
 * @param {CryptoKey} the public key we will be sharing 
 * @returns {promise<JsonWebKey>} just as talked above nothing new
 */

export async function deriveSharedSecret(myPrivateKey: CryptoKey, theirPublicKey: CryptoKey): Promise<CryptoKey> {
    console.log("Creating a shared secret so that you and your homie can chat...");

    // Log the types of the keys for debugging
    console.log("My Private Key Type:", myPrivateKey.type); // should be 'private'
    console.log("Their Public Key Type:", theirPublicKey.type); // should be 'public'

    try {
        // Derive shared secret using ECDH
        const sharedSecret = await webcrypto.subtle.deriveKey(
            {
                name: "ECDH",  
                public: theirPublicKey,  // Their public key
            },
            myPrivateKey,  // My private key
            {
                name: "AES-GCM",  // Algorithm for the derived key (AES for encryption)
                length: 256,  // AES key length
            },
            true,  // extractable (so we can use it later)
            ["encrypt", "decrypt"]  // Key usages
        );

        console.log("Shared key derived successfully! You can chat now!");
        console.log("Shared Secret (AES Key):", sharedSecret);  // Log the derived shared secret
        return sharedSecret;
    } catch (error) {
        console.error("Error deriving shared secret:", error);
        throw error;
    }
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

export async function importSharedSecret(sharedSecret: CryptoKey): Promise<CryptoKey> {
    try {
        // Export the shared secret to JWK format
        const exportedSharedSecret = await webcrypto.subtle.exportKey("jwk", sharedSecret);

        // Log the exported shared secret to verify the "kty" field
        console.log("Exported Shared Secret:", exportedSharedSecret);

        // Now import it back with the correct kty for AES (symmetric key)
        const importedSecret = await webcrypto.subtle.importKey(
            "jwk",
            exportedSharedSecret,
            { name: "AES-GCM", length: 256 },  // AES with 256-bit key
            true,  // extractable (so you can use it later)
            ["encrypt", "decrypt"]  // Usages for symmetric encryption
        );

        return importedSecret;
    } catch (error) {
        console.error("Error importing shared secret:", error);
        throw new Error("Failed to use shared secret.");
    }
}
