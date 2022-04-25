"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XrayAddOn = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const cluster_providers_1 = require("../../cluster-providers");
const utils_1 = require("../../utils");
/**
 * Implementation of AWS X-Ray add-on for EKS Blueprints. Installs xray daemonset and exposes
 * an internal ClusterIP service for tracing on port 2000 (UDP).
 */
class XrayAddOn {
    deploy(clusterInfo) {
        const cluster = clusterInfo.cluster;
        (0, cluster_providers_1.assertEC2NodeGroup)(clusterInfo, "X-Ray Addon");
        // Setup managed policy.
        const opts = { name: 'xray-account', namespace: "xray-system" };
        const sa = cluster.addServiceAccount('xray-account', opts);
        // Cloud Map Full Access policy.
        const cloudMapPolicy = aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess");
        sa.role.addManagedPolicy(cloudMapPolicy);
        // X-Ray Namespace
        const namespace = (0, utils_1.createNamespace)('xray-system', cluster);
        sa.node.addDependency(namespace);
        // Apply manifest
        const doc = (0, utils_1.readYamlDocument)(__dirname + '/xray-ds.yaml');
        const docArray = doc.replace(/{{cluster_name}}/g, cluster.clusterName).replace(/{{region_name}}/g, cluster.stack.region);
        const manifest = docArray.split("---").map(e => (0, utils_1.loadYaml)(e));
        const statement = new aws_eks_1.KubernetesManifest(cluster.stack, "xray-daemon", {
            cluster,
            manifest,
            overwrite: true
        });
        statement.node.addDependency(sa);
    }
}
exports.XrayAddOn = XrayAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3hyYXkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaURBQXlEO0FBQ3pELGlEQUFvRDtBQUVwRCwrREFBNkQ7QUFFN0QsdUNBQTBFO0FBRTFFOzs7R0FHRztBQUNILE1BQWEsU0FBUztJQUVsQixNQUFNLENBQUMsV0FBd0I7UUFDM0IsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNwQyxJQUFBLHNDQUFrQixFQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUUvQyx3QkFBd0I7UUFDeEIsTUFBTSxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsQ0FBQztRQUNoRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNELGdDQUFnQztRQUNoQyxNQUFNLGNBQWMsR0FBRyx1QkFBYSxDQUFDLHdCQUF3QixDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDMUYsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV6QyxrQkFBa0I7UUFDbEIsTUFBTSxTQUFTLEdBQUcsSUFBQSx1QkFBZSxFQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxRCxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVqQyxpQkFBaUI7UUFDakIsTUFBTSxHQUFHLEdBQUcsSUFBQSx3QkFBZ0IsRUFBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLENBQUM7UUFDMUQsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekgsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLGdCQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RCxNQUFNLFNBQVMsR0FBRyxJQUFJLDRCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFO1lBQ25FLE9BQU87WUFDUCxRQUFRO1lBQ1IsU0FBUyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFDO1FBQ0gsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQztDQUNKO0FBN0JELDhCQTZCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEt1YmVybmV0ZXNNYW5pZmVzdCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBNYW5hZ2VkUG9saWN5IH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcblxuaW1wb3J0IHsgYXNzZXJ0RUMyTm9kZUdyb3VwIH0gZnJvbSBcIi4uLy4uL2NsdXN0ZXItcHJvdmlkZXJzXCI7XG5pbXBvcnQgeyBDbHVzdGVyQWRkT24sIENsdXN0ZXJJbmZvIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHsgbG9hZFlhbWwsIHJlYWRZYW1sRG9jdW1lbnQsIGNyZWF0ZU5hbWVzcGFjZSB9IGZyb20gXCIuLi8uLi91dGlsc1wiO1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIEFXUyBYLVJheSBhZGQtb24gZm9yIEVLUyBCbHVlcHJpbnRzLiBJbnN0YWxscyB4cmF5IGRhZW1vbnNldCBhbmQgZXhwb3NlcyBcbiAqIGFuIGludGVybmFsIENsdXN0ZXJJUCBzZXJ2aWNlIGZvciB0cmFjaW5nIG9uIHBvcnQgMjAwMCAoVURQKS5cbiAqL1xuZXhwb3J0IGNsYXNzIFhyYXlBZGRPbiBpbXBsZW1lbnRzIENsdXN0ZXJBZGRPbiB7XG5cbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBhc3NlcnRFQzJOb2RlR3JvdXAoY2x1c3RlckluZm8sIFwiWC1SYXkgQWRkb25cIik7XG5cbiAgICAgICAgLy8gU2V0dXAgbWFuYWdlZCBwb2xpY3kuXG4gICAgICAgIGNvbnN0IG9wdHMgPSB7IG5hbWU6ICd4cmF5LWFjY291bnQnLCBuYW1lc3BhY2U6IFwieHJheS1zeXN0ZW1cIiB9O1xuICAgICAgICBjb25zdCBzYSA9IGNsdXN0ZXIuYWRkU2VydmljZUFjY291bnQoJ3hyYXktYWNjb3VudCcsIG9wdHMpO1xuXG4gICAgICAgIC8vIENsb3VkIE1hcCBGdWxsIEFjY2VzcyBwb2xpY3kuXG4gICAgICAgIGNvbnN0IGNsb3VkTWFwUG9saWN5ID0gTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NYUmF5RGFlbW9uV3JpdGVBY2Nlc3NcIik7XG4gICAgICAgIHNhLnJvbGUuYWRkTWFuYWdlZFBvbGljeShjbG91ZE1hcFBvbGljeSk7XG5cbiAgICAgICAgLy8gWC1SYXkgTmFtZXNwYWNlXG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZSA9IGNyZWF0ZU5hbWVzcGFjZSgneHJheS1zeXN0ZW0nLCBjbHVzdGVyKTtcbiAgICAgICAgc2Eubm9kZS5hZGREZXBlbmRlbmN5KG5hbWVzcGFjZSk7XG5cbiAgICAgICAgLy8gQXBwbHkgbWFuaWZlc3RcbiAgICAgICAgY29uc3QgZG9jID0gcmVhZFlhbWxEb2N1bWVudChfX2Rpcm5hbWUgKyAnL3hyYXktZHMueWFtbCcpO1xuICAgICAgICBjb25zdCBkb2NBcnJheSA9IGRvYy5yZXBsYWNlKC97e2NsdXN0ZXJfbmFtZX19L2csIGNsdXN0ZXIuY2x1c3Rlck5hbWUpLnJlcGxhY2UoL3t7cmVnaW9uX25hbWV9fS9nLCBjbHVzdGVyLnN0YWNrLnJlZ2lvbik7XG4gICAgICAgIGNvbnN0IG1hbmlmZXN0ID0gZG9jQXJyYXkuc3BsaXQoXCItLS1cIikubWFwKGUgPT4gbG9hZFlhbWwoZSkpO1xuICAgICAgICBjb25zdCBzdGF0ZW1lbnQgPSBuZXcgS3ViZXJuZXRlc01hbmlmZXN0KGNsdXN0ZXIuc3RhY2ssIFwieHJheS1kYWVtb25cIiwge1xuICAgICAgICAgICAgY2x1c3RlcixcbiAgICAgICAgICAgIG1hbmlmZXN0LFxuICAgICAgICAgICAgb3ZlcndyaXRlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBzdGF0ZW1lbnQubm9kZS5hZGREZXBlbmRlbmN5KHNhKTtcbiAgICB9XG59Il19