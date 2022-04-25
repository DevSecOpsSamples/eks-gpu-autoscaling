import { ClusterAddOn, ClusterInfo } from "../../spi";
/**
 * Implementation of AWS X-Ray add-on for EKS Blueprints. Installs xray daemonset and exposes
 * an internal ClusterIP service for tracing on port 2000 (UDP).
 */
export declare class XrayAddOn implements ClusterAddOn {
    deploy(clusterInfo: ClusterInfo): void;
}
