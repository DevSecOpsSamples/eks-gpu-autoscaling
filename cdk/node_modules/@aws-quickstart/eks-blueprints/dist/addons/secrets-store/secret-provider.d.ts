import { ClusterInfo } from '../../spi';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { IStringParameter } from 'aws-cdk-lib/aws-ssm';
import { IKey } from 'aws-cdk-lib/aws-kms';
/**
 * Secret Provider Interface
 * You can provide() your own Secrets
 */
export interface SecretProvider {
    provide(clusterInfo?: ClusterInfo): ISecret | IStringParameter;
}
/**
 * Generate a new Secret on Secrets Manager
 */
export declare class GenerateSecretManagerProvider implements SecretProvider {
    private id;
    private secretName;
    constructor(id: string, secretName: string);
    provide(clusterInfo: ClusterInfo): ISecret;
}
/**
 * Lookup Secret in SecretsManager by Name
 */
export declare class LookupSecretsManagerSecretByName implements SecretProvider {
    private secretName;
    private id?;
    /**
     * @param secretName
     * @param id
     */
    constructor(secretName: string, id?: string | undefined);
    provide(clusterInfo: ClusterInfo): ISecret;
}
/**
 * Lookup Secret in SecretsManager by Arn
 */
export declare class LookupSecretsManagerSecretByArn implements SecretProvider {
    private secretArn;
    private id?;
    /**
     * @param secretArn
     * @param id
     */
    constructor(secretArn: string, id?: string | undefined);
    provide(clusterInfo: ClusterInfo): ISecret;
}
/**
 * Lookup SSM Parameter Store Secret by Name
 */
export declare class LookupSsmSecretByAttrs implements SecretProvider {
    private secretName;
    private version;
    private encryptionKey?;
    private simpleName?;
    private id?;
    /**
     * @param secretName
     * @param version
     * @param encryptionKey
     * @param simpleName
     * @param id
     */
    constructor(secretName: string, version: number, encryptionKey?: IKey | undefined, simpleName?: boolean | undefined, id?: string | undefined);
    /**
     * Lookup the secret string parameter
     * @param clusterInfo
     * @returns
     */
    provide(clusterInfo: ClusterInfo): IStringParameter;
}
