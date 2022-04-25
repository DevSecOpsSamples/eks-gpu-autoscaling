import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Stack } from 'aws-cdk-lib';
/**
 * Tags EC2 Security Group with given tag and value - used for EKS Security Group Tagging
 * @param stack - CDK Stack
 * @param securityGroupId - Security Group Resource ID
 * @param key - Tag Key
 * @param value - Tag Value
 */
export declare function tagSecurityGroup(stack: Stack, securityGroupId: string, key: string, value: string): void;
/**
 * Tags VPC Subnets with given tag and value.
 * @param stack - CDK Stack
 * @param subnets - a list of subnets
 * @param key - Tag Key
 * @param value - Tag Value
 */
export declare function tagSubnets(stack: Stack, subnets: ec2.ISubnet[], key: string, value: string): void;
