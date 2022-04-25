import { ClusterAddOn, ClusterInfo } from "../../spi";
export declare class SSMAgentAddOn implements ClusterAddOn {
    deploy(clusterInfo: ClusterInfo): void;
}
