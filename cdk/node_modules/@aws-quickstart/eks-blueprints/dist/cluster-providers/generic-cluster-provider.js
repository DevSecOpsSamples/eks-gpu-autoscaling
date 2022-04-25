"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericClusterProvider = exports.ClusterBuilder = exports.defaultOptions = exports.clusterBuilder = void 0;
const aws_autoscaling_1 = require("aws-cdk-lib/aws-autoscaling");
const ec2 = require("aws-cdk-lib/aws-ec2");
const eks = require("aws-cdk-lib/aws-eks");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const spi_1 = require("../spi");
const utils_1 = require("../utils");
const constants = require("./constants");
const assert = require("assert");
function clusterBuilder() {
    return new ClusterBuilder();
}
exports.clusterBuilder = clusterBuilder;
exports.defaultOptions = {
    version: eks.KubernetesVersion.V1_21
};
class ClusterBuilder {
    constructor() {
        this.props = {};
        this.privateCluster = false;
        this.managedNodeGroups = [];
        this.autoscalingNodeGroups = [];
        this.fargateProfiles = {};
        this.props = { ...this.props, ...{ version: aws_eks_1.KubernetesVersion.V1_21 } };
    }
    withCommonOptions(options) {
        this.props = { ...this.props, ...options };
        return this;
    }
    managedNodeGroup(...nodeGroups) {
        this.managedNodeGroups = this.managedNodeGroups.concat(nodeGroups);
        return this;
    }
    autoscalingGroup(...nodeGroups) {
        this.autoscalingNodeGroups = this.autoscalingNodeGroups.concat(nodeGroups);
        return this;
    }
    fargateProfile(name, options) {
        this.fargateProfiles[name] = options;
        return this;
    }
    build() {
        return new GenericClusterProvider({
            ...this.props,
            version: this.props.version,
            privateCluster: this.privateCluster,
            managedNodeGroups: this.managedNodeGroups,
            autoscalingNodeGroups: this.autoscalingNodeGroups,
            fargateProfiles: this.fargateProfiles
        });
    }
}
exports.ClusterBuilder = ClusterBuilder;
/**
 * Cluster provider implementation that supports multiple node groups.
 */
class GenericClusterProvider {
    constructor(props) {
        this.props = props;
        assert(!(props.managedNodeGroups && props.managedNodeGroups.length > 0
            && props.autoscalingNodeGroups && props.autoscalingNodeGroups.length > 0), "Mixing managed and autoscaling node groups is not supported. Please file a request on GitHub to add this support if needed.");
    }
    /**
     * @override
     */
    createCluster(scope, vpc) {
        var _a, _b, _c, _d, _e, _f;
        const id = scope.node.id;
        // Props for the cluster.
        const clusterName = (_a = this.props.clusterName) !== null && _a !== void 0 ? _a : id;
        const outputClusterName = true;
        const version = this.props.version;
        const privateCluster = (_b = this.props.privateCluster) !== null && _b !== void 0 ? _b : (0, utils_1.valueFromContext)(scope, constants.PRIVATE_CLUSTER, false);
        const endpointAccess = (privateCluster === true) ? eks.EndpointAccess.PRIVATE : eks.EndpointAccess.PUBLIC_AND_PRIVATE;
        const vpcSubnets = ((_c = this.props.vpcSubnets) !== null && _c !== void 0 ? _c : (privateCluster === true)) ? [{ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT }] : undefined;
        const defaultOptions = {
            vpc,
            clusterName,
            outputClusterName,
            version,
            vpcSubnets,
            endpointAccess,
            defaultCapacity: 0 // we want to manage capacity ourselves
        };
        const clusterOptions = { ...this.props, ...defaultOptions };
        // Create an EKS Cluster
        const cluster = this.internalCreateCluster(scope, id, clusterOptions);
        cluster.node.addDependency(vpc);
        const nodeGroups = [];
        (_d = this.props.managedNodeGroups) === null || _d === void 0 ? void 0 : _d.forEach(n => {
            const nodeGroup = this.addManagedNodeGroup(cluster, n);
            nodeGroups.push(nodeGroup);
        });
        const autoscalingGroups = [];
        (_e = this.props.autoscalingNodeGroups) === null || _e === void 0 ? void 0 : _e.forEach(n => {
            const autoscalingGroup = this.addAutoScalingGroup(cluster, n);
            autoscalingGroups.push(autoscalingGroup);
        });
        const fargateProfiles = Object.entries((_f = this.props.fargateProfiles) !== null && _f !== void 0 ? _f : {});
        fargateProfiles === null || fargateProfiles === void 0 ? void 0 : fargateProfiles.forEach(([key, options]) => this.addFargateProfile(cluster, key, options));
        return new spi_1.ClusterInfo(cluster, version, nodeGroups, autoscalingGroups);
    }
    /**
     * Template method that may be overridden by subclasses to create a specific cluster flavor (e.g. FargateCluster vs eks.Cluster)
     * @param scope
     * @param id
     * @param clusterOptions
     * @returns
     */
    internalCreateCluster(scope, id, clusterOptions) {
        return new eks.Cluster(scope, id, clusterOptions);
    }
    /**
     * Adds an autoscaling group to the cluster.
     * @param cluster
     * @param nodeGroup
     * @returns
     */
    addAutoScalingGroup(cluster, nodeGroup) {
        var _a, _b, _c, _d, _e, _f;
        const machineImageType = (_a = nodeGroup.machineImageType) !== null && _a !== void 0 ? _a : eks.MachineImageType.AMAZON_LINUX_2;
        const instanceType = (_b = nodeGroup.instanceType) !== null && _b !== void 0 ? _b : (0, utils_1.valueFromContext)(cluster, constants.INSTANCE_TYPE_KEY, constants.DEFAULT_INSTANCE_TYPE);
        const minSize = (_c = nodeGroup.minSize) !== null && _c !== void 0 ? _c : (0, utils_1.valueFromContext)(cluster, constants.MIN_SIZE_KEY, constants.DEFAULT_NG_MINSIZE);
        const maxSize = (_d = nodeGroup.maxSize) !== null && _d !== void 0 ? _d : (0, utils_1.valueFromContext)(cluster, constants.MAX_SIZE_KEY, constants.DEFAULT_NG_MAXSIZE);
        const desiredSize = (_e = nodeGroup.desiredSize) !== null && _e !== void 0 ? _e : (0, utils_1.valueFromContext)(cluster, constants.DESIRED_SIZE_KEY, minSize);
        const updatePolicy = (_f = nodeGroup.updatePolicy) !== null && _f !== void 0 ? _f : aws_autoscaling_1.UpdatePolicy.rollingUpdate();
        // Create an autoscaling group
        return cluster.addAutoScalingGroupCapacity(nodeGroup.id, {
            autoScalingGroupName: nodeGroup.id,
            machineImageType,
            instanceType,
            minCapacity: minSize,
            maxCapacity: maxSize,
            desiredCapacity: desiredSize,
            updatePolicy,
        });
    }
    /**
     * Adds a fargate profile to the cluster
     */
    addFargateProfile(cluster, name, profileOptions) {
        cluster.addFargateProfile(name, profileOptions);
    }
    /**
     * Adds a managed node group to the cluster.
     * @param cluster
     * @param nodeGroup
     * @returns
     */
    addManagedNodeGroup(cluster, nodeGroup) {
        var _a, _b, _c, _d, _e, _f;
        const amiType = nodeGroup.amiType;
        const capacityType = nodeGroup.nodeGroupCapacityType;
        const releaseVersion = nodeGroup.amiReleaseVersion;
        const instanceTypes = (_a = nodeGroup.instanceTypes) !== null && _a !== void 0 ? _a : [(0, utils_1.valueFromContext)(cluster, constants.INSTANCE_TYPE_KEY, constants.DEFAULT_INSTANCE_TYPE)];
        const minSize = (_b = nodeGroup.minSize) !== null && _b !== void 0 ? _b : (0, utils_1.valueFromContext)(cluster, constants.MIN_SIZE_KEY, constants.DEFAULT_NG_MINSIZE);
        const maxSize = (_c = nodeGroup.maxSize) !== null && _c !== void 0 ? _c : (0, utils_1.valueFromContext)(cluster, constants.MAX_SIZE_KEY, constants.DEFAULT_NG_MAXSIZE);
        const desiredSize = (_d = nodeGroup.desiredSize) !== null && _d !== void 0 ? _d : (0, utils_1.valueFromContext)(cluster, constants.DESIRED_SIZE_KEY, minSize);
        // Create a managed node group.
        const commonNodegroupProps = {
            nodegroupName: nodeGroup.id,
            capacityType,
            instanceTypes,
            minSize,
            maxSize,
            desiredSize
        };
        let nodegroupOptions;
        if (nodeGroup.customAmi) {
            // Create launch template if custom AMI is provided.
            const lt = new ec2.LaunchTemplate(cluster, `${nodeGroup.id}-lt`, {
                machineImage: (_e = nodeGroup.customAmi) === null || _e === void 0 ? void 0 : _e.machineImage,
                userData: (_f = nodeGroup.customAmi) === null || _f === void 0 ? void 0 : _f.userData,
            });
            nodegroupOptions = {
                ...commonNodegroupProps,
                launchTemplateSpec: {
                    id: lt.launchTemplateId,
                    version: lt.latestVersionNumber,
                },
            };
        }
        else {
            nodegroupOptions = {
                ...commonNodegroupProps,
                amiType,
                releaseVersion,
            };
        }
        return cluster.addNodegroupCapacity(nodeGroup.id + "-ng", nodegroupOptions);
    }
}
exports.GenericClusterProvider = GenericClusterProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpYy1jbHVzdGVyLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NsdXN0ZXItcHJvdmlkZXJzL2dlbmVyaWMtY2x1c3Rlci1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpRUFBMkQ7QUFDM0QsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUMzQyxpREFBcUc7QUFFckcsZ0NBQXNEO0FBQ3RELG9DQUE0QztBQUM1Qyx5Q0FBeUM7QUFFekMsaUNBQWtDO0FBR2xDLFNBQWdCLGNBQWM7SUFDMUIsT0FBTyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFGRCx3Q0FFQztBQStCWSxRQUFBLGNBQWMsR0FBRztJQUMxQixPQUFPLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUs7Q0FDdkMsQ0FBQztBQUVGLE1BQWEsY0FBYztJQVV2QjtRQVJRLFVBQUssR0FBeUMsRUFBRSxDQUFDO1FBQ2pELG1CQUFjLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLHNCQUFpQixHQUF1QixFQUFFLENBQUM7UUFDM0MsMEJBQXFCLEdBQTJCLEVBQUUsQ0FBQztRQUNuRCxvQkFBZSxHQUVuQixFQUFFLENBQUM7UUFHSCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxPQUFPLEVBQUUsMkJBQWlCLENBQUMsS0FBSyxFQUFDLEVBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQsaUJBQWlCLENBQUMsT0FBc0M7UUFDcEQsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLE9BQU8sRUFBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFHLFVBQThCO1FBQzlDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFB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O1FBRTVHLCtCQUErQjtRQUMvQixNQUFNLG9CQUFvQixHQUFrQztZQUN4RCxhQUFhLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDM0IsWUFBWTtZQUNaLGFBQWE7WUFDYixPQUFPO1lBQ1AsT0FBTztZQUNQLFdBQVc7U0FDZCxDQUFDO1FBRUYsSUFBSSxnQkFBc0MsQ0FBQztRQUMzQyxJQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUU7WUFDcEIsb0RBQW9EO1lBQ3BELE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUU7Z0JBQzdELFlBQVksRUFBRSxNQUFBLFNBQVMsQ0FBQyxTQUFTLDBDQUFFLFlBQVk7Z0JBQy9DLFFBQVEsRUFBRSxNQUFBLFNBQVMsQ0FBQyxTQUFTLDBDQUFFLFFBQVE7YUFDMUMsQ0FBQyxDQUFDO1lBQ0gsZ0JBQWdCLEdBQUc7Z0JBQ2YsR0FBRyxvQkFBb0I7Z0JBQ3ZCLGtCQUFrQixFQUFFO29CQUNoQixFQUFFLEVBQUUsRUFBRSxDQUFDLGdCQUFpQjtvQkFDeEIsT0FBTyxFQUFFLEVBQUUsQ0FBQyxtQkFBbUI7aUJBQ2xDO2FBQ0osQ0FBQztTQUNMO2FBQU07WUFDSCxnQkFBZ0IsR0FBRztnQkFDZixHQUFHLG9CQUFvQjtnQkFDdkIsT0FBTztnQkFDUCxjQUFjO2FBQ2pCLENBQUM7U0FDTDtRQUVELE9BQU8sT0FBTyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDaEYsQ0FBQztDQUNKO0FBdEpELHdEQXNKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGF1dG9zY2FsaW5nIGZyb20gJ2F3cy1jZGstbGliL2F3cy1hdXRvc2NhbGluZyc7XG5pbXBvcnQgeyBVcGRhdGVQb2xpY3kgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXV0b3NjYWxpbmcnO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBla3MgZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcbmltcG9ydCB7IENvbW1vbkNsdXN0ZXJPcHRpb25zLCBGYXJnYXRlUHJvZmlsZU9wdGlvbnMsIEt1YmVybmV0ZXNWZXJzaW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVrcyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8sIENsdXN0ZXJQcm92aWRlciB9IGZyb20gXCIuLi9zcGlcIjtcbmltcG9ydCB7IHZhbHVlRnJvbUNvbnRleHQgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCAqIGFzIGNvbnN0YW50cyBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBBdXRvc2NhbGluZ05vZGVHcm91cCwgTWFuYWdlZE5vZGVHcm91cCB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNsdXN0ZXJCdWlsZGVyKCkge1xuICAgIHJldHVybiBuZXcgQ2x1c3RlckJ1aWxkZXIoKTtcbn1cblxuLyoqXG4gKiBQcm9wZXJ0aWVzIGZvciB0aGUgZ2VuZXJpYyBjbHVzdGVyIHByb3ZpZGVyLCBjb250YWluaW5nIGRlZmluaXRpb25zIG9mIG1hbmFnZWQgbm9kZSBncm91cHMsIFxuICogYXV0by1zY2FsaW5nIGdyb3VwcywgZmFyZ2F0ZSBwcm9maWxlcy4gXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2VuZXJpY0NsdXN0ZXJQcm92aWRlclByb3BzIGV4dGVuZHMgZWtzLkNvbW1vbkNsdXN0ZXJPcHRpb25zIHtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgQVBJIHNlcnZlciBpcyBwcml2YXRlLlxuICAgICAqL1xuICAgIHByaXZhdGVDbHVzdGVyPzogYm9vbGVhbixcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIG1hbmFnZWQgbm9kZSBncm91cHMuXG4gICAgICovXG4gICAgbWFuYWdlZE5vZGVHcm91cHM/OiBNYW5hZ2VkTm9kZUdyb3VwW107XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBhdXRvc2NhbGluZyBub2RlIGdyb3Vwcy5cbiAgICAgKi9cbiAgICBhdXRvc2NhbGluZ05vZGVHcm91cHM/OiBBdXRvc2NhbGluZ05vZGVHcm91cFtdO1xuXG4gICAgLyoqXG4gICAgICogRmFyZ2F0ZSBwcm9maWxlc1xuICAgICAqL1xuICAgIGZhcmdhdGVQcm9maWxlcz86IHtcbiAgICAgICAgW2tleTogc3RyaW5nXTogZWtzLkZhcmdhdGVQcm9maWxlT3B0aW9ucztcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB2ZXJzaW9uOiBla3MuS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjFcbn07XG5cbmV4cG9ydCBjbGFzcyBDbHVzdGVyQnVpbGRlciB7XG5cbiAgICBwcml2YXRlIHByb3BzOiBQYXJ0aWFsPEdlbmVyaWNDbHVzdGVyUHJvdmlkZXJQcm9wcz4gPSB7fTtcbiAgICBwcml2YXRlIHByaXZhdGVDbHVzdGVyID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBtYW5hZ2VkTm9kZUdyb3VwczogTWFuYWdlZE5vZGVHcm91cFtdID0gW107XG4gICAgcHJpdmF0ZSBhdXRvc2NhbGluZ05vZGVHcm91cHM6IEF1dG9zY2FsaW5nTm9kZUdyb3VwW10gPSBbXTtcbiAgICBwcml2YXRlIGZhcmdhdGVQcm9maWxlczoge1xuICAgICAgICBba2V5OiBzdHJpbmddOiBla3MuRmFyZ2F0ZVByb2ZpbGVPcHRpb25zO1xuICAgIH0gPSB7fTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnByb3BzID0gey4uLnRoaXMucHJvcHMsIC4uLnt2ZXJzaW9uOiBLdWJlcm5ldGVzVmVyc2lvbi5WMV8yMX19O1xuICAgIH1cblxuICAgIHdpdGhDb21tb25PcHRpb25zKG9wdGlvbnM6IFBhcnRpYWw8Q29tbW9uQ2x1c3Rlck9wdGlvbnM+KTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7Li4udGhpcy5wcm9wcywgLi4ub3B0aW9uc307XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG1hbmFnZWROb2RlR3JvdXAoLi4ubm9kZUdyb3VwczogTWFuYWdlZE5vZGVHcm91cFtdKTogdGhpcyB7XG4gICAgICAgIHRoaXMubWFuYWdlZE5vZGVHcm91cHMgPSB0aGlzLm1hbmFnZWROb2RlR3JvdXBzLmNvbmNhdChub2RlR3JvdXBzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXV0b3NjYWxpbmdHcm91cCguLi5ub2RlR3JvdXBzOiBBdXRvc2NhbGluZ05vZGVHcm91cFtdKTogdGhpcyB7XG4gICAgICAgIHRoaXMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzID0gdGhpcy5hdXRvc2NhbGluZ05vZGVHcm91cHMuY29uY2F0KG5vZGVHcm91cHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmYXJnYXRlUHJvZmlsZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IEZhcmdhdGVQcm9maWxlT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICB0aGlzLmZhcmdhdGVQcm9maWxlc1tuYW1lXSA9IG9wdGlvbnM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGJ1aWxkKCkge1xuICAgICAgICByZXR1cm4gbmV3IEdlbmVyaWNDbHVzdGVyUHJvdmlkZXIoe1xuICAgICAgICAgICAgLi4udGhpcy5wcm9wcyxcbiAgICAgICAgICAgIHZlcnNpb246IHRoaXMucHJvcHMudmVyc2lvbiEsIFxuICAgICAgICAgICAgcHJpdmF0ZUNsdXN0ZXI6IHRoaXMucHJpdmF0ZUNsdXN0ZXIsXG4gICAgICAgICAgICBtYW5hZ2VkTm9kZUdyb3VwczogdGhpcy5tYW5hZ2VkTm9kZUdyb3VwcywgXG4gICAgICAgICAgICBhdXRvc2NhbGluZ05vZGVHcm91cHM6IHRoaXMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzLCBcbiAgICAgICAgICAgIGZhcmdhdGVQcm9maWxlczogdGhpcy5mYXJnYXRlUHJvZmlsZXNcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIENsdXN0ZXIgcHJvdmlkZXIgaW1wbGVtZW50YXRpb24gdGhhdCBzdXBwb3J0cyBtdWx0aXBsZSBub2RlIGdyb3Vwcy4gXG4gKi9cbmV4cG9ydCBjbGFzcyBHZW5lcmljQ2x1c3RlclByb3ZpZGVyIGltcGxlbWVudHMgQ2x1c3RlclByb3ZpZGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcHJvcHM6IEdlbmVyaWNDbHVzdGVyUHJvdmlkZXJQcm9wcykge1xuICAgICAgICBhc3NlcnQoIShwcm9wcy5tYW5hZ2VkTm9kZUdyb3VwcyAmJiBwcm9wcy5tYW5hZ2VkTm9kZUdyb3Vwcy5sZW5ndGggPiAwIFxuICAgICAgICAgICAgJiYgcHJvcHMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzICYmIHByb3BzLmF1dG9zY2FsaW5nTm9kZUdyb3Vwcy5sZW5ndGggPiAwKSxcbiAgICAgICAgICAgIFwiTWl4aW5nIG1hbmFnZWQgYW5kIGF1dG9zY2FsaW5nIG5vZGUgZ3JvdXBzIGlzIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSBmaWxlIGEgcmVxdWVzdCBvbiBHaXRIdWIgdG8gYWRkIHRoaXMgc3VwcG9ydCBpZiBuZWVkZWQuXCIpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBAb3ZlcnJpZGUgXG4gICAgICovXG4gICAgY3JlYXRlQ2x1c3RlcihzY29wZTogQ29uc3RydWN0LCB2cGM6IGVjMi5JVnBjKTogQ2x1c3RlckluZm8ge1xuICAgICAgICBjb25zdCBpZCA9IHNjb3BlLm5vZGUuaWQ7XG5cbiAgICAgICAgLy8gUHJvcHMgZm9yIHRoZSBjbHVzdGVyLlxuICAgICAgICBjb25zdCBjbHVzdGVyTmFtZSA9IHRoaXMucHJvcHMuY2x1c3Rlck5hbWUgPz8gaWQ7XG4gICAgICAgIGNvbnN0IG91dHB1dENsdXN0ZXJOYW1lID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IHRoaXMucHJvcHMudmVyc2lvbjtcbiAgICAgICAgY29uc3QgcHJpdmF0ZUNsdXN0ZXIgPSB0aGlzLnByb3BzLnByaXZhdGVDbHVzdGVyID8/IHZhbHVlRnJvbUNvbnRleHQoc2NvcGUsIGNvbnN0YW50cy5QUklWQVRFX0NMVVNURVIsIGZhbHNlKTtcbiAgICAgICAgY29uc3QgZW5kcG9pbnRBY2Nlc3MgPSAocHJpdmF0ZUNsdXN0ZXIgPT09IHRydWUpID8gZWtzLkVuZHBvaW50QWNjZXNzLlBSSVZBVEUgOiBla3MuRW5kcG9pbnRBY2Nlc3MuUFVCTElDX0FORF9QUklWQVRFO1xuICAgICAgICBjb25zdCB2cGNTdWJuZXRzID0gdGhpcy5wcm9wcy52cGNTdWJuZXRzID8/IChwcml2YXRlQ2x1c3RlciA9PT0gdHJ1ZSkgPyBbeyBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfTkFUIH1dIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgICAgICAgdnBjLFxuICAgICAgICAgICAgY2x1c3Rlck5hbWUsXG4gICAgICAgICAgICBvdXRwdXRDbHVzdGVyTmFtZSxcbiAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICB2cGNTdWJuZXRzLFxuICAgICAgICAgICAgZW5kcG9pbnRBY2Nlc3MsXG4gICAgICAgICAgICBkZWZhdWx0Q2FwYWNpdHk6IDAgLy8gd2Ugd2FudCB0byBtYW5hZ2UgY2FwYWNpdHkgb3Vyc2VsdmVzXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY2x1c3Rlck9wdGlvbnMgPSB7Li4udGhpcy5wcm9wcywgLi4uZGVmYXVsdE9wdGlvbnMgfTtcbiAgICAgICAgLy8gQ3JlYXRlIGFuIEVLUyBDbHVzdGVyXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSB0aGlzLmludGVybmFsQ3JlYXRlQ2x1c3RlcihzY29wZSwgaWQsIGNsdXN0ZXJPcHRpb25zKTtcbiAgICAgICAgY2x1c3Rlci5ub2RlLmFkZERlcGVuZGVuY3kodnBjKTtcblxuICAgICAgICBjb25zdCBub2RlR3JvdXBzOiBla3MuTm9kZWdyb3VwW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucHJvcHMubWFuYWdlZE5vZGVHcm91cHM/LmZvckVhY2goIG4gPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm9kZUdyb3VwID0gdGhpcy5hZGRNYW5hZ2VkTm9kZUdyb3VwKGNsdXN0ZXIsIG4pO1xuICAgICAgICAgICAgbm9kZUdyb3Vwcy5wdXNoKG5vZGVHcm91cCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGF1dG9zY2FsaW5nR3JvdXBzOiBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwW10gPSBbXTtcbiAgICAgICAgdGhpcy5wcm9wcy5hdXRvc2NhbGluZ05vZGVHcm91cHM/LmZvckVhY2goIG4gPT4ge1xuICAgICAgICAgICAgY29uc3QgYXV0b3NjYWxpbmdHcm91cCA9IHRoaXMuYWRkQXV0b1NjYWxpbmdHcm91cChjbHVzdGVyLCBuKTtcbiAgICAgICAgICAgIGF1dG9zY2FsaW5nR3JvdXBzLnB1c2goYXV0b3NjYWxpbmdHcm91cCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGZhcmdhdGVQcm9maWxlcyA9IE9iamVjdC5lbnRyaWVzKHRoaXMucHJvcHMuZmFyZ2F0ZVByb2ZpbGVzID8/IHt9KTtcbiAgICAgICAgZmFyZ2F0ZVByb2ZpbGVzPy5mb3JFYWNoKChba2V5LCBvcHRpb25zXSkgPT4gdGhpcy5hZGRGYXJnYXRlUHJvZmlsZShjbHVzdGVyLCBrZXksIG9wdGlvbnMpKTtcblxuICAgICAgICByZXR1cm4gbmV3IENsdXN0ZXJJbmZvKGNsdXN0ZXIsIHZlcnNpb24sIG5vZGVHcm91cHMsIGF1dG9zY2FsaW5nR3JvdXBzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUZW1wbGF0ZSBtZXRob2QgdGhhdCBtYXkgYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzIHRvIGNyZWF0ZSBhIHNwZWNpZmljIGNsdXN0ZXIgZmxhdm9yIChlLmcuIEZhcmdhdGVDbHVzdGVyIHZzIGVrcy5DbHVzdGVyKVxuICAgICAqIEBwYXJhbSBzY29wZSBcbiAgICAgKiBAcGFyYW0gaWQgXG4gICAgICogQHBhcmFtIGNsdXN0ZXJPcHRpb25zIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpbnRlcm5hbENyZWF0ZUNsdXN0ZXIoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgY2x1c3Rlck9wdGlvbnM6IGFueSkgOiBla3MuQ2x1c3RlciB7XG4gICAgICAgIHJldHVybiBuZXcgZWtzLkNsdXN0ZXIoc2NvcGUsIGlkLCBjbHVzdGVyT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBhdXRvc2NhbGluZyBncm91cCB0byB0aGUgY2x1c3Rlci5cbiAgICAgKiBAcGFyYW0gY2x1c3RlciBcbiAgICAgKiBAcGFyYW0gbm9kZUdyb3VwIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGFkZEF1dG9TY2FsaW5nR3JvdXAoY2x1c3RlcjogZWtzLkNsdXN0ZXIsIG5vZGVHcm91cDogQXV0b3NjYWxpbmdOb2RlR3JvdXApOiBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwIHtcbiAgICAgICAgY29uc3QgbWFjaGluZUltYWdlVHlwZSA9IG5vZGVHcm91cC5tYWNoaW5lSW1hZ2VUeXBlID8/IGVrcy5NYWNoaW5lSW1hZ2VUeXBlLkFNQVpPTl9MSU5VWF8yO1xuICAgICAgICBjb25zdCBpbnN0YW5jZVR5cGUgPSBub2RlR3JvdXAuaW5zdGFuY2VUeXBlID8/IHZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLklOU1RBTkNFX1RZUEVfS0VZLCBjb25zdGFudHMuREVGQVVMVF9JTlNUQU5DRV9UWVBFKTtcbiAgICAgICAgY29uc3QgbWluU2l6ZSA9IG5vZGVHcm91cC5taW5TaXplID8/IHZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLk1JTl9TSVpFX0tFWSwgY29uc3RhbnRzLkRFRkFVTFRfTkdfTUlOU0laRSk7XG4gICAgICAgIGNvbnN0IG1heFNpemUgPSBub2RlR3JvdXAubWF4U2l6ZSA/PyB2YWx1ZUZyb21Db250ZXh0KGNsdXN0ZXIsIGNvbnN0YW50cy5NQVhfU0laRV9LRVksIGNvbnN0YW50cy5ERUZBVUxUX05HX01BWFNJWkUpO1xuICAgICAgICBjb25zdCBkZXNpcmVkU2l6ZSA9IG5vZGVHcm91cC5kZXNpcmVkU2l6ZSA/PyB2YWx1ZUZyb21Db250ZXh0KGNsdXN0ZXIsIGNvbnN0YW50cy5ERVNJUkVEX1NJWkVfS0VZLCBtaW5TaXplKTtcbiAgICAgICAgY29uc3QgdXBkYXRlUG9saWN5ID0gbm9kZUdyb3VwLnVwZGF0ZVBvbGljeSA/PyBVcGRhdGVQb2xpY3kucm9sbGluZ1VwZGF0ZSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhdXRvc2NhbGluZyBncm91cFxuICAgICAgICByZXR1cm4gY2x1c3Rlci5hZGRBdXRvU2NhbGluZ0dyb3VwQ2FwYWNpdHkobm9kZUdyb3VwLmlkLCB7XG4gICAgICAgICAgICBhdXRvU2NhbGluZ0dyb3VwTmFtZTogbm9kZUdyb3VwLmlkLFxuICAgICAgICAgICAgbWFjaGluZUltYWdlVHlwZSxcbiAgICAgICAgICAgIGluc3RhbmNlVHlwZSxcbiAgICAgICAgICAgIG1pbkNhcGFjaXR5OiBtaW5TaXplLFxuICAgICAgICAgICAgbWF4Q2FwYWNpdHk6IG1heFNpemUsXG4gICAgICAgICAgICBkZXNpcmVkQ2FwYWNpdHk6IGRlc2lyZWRTaXplLFxuICAgICAgICAgICAgdXBkYXRlUG9saWN5LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgZmFyZ2F0ZSBwcm9maWxlIHRvIHRoZSBjbHVzdGVyXG4gICAgICovXG4gICAgYWRkRmFyZ2F0ZVByb2ZpbGUoY2x1c3RlcjogZWtzLkNsdXN0ZXIsIG5hbWU6IHN0cmluZywgcHJvZmlsZU9wdGlvbnM6IGVrcy5GYXJnYXRlUHJvZmlsZU9wdGlvbnMpIHtcbiAgICAgICAgY2x1c3Rlci5hZGRGYXJnYXRlUHJvZmlsZShuYW1lLCBwcm9maWxlT3B0aW9ucyk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbWFuYWdlZCBub2RlIGdyb3VwIHRvIHRoZSBjbHVzdGVyLlxuICAgICAqIEBwYXJhbSBjbHVzdGVyIFxuICAgICAqIEBwYXJhbSBub2RlR3JvdXAgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgYWRkTWFuYWdlZE5vZGVHcm91cChjbHVzdGVyOiBla3MuQ2x1c3Rlciwgbm9kZUdyb3VwOiBNYW5hZ2VkTm9kZUdyb3VwKSA6IGVrcy5Ob2RlZ3JvdXAge1xuICAgICAgICBjb25zdCBhbWlUeXBlID0gbm9kZUdyb3VwLmFtaVR5cGU7XG4gICAgICAgIGNvbnN0IGNhcGFjaXR5VHlwZSA9IG5vZGVHcm91cC5ub2RlR3JvdXBDYXBhY2l0eVR5cGU7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VWZXJzaW9uID0gbm9kZUdyb3VwLmFtaVJlbGVhc2VWZXJzaW9uO1xuICAgICAgICBjb25zdCBpbnN0YW5jZVR5cGVzID0gbm9kZUdyb3VwLmluc3RhbmNlVHlwZXMgPz8gW3ZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLklOU1RBTkNFX1RZUEVfS0VZLCBjb25zdGFudHMuREVGQVVMVF9JTlNUQU5DRV9UWVBFKV07XG4gICAgICAgIGNvbnN0IG1pblNpemUgPSBub2RlR3JvdXAubWluU2l6ZSA/PyB2YWx1ZUZyb21Db250ZXh0KGNsdXN0ZXIsIGNvbnN0YW50cy5NSU5fU0laRV9LRVksIGNvbnN0YW50cy5ERUZBVUxUX05HX01JTlNJWkUpO1xuICAgICAgICBjb25zdCBtYXhTaXplID0gbm9kZUdyb3VwLm1heFNpemUgPz8gdmFsdWVGcm9tQ29udGV4dChjbHVzdGVyLCBjb25zdGFudHMuTUFYX1NJWkVfS0VZLCBjb25zdGFudHMuREVGQVVMVF9OR19NQVhTSVpFKTtcbiAgICAgICAgY29uc3QgZGVzaXJlZFNpemUgPSBub2RlR3JvdXAuZGVzaXJlZFNpemUgPz8gdmFsdWVGcm9tQ29udGV4dChjbHVzdGVyLCBjb25zdGFudHMuREVTSVJFRF9TSVpFX0tFWSwgbWluU2l6ZSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFuYWdlZCBub2RlIGdyb3VwLlxuICAgICAgICBjb25zdCBjb21tb25Ob2RlZ3JvdXBQcm9wczogUGFydGlhbDxla3MuTm9kZWdyb3VwT3B0aW9ucz4gPSB7XG4gICAgICAgICAgICBub2RlZ3JvdXBOYW1lOiBub2RlR3JvdXAuaWQsXG4gICAgICAgICAgICBjYXBhY2l0eVR5cGUsXG4gICAgICAgICAgICBpbnN0YW5jZVR5cGVzLFxuICAgICAgICAgICAgbWluU2l6ZSxcbiAgICAgICAgICAgIG1heFNpemUsXG4gICAgICAgICAgICBkZXNpcmVkU2l6ZVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBub2RlZ3JvdXBPcHRpb25zOiBla3MuTm9kZWdyb3VwT3B0aW9ucztcbiAgICAgICAgaWYobm9kZUdyb3VwLmN1c3RvbUFtaSkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGxhdW5jaCB0ZW1wbGF0ZSBpZiBjdXN0b20gQU1JIGlzIHByb3ZpZGVkLlxuICAgICAgICAgICAgY29uc3QgbHQgPSBuZXcgZWMyLkxhdW5jaFRlbXBsYXRlKGNsdXN0ZXIsIGAke25vZGVHcm91cC5pZH0tbHRgLCB7XG4gICAgICAgICAgICAgICAgbWFjaGluZUltYWdlOiBub2RlR3JvdXAuY3VzdG9tQW1pPy5tYWNoaW5lSW1hZ2UsXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IG5vZGVHcm91cC5jdXN0b21BbWk/LnVzZXJEYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBub2RlZ3JvdXBPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIC4uLmNvbW1vbk5vZGVncm91cFByb3BzLFxuICAgICAgICAgICAgICAgIGxhdW5jaFRlbXBsYXRlU3BlYzoge1xuICAgICAgICAgICAgICAgICAgICBpZDogbHQubGF1bmNoVGVtcGxhdGVJZCEsXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246IGx0LmxhdGVzdFZlcnNpb25OdW1iZXIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlZ3JvdXBPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIC4uLmNvbW1vbk5vZGVncm91cFByb3BzLFxuICAgICAgICAgICAgICAgIGFtaVR5cGUsXG4gICAgICAgICAgICAgICAgcmVsZWFzZVZlcnNpb24sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNsdXN0ZXIuYWRkTm9kZWdyb3VwQ2FwYWNpdHkobm9kZUdyb3VwLmlkICsgXCItbmdcIiwgbm9kZWdyb3VwT3B0aW9ucyk7XG4gICAgfVxufSJdfQ==