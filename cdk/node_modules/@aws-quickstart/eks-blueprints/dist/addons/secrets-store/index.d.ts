import { Construct } from "constructs";
import { ClusterAddOn, ClusterInfo } from '../../spi';
import { HelmAddOnUserProps } from '../helm-addon';
/**
 * Configuration options for Secrets Store AddOn
 */
export interface SecretsStoreAddOnProps extends HelmAddOnUserProps {
    /**
     * Namespace where Secrets Store CSI driver will be installed
     * @default 'kube-system'
     */
    readonly namespace?: string;
    /**
     * Version of the Secrets Store CSI Driver. Eg. v0.0.23
     * @default 'v0.0.23/'
     */
    readonly version?: string;
    /**
     * Rotation Poll Interval, e.g. '120s'.
     * @default undefined
     * If provided, sets auto rotation to true and sets the polling interval.
     */
    readonly rotationPollInterval?: string;
    /**
     * Enable Sync Secrets to kubernetes secrets
     */
    readonly syncSecrets?: boolean;
    /**
     * ASCP secret and configuration provider URL for provisioning.
     */
    readonly ascpUrl?: string;
}
export declare class SecretsStoreAddOn implements ClusterAddOn {
    private options;
    constructor(props?: SecretsStoreAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
