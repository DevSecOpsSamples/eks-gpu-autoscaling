import { ClusterInfo } from '../../spi';
import { HelmAddOn, HelmAddOnUserProps } from '../helm-addon';
/**
 * Supported Modes
 */
export declare enum Mode {
    /**
     * IMDS Mode
     */
    IMDS = 0,
    /**
     * Queue Mode
     */
    QUEUE = 1
}
/**
 * Configuration for the add-on
 */
export interface AwsNodeTerminationHandlerProps extends HelmAddOnUserProps {
    /**
     * Supported Modes are Mode.IMDS and Mode.QUEUE
     * @default Mode.IMDS
     */
    mode?: Mode;
}
export declare class AwsNodeTerminationHandlerAddOn extends HelmAddOn {
    private options;
    constructor(props?: AwsNodeTerminationHandlerProps);
    /**
     * Implementation of the deploy interface
     * @param clusterInfo
     */
    deploy(clusterInfo: ClusterInfo): void;
    /**
     * Configures IMDS Mode
     * @param serviceAccount
     * @returns Helm values
     */
    private configureImdsMode;
    /**
     * Configures Queue Mode
     * @param cluster
     * @param serviceAccount
     * @param asgCapacity
     * @returns Helm values
     */
    private configureQueueMode;
    /**
     * Create EventBridge rules with target as SQS queue
     * @param scope
     * @param queue
     */
    private createEvents;
}
