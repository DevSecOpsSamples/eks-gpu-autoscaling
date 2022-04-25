import * as ec2 from "aws-cdk-lib/aws-ec2";
/**
 * Default instance type for managed node group provisioning
 */
export declare const DEFAULT_INSTANCE_TYPE: ec2.InstanceType;
/**
 * Default min size of MNG
 */
export declare const DEFAULT_NG_MINSIZE = 1;
/**
 * Default max size for MNG
 */
export declare const DEFAULT_NG_MAXSIZE = 3;
/**
 * Keys for context lookups.
 */
export declare const INSTANCE_TYPE_KEY = "eks.default.instance-type";
export declare const MIN_SIZE_KEY = "eks.default.min-size";
export declare const MAX_SIZE_KEY = "eks.default.max-size";
export declare const DESIRED_SIZE_KEY = "eks.default.desired-size";
export declare const PRIVATE_CLUSTER = "eks.default.private-cluster";
