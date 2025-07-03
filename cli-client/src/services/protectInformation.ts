import keytar from 'keytar';
import { exportPublicKey, importPrivateKey, importSharedSecret } from './encryption';
import { store } from '../cache/cache';
const KEYTAR_SERVICE = 'e2eCLIchatapp'
const KEYTAR_ACCOUNT = 'user-identity'
const KEYTAR_USER_JWT = 'jwt';
const KEYTAR_SHARED_SECRET = 'shared_secret';
import { getRandomValues, webcrypto } from "crypto";

export async function protectKeys(keyPair: CryptoKeyPair, email: string) {
    const { publicKey, privateKey } = keyPair;
    const exportedPrivateKey = await webcrypto.subtle.exportKey("jwk", privateKey);
    
    // Log the exported private key to check its structure
    console.log("exportedPrivateKey:", exportedPrivateKey);

    const storedPrivateKey = JSON.stringify(exportedPrivateKey);
    await keytar.setPassword(KEYTAR_SERVICE, `${KEYTAR_ACCOUNT}${email}`, storedPrivateKey);
    console.log("Private key has been stored for future reference, happy protected chatting!");
}


export async function useProtectedPrivateKey(email: string): Promise<CryptoKey> {
    try {
        // Retrieve the private key JSON string from keytar
        const privateKeyString = await keytar.getPassword(KEYTAR_SERVICE, `${KEYTAR_ACCOUNT}${email}`);

        // If the key is not found, throw a specific error
        if (!privateKeyString) {
            throw new Error("No private key found for this email.");
        }

        // Log the retrieved private key string
        console.log("privateKeyString retrieved from keytar:", privateKeyString);

        let privateKeyJson;
        try {
            privateKeyJson = JSON.parse(privateKeyString);
        } catch (parseError) {
            // This catches specific JSON parsing errors
            throw new Error("Failed to parse stored private key string.");
        }

        // Import the private key from the JWK format
        const usablePrivateKey = await importPrivateKey(privateKeyJson);
        return usablePrivateKey;

    } catch (error) {
        // This is the main catch block for the entire operation
        console.error("🔴 An error occurred in useProtectedPrivateKey:", error);

        // Re-throw the error to let the calling function handle the failure
        throw error;
    }
}


export async function protectJWTSignInKey(jwtPasskey : string) {
    //store and save the json web token
    await keytar.setPassword(KEYTAR_SERVICE , `${KEYTAR_USER_JWT}jwt` , jwtPasskey);
}

export async function useJWTSignInKey() : Promise<string> {
    const jwt = await keytar.getPassword(KEYTAR_SERVICE , `${KEYTAR_USER_JWT}jwt`);
    const cooked = "homie your jwt is not saved yet try again "
    return jwt ? jwt : cooked ;
}

export async function protectSharedSecret(sharedSecret: CryptoKey, recipientId: string) {
    try {
        // Export the shared secret to JWK format
        const exportedSharedSecret = await webcrypto.subtle.exportKey("jwk", sharedSecret);

        // Log the exported shared secret to verify the structure
        console.log("Exported Shared Secret JWK:", exportedSharedSecret);

        // Ensure the exported key is for an AES key (should have 'kty' === "oct")
        if (exportedSharedSecret.kty !== "oct") {
            throw new Error("The shared secret is not an AES key (kty should be 'oct').");
        }

        const storedSharedSecret = JSON.stringify(exportedSharedSecret);

        // Store the serialized shared secret in keytar
        await keytar.setPassword(KEYTAR_SERVICE, `${KEYTAR_SHARED_SECRET}${recipientId}`, storedSharedSecret);
        console.log(`Shared secret has been protected and stored for recipient ${recipientId}.`);
    } catch (error) {
        console.error("Error storing shared secret:", error);
        throw new Error("Failed to protect shared secret.");
    }
}



export async function useSharedSecret(recipientId: string): Promise<CryptoKey> {
    try {
        // Retrieve the serialized shared secret from Keytar
        const sharedSecretString = await keytar.getPassword(KEYTAR_SERVICE, `${KEYTAR_SHARED_SECRET}${recipientId}`);

        // If no shared secret is found, throw an error
        if (!sharedSecretString) {
            throw new Error(`No shared secret found for recipient ${recipientId}.`);
        }

        let sharedSecretJson;
        try {
            sharedSecretJson = JSON.parse(sharedSecretString); // Parse the JSON string to get JWK
        } catch (error) {
            throw new Error("Failed to parse the shared secret JSON.");
        }

        // Log the parsed JWK to verify its structure
        console.log("Parsed Shared Secret JWK:", sharedSecretJson);

        // Ensure that the retrieved JWK is for an AES key (kty: "oct")
        if (sharedSecretJson.kty !== "oct") {
            throw new Error("The retrieved shared secret is not a valid AES key (kty should be 'oct').");
        }

        // Import the shared secret back into a CryptoKey (AES key)
        const usableSharedSecret = await webcrypto.subtle.importKey(
            "jwk",
            sharedSecretJson,
            { name: "AES-GCM", length: 256 },  // AES with 256-bit key
            true,  // extractable (so you can use it later)
            ["encrypt", "decrypt"]  // Usages for symmetric encryption
        );
        console.log(`Shared secret successfully retrieved for recipient ${recipientId}.`);
        
        return usableSharedSecret;
    } catch (error) {
        console.error("Error using shared secret:", error);
        throw new Error("Failed to use shared secret.");
    }
}

