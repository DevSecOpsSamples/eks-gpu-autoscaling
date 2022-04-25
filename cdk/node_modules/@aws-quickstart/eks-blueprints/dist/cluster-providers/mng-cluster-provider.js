"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertEC2NodeGroup = exports.MngClusterProvider = void 0;
const generic_cluster_provider_1 = require("./generic-cluster-provider");
/**
 * MngClusterProvider provisions an EKS cluster with a managed node group for managed capacity.
 */
class MngClusterProvider extends generic_cluster_provider_1.GenericClusterProvider {
    constructor(props) {
        var _a, _b;
        super({ ...generic_cluster_provider_1.defaultOptions, ...props, ...{
                managedNodeGroups: [{
                        id: (_b = (_a = props === null || props === void 0 ? void 0 : props.id) !== null && _a !== void 0 ? _a : props === null || props === void 0 ? void 0 : props.clusterName) !== null && _b !== void 0 ? _b : "eks-blueprints-mng",
                        amiReleaseVersion: props === null || props === void 0 ? void 0 : props.amiReleaseVersion,
                        customAmi: props === null || props === void 0 ? void 0 : props.customAmi,
                        amiType: props === null || props === void 0 ? void 0 : props.amiType,
                        desiredSize: props === null || props === void 0 ? void 0 : props.desiredSize,
                        instanceTypes: props === null || props === void 0 ? void 0 : props.instanceTypes,
                        maxSize: props === null || props === void 0 ? void 0 : props.maxSize,
                        minSize: props === null || props === void 0 ? void 0 : props.minSize,
                        nodeGroupCapacityType: props === null || props === void 0 ? void 0 : props.nodeGroupCapacityType,
                        vpcSubnets: props === null || props === void 0 ? void 0 : props.vpcSubnets,
                    }]
            } });
    }
}
exports.MngClusterProvider = MngClusterProvider;
/**
 * Validates that cluster is backed by EC2 either through a managed node group or through a self-managed autoscaling group.
 * @param clusterInfo
 * @param source Used for error message to identify the source of the check
 * @returns
 */
//TODO: move to clusterInfo
function assertEC2NodeGroup(clusterInfo, source) {
    if (clusterInfo.nodeGroups != undefined && clusterInfo.nodeGroups.length > 0) {
        return clusterInfo.nodeGroups;
    }
    if (clusterInfo.autoscalingGroups != undefined && clusterInfo.autoscalingGroups.length > 0) {
        return clusterInfo.autoscalingGroups;
    }
    throw new Error(`${source} is supported with EKS EC2 only`);
}
exports.assertEC2NodeGroup = assertEC2NodeGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW5nLWNsdXN0ZXItcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvY2x1c3Rlci1wcm92aWRlcnMvbW5nLWNsdXN0ZXItcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBS0EseUVBQW9GO0FBaUNwRjs7R0FFRztBQUNILE1BQWEsa0JBQW1CLFNBQVEsaURBQXNCO0lBRTFELFlBQVksS0FBK0I7O1FBQ3ZDLEtBQUssQ0FBQyxFQUFDLEdBQUcseUNBQWMsRUFBRSxHQUFHLEtBQUssRUFBRSxHQUFHO2dCQUNuQyxpQkFBaUIsRUFBRSxDQUFDO3dCQUNoQixFQUFFLEVBQUUsTUFBQSxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxFQUFFLG1DQUFJLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxXQUFXLG1DQUFJLG9CQUFvQjt3QkFDM0QsaUJBQWlCLEVBQUUsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLGlCQUFpQjt3QkFDM0MsU0FBUyxFQUFFLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxTQUFTO3dCQUMzQixPQUFPLEVBQUUsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE9BQU87d0JBQ3ZCLFdBQVcsRUFBRSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsV0FBVzt3QkFDL0IsYUFBYSxFQUFFLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxhQUFhO3dCQUNuQyxPQUFPLEVBQUUsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE9BQU87d0JBQ3ZCLE9BQU8sRUFBRSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsT0FBTzt3QkFDdkIscUJBQXFCLEVBQUUsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLHFCQUFxQjt3QkFDbkQsVUFBVSxFQUFFLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxVQUFVO3FCQUNoQyxDQUFDO2FBQ0wsRUFBQyxDQUFDLENBQUM7SUFDUixDQUFDO0NBQ0o7QUFsQkQsZ0RBa0JDO0FBRUQ7Ozs7O0dBS0c7QUFDSCwyQkFBMkI7QUFDM0IsU0FBZ0Isa0JBQWtCLENBQUMsV0FBd0IsRUFBRSxNQUFjO0lBQ3ZFLElBQUcsV0FBVyxDQUFDLFVBQVUsSUFBSSxTQUFTLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3pFLE9BQU8sV0FBVyxDQUFDLFVBQVUsQ0FBQztLQUNqQztJQUNELElBQUcsV0FBVyxDQUFDLGlCQUFpQixJQUFJLFNBQVMsSUFBSSxXQUFXLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUN2RixPQUFPLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztLQUN4QztJQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxNQUFNLGlDQUFpQyxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQVJELGdEQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXdzX2F1dG9zY2FsaW5nIGFzIGFzZyB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgYXdzX2VjMiBhcyBlYzIgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IGF3c19la3MgYXMgZWtzIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG4vLyBDbHVzdGVyXG5pbXBvcnQgeyBDbHVzdGVySW5mbyB9IGZyb20gXCIuLlwiO1xuaW1wb3J0IHsgZGVmYXVsdE9wdGlvbnMsIEdlbmVyaWNDbHVzdGVyUHJvdmlkZXIgfSBmcm9tIFwiLi9nZW5lcmljLWNsdXN0ZXItcHJvdmlkZXJcIjtcbi8vIENvbnN0YW50cyBcbmltcG9ydCB7IE1hbmFnZWROb2RlR3JvdXAgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUgY2x1c3RlciBwcm92aWRlci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNbmdDbHVzdGVyUHJvdmlkZXJQcm9wcyBleHRlbmRzIGVrcy5Db21tb25DbHVzdGVyT3B0aW9ucywgT21pdDxNYW5hZ2VkTm9kZUdyb3VwLCBcImlkXCI+IHtcbiAgICAvKipcbiAgICAqIFRoZSBuYW1lIGZvciB0aGUgY2x1c3Rlci5cbiAgICAqIEBkZXByZWNhdGVkIHVzZSAjY2x1c3Rlck5hbWVcbiAgICAqL1xuICAgIG5hbWU/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBJbiB0aGlzIGNhc2UgaWQgaXMgb3B0aW9uYWwgYW5kIGRlZmF1bHRzIHRwIHRoZSBjbHVzdGVyIG5hbWVcbiAgICAgKi9cbiAgICBpZD86IHN0cmluZyxcblxuICAgIC8qKlxuICAgICAqIElzIGl0IGEgcHJpdmF0ZSBvbmx5IEVLUyBDbHVzdGVyP1xuICAgICAqIERlZmF1bHRzIHRvIHByaXZhdGVfYW5kX3B1YmxpYyBjbHVzdGVyLCBzZXQgdG8gdHJ1ZSBmb3IgcHJpdmF0ZSBjbHVzdGVyXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBwcml2YXRlQ2x1c3Rlcj86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBBZmZlY3RzIGJvdGggY29udHJvbCBwbGFuZSBhbmQgdGhlIG1hbmFnZWQgbm9kZSBncm91cC5cbiAgICAgKi9cbiAgICB2cGNTdWJuZXRzPzogZWMyLlN1Ym5ldFNlbGVjdGlvbltdO1xufVxuXG4vKipcbiAqIE1uZ0NsdXN0ZXJQcm92aWRlciBwcm92aXNpb25zIGFuIEVLUyBjbHVzdGVyIHdpdGggYSBtYW5hZ2VkIG5vZGUgZ3JvdXAgZm9yIG1hbmFnZWQgY2FwYWNpdHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBNbmdDbHVzdGVyUHJvdmlkZXIgZXh0ZW5kcyBHZW5lcmljQ2x1c3RlclByb3ZpZGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogTW5nQ2x1c3RlclByb3ZpZGVyUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoey4uLmRlZmF1bHRPcHRpb25zLCAuLi5wcm9wcywgLi4ue1xuICAgICAgICAgICAgbWFuYWdlZE5vZGVHcm91cHM6IFt7XG4gICAgICAgICAgICAgICAgaWQ6IHByb3BzPy5pZCA/PyBwcm9wcz8uY2x1c3Rlck5hbWUgPz8gXCJla3MtYmx1ZXByaW50cy1tbmdcIixcbiAgICAgICAgICAgICAgICBhbWlSZWxlYXNlVmVyc2lvbjogcHJvcHM/LmFtaVJlbGVhc2VWZXJzaW9uLFxuICAgICAgICAgICAgICAgIGN1c3RvbUFtaTogcHJvcHM/LmN1c3RvbUFtaSxcbiAgICAgICAgICAgICAgICBhbWlUeXBlOiBwcm9wcz8uYW1pVHlwZSxcbiAgICAgICAgICAgICAgICBkZXNpcmVkU2l6ZTogcHJvcHM/LmRlc2lyZWRTaXplLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlVHlwZXM6IHByb3BzPy5pbnN0YW5jZVR5cGVzLFxuICAgICAgICAgICAgICAgIG1heFNpemU6IHByb3BzPy5tYXhTaXplLFxuICAgICAgICAgICAgICAgIG1pblNpemU6IHByb3BzPy5taW5TaXplLFxuICAgICAgICAgICAgICAgIG5vZGVHcm91cENhcGFjaXR5VHlwZTogcHJvcHM/Lm5vZGVHcm91cENhcGFjaXR5VHlwZSxcbiAgICAgICAgICAgICAgICB2cGNTdWJuZXRzOiBwcm9wcz8udnBjU3VibmV0cyxcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH19KTtcbiAgICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoYXQgY2x1c3RlciBpcyBiYWNrZWQgYnkgRUMyIGVpdGhlciB0aHJvdWdoIGEgbWFuYWdlZCBub2RlIGdyb3VwIG9yIHRocm91Z2ggYSBzZWxmLW1hbmFnZWQgYXV0b3NjYWxpbmcgZ3JvdXAuXG4gKiBAcGFyYW0gY2x1c3RlckluZm8gXG4gKiBAcGFyYW0gc291cmNlIFVzZWQgZm9yIGVycm9yIG1lc3NhZ2UgdG8gaWRlbnRpZnkgdGhlIHNvdXJjZSBvZiB0aGUgY2hlY2tcbiAqIEByZXR1cm5zIFxuICovXG4vL1RPRE86IG1vdmUgdG8gY2x1c3RlckluZm9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRFQzJOb2RlR3JvdXAoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCBzb3VyY2U6IHN0cmluZyk6IGVrcy5Ob2RlZ3JvdXBbXSB8IGFzZy5BdXRvU2NhbGluZ0dyb3VwW10ge1xuICAgIGlmKGNsdXN0ZXJJbmZvLm5vZGVHcm91cHMgIT0gdW5kZWZpbmVkICYmIGNsdXN0ZXJJbmZvLm5vZGVHcm91cHMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gY2x1c3RlckluZm8ubm9kZUdyb3VwcztcbiAgICB9XG4gICAgaWYoY2x1c3RlckluZm8uYXV0b3NjYWxpbmdHcm91cHMgIT0gdW5kZWZpbmVkICYmIGNsdXN0ZXJJbmZvLmF1dG9zY2FsaW5nR3JvdXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNsdXN0ZXJJbmZvLmF1dG9zY2FsaW5nR3JvdXBzO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7c291cmNlfSBpcyBzdXBwb3J0ZWQgd2l0aCBFS1MgRUMyIG9ubHlgKTtcbn0iXX0=