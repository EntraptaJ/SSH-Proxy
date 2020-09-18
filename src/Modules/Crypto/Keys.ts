// src/Modules/Crypto/Keys.ts
import { pki, ssh } from 'node-forge';

export const generateKeyPair = (): Promise<pki.rsa.KeyPair> =>
  new Promise((resolve, reject) =>
    pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) => {
      if (err) reject(err);

      resolve(keypair);
    }),
  );

export async function generateHostKeys(): Promise<string> {
  const { privateKey } = await generateKeyPair();

  return ssh.privateKeyToOpenSSH(privateKey);
}

/**
 * TODO: Add SSH Host Key to Database
 */
export async function getHostKeys(): Promise<string> {
  return generateHostKeys();
}
