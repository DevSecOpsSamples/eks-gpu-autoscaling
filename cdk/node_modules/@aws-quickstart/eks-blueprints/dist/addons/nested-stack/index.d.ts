import { NestedStackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ClusterAddOn, ClusterInfo, NestedStackBuilder } from "../../spi";
/**
 * Properties for the nested stack add-on.
 */
export declare class NestedStackAddOnProps {
    /**
     * Required identified, must be unique within the parent stack scope.
     */
    id: string;
    /**
     * Builder that generates the stack.
     */
    builder: NestedStackBuilder;
    /**
     * Optional properties for the nested stack.
     */
    nestedStackProps?: NestedStackProps;
}
export declare class NestedStackAddOn implements ClusterAddOn {
    private readonly props;
    readonly id?: string;
    constructor(props: NestedStackAddOnProps);
    deploy(clusterInfo: ClusterInfo): void | Promise<Construct>;
}
