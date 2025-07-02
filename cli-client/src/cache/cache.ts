// functions to store all the cache , store the JWT , public key , shared secret 
import Conf from 'conf';
import type { JsonWebKey } from 'crypto';

type AppData = {
    publicKey: JsonWebKey;
};

export const store = new Conf<AppData>({
    projectName: 'my-secure-cli',

    defaults: {
        publicKey: {}
    }
});
