import { Stack, StackProps, CfnOutput, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

/**
 * 
 */
export class VpcStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'Vpc', {
            maxAzs: 3,
            natGateways: 3,
            cidr: '10.0.0.0/16',
            subnetConfiguration: [
                {
                    cidrMask: 20,
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 20,
                    name: 'private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
                }
            ]
        });

        const tagAllSubnets = (
            subnets: ec2.ISubnet[],
            tagName: string,
            tagValue: string,
          ) => {
            for (const subnet of subnets) {
              Tags.of(subnet).add(
                tagName,
                tagValue
              );
            }
        };
        // To use the auto-discover subnets, kubernetes.io/role/elb, kubernetes.io/role/internal-elb tags should be set as 1
        tagAllSubnets(vpc.publicSubnets, 'kubernetes.io/role/elb', '1');
        tagAllSubnets(vpc.privateSubnets, 'kubernetes.io/role/internal-elb', '1');

        const parameter = new ssm.StringParameter(this, 'SSMVPCID', { parameterName: '/eks-gpu-autoscaling/vpc-id', stringValue: vpc.vpcId });
        new CfnOutput(this, 'VPC', { value: vpc.vpcId });
        new CfnOutput(this, 'SSMParameter', { value: parameter.parameterName });
        new CfnOutput(this, 'SSMParameterValue', { value: vpc.vpcId });
        new CfnOutput(this, 'SSMURL', { value: `https://${this.region}.console.aws.amazon.com/systems-manager/parameters/` });
    }
}