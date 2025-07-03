import keytar from 'keytar';
import { exportPublicKey, importPrivateKey, importSharedSecret } from './encryption';
import { store } from '../cache/cache';
const KEYTAR_SERVICE = 'e2eCLIchatapp'
const KEYTAR_ACCOUNT = 'user-identity'
const KEYTAR_USER_JWT = 'jwt';
const KEYTAR_SHARED_SECRET = 'jwt';


export async function protectKeys(keyPair : CryptoKeyPair , email : string){
    const {publicKey , privateKey} = keyPair;
    const storedPrivateKey = JSON.stringify(privateKey)

    await keytar.setPassword(KEYTAR_SERVICE , `${KEYTAR_ACCOUNT}${email}` , storedPrivateKey );
    console.log("private key has been stored for future refrences happy protected chatting ! ")

}

export async function useProtectedPrivateKey(email : string) : Promise<CryptoKey>{
    //need to enter a way here to make sure it is private key that is getting jsonified
    const privateKeyString = await keytar.getPassword(KEYTAR_SERVICE , `${KEYTAR_ACCOUNT}${email}`);
    const cooked = "sorry you're cooked"
    const unusablePrivateKey = JSON.parse(privateKeyString ? privateKeyString : cooked);
    const usablePrivateKey = await importPrivateKey(unusablePrivateKey);

    return usablePrivateKey;
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

export async function protectSharedSecret(sharedSecret : CryptoKey , recipientId : string) {
    const storedSharedSecret = JSON.stringify(sharedSecret)
    await keytar.setPassword(KEYTAR_SERVICE , `${KEYTAR_USER_JWT}${recipientId}` , storedSharedSecret);
}

export async function useSharedSecret(recipientId:string) : Promise<CryptoKey> {
    const sharedSecret = await keytar.getPassword(KEYTAR_SERVICE , `${KEYTAR_ACCOUNT}${recipientId}`);
    const cooked = "sorry you're cooked"
    const unusableSharedSecret = JSON.parse(sharedSecret ? sharedSecret : cooked);
    const usableSharedSecret = await importSharedSecret(unusableSharedSecret);

    return usableSharedSecret;
}
