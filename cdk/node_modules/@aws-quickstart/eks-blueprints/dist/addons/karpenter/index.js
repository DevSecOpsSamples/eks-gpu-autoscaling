"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarpenterAddOn = void 0;
const iam = require("aws-cdk-lib/aws-iam");
const helm_addon_1 = require("../helm-addon");
const utils_1 = require("../../utils");
const iam_1 = require("./iam");
const ts_deepmerge_1 = require("ts-deepmerge");
const KARPENTER = 'karpenter';
const RELEASE = 'blueprints-addon-karpenter';
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    name: KARPENTER,
    namespace: KARPENTER,
    version: '0.8.2',
    chart: KARPENTER,
    release: RELEASE,
    repository: 'https://charts.karpenter.sh',
};
/**
 * Implementation of the Karpenter add-on
 */
class KarpenterAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const endpoint = clusterInfo.cluster.clusterEndpoint;
        const name = clusterInfo.cluster.clusterName;
        const cluster = clusterInfo.cluster;
        let values = (_a = this.options.values) !== null && _a !== void 0 ? _a : {};
        const provisionerSpecs = this.options.provisionerSpecs || {};
        const subnetTags = this.options.subnetTags || {};
        const sgTags = this.options.securityGroupTags || {};
        // Tag VPC Subnets
        if (subnetTags) {
            Object.entries(subnetTags).forEach(([key, value]) => {
                (0, utils_1.tagSubnets)(cluster.stack, cluster.vpc.privateSubnets, key, value);
            });
        }
        // Tag VPC Security Group
        if (sgTags) {
            Object.entries(sgTags).forEach(([key, value]) => {
                (0, utils_1.tagSecurityGroup)(cluster.stack, cluster.clusterSecurityGroupId, key, value);
            });
        }
        // Set up Node Role
        const karpenterNodeRole = new iam.Role(cluster, 'karpenter-node-role', {
            assumedBy: new iam.ServicePrincipal(`ec2.${cluster.stack.urlSuffix}`),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
            ],
            roleName: `KarpenterNodeRole-${name}`
        });
        // Set up Instance Profile
        const karpenterInstanceProfile = new iam.CfnInstanceProfile(cluster, 'karpenter-instance-profile', {
            roles: [karpenterNodeRole.roleName],
            instanceProfileName: `KarpenterNodeInstanceProfile-${name}`,
            path: '/'
        });
        // Map Node Role to aws-auth
        cluster.awsAuth.addRoleMapping(karpenterNodeRole, {
            groups: ['system:bootstrapper', 'system:nodes'],
            username: 'system:node:{{EC2PrivateDNSName}}'
        });
        // Create Namespace
        const ns = (0, utils_1.createNamespace)(KARPENTER, cluster, true, true);
        const karpenterPolicyDocument = iam.PolicyDocument.fromJson(iam_1.KarpenterControllerPolicy);
        const sa = (0, utils_1.createServiceAccount)(cluster, RELEASE, KARPENTER, karpenterPolicyDocument);
        sa.node.addDependency(ns);
        // Add helm chart
        (0, utils_1.setPath)(values, "clusterEndpoint", endpoint);
        (0, utils_1.setPath)(values, "clusterName", name);
        (0, utils_1.setPath)(values, "aws.defaultInstanceProfile", karpenterInstanceProfile.instanceProfileName);
        const saValues = {
            serviceAccount: {
                create: false,
                name: RELEASE,
                annotations: {
                    "eks.amazonaws.com/role-arn": sa.role.roleArn,
                }
            }
        };
        values = (0, ts_deepmerge_1.default)(values, saValues);
        const karpenterChart = this.addHelmChart(clusterInfo, values, false, true);
        karpenterChart.node.addDependency(ns);
        // (Optional) default provisioner
        if ((Object.keys(subnetTags).length > 0) && (Object.keys(sgTags).length > 0)) {
            const provisioner = cluster.addManifest('default-provisioner', {
                apiVersion: 'karpenter.sh/v1alpha5',
                kind: 'Provisioner',
                metadata: { name: 'default' },
                spec: {
                    requirements: this.convertToSpec(provisionerSpecs),
                    provider: {
                        subnetSelector: subnetTags,
                        securityGroupSelector: sgTags,
                    },
                    ttlSecondsAfterEmpty: 30,
                },
            });
            provisioner.node.addDependency(karpenterChart);
        }
        return Promise.resolve(karpenterChart);
    }
    /**
     * Helper function to convert a key-pair values of provisioner spec configurations
     * To appropriate json format for addManifest function
     * @param specs
     * @returns
     * */
    convertToSpec(specs) {
        const newSpecs = [];
        for (const key in specs) {
            const value = specs[key];
            const requirement = {
                "key": key,
                "operator": "In",
                "values": value
            };
            newSpecs.push(requirement);
        }
        return newSpecs;
    }
}
__decorate([
    (0, utils_1.dependable)('VpcCniAddOn'),
    (0, utils_1.conflictsWith)('ClusterAutoScalerAddOn')
], KarpenterAddOn.prototype, "deploy", null);
exports.KarpenterAddOn = KarpenterAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2thcnBlbnRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSwyQ0FBMkM7QUFFM0MsOENBQThFO0FBQzlFLHVDQUFzSTtBQUN0SSwrQkFBa0Q7QUFDbEQsK0NBQWlDO0FBZ0NqQyxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUM7QUFDOUIsTUFBTSxPQUFPLEdBQUcsNEJBQTRCLENBQUM7QUFFN0M7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBbUI7SUFDakMsSUFBSSxFQUFFLFNBQVM7SUFDZixTQUFTLEVBQUUsU0FBUztJQUNwQixPQUFPLEVBQUUsT0FBTztJQUNoQixLQUFLLEVBQUUsU0FBUztJQUNoQixPQUFPLEVBQUUsT0FBTztJQUNoQixVQUFVLEVBQUUsNkJBQTZCO0NBQzVDLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQWEsY0FBZSxTQUFRLHNCQUFTO0lBSXpDLFlBQVksS0FBMkI7UUFDbkMsS0FBSyxDQUFDLEVBQUMsR0FBRyxZQUFZLEVBQUUsR0FBRyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM5QixDQUFDO0lBSUQsTUFBTSxDQUFDLFdBQXdCOztRQUMzQixNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztRQUNyRCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUM3QyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3BDLElBQUksTUFBTSxHQUFHLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQztRQUV2QyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFD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O2FBQ0osQ0FBQyxDQUFDO1lBQ0gsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDbEQ7UUFFRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVEOzs7OztTQUtLO0lBQ0ssYUFBYSxDQUFDLEtBQW1DO1FBQ3ZELE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNwQixLQUFLLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBQztZQUNwQixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsTUFBTSxXQUFXLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxHQUFHO2dCQUNWLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDO1lBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM5QjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7Q0FDSjtBQXBIRztJQUZDLElBQUEsa0JBQVUsRUFBQyxhQUFhLENBQUM7SUFDekIsSUFBQSxxQkFBYSxFQUFDLHdCQUF3QixDQUFDOzRDQWdHdkM7QUExR0wsd0NBK0hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENsdXN0ZXJJbmZvIH0gZnJvbSAnLi4vLi4vc3BpJztcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uUHJvcHMsIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gJy4uL2hlbG0tYWRkb24nO1xuaW1wb3J0IHsgY3JlYXRlTmFtZXNwYWNlLCBzZXRQYXRoLCBjb25mbGljdHNXaXRoLCBkZXBlbmRhYmxlLCB0YWdTdWJuZXRzLCB0YWdTZWN1cml0eUdyb3VwLCBjcmVhdGVTZXJ2aWNlQWNjb3VudCB9IGZyb20gJy4uLy4uL3V0aWxzJztcbmltcG9ydCB7IEthcnBlbnRlckNvbnRyb2xsZXJQb2xpY3kgfSBmcm9tICcuL2lhbSc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAndHMtZGVlcG1lcmdlJztcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBhZGQtb25cbiAqL1xuaW50ZXJmYWNlIEthcnBlbnRlckFkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIFNwZWNzIGZvciBhIFByb3Zpc2lvbmVyIChPcHRpb25hbCkgLSBJZiBub3QgcHJvdmlkZWQsIHRoZSBhZGQtb24gd2lsbFxuICAgICAqIGRlcGxveSBhIFByb3Zpc2lvbmVyIHdpdGggZGVmYXVsdCB2YWx1ZXMuXG4gICAgICovXG4gICAgcHJvdmlzaW9uZXJTcGVjcz86IHsgXG4gICAgICAgICdub2RlLmt1YmVybmV0ZXMuaW8vaW5zdGFuY2UtdHlwZSc/OiBzdHJpbmdbXSxcbiAgICAgICAgJ3RvcG9sb2d5Lmt1YmVybmV0ZXMuaW8vem9uZSc/OiBzdHJpbmdbXSxcbiAgICAgICAgJ2t1YmVybmV0ZXMuaW8vYXJjaCc/OiBzdHJpbmdbXSxcbiAgICAgICAgJ2thcnBlbnRlci5zaC9jYXBhY2l0eS10eXBlJz86IHN0cmluZ1tdLFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRhZ3MgbmVlZGVkIGZvciBzdWJuZXRzIC0gU3VibmV0IHRhZ3MgYW5kIHNlY3VyaXR5IGdyb3VwIHRhZ3MgYXJlIHJlcXVpcmVkIGZvciB0aGUgcHJvdmlzaW9uZXIgdG8gYmUgY3JlYXRlZFxuICAgICAqL1xuICAgIHN1Ym5ldFRhZ3M/OiB7IFxuICAgICAgICBba2V5OiBzdHJpbmddOiBzdHJpbmdcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUYWdzIG5lZWRlZCBmb3Igc2VjdXJpdHkgZ3JvdXBzIC0gU3VibmV0IHRhZ3MgYW5kIHNlY3VyaXR5IGdyb3VwIHRhZ3MgYXJlIHJlcXVpcmVkIGZvciB0aGUgcHJvdmlzaW9uZXIgdG8gYmUgY3JlYXRlZFxuICAgICAqL1xuICAgIHNlY3VyaXR5R3JvdXBUYWdzPzogeyBcbiAgICAgICAgW2tleTogc3RyaW5nXTogc3RyaW5nXG4gICAgfVxufVxuXG5jb25zdCBLQVJQRU5URVIgPSAna2FycGVudGVyJztcbmNvbnN0IFJFTEVBU0UgPSAnYmx1ZXByaW50cy1hZGRvbi1rYXJwZW50ZXInO1xuXG4vKipcbiAqIERlZmF1bHRzIG9wdGlvbnMgZm9yIHRoZSBhZGQtb25cbiAqL1xuY29uc3QgZGVmYXVsdFByb3BzOiBIZWxtQWRkT25Qcm9wcyA9IHtcbiAgICBuYW1lOiBLQVJQRU5URVIsXG4gICAgbmFtZXNwYWNlOiBLQVJQRU5URVIsXG4gICAgdmVyc2lvbjogJzAuOC4yJyxcbiAgICBjaGFydDogS0FSUEVOVEVSLFxuICAgIHJlbGVhc2U6IFJFTEVBU0UsXG4gICAgcmVwb3NpdG9yeTogJ2h0dHBzOi8vY2hhcnRzLmthcnBlbnRlci5zaCcsXG59O1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBLYXJwZW50ZXIgYWRkLW9uXG4gKi9cbmV4cG9ydCBjbGFzcyBLYXJwZW50ZXJBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XG5cbiAgICByZWFkb25seSBvcHRpb25zOiBLYXJwZW50ZXJBZGRPblByb3BzO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBLYXJwZW50ZXJBZGRPblByb3BzKSB7XG4gICAgICAgIHN1cGVyKHsuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzfSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHRoaXMucHJvcHM7XG4gICAgfVxuXG4gICAgQGRlcGVuZGFibGUoJ1ZwY0NuaUFkZE9uJylcbiAgICBAY29uZmxpY3RzV2l0aCgnQ2x1c3RlckF1dG9TY2FsZXJBZGRPbicpXG4gICAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG4gICAgICAgIGNvbnN0IGVuZHBvaW50ID0gY2x1c3RlckluZm8uY2x1c3Rlci5jbHVzdGVyRW5kcG9pbnQ7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBjbHVzdGVySW5mby5jbHVzdGVyLmNsdXN0ZXJOYW1lO1xuICAgICAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcbiAgICAgICAgbGV0IHZhbHVlcyA9IHRoaXMub3B0aW9ucy52YWx1ZXMgPz8ge307XG5cbiAgICAgICAgY29uc3QgcHJvdmlzaW9uZXJTcGVjcyA9IHRoaXMub3B0aW9ucy5wcm92aXNpb25lclNwZWNzIHx8IHt9O1xuICAgICAgICBjb25zdCBzdWJuZXRUYWdzID0gdGhpcy5vcHRpb25zLnN1Ym5ldFRhZ3MgfHwge307XG4gICAgICAgIGNvbnN0IHNnVGFncyA9IHRoaXMub3B0aW9ucy5zZWN1cml0eUdyb3VwVGFncyB8fCB7fTtcblxuICAgICAgICAvLyBUYWcgVlBDIFN1Ym5ldHNcbiAgICAgICAgaWYgKHN1Ym5ldFRhZ3Mpe1xuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoc3VibmV0VGFncykuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAoW2tleSx2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGFnU3VibmV0cyhjbHVzdGVyLnN0YWNrLCBjbHVzdGVyLnZwYy5wcml2YXRlU3VibmV0cywga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gVGFnIFZQQyBTZWN1cml0eSBHcm91cFxuICAgICAgICBpZiAoc2dUYWdzKXtcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHNnVGFncykuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAoW2tleSx2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGFnU2VjdXJpdHlHcm91cChjbHVzdGVyLnN0YWNrLCBjbHVzdGVyLmNsdXN0ZXJTZWN1cml0eUdyb3VwSWQsIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIFxuICAgICAgICAvLyBTZXQgdXAgTm9kZSBSb2xlXG4gICAgICAgIGNvbnN0IGthcnBlbnRlck5vZGVSb2xlID0gbmV3IGlhbS5Sb2xlKGNsdXN0ZXIsICdrYXJwZW50ZXItbm9kZS1yb2xlJywge1xuICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoYGVjMi4ke2NsdXN0ZXIuc3RhY2sudXJsU3VmZml4fWApLFxuICAgICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uRUtTV29ya2VyTm9kZVBvbGljeVwiKSxcbiAgICAgICAgICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25FS1NfQ05JX1BvbGljeVwiKSxcbiAgICAgICAgICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25FQzJDb250YWluZXJSZWdpc3RyeVJlYWRPbmx5XCIpLFxuICAgICAgICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblNTTU1hbmFnZWRJbnN0YW5jZUNvcmVcIiksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcm9sZU5hbWU6IGBLYXJwZW50ZXJOb2RlUm9sZS0ke25hbWV9YFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTZXQgdXAgSW5zdGFuY2UgUHJvZmlsZVxuICAgICAgICBjb25zdCBrYXJwZW50ZXJJbnN0YW5jZVByb2ZpbGUgPSBuZXcgaWFtLkNmbkluc3RhbmNlUHJvZmlsZShjbHVzdGVyLCAna2FycGVudGVyLWluc3RhbmNlLXByb2ZpbGUnLCB7XG4gICAgICAgICAgICByb2xlczogW2thcnBlbnRlck5vZGVSb2xlLnJvbGVOYW1lXSxcbiAgICAgICAgICAgIGluc3RhbmNlUHJvZmlsZU5hbWU6IGBLYXJwZW50ZXJOb2RlSW5zdGFuY2VQcm9maWxlLSR7bmFtZX1gLFxuICAgICAgICAgICAgcGF0aDogJy8nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE1hcCBOb2RlIFJvbGUgdG8gYXdzLWF1dGhcbiAgICAgICAgY2x1c3Rlci5hd3NBdXRoLmFkZFJvbGVNYXBwaW5nKGthcnBlbnRlck5vZGVSb2xlLCB7XG4gICAgICAgICAgICBncm91cHM6IFsnc3lzdGVtOmJvb3RzdHJhcHBlcicsICdzeXN0ZW06bm9kZXMnXSxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnc3lzdGVtOm5vZGU6e3tFQzJQcml2YXRlRE5TTmFtZX19J1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgTmFtZXNwYWNlXG4gICAgICAgIGNvbnN0IG5zID0gY3JlYXRlTmFtZXNwYWNlKEtBUlBFTlRFUiwgY2x1c3RlciwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IGthcnBlbnRlclBvbGljeURvY3VtZW50ID0gaWFtLlBvbGljeURvY3VtZW50LmZyb21Kc29uKEthcnBlbnRlckNvbnRyb2xsZXJQb2xpY3kpO1xuICAgICAgICBjb25zdCBzYSA9IGNyZWF0ZVNlcnZpY2VBY2NvdW50KGNsdXN0ZXIsIFJFTEVBU0UsIEtBUlBFTlRFUiwga2FycGVudGVyUG9saWN5RG9jdW1lbnQpO1xuICAgICAgICBzYS5ub2RlLmFkZERlcGVuZGVuY3kobnMpO1xuXG4gICAgICAgIC8vIEFkZCBoZWxtIGNoYXJ0XG4gICAgICAgIHNldFBhdGgodmFsdWVzLCBcImNsdXN0ZXJFbmRwb2ludFwiLCBlbmRwb2ludCk7XG4gICAgICAgIHNldFBhdGgodmFsdWVzLCBcImNsdXN0ZXJOYW1lXCIsIG5hbWUpO1xuICAgICAgICBzZXRQYXRoKHZhbHVlcywgXCJhd3MuZGVmYXVsdEluc3RhbmNlUHJvZmlsZVwiLCBrYXJwZW50ZXJJbnN0YW5jZVByb2ZpbGUuaW5zdGFuY2VQcm9maWxlTmFtZSk7XG4gICAgICAgIGNvbnN0IHNhVmFsdWVzID0ge1xuICAgICAgICAgICAgc2VydmljZUFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5hbWU6IFJFTEVBU0UsXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJla3MuYW1hem9uYXdzLmNvbS9yb2xlLWFyblwiOiBzYS5yb2xlLnJvbGVBcm4sXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhbHVlcyA9IG1lcmdlKHZhbHVlcywgc2FWYWx1ZXMpO1xuICAgICAgICBjb25zdCBrYXJwZW50ZXJDaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCB2YWx1ZXMsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICBrYXJwZW50ZXJDaGFydC5ub2RlLmFkZERlcGVuZGVuY3kobnMpO1xuXG4gICAgICAgIC8vIChPcHRpb25hbCkgZGVmYXVsdCBwcm92aXNpb25lclxuICAgICAgICBpZiAoKE9iamVjdC5rZXlzKHN1Ym5ldFRhZ3MpLmxlbmd0aCA+IDApICYmIChPYmplY3Qua2V5cyhzZ1RhZ3MpLmxlbmd0aCA+IDApKXtcbiAgICAgICAgICAgIGNvbnN0IHByb3Zpc2lvbmVyID0gY2x1c3Rlci5hZGRNYW5pZmVzdCgnZGVmYXVsdC1wcm92aXNpb25lcicsIHtcbiAgICAgICAgICAgICAgICBhcGlWZXJzaW9uOiAna2FycGVudGVyLnNoL3YxYWxwaGE1JyxcbiAgICAgICAgICAgICAgICBraW5kOiAnUHJvdmlzaW9uZXInLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7IG5hbWU6ICdkZWZhdWx0JyB9LFxuICAgICAgICAgICAgICAgIHNwZWM6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmNvbnZlcnRUb1NwZWMocHJvdmlzaW9uZXJTcGVjcyksXG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJuZXRTZWxlY3Rvcjogc3VibmV0VGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBTZWxlY3Rvcjogc2dUYWdzLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0dGxTZWNvbmRzQWZ0ZXJFbXB0eTogMzAsXG4gICAgICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3Zpc2lvbmVyLm5vZGUuYWRkRGVwZW5kZW5jeShrYXJwZW50ZXJDaGFydCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGthcnBlbnRlckNoYXJ0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCBhIGtleS1wYWlyIHZhbHVlcyBvZiBwcm92aXNpb25lciBzcGVjIGNvbmZpZ3VyYXRpb25zXG4gICAgICogVG8gYXBwcm9wcmlhdGUganNvbiBmb3JtYXQgZm9yIGFkZE1hbmlmZXN0IGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHNwZWNzIFxuICAgICAqIEByZXR1cm5zXG4gICAgICogKi9cbiAgICBwcm90ZWN0ZWQgY29udmVydFRvU3BlYyhzcGVjczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXTsgfSk6IGFueVtdIHtcbiAgICAgICAgY29uc3QgbmV3U3BlY3MgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc3BlY3Mpe1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzcGVjc1trZXldO1xuICAgICAgICAgICAgY29uc3QgcmVxdWlyZW1lbnQgPSB7XG4gICAgICAgICAgICAgICAgXCJrZXlcIjoga2V5LFxuICAgICAgICAgICAgICAgIFwib3BlcmF0b3JcIjogXCJJblwiLFxuICAgICAgICAgICAgICAgIFwidmFsdWVzXCI6IHZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbmV3U3BlY3MucHVzaChyZXF1aXJlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld1NwZWNzO1xuICAgIH1cbn0iXX0=