import { CsiSecretProps } from "..";
/**
 * Creates CsiSecretProps that contains secret template for ssh/username/pwd credentials.
 * In each case, the secret is expected to be a JSON structure containing url and either sshPrivateKey
 * or username and password attributes.
 * @param credentialsType SSH | USERNAME | TOKEN
 * @param secretName
 * @returns
 */
export declare function createSecretRef(credentialsType: string, secretName: string): CsiSecretProps;
/**
 * Local function to create a secret reference for SSH key.
 * @param url
 * @param secretName
 * @returns
 */
export declare function createSshSecretRef(secretName: string): CsiSecretProps;
/**
 * Local function to a secret reference for username/pwd or username/token key.
 * @param url
 * @param secretName
 * @returns
 */
export declare function createUserNameSecretRef(secretName: string): CsiSecretProps;
