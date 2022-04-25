import { Construct } from "constructs";
import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Properties available to configure the nginx ingress controller.
 * Values to pass to the chart as per https://docs.nginx.com/nginx-ingress-controller/installation/installation-with-helm/#
 */
export interface NginxAddOnProps extends HelmAddOnUserProps {
    /**
     * tcp, http
     * @default tcp
     */
    backendProtocol?: string;
    /**
     * Enabling cross AZ loadbalancing for
     * @default true
     */
    crossZoneEnabled?: boolean;
    /**
     * If the load balancer created for the ingress is internet facing.
     * Internal if set to false.
     * @default true
     */
    internetFacing?: boolean;
    /**
     * IP or instance mode. Default: IP, requires VPC-CNI, has better performance eliminating a hop through kubeproxy
     * Instance mode: traditional NodePort mode on the instance.
     * @default ip
     */
    targetType?: string;
    /**
     * Used in conjunction with external DNS add-on to handle automatic registration of the service with Route53.
     */
    externalDnsHostname?: string;
    /**
     * Name of the certificate {@link NamedResourceProvider} to be used for certificate look up.
     * @see {@link ImportCertificateProvider} and {@link CreateCertificateProvider} for examples of certificate providers.
     */
    certificateResourceName?: string;
}
export declare class NginxAddOn extends HelmAddOn {
    readonly options: NginxAddOnProps;
    constructor(props?: NginxAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
