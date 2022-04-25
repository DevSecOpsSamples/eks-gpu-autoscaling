"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsNodeTerminationHandlerAddOn = exports.Mode = void 0;
const aws_autoscaling_1 = require("aws-cdk-lib/aws-autoscaling");
const aws_autoscaling_hooktargets_1 = require("aws-cdk-lib/aws-autoscaling-hooktargets");
const aws_events_1 = require("aws-cdk-lib/aws-events");
const aws_events_targets_1 = require("aws-cdk-lib/aws-events-targets");
const iam = require("aws-cdk-lib/aws-iam");
const aws_sqs_1 = require("aws-cdk-lib/aws-sqs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const assert = require("assert");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Supported Modes
 */
var Mode;
(function (Mode) {
    /**
     * IMDS Mode
     */
    Mode[Mode["IMDS"] = 0] = "IMDS";
    /**
     * Queue Mode
     */
    Mode[Mode["QUEUE"] = 1] = "QUEUE";
})(Mode = exports.Mode || (exports.Mode = {}));
/**
 * Default options for the add-on
 */
const defaultProps = {
    chart: 'aws-node-termination-handler',
    repository: 'https://aws.github.io/eks-charts',
    version: '0.16.0',
    release: 'blueprints-addon-aws-node-termination-handler',
    name: 'aws-node-termination-handler',
    namespace: 'kube-system',
    mode: Mode.IMDS
};
class AwsNodeTerminationHandlerAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    /**
     * Implementation of the deploy interface
     * @param clusterInfo
     */
    deploy(clusterInfo) {
        const cluster = clusterInfo.cluster;
        const asgCapacity = clusterInfo.autoscalingGroups;
        // No support for Fargate and Managed Node Groups, lets catch that
        assert(asgCapacity && asgCapacity.length > 0, 'AWS Node Termination Handler is only supported for self-managed nodes');
        // Create an SQS Queue
        let helmValues;
        // Create Service Account
        const serviceAccount = cluster.addServiceAccount('aws-nth-sa', {
            name: 'aws-node-termination-handler-sa',
            namespace: this.options.namespace,
        });
        // Get the appropriate Helm Values depending upon the Mode selected
        if (this.options.mode === Mode.IMDS) {
            helmValues = this.configureImdsMode(serviceAccount);
        }
        else {
            helmValues = this.configureQueueMode(cluster, serviceAccount, asgCapacity);
        }
        // Deploy the helm chart
        const awsNodeTerminationHandlerChart = this.addHelmChart(clusterInfo, helmValues);
        awsNodeTerminationHandlerChart.node.addDependency(serviceAccount);
    }
    /**
     * Configures IMDS Mode
     * @param serviceAccount
     * @returns Helm values
     */
    configureImdsMode(serviceAccount) {
        return {
            enableSpotInterruptionDraining: true,
            enableRebalanceMonitoring: true,
            enableScheduledEventDraining: true,
            serviceAccount: {
                create: false,
                name: serviceAccount.serviceAccountName,
            }
        };
    }
    /**
     * Configures Queue Mode
     * @param cluster
     * @param serviceAccount
     * @param asgCapacity
     * @returns Helm values
     */
    configureQueueMode(cluster, serviceAccount, asgCapacity) {
        const queue = new aws_sqs_1.Queue(cluster.stack, "aws-nth-queue", {
            retentionPeriod: aws_cdk_lib_1.Duration.minutes(5)
        });
        queue.addToResourcePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [
                new iam.ServicePrincipal('events.amazonaws.com'),
                new iam.ServicePrincipal('sqs.amazonaws.com'),
            ],
            actions: ['sqs:SendMessage'],
            resources: [queue.queueArn]
        }));
        const resources = [];
        for (let i = 0; i < asgCapacity.length; i++) {
            const nodeGroup = asgCapacity[i];
            // Setup a Termination Lifecycle Hook on an ASG
            new aws_autoscaling_1.LifecycleHook(cluster.stack, `aws-${nodeGroup.autoScalingGroupName}-nth-lifecycle-hook`, {
                lifecycleTransition: aws_autoscaling_1.LifecycleTransition.INSTANCE_TERMINATING,
                heartbeatTimeout: aws_cdk_lib_1.Duration.minutes(5),
                notificationTarget: new aws_autoscaling_hooktargets_1.QueueHook(queue),
                autoScalingGroup: nodeGroup
            });
            // Tag the ASG
            const tags = [{
                    Key: 'aws-node-termination-handler/managed',
                    Value: 'true'
                }];
            (0, utils_1.tagAsg)(cluster.stack, nodeGroup.autoScalingGroupName, tags);
            resources.push(nodeGroup.autoScalingGroupArn);
        }
        // Create Amazon EventBridge Rules
        this.createEvents(cluster.stack, queue);
        // Service Account Policy
        serviceAccount.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'autoscaling:CompleteLifecycleAction',
                'autoscaling:DescribeAutoScalingInstances',
                'autoscaling:DescribeTags'
            ],
            resources
        }));
        serviceAccount.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['ec2:DescribeInstances'],
            resources: ['*']
        }));
        queue.grantConsumeMessages(serviceAccount);
        return {
            enableSqsTerminationDraining: true,
            queueURL: queue.queueUrl,
            serviceAccount: {
                create: false,
                name: serviceAccount.serviceAccountName,
            }
        };
    }
    /**
     * Create EventBridge rules with target as SQS queue
     * @param scope
     * @param queue
     */
    createEvents(scope, queue) {
        const target = new aws_events_targets_1.SqsQueue(queue);
        const eventPatterns = [
            {
                source: ['aws.autoscaling'],
                detailType: ['EC2 Instance-terminate Lifecycle Action']
            },
            {
                source: ['aws.ec2'],
                detailType: ['EC2 Spot Instance Interruption Warning']
            },
            {
                source: ['aws.ec2'],
                detailType: ['EC2 Instance Rebalance Recommendation']
            },
            {
                source: ['aws.ec2'],
                detailType: ['EC2 Instance State-change Notification']
            },
            {
                source: ['aws.health'],
                detailType: ['AWS Health Even'],
            }
        ];
        eventPatterns.forEach((event, index) => {
            const rule = new aws_events_1.Rule(scope, `rule-${index}`, { eventPattern: event });
            rule.addTarget(target);
        });
    }
}
exports.AwsNodeTerminationHandlerAddOn = AwsNodeTerminationHandlerAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2F3cy1ub2RlLXRlcm1pbmF0aW9uLWhhbmRsZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUVBQW1HO0FBQ25HLHlGQUFvRTtBQUVwRSx1REFBNEQ7QUFDNUQsdUVBQTBEO0FBQzFELDJDQUEyQztBQUMzQyxpREFBNEM7QUFDNUMsNkNBQXVDO0FBRXZDLGlDQUFpQztBQUVqQyx1Q0FBcUM7QUFDckMsOENBQThEO0FBRTlEOztHQUVHO0FBQ0gsSUFBWSxJQVVYO0FBVkQsV0FBWSxJQUFJO0lBQ2Q7O09BRUc7SUFDSCwrQkFBSSxDQUFBO0lBRUo7O09BRUc7SUFDSCxpQ0FBSyxDQUFBO0FBQ1AsQ0FBQyxFQVZXLElBQUksR0FBSixZQUFJLEtBQUosWUFBSSxRQVVmO0FBYUQ7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBbUM7SUFDbkQsS0FBSyxFQUFFLDhCQUE4QjtJQUNyQyxVQUFVLEVBQUUsa0NBQWtDO0lBQzlDLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLE9BQU8sRUFBRSwrQ0FBK0M7SUFDeEQsSUFBSSxFQUFFLDhCQUE4QjtJQUNwQyxTQUFTLEVBQUUsYUFBYTtJQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7Q0FDaEIsQ0FBQztBQUVGLE1BQWEsOEJBQStCLFNBQVEsc0JBQVM7SUFJM0QsWUFBWSxLQUFzQztRQUNoRCxLQUFLLENBQUMsRUFBRSxHQUFHLFlBQW1CLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM1QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLFdBQXdCO1FBQzdCLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEMsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixD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QUFJLDZCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsTUFBTSxhQUFhLEdBQW1CO1lBQ3BDO2dCQUNFLE1BQU0sRUFBRSxDQUFDLGlCQUFpQixDQUFDO2dCQUMzQixVQUFVLEVBQUUsQ0FBQyx5Q0FBeUMsQ0FBQzthQUN4RDtZQUNEO2dCQUNFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQztnQkFDbkIsVUFBVSxFQUFFLENBQUMsd0NBQXdDLENBQUM7YUFDdkQ7WUFDRDtnQkFDRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLFVBQVUsRUFBRSxDQUFDLHVDQUF1QyxDQUFDO2FBQ3REO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUNuQixVQUFVLEVBQUUsQ0FBQyx3Q0FBd0MsQ0FBQzthQUN2RDtZQUNEO2dCQUNFLE1BQU0sRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdEIsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7YUFDaEM7U0FDRixDQUFDO1FBRUYsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNyQyxNQUFNLElBQUksR0FBRyxJQUFJLGlCQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsS0FBSyxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBdktELHdFQXVLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF1dG9TY2FsaW5nR3JvdXAsIExpZmVjeWNsZUhvb2ssIExpZmVjeWNsZVRyYW5zaXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXV0b3NjYWxpbmcnO1xuaW1wb3J0IHsgUXVldWVIb29rIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWF1dG9zY2FsaW5nLWhvb2t0YXJnZXRzJztcbmltcG9ydCB7IENsdXN0ZXIsIFNlcnZpY2VBY2NvdW50IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVrcyc7XG5pbXBvcnQgeyBFdmVudFBhdHRlcm4sIFJ1bGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZXZlbnRzJztcbmltcG9ydCB7IFNxc1F1ZXVlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWV2ZW50cy10YXJnZXRzJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSBcImFzc2VydFwiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8gfSBmcm9tICcuLi8uLi9zcGknO1xuaW1wb3J0IHsgdGFnQXNnIH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tICcuLi9oZWxtLWFkZG9uJztcblxuLyoqXG4gKiBTdXBwb3J0ZWQgTW9kZXNcbiAqL1xuZXhwb3J0IGVudW0gTW9kZSB7XG4gIC8qKlxuICAgKiBJTURTIE1vZGVcbiAgICovXG4gIElNRFMsXG5cbiAgLyoqXG4gICAqIFF1ZXVlIE1vZGVcbiAgICovXG4gIFFVRVVFXG59XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBmb3IgdGhlIGFkZC1vblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF3c05vZGVUZXJtaW5hdGlvbkhhbmRsZXJQcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XG4gIC8qKlxuICAgKiBTdXBwb3J0ZWQgTW9kZXMgYXJlIE1vZGUuSU1EUyBhbmQgTW9kZS5RVUVVRVxuICAgKiBAZGVmYXVsdCBNb2RlLklNRFNcbiAgICovXG4gIG1vZGU/OiBNb2RlXG59XG5cbi8qKlxuICogRGVmYXVsdCBvcHRpb25zIGZvciB0aGUgYWRkLW9uXG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wczogQXdzTm9kZVRlcm1pbmF0aW9uSGFuZGxlclByb3BzID0ge1xuICBjaGFydDogJ2F3cy1ub2RlLXRlcm1pbmF0aW9uLWhhbmRsZXInLFxuICByZXBvc2l0b3J5OiAnaHR0cHM6Ly9hd3MuZ2l0aHViLmlvL2Vrcy1jaGFydHMnLFxuICB2ZXJzaW9uOiAnMC4xNi4wJyxcbiAgcmVsZWFzZTogJ2JsdWVwcmludHMtYWRkb24tYXdzLW5vZGUtdGVybWluYXRpb24taGFuZGxlcicsXG4gIG5hbWU6ICdhd3Mtbm9kZS10ZXJtaW5hdGlvbi1oYW5kbGVyJyxcbiAgbmFtZXNwYWNlOiAna3ViZS1zeXN0ZW0nLFxuICBtb2RlOiBNb2RlLklNRFNcbn07XG5cbmV4cG9ydCBjbGFzcyBBd3NOb2RlVGVybWluYXRpb25IYW5kbGVyQWRkT24gZXh0ZW5kcyBIZWxtQWRkT24ge1xuXG4gIHByaXZhdGUgb3B0aW9uczogQXdzTm9kZVRlcm1pbmF0aW9uSGFuZGxlclByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzPzogQXdzTm9kZVRlcm1pbmF0aW9uSGFuZGxlclByb3BzKSB7XG4gICAgc3VwZXIoeyAuLi5kZWZhdWx0UHJvcHMgYXMgYW55LCAuLi5wcm9wcyB9KTtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBkZXBsb3kgaW50ZXJmYWNlXG4gICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICovXG4gIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiB2b2lkIHtcbiAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjsgICAgXG4gICAgY29uc3QgYXNnQ2FwYWNpdHkgPSBjbHVzdGVySW5mby5hdXRvc2NhbGluZ0dyb3VwcztcblxuICAgIC8vIE5vIHN1cHBvcnQgZm9yIEZhcmdhdGUgYW5kIE1hbmFnZWQgTm9kZSBHcm91cHMsIGxldHMgY2F0Y2ggdGhhdFxuICAgIGFzc2VydChhc2dDYXBhY2l0eSAmJiBhc2dDYXBhY2l0eS5sZW5ndGggPiAwLCAnQVdTIE5vZGUgVGVybWluYXRpb24gSGFuZGxlciBpcyBvbmx5IHN1cHBvcnRlZCBmb3Igc2VsZi1tYW5hZ2VkIG5vZGVzJyk7XG5cbiAgICAvLyBDcmVhdGUgYW4gU1FTIFF1ZXVlXG4gICAgbGV0IGhlbG1WYWx1ZXM6IGFueTtcblxuICAgIC8vIENyZWF0ZSBTZXJ2aWNlIEFjY291bnRcbiAgICBjb25zdCBzZXJ2aWNlQWNjb3VudCA9IGNsdXN0ZXIuYWRkU2VydmljZUFjY291bnQoJ2F3cy1udGgtc2EnLCB7XG4gICAgICAgIG5hbWU6ICdhd3Mtbm9kZS10ZXJtaW5hdGlvbi1oYW5kbGVyLXNhJyxcbiAgICAgICAgbmFtZXNwYWNlOiB0aGlzLm9wdGlvbnMubmFtZXNwYWNlLFxuICAgIH0pO1xuXG4gICAgLy8gR2V0IHRoZSBhcHByb3ByaWF0ZSBIZWxtIFZhbHVlcyBkZXBlbmRpbmcgdXBvbiB0aGUgTW9kZSBzZWxlY3RlZFxuICAgIGlmICh0aGlzLm9wdGlvbnMubW9kZSA9PT0gTW9kZS5JTURTKSB7XG4gICAgICAgIGhlbG1WYWx1ZXMgPSB0aGlzLmNvbmZpZ3VyZUltZHNNb2RlKHNlcnZpY2VBY2NvdW50KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGhlbG1WYWx1ZXMgPSB0aGlzLmNvbmZpZ3VyZVF1ZXVlTW9kZShjbHVzdGVyLCBzZXJ2aWNlQWNjb3VudCwgYXNnQ2FwYWNpdHkpO1xuICAgIH1cblxuICAgIC8vIERlcGxveSB0aGUgaGVsbSBjaGFydFxuICAgIGNvbnN0IGF3c05vZGVUZXJtaW5hdGlvbkhhbmRsZXJDaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCBoZWxtVmFsdWVzKTtcbiAgICBhd3NOb2RlVGVybWluYXRpb25IYW5kbGVyQ2hhcnQubm9kZS5hZGREZXBlbmRlbmN5KHNlcnZpY2VBY2NvdW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIElNRFMgTW9kZVxuICAgKiBAcGFyYW0gc2VydmljZUFjY291bnQgXG4gICAqIEByZXR1cm5zIEhlbG0gdmFsdWVzXG4gICAqL1xuICAgIHByaXZhdGUgY29uZmlndXJlSW1kc01vZGUoc2VydmljZUFjY291bnQ6IFNlcnZpY2VBY2NvdW50KTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVuYWJsZVNwb3RJbnRlcnJ1cHRpb25EcmFpbmluZzogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVJlYmFsYW5jZU1vbml0b3Jpbmc6IHRydWUsXG4gICAgICAgICAgICBlbmFibGVTY2hlZHVsZWRFdmVudERyYWluaW5nOiB0cnVlLFxuICAgICAgICAgICAgc2VydmljZUFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5hbWU6IHNlcnZpY2VBY2NvdW50LnNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgUXVldWUgTW9kZVxuICAgKiBAcGFyYW0gY2x1c3RlclxuICAgKiBAcGFyYW0gc2VydmljZUFjY291bnRcbiAgICogQHBhcmFtIGFzZ0NhcGFjaXR5XG4gICAqIEByZXR1cm5zIEhlbG0gdmFsdWVzXG4gICAqL1xuICAgIHByaXZhdGUgY29uZmlndXJlUXVldWVNb2RlKGNsdXN0ZXI6IENsdXN0ZXIsIHNlcnZpY2VBY2NvdW50OiBTZXJ2aWNlQWNjb3VudCwgYXNnQ2FwYWNpdHk6IEF1dG9TY2FsaW5nR3JvdXBbXSk6IGFueSB7XG4gICAgICAgIGNvbnN0IHF1ZXVlID0gbmV3IFF1ZXVlKGNsdXN0ZXIuc3RhY2ssIFwiYXdzLW50aC1xdWV1ZVwiLCB7XG4gICAgICAgICAgICByZXRlbnRpb25QZXJpb2Q6IER1cmF0aW9uLm1pbnV0ZXMoNSlcbiAgICAgICAgfSk7XG4gICAgICAgIHF1ZXVlLmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgcHJpbmNpcGFsczogW1xuICAgICAgICAgICAgICAgIG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZXZlbnRzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgICAgICAgICAgICBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ3Nxcy5hbWF6b25hd3MuY29tJyksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgYWN0aW9uczogWydzcXM6U2VuZE1lc3NhZ2UnXSxcbiAgICAgICAgICAgIHJlc291cmNlczogW3F1ZXVlLnF1ZXVlQXJuXVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgY29uc3QgcmVzb3VyY2VzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXNnQ2FwYWNpdHkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVHcm91cCA9IGFzZ0NhcGFjaXR5W2ldO1xuICAgICAgICAgICAgLy8gU2V0dXAgYSBUZXJtaW5hdGlvbiBMaWZlY3ljbGUgSG9vayBvbiBhbiBBU0dcbiAgICAgICAgICAgIG5ldyBMaWZlY3ljbGVIb29rKGNsdXN0ZXIuc3RhY2ssIGBhd3MtJHtub2RlR3JvdXAuYXV0b1NjYWxpbmdHcm91cE5hbWV9LW50aC1saWZlY3ljbGUtaG9va2AsIHtcbiAgICAgICAgICAgICAgICBsaWZlY3ljbGVUcmFuc2l0aW9uOiBMaWZlY3ljbGVUcmFuc2l0aW9uLklOU1RBTkNFX1RFUk1JTkFUSU5HLFxuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoNSksIC8vIGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvYXdzLW5vZGUtdGVybWluYXRpb24taGFuZGxlciBkb2NzXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uVGFyZ2V0OiBuZXcgUXVldWVIb29rKHF1ZXVlKSxcbiAgICAgICAgICAgICAgICBhdXRvU2NhbGluZ0dyb3VwOiBub2RlR3JvdXBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBUYWcgdGhlIEFTR1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IFt7XG4gICAgICAgICAgICAgICAgS2V5OiAnYXdzLW5vZGUtdGVybWluYXRpb24taGFuZGxlci9tYW5hZ2VkJyxcbiAgICAgICAgICAgICAgICBWYWx1ZTogJ3RydWUnXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICAgIHRhZ0FzZyhjbHVzdGVyLnN0YWNrLCBub2RlR3JvdXAuYXV0b1NjYWxpbmdHcm91cE5hbWUsIHRhZ3MpO1xuICAgICAgICAgICAgcmVzb3VyY2VzLnB1c2gobm9kZUdyb3VwLmF1dG9TY2FsaW5nR3JvdXBBcm4pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIEFtYXpvbiBFdmVudEJyaWRnZSBSdWxlc1xuICAgICAgICB0aGlzLmNyZWF0ZUV2ZW50cyhjbHVzdGVyLnN0YWNrLCBxdWV1ZSk7XG5cbiAgICAgICAgLy8gU2VydmljZSBBY2NvdW50IFBvbGljeVxuICAgICAgICBzZXJ2aWNlQWNjb3VudC5hZGRUb1ByaW5jaXBhbFBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgJ2F1dG9zY2FsaW5nOkNvbXBsZXRlTGlmZWN5Y2xlQWN0aW9uJyxcbiAgICAgICAgICAgICAgICAnYXV0b3NjYWxpbmc6RGVzY3JpYmVBdXRvU2NhbGluZ0luc3RhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2F1dG9zY2FsaW5nOkRlc2NyaWJlVGFncydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZXNvdXJjZXNcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHNlcnZpY2VBY2NvdW50LmFkZFRvUHJpbmNpcGFsUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnZWMyOkRlc2NyaWJlSW5zdGFuY2VzJ10sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddXG4gICAgICAgIH0pKTtcbiAgICAgICAgcXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXMoc2VydmljZUFjY291bnQpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbmFibGVTcXNUZXJtaW5hdGlvbkRyYWluaW5nOiB0cnVlLFxuICAgICAgICAgICAgcXVldWVVUkw6IHF1ZXVlLnF1ZXVlVXJsLFxuICAgICAgICAgICAgc2VydmljZUFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5hbWU6IHNlcnZpY2VBY2NvdW50LnNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBFdmVudEJyaWRnZSBydWxlcyB3aXRoIHRhcmdldCBhcyBTUVMgcXVldWVcbiAgICogQHBhcmFtIHNjb3BlIFxuICAgKiBAcGFyYW0gcXVldWUgXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUV2ZW50cyhzY29wZTogQ29uc3RydWN0LCBxdWV1ZTogUXVldWUpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgU3FzUXVldWUocXVldWUpO1xuICAgIGNvbnN0IGV2ZW50UGF0dGVybnM6IEV2ZW50UGF0dGVybltdID0gW1xuICAgICAge1xuICAgICAgICBzb3VyY2U6IFsnYXdzLmF1dG9zY2FsaW5nJ10sXG4gICAgICAgIGRldGFpbFR5cGU6IFsnRUMyIEluc3RhbmNlLXRlcm1pbmF0ZSBMaWZlY3ljbGUgQWN0aW9uJ11cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHNvdXJjZTogWydhd3MuZWMyJ10sXG4gICAgICAgIGRldGFpbFR5cGU6IFsnRUMyIFNwb3QgSW5zdGFuY2UgSW50ZXJydXB0aW9uIFdhcm5pbmcnXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc291cmNlOiBbJ2F3cy5lYzInXSxcbiAgICAgICAgZGV0YWlsVHlwZTogWydFQzIgSW5zdGFuY2UgUmViYWxhbmNlIFJlY29tbWVuZGF0aW9uJ11cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHNvdXJjZTogWydhd3MuZWMyJ10sXG4gICAgICAgIGRldGFpbFR5cGU6IFsnRUMyIEluc3RhbmNlIFN0YXRlLWNoYW5nZSBOb3RpZmljYXRpb24nXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc291cmNlOiBbJ2F3cy5oZWFsdGgnXSxcbiAgICAgICAgZGV0YWlsVHlwZTogWydBV1MgSGVhbHRoIEV2ZW4nXSxcbiAgICAgIH1cbiAgICBdO1xuXG4gICAgZXZlbnRQYXR0ZXJucy5mb3JFYWNoKChldmVudCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHJ1bGUgPSBuZXcgUnVsZShzY29wZSwgYHJ1bGUtJHtpbmRleH1gLCB7IGV2ZW50UGF0dGVybjogZXZlbnQgfSk7XG4gICAgICBydWxlLmFkZFRhcmdldCh0YXJnZXQpO1xuICAgIH0pO1xuICB9XG59Il19