/**
 * Gets secret value from AWS Secret Manager. Requires access rights to the secret, specified by the secretName parameter.
 * @param secretName name of the secret to retrieve
 * @param region
 * @returns
*/
export declare function getSecretValue(secretName: string, region: string): Promise<string>;
/**
 * Throws an error if secret is undefined in the target region.
 * @returns ARN of the secret if exists.
 */
export declare function validateSecret(secretName: string, region: string): Promise<string>;
