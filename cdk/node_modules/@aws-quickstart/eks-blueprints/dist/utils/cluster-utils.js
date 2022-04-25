"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagAsg = exports.setupClusterLogging = void 0;
const custom_resources_1 = require("aws-cdk-lib/custom-resources");
const customResource = require("aws-cdk-lib/custom-resources");
// Available Control Plane logging types
const CONTROL_PLANE_LOG_TYPES = ['api', 'audit', 'authenticator', 'controllerManager', 'scheduler'];
// Enables logs for the cluster.
function setupClusterLogging(stack, cluster, enableLogTypes) {
    if (!enableLogTypes.every(val => CONTROL_PLANE_LOG_TYPES.includes(val))) {
        throw new Error('You have included an invalid Control Plane Log Type.');
    }
    let disableLogTypes = CONTROL_PLANE_LOG_TYPES.filter(item => enableLogTypes.indexOf(item) < 0);
    new custom_resources_1.AwsCustomResource(stack, "ClusterLogsEnabler", {
        policy: custom_resources_1.AwsCustomResourcePolicy.fromSdkCalls({
            resources: [`${cluster.clusterArn}/update-config`],
        }),
        onCreate: {
            physicalResourceId: { id: `${cluster.clusterArn}/LogsEnabler` },
            service: "EKS",
            action: "updateClusterConfig",
            region: stack.region,
            parameters: {
                name: cluster.clusterName,
                logging: {
                    clusterLogging: [
                        {
                            enabled: true,
                            types: enableLogTypes,
                        },
                    ],
                },
            },
        },
        onDelete: {
            physicalResourceId: { id: `${cluster.clusterArn}/LogsEnabler` },
            service: "EKS",
            action: "updateClusterConfig",
            region: stack.region,
            parameters: {
                name: cluster.clusterName,
                logging: {
                    clusterLogging: [
                        {
                            enabled: false,
                            types: CONTROL_PLANE_LOG_TYPES,
                        },
                    ],
                },
            },
        },
        onUpdate: {
            physicalResourceId: { id: `${cluster.clusterArn}/LogsEnabler` },
            service: "EKS",
            action: "updateClusterConfig",
            region: stack.region,
            parameters: {
                name: cluster.clusterName,
                logging: {
                    clusterLogging: [
                        {
                            enabled: true,
                            types: enableLogTypes,
                        },
                        {
                            enabled: false,
                            types: disableLogTypes,
                        },
                    ],
                },
            },
        },
    });
}
exports.setupClusterLogging = setupClusterLogging;
/**
 * Creates the node termination tag for the ASG
 * @param scope
 * @param autoScalingGroup
 */
function tagAsg(scope, autoScalingGroup, tags) {
    let tagList = [];
    tags.forEach((tag) => {
        tagList.push({
            Key: tag.Key,
            Value: tag.Value,
            PropagateAtLaunch: true,
            ResourceId: autoScalingGroup,
            ResourceType: 'auto-scaling-group'
        });
    });
    const callProps = {
        service: 'AutoScaling',
        action: 'createOrUpdateTags',
        parameters: {
            Tags: tagList
        },
        physicalResourceId: customResource.PhysicalResourceId.of(`${autoScalingGroup}-asg-tag`)
    };
    new customResource.AwsCustomResource(scope, 'asg-tag', {
        onCreate: callProps,
        onUpdate: callProps,
        policy: customResource.AwsCustomResourcePolicy.fromSdkCalls({
            resources: customResource.AwsCustomResourcePolicy.ANY_RESOURCE
        })
    });
}
exports.tagAsg = tagAsg;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2x1c3Rlci11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlscy9jbHVzdGVyLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1FQUEwRjtBQUUxRiwrREFBK0Q7QUFFL0Qsd0NBQXdDO0FBQ3hDLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxtQkFBbUIsRUFBQyxXQUFXLENBQUMsQ0FBQztBQUVoRyxnQ0FBZ0M7QUFDaEMsU0FBZ0IsbUJBQW1CLENBQUMsS0FBWSxFQUFFLE9BQW9CLEVBQUUsY0FBd0I7SUFDL0YsSUFBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQztRQUN0RSxNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7S0FDeEU7SUFDRCxJQUFJLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRS9GLElBQUksb0NBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixFQUFFO1FBQ2xELE1BQU0sRUFBRSwwQ0FBdUIsQ0FBQyxZQUFZLENBQUM7WUFDNUMsU0FBUyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsVUFBVSxnQkFBZ0IsQ0FBQztTQUNsRCxDQUFDO1FBRUYsUUFBUSxFQUFFO1lBQ1Qsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxjQUFjLEVBQUU7WUFDL0QsT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNLEVBQUUscUJBQXFCO1lBQzdCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixVQUFVLEVBQUU7Z0JBQ1gsSUFBSSxFQUFFLE9BQU8sQ0FBQyxXQUFXO2dCQUN6QixPQUFPLEVBQUU7b0JBQ1IsY0FBYyxFQUFFO3dCQUNmOzRCQUNDLE9BQU8sRUFBRSxJQUFJOzRCQUNiLEtBQUssRUFBRSxjQUFjO3lCQUNyQjtxQkFDRDtpQkFDRDthQUNEO1NBQ0Q7UUFDRCxRQUFRLEVBQUU7WUFDVCxrQkFBa0IsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxVQUFVLGNBQWMsRUFBRTtZQUMvRCxPQUFPLEVBQUUsS0FBSztZQUNkLE1BQU0sRUFBRSxxQkFBcUI7WUFDN0IsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ3BCLFVBQVUsRUFBRTtnQkFDWCxJQUFJLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ3pCLE9BQU8sRUFBRTtvQkFDUixjQUFjLEVBQUU7d0JBQ2Y7NEJBQ0MsT0FBTyxFQUFFLEtBQUs7NEJBQ2QsS0FBSyxFQUFFLHVCQUF1Qjt5QkFDOUI7cUJBQ0Q7aUJBQ0Q7YUFDRDtTQUNEO1FBQ0QsUUFBUSxFQUFFO1lBQ1Qsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxjQUFjLEVBQUU7WUFDL0QsT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNLEVBQUUscUJBQXFCO1lBQzdCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixVQUFVLEVBQUU7Z0JBQ1gsSUFBSSxFQUFFLE9BQU8sQ0FBQyxXQUFXO2dCQUN6QixPQUFPLEVBQUU7b0JBQ1IsY0FBYyxFQUFFO3dCQUNmOzRCQUNDLE9BQU8sRUFBRSxJQUFJOzRCQUNiLEtBQUssRUFBRSxjQUFjO3lCQUNyQjt3QkFDRDs0QkFDQyxPQUFPLEVBQUUsS0FBSzs0QkFDZCxLQUFLLEVBQUUsZUFBZTt5QkFDdEI7cUJBQ0Q7aUJBQ0Q7YUFDRDtTQUNEO0tBQ0QsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQW5FRCxrREFtRUM7QUFPRDs7OztHQUlHO0FBQ0YsU0FBZ0IsTUFBTSxDQUFDLEtBQWdCLEVBQUUsZ0JBQXdCLEVBQUUsSUFBVztJQUM3RSxJQUFJLE9BQU8sR0FNTCxFQUFFLENBQUM7SUFFVCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNYLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztZQUNaLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztZQUNoQixpQkFBaUIsRUFBRyxJQUFJO1lBQ3hCLFVBQVUsRUFBRSxnQkFBZ0I7WUFDNUIsWUFBWSxFQUFFLG9CQUFvQjtTQUNuQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxHQUE4QjtRQUMzQyxPQUFPLEVBQUUsYUFBYTtRQUN0QixNQUFNLEVBQUUsb0JBQW9CO1FBQzVCLFVBQVUsRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1NBQ2Q7UUFDRCxrQkFBa0IsRUFBRSxjQUFjLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUN0RCxHQUFHLGdCQUFnQixVQUFVLENBQzlCO0tBQ0YsQ0FBQztJQUVGLElBQUksY0FBYyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUU7UUFDckQsUUFBUSxFQUFFLFNBQVM7UUFDbkIsUUFBUSxFQUFFLFNBQVM7UUFDbkIsTUFBTSxFQUFFLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUM7WUFDMUQsU0FBUyxFQUFFLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZO1NBQy9ELENBQUM7S0FDSCxDQUFDLENBQUM7QUFDTCxDQUFDO0FBckNBLHdCQXFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGVrcyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgU3RhY2sgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IEF3c0N1c3RvbVJlc291cmNlLCBBd3NDdXN0b21SZXNvdXJjZVBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYi9jdXN0b20tcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0ICogYXMgY3VzdG9tUmVzb3VyY2UgZnJvbSAnYXdzLWNkay1saWIvY3VzdG9tLXJlc291cmNlcyc7XG5cbi8vIEF2YWlsYWJsZSBDb250cm9sIFBsYW5lIGxvZ2dpbmcgdHlwZXNcbmNvbnN0IENPTlRST0xfUExBTkVfTE9HX1RZUEVTID0gWydhcGknLCdhdWRpdCcsJ2F1dGhlbnRpY2F0b3InLCdjb250cm9sbGVyTWFuYWdlcicsJ3NjaGVkdWxlciddO1xuXG4vLyBFbmFibGVzIGxvZ3MgZm9yIHRoZSBjbHVzdGVyLlxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwQ2x1c3RlckxvZ2dpbmcoc3RhY2s6IFN0YWNrLCBjbHVzdGVyOiBla3MuQ2x1c3RlciwgZW5hYmxlTG9nVHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XG5cdGlmKCFlbmFibGVMb2dUeXBlcy5ldmVyeSh2YWwgPT4gQ09OVFJPTF9QTEFORV9MT0dfVFlQRVMuaW5jbHVkZXModmFsKSkpe1xuXHRcdHRocm93IG5ldyBFcnJvcignWW91IGhhdmUgaW5jbHVkZWQgYW4gaW52YWxpZCBDb250cm9sIFBsYW5lIExvZyBUeXBlLicpO1xuXHR9XG5cdGxldCBkaXNhYmxlTG9nVHlwZXMgPSBDT05UUk9MX1BMQU5FX0xPR19UWVBFUy5maWx0ZXIoaXRlbSA9PiBlbmFibGVMb2dUeXBlcy5pbmRleE9mKGl0ZW0pIDwgMCk7XG5cblx0bmV3IEF3c0N1c3RvbVJlc291cmNlKHN0YWNrLCBcIkNsdXN0ZXJMb2dzRW5hYmxlclwiLCB7XG5cdFx0cG9saWN5OiBBd3NDdXN0b21SZXNvdXJjZVBvbGljeS5mcm9tU2RrQ2FsbHMoe1xuXHRcdFx0cmVzb3VyY2VzOiBbYCR7Y2x1c3Rlci5jbHVzdGVyQXJufS91cGRhdGUtY29uZmlnYF0sXG5cdFx0fSksXG5cblx0XHRvbkNyZWF0ZToge1xuXHRcdFx0cGh5c2ljYWxSZXNvdXJjZUlkOiB7IGlkOiBgJHtjbHVzdGVyLmNsdXN0ZXJBcm59L0xvZ3NFbmFibGVyYCB9LFxuXHRcdFx0c2VydmljZTogXCJFS1NcIixcblx0XHRcdGFjdGlvbjogXCJ1cGRhdGVDbHVzdGVyQ29uZmlnXCIsXG5cdFx0XHRyZWdpb246IHN0YWNrLnJlZ2lvbixcblx0XHRcdHBhcmFtZXRlcnM6IHtcblx0XHRcdFx0bmFtZTogY2x1c3Rlci5jbHVzdGVyTmFtZSxcblx0XHRcdFx0bG9nZ2luZzoge1xuXHRcdFx0XHRcdGNsdXN0ZXJMb2dnaW5nOiBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGVuYWJsZWQ6IHRydWUsXG5cdFx0XHRcdFx0XHRcdHR5cGVzOiBlbmFibGVMb2dUeXBlcyxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0fSxcblx0XHRvbkRlbGV0ZToge1xuXHRcdFx0cGh5c2ljYWxSZXNvdXJjZUlkOiB7IGlkOiBgJHtjbHVzdGVyLmNsdXN0ZXJBcm59L0xvZ3NFbmFibGVyYCB9LFxuXHRcdFx0c2VydmljZTogXCJFS1NcIixcblx0XHRcdGFjdGlvbjogXCJ1cGRhdGVDbHVzdGVyQ29uZmlnXCIsXG5cdFx0XHRyZWdpb246IHN0YWNrLnJlZ2lvbixcblx0XHRcdHBhcmFtZXRlcnM6IHtcblx0XHRcdFx0bmFtZTogY2x1c3Rlci5jbHVzdGVyTmFtZSxcblx0XHRcdFx0bG9nZ2luZzoge1xuXHRcdFx0XHRcdGNsdXN0ZXJMb2dnaW5nOiBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHR0eXBlczogQ09OVFJPTF9QTEFORV9MT0dfVFlQRVMsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0b25VcGRhdGU6IHtcblx0XHRcdHBoeXNpY2FsUmVzb3VyY2VJZDogeyBpZDogYCR7Y2x1c3Rlci5jbHVzdGVyQXJufS9Mb2dzRW5hYmxlcmAgfSxcblx0XHRcdHNlcnZpY2U6IFwiRUtTXCIsXG5cdFx0XHRhY3Rpb246IFwidXBkYXRlQ2x1c3RlckNvbmZpZ1wiLFxuXHRcdFx0cmVnaW9uOiBzdGFjay5yZWdpb24sXG5cdFx0XHRwYXJhbWV0ZXJzOiB7XG5cdFx0XHRcdG5hbWU6IGNsdXN0ZXIuY2x1c3Rlck5hbWUsXG5cdFx0XHRcdGxvZ2dpbmc6IHtcblx0XHRcdFx0XHRjbHVzdGVyTG9nZ2luZzogW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRlbmFibGVkOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHR0eXBlczogZW5hYmxlTG9nVHlwZXMsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRlbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0dHlwZXM6IGRpc2FibGVMb2dUeXBlcyxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0fSxcblx0fSk7XG59XG5cbmludGVyZmFjZSBUYWcge1xuICBLZXk6IHN0cmluZztcbiAgVmFsdWU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBub2RlIHRlcm1pbmF0aW9uIHRhZyBmb3IgdGhlIEFTR1xuICogQHBhcmFtIHNjb3BlXG4gKiBAcGFyYW0gYXV0b1NjYWxpbmdHcm91cCBcbiAqL1xuIGV4cG9ydCBmdW5jdGlvbiB0YWdBc2coc2NvcGU6IENvbnN0cnVjdCwgYXV0b1NjYWxpbmdHcm91cDogc3RyaW5nLCB0YWdzOiBUYWdbXSk6IHZvaWQge1xuICBsZXQgdGFnTGlzdDoge1xuICAgIEtleTogc3RyaW5nO1xuICAgIFZhbHVlOiBzdHJpbmc7XG4gICAgUHJvcGFnYXRlQXRMYXVuY2g6IGJvb2xlYW47XG4gICAgUmVzb3VyY2VJZDogc3RyaW5nO1xuICAgIFJlc291cmNlVHlwZTogc3RyaW5nO1xuICB9W10gPSBbXTtcblxuICB0YWdzLmZvckVhY2goKHRhZykgPT4ge1xuICAgIHRhZ0xpc3QucHVzaCh7XG4gICAgICBLZXk6IHRhZy5LZXksXG4gICAgICBWYWx1ZTogdGFnLlZhbHVlLFxuICAgICAgUHJvcGFnYXRlQXRMYXVuY2ggOiB0cnVlLFxuICAgICAgUmVzb3VyY2VJZDogYXV0b1NjYWxpbmdHcm91cCxcbiAgICAgIFJlc291cmNlVHlwZTogJ2F1dG8tc2NhbGluZy1ncm91cCdcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgY2FsbFByb3BzOiBjdXN0b21SZXNvdXJjZS5Bd3NTZGtDYWxsID0ge1xuICAgIHNlcnZpY2U6ICdBdXRvU2NhbGluZycsXG4gICAgYWN0aW9uOiAnY3JlYXRlT3JVcGRhdGVUYWdzJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBUYWdzOiB0YWdMaXN0XG4gICAgfSxcbiAgICBwaHlzaWNhbFJlc291cmNlSWQ6IGN1c3RvbVJlc291cmNlLlBoeXNpY2FsUmVzb3VyY2VJZC5vZihcbiAgICAgIGAke2F1dG9TY2FsaW5nR3JvdXB9LWFzZy10YWdgXG4gICAgKVxuICB9O1xuXG4gIG5ldyBjdXN0b21SZXNvdXJjZS5Bd3NDdXN0b21SZXNvdXJjZShzY29wZSwgJ2FzZy10YWcnLCB7XG4gICAgb25DcmVhdGU6IGNhbGxQcm9wcyxcbiAgICBvblVwZGF0ZTogY2FsbFByb3BzLFxuICAgIHBvbGljeTogY3VzdG9tUmVzb3VyY2UuQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuZnJvbVNka0NhbGxzKHtcbiAgICAgIHJlc291cmNlczogY3VzdG9tUmVzb3VyY2UuQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuQU5ZX1JFU09VUkNFXG4gICAgfSlcbiAgfSk7XG59Il19