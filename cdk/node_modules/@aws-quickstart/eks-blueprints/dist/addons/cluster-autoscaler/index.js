"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterAutoScalerAddOn = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const iam = require("aws-cdk-lib/aws-iam");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const console_1 = require("console");
const cluster_providers_1 = require("../../cluster-providers");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    chart: 'cluster-autoscaler',
    name: 'cluster-autoscaler',
    namespace: 'kube-system',
    release: 'blueprints-addon-cluster-autoscaler',
    repository: 'https://kubernetes.github.io/autoscaler',
    version: 'auto'
};
/**
 * Version of the autoscaler, controls the image tag
 */
const versionMap = new Map([
    [aws_eks_1.KubernetesVersion.V1_22, "9.11.0"],
    [aws_eks_1.KubernetesVersion.V1_21, "9.10.8"],
    [aws_eks_1.KubernetesVersion.V1_20, "9.9.2"],
    [aws_eks_1.KubernetesVersion.V1_19, "9.4.0"],
    [aws_eks_1.KubernetesVersion.V1_18, "9.4.0"],
]);
class ClusterAutoScalerAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a, _b, _c;
        if (((_a = this.options.version) === null || _a === void 0 ? void 0 : _a.trim()) === 'auto') {
            this.options.version = versionMap.get(clusterInfo.version);
            (0, console_1.assert)(this.options.version, (_c = "Unable to auto-detect cluster autoscaler version. Applying latest. Provided EKS cluster version: "
                + ((_b = clusterInfo.version) === null || _b === void 0 ? void 0 : _b.version)) !== null && _c !== void 0 ? _c : clusterInfo.version);
        }
        const cluster = clusterInfo.cluster;
        const nodeGroups = (0, cluster_providers_1.assertEC2NodeGroup)(clusterInfo, "Cluster Autoscaler");
        const autoscalerStmt = new iam.PolicyStatement();
        autoscalerStmt.addResources("*");
        autoscalerStmt.addActions("autoscaling:DescribeAutoScalingGroups", "autoscaling:DescribeAutoScalingInstances", "autoscaling:DescribeLaunchConfigurations", "autoscaling:DescribeTags", "autoscaling:SetDesiredCapacity", "autoscaling:TerminateInstanceInAutoScalingGroup", "ec2:DescribeInstanceTypes", "ec2:DescribeLaunchTemplateVersions");
        const autoscalerPolicy = new iam.Policy(cluster.stack, "cluster-autoscaler-policy", {
            policyName: "ClusterAutoscalerPolicy",
            statements: [autoscalerStmt],
        });
        const clusterName = new aws_cdk_lib_1.CfnJson(cluster.stack, "clusterName", {
            value: cluster.clusterName,
        });
        for (let ng of nodeGroups) {
            autoscalerPolicy.attachToRole(ng.role);
            aws_cdk_lib_1.Tags.of(ng).add(`k8s.io/cluster-autoscaler/${clusterName}`, "owned", { applyToLaunchedInstances: true });
            aws_cdk_lib_1.Tags.of(ng).add("k8s.io/cluster-autoscaler/enabled", "true", { applyToLaunchedInstances: true });
        }
        const clusterAutoscalerChart = this.addHelmChart(clusterInfo, {
            cloudProvider: 'aws',
            autoDiscovery: {
                clusterName: cluster.clusterName
            },
            awsRegion: clusterInfo.cluster.stack.region
        });
        return Promise.resolve(clusterAutoscalerChart);
    }
}
__decorate([
    (0, utils_1.conflictsWith)('KarpenterAddOn')
], ClusterAutoScalerAddOn.prototype, "deploy", null);
exports.ClusterAutoScalerAddOn = ClusterAutoScalerAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2NsdXN0ZXItYXV0b3NjYWxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxpREFBd0Q7QUFDeEQsMkNBQTJDO0FBQzNDLDZDQUE0QztBQUU1QyxxQ0FBaUM7QUFDakMsK0RBQTZEO0FBRTdELHVDQUE0QztBQUM1Qyw4Q0FBOEQ7QUFhOUQ7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBRztJQUNqQixLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLElBQUksRUFBRSxvQkFBb0I7SUFDMUIsU0FBUyxFQUFFLGFBQWE7SUFDeEIsT0FBTyxFQUFFLHFDQUFxQztJQUM5QyxVQUFVLEVBQUUseUNBQXlDO0lBQ3JELE9BQU8sRUFBRSxNQUFNO0NBQ2xCLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDO0lBQ3ZCLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztJQUNuQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7SUFDbkMsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO0lBQ2xDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQztJQUNsQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7Q0FDckMsQ0FBQyxDQUFDO0FBRUgsTUFBYSxzQkFBdUIsU0FBUSxzQkFBUztJQUlqRCxZQUFZLEtBQW1DO1FBQzNDLEtBQUssQ0FBQyxFQUFFLEdBQUcsWUFBWSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDOUIsQ0FBQztJQUdELE1BQU0sQ0FBQyxXQUF3Qjs7UUFFM0IsSUFBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLDBDQUFFLElBQUksRUFBRSxNQUFLLE1BQU0sRUFBRTtZQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxJQUFBLGdCQUFNLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBQSxtR0FBbUc7bUJBQzFILE1BQUEsV0FBVyxDQUFDLE9BQU8sMENBQUUsT0FBTyxDQUFBLG1DQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM5RDtRQUVELE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEMsTUFBTSxVQUFVLEdBQUcsSUFBQSxzQ0FBa0IsRUFBQyxXQUFXLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUN6RSxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUVqRCxjQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLGNBQWMsQ0FBQyxVQUFVLENBQ3JCLHVDQUF1QyxFQUN2QywwQ0FBMEMsRUFDMUMsMENBQTBDLEVBQzFDLDBCQUEwQixFQUMxQixnQ0FBZ0MsRUFDaEMsaURBQWlELEVBQ2pELDJCQUEyQixFQUMzQixvQ0FBb0MsQ0FDdkMsQ0FBQztRQUNGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsMkJBQTJCLEVBQUU7WUFDaEYsVUFBVSxFQUFFLHlCQUF5QjtZQUNyQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUM7U0FDL0IsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxXQUFXLEdBQUcsSUFBSSxxQkFBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFO1lBQzFELEtBQUssRUFBRSxPQUFPLENBQUMsV0FBVztTQUM3QixDQUFDLENBQUM7UUFFSCxLQUFJLElBQUksRUFBRSxJQUFJLFVBQVUsRUFBRTtZQUN0QixnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLGtCQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsV0FBVyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN6RyxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEVBQUUsTUFBTSxFQUFFLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNwRztRQUVELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7WUFDMUQsYUFBYSxFQUFFLEtBQUs7WUFDcEIsYUFBYSxFQUFFO2dCQUNYLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVzthQUNuQztZQUNELFNBQVMsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNO1NBQzlDLENBQUMsQ0FBQztRQUVILE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FDSjtBQS9DRztJQURDLElBQUEscUJBQWEsRUFBQyxnQkFBZ0IsQ0FBQztvREErQy9CO0FBeERMLHdEQXlEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEt1YmVybmV0ZXNWZXJzaW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHsgQ2ZuSnNvbiwgVGFncyB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJjb25zb2xlXCI7XG5pbXBvcnQgeyBhc3NlcnRFQzJOb2RlR3JvdXAgfSBmcm9tIFwiLi4vLi4vY2x1c3Rlci1wcm92aWRlcnNcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHsgY29uZmxpY3RzV2l0aCB9IGZyb20gXCIuLi8uLi91dGlsc1wiO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGFkZC1vbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbHVzdGVyQXV0b1NjYWxlckFkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIFZlcnNpb24gb2YgdGhlIENsdXN0ZXIgQXV0b3NjYWxlclxuICAgICAqIEBkZWZhdWx0IGF1dG8gZGlzY292ZXJlZCBiYXNlZCBvbiBFS1MgdmVyc2lvbi5cbiAgICAgKi9cbiAgICB2ZXJzaW9uPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIERlZmF1bHRzIG9wdGlvbnMgZm9yIHRoZSBhZGQtb25cbiAqL1xuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAgIGNoYXJ0OiAnY2x1c3Rlci1hdXRvc2NhbGVyJyxcbiAgICBuYW1lOiAnY2x1c3Rlci1hdXRvc2NhbGVyJyxcbiAgICBuYW1lc3BhY2U6ICdrdWJlLXN5c3RlbScsXG4gICAgcmVsZWFzZTogJ2JsdWVwcmludHMtYWRkb24tY2x1c3Rlci1hdXRvc2NhbGVyJyxcbiAgICByZXBvc2l0b3J5OiAnaHR0cHM6Ly9rdWJlcm5ldGVzLmdpdGh1Yi5pby9hdXRvc2NhbGVyJyxcbiAgICB2ZXJzaW9uOiAnYXV0bydcbn07XG5cbi8qKlxuICogVmVyc2lvbiBvZiB0aGUgYXV0b3NjYWxlciwgY29udHJvbHMgdGhlIGltYWdlIHRhZ1xuICovXG5jb25zdCB2ZXJzaW9uTWFwID0gbmV3IE1hcChbXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzIyLCBcIjkuMTEuMFwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjEsIFwiOS4xMC44XCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yMCwgXCI5LjkuMlwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMTksIFwiOS40LjBcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzE4LCBcIjkuNC4wXCJdLFxuXSk7XG5cbmV4cG9ydCBjbGFzcyBDbHVzdGVyQXV0b1NjYWxlckFkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcblxuICAgIHByaXZhdGUgb3B0aW9uczogQ2x1c3RlckF1dG9TY2FsZXJBZGRPblByb3BzO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBDbHVzdGVyQXV0b1NjYWxlckFkZE9uUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoeyAuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzO1xuICAgIH1cbiAgICBcbiAgICBAY29uZmxpY3RzV2l0aCgnS2FycGVudGVyQWRkT24nKVxuICAgIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy52ZXJzaW9uPy50cmltKCkgPT09ICdhdXRvJykge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnZlcnNpb24gPSB2ZXJzaW9uTWFwLmdldChjbHVzdGVySW5mby52ZXJzaW9uKTtcbiAgICAgICAgICAgIGFzc2VydCh0aGlzLm9wdGlvbnMudmVyc2lvbiwgXCJVbmFibGUgdG8gYXV0by1kZXRlY3QgY2x1c3RlciBhdXRvc2NhbGVyIHZlcnNpb24uIEFwcGx5aW5nIGxhdGVzdC4gUHJvdmlkZWQgRUtTIGNsdXN0ZXIgdmVyc2lvbjogXCIgXG4gICAgICAgICAgICAgICAgKyBjbHVzdGVySW5mby52ZXJzaW9uPy52ZXJzaW9uID8/IGNsdXN0ZXJJbmZvLnZlcnNpb24pO1xuICAgICAgICB9IFxuXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBjb25zdCBub2RlR3JvdXBzID0gYXNzZXJ0RUMyTm9kZUdyb3VwKGNsdXN0ZXJJbmZvLCBcIkNsdXN0ZXIgQXV0b3NjYWxlclwiKTtcbiAgICAgICAgY29uc3QgYXV0b3NjYWxlclN0bXQgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCgpO1xuXG4gICAgICAgIGF1dG9zY2FsZXJTdG10LmFkZFJlc291cmNlcyhcIipcIik7XG4gICAgICAgIGF1dG9zY2FsZXJTdG10LmFkZEFjdGlvbnMoXG4gICAgICAgICAgICBcImF1dG9zY2FsaW5nOkRlc2NyaWJlQXV0b1NjYWxpbmdHcm91cHNcIixcbiAgICAgICAgICAgIFwiYXV0b3NjYWxpbmc6RGVzY3JpYmVBdXRvU2NhbGluZ0luc3RhbmNlc1wiLFxuICAgICAgICAgICAgXCJhdXRvc2NhbGluZzpEZXNjcmliZUxhdW5jaENvbmZpZ3VyYXRpb25zXCIsXG4gICAgICAgICAgICBcImF1dG9zY2FsaW5nOkRlc2NyaWJlVGFnc1wiLFxuICAgICAgICAgICAgXCJhdXRvc2NhbGluZzpTZXREZXNpcmVkQ2FwYWNpdHlcIixcbiAgICAgICAgICAgIFwiYXV0b3NjYWxpbmc6VGVybWluYXRlSW5zdGFuY2VJbkF1dG9TY2FsaW5nR3JvdXBcIixcbiAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlSW5zdGFuY2VUeXBlc1wiLFxuICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVMYXVuY2hUZW1wbGF0ZVZlcnNpb25zXCJcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYXV0b3NjYWxlclBvbGljeSA9IG5ldyBpYW0uUG9saWN5KGNsdXN0ZXIuc3RhY2ssIFwiY2x1c3Rlci1hdXRvc2NhbGVyLXBvbGljeVwiLCB7XG4gICAgICAgICAgICBwb2xpY3lOYW1lOiBcIkNsdXN0ZXJBdXRvc2NhbGVyUG9saWN5XCIsXG4gICAgICAgICAgICBzdGF0ZW1lbnRzOiBbYXV0b3NjYWxlclN0bXRdLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgY2x1c3Rlck5hbWUgPSBuZXcgQ2ZuSnNvbihjbHVzdGVyLnN0YWNrLCBcImNsdXN0ZXJOYW1lXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiBjbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvcihsZXQgbmcgb2Ygbm9kZUdyb3Vwcykge1xuICAgICAgICAgICAgYXV0b3NjYWxlclBvbGljeS5hdHRhY2hUb1JvbGUobmcucm9sZSk7XG4gICAgICAgICAgICBUYWdzLm9mKG5nKS5hZGQoYGs4cy5pby9jbHVzdGVyLWF1dG9zY2FsZXIvJHtjbHVzdGVyTmFtZX1gLCBcIm93bmVkXCIsIHsgYXBwbHlUb0xhdW5jaGVkSW5zdGFuY2VzOiB0cnVlIH0pO1xuICAgICAgICAgICAgVGFncy5vZihuZykuYWRkKFwiazhzLmlvL2NsdXN0ZXItYXV0b3NjYWxlci9lbmFibGVkXCIsIFwidHJ1ZVwiLCB7IGFwcGx5VG9MYXVuY2hlZEluc3RhbmNlczogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsdXN0ZXJBdXRvc2NhbGVyQ2hhcnQgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywge1xuICAgICAgICAgICAgY2xvdWRQcm92aWRlcjogJ2F3cycsXG4gICAgICAgICAgICBhdXRvRGlzY292ZXJ5OiB7XG4gICAgICAgICAgICAgICAgY2x1c3Rlck5hbWU6IGNsdXN0ZXIuY2x1c3Rlck5hbWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhd3NSZWdpb246IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2sucmVnaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2x1c3RlckF1dG9zY2FsZXJDaGFydCk7XG4gICAgfVxufSJdfQ==