import { ClusterInfo } from "../../spi";
import { KubernetesManifest } from "aws-cdk-lib/aws-eks";
import { SecretsStoreAddOnProps } from ".";
export declare class CsiDriverProviderAws {
    private props;
    constructor(props: SecretsStoreAddOnProps);
    deploy(clusterInfo: ClusterInfo): KubernetesManifest;
}
