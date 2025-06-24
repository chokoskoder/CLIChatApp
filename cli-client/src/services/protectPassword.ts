import keytar from 'keytar';
import { exportPublicKey, importPublicKey } from './encryption';
const KEYTAR_SERVICE = 'e2eCLIchatapp'
const KEYTAR_ACCOUNT = 'user-identity'


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
    const usablePrivateKey = await importPublicKey(unusablePrivateKey);

    return usablePrivateKey;



}