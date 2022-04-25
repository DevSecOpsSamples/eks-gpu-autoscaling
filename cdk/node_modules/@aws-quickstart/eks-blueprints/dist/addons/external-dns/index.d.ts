import { Construct } from "constructs";
import { ClusterInfo } from '../../spi';
import { HelmAddOn, HelmAddOnUserProps } from '../helm-addon';
/**
 * Configuration options for the external DNS add-on.
 */
export interface ExternalDnsProps extends HelmAddOnUserProps {
    /**
     * Names of hosted zone provider named resources (@see LookupHostedZoneProvider) for external DNS.
     * Hosted zone providers are registered as named resource providers with the EksBlueprintProps.
     */
    readonly hostedZoneResources: string[];
}
/**
 * Implementation of the External DNS service: https://github.com/kubernetes-sigs/external-dns/.
 * It is required to integrate with Route53 for external DNS resolution.
 */
export declare class ExternalDnsAddOn extends HelmAddOn {
    private options;
    constructor(props: ExternalDnsProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
