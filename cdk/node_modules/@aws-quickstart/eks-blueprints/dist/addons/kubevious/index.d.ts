import { Construct } from "constructs";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
import { ClusterInfo } from "../../spi";
/**
 * User provided options for the Helm Chart
 */
export interface KubeviousAddOnProps extends HelmAddOnUserProps {
    /**
     * Version of the helm chart to deploy
     */
    version?: string;
    /**
     * Create an ingress for access to Kubevious
     */
    ingressEnabled?: boolean;
    /**
     * Type of service to expose Kubevious UI
     */
    kubeviousServiceType?: string;
}
/**
 * Main class to instantiate the Helm chart
 */
export declare class KubeviousAddOn extends HelmAddOn {
    readonly options: KubeviousAddOnProps;
    constructor(props?: KubeviousAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
