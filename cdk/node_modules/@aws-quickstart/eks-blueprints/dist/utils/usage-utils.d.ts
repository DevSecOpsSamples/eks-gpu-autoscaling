import { StackProps } from "aws-cdk-lib";
/**
 * Adds usage tracking info to the stack props
 * @param usageIdentifier
 * @param stackProps
 * @returns
 */
export declare function withUsageTracking(usageIdentifier: string, stackProps?: StackProps): StackProps;
