"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsgClusterProvider = void 0;
const generic_cluster_provider_1 = require("./generic-cluster-provider");
/**
 * AsgClusterProvider provisions an EKS cluster with an autoscaling group for self-managed capacity.
 */
class AsgClusterProvider extends generic_cluster_provider_1.GenericClusterProvider {
    constructor(props) {
        var _a, _b;
        super({ ...generic_cluster_provider_1.defaultOptions, ...props, ...{
                autoscalingNodeGroups: [{
                        id: (_b = (_a = props === null || props === void 0 ? void 0 : props.id) !== null && _a !== void 0 ? _a : props === null || props === void 0 ? void 0 : props.clusterName) !== null && _b !== void 0 ? _b : "eks-blueprints-asg",
                        desiredSize: props === null || props === void 0 ? void 0 : props.desiredSize,
                        maxSize: props === null || props === void 0 ? void 0 : props.maxSize,
                        minSize: props === null || props === void 0 ? void 0 : props.minSize,
                        vpcSubnets: props === null || props === void 0 ? void 0 : props.vpcSubnets,
                        instanceType: props === null || props === void 0 ? void 0 : props.instanceType,
                        machineImageType: props === null || props === void 0 ? void 0 : props.machineImageType,
                        updatePolicy: props === null || props === void 0 ? void 0 : props.updatePolicy
                    }]
            } });
    }
}
exports.AsgClusterProvider = AsgClusterProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNnLWNsdXN0ZXItcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvY2x1c3Rlci1wcm92aWRlcnMvYXNnLWNsdXN0ZXItcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEseUVBQW9GO0FBMEJwRjs7R0FFRztBQUNILE1BQWEsa0JBQW1CLFNBQVEsaURBQXNCO0lBRTFELFlBQVksS0FBK0I7O1FBQ3ZDLEtBQUssQ0FBQyxFQUFDLEdBQUcseUNBQWMsRUFBRSxHQUFHLEtBQUssRUFBRSxHQUFHO2dCQUNuQyxxQkFBcUIsRUFBRSxDQUFDO3dCQUNwQixFQUFFLEVBQUUsTUFBQSxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxFQUFFLG1DQUFJLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxXQUFXLG1DQUFJLG9CQUFvQjt3QkFDM0QsV0FBVyxFQUFFLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxXQUFXO3dCQUMvQixPQUFPLEVBQUUsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE9BQU87d0JBQ3ZCLE9BQU8sRUFBRSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsT0FBTzt3QkFDdkIsVUFBVSxFQUFFLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxVQUFVO3dCQUM3QixZQUFZLEVBQUUsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFlBQVk7d0JBQ2pDLGdCQUFnQixFQUFFLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxnQkFBZ0I7d0JBQ3pDLFlBQVksRUFBRSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsWUFBWTtxQkFDcEMsQ0FBQzthQUNMLEVBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNIO0FBaEJGLGdEQWdCRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGVjMiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgZWtzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBkZWZhdWx0T3B0aW9ucywgR2VuZXJpY0NsdXN0ZXJQcm92aWRlciB9IGZyb20gXCIuL2dlbmVyaWMtY2x1c3Rlci1wcm92aWRlclwiO1xuaW1wb3J0IHsgQXV0b3NjYWxpbmdOb2RlR3JvdXAgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGNsdXN0ZXIgcHJvdmlkZXIuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXNnQ2x1c3RlclByb3ZpZGVyUHJvcHMgZXh0ZW5kcyBla3MuQ29tbW9uQ2x1c3Rlck9wdGlvbnMsIEF1dG9zY2FsaW5nTm9kZUdyb3VwIHtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBmb3IgdGhlIGNsdXN0ZXIuXG4gICAgICovXG4gICAgbmFtZT86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIElzIGl0IGEgcHJpdmF0ZSBvbmx5IEVLUyBDbHVzdGVyP1xuICAgICAqIERlZmF1bHRzIHRvIHByaXZhdGVfYW5kX3B1YmxpYyBjbHVzdGVyLCBzZXQgdG8gdHJ1ZSBmb3IgcHJpdmF0ZSBjbHVzdGVyXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBwcml2YXRlQ2x1c3Rlcj86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBBZmZlY3RzIGJvdGggY29udHJvbCBwbGFuZSBhbmQgdGhlIG1hbmFnZWQgbm9kZSBncm91cC5cbiAgICAqL1xuICAgIHZwY1N1Ym5ldHM/OiBlYzIuU3VibmV0U2VsZWN0aW9uW107XG59XG5cbi8qKlxuICogQXNnQ2x1c3RlclByb3ZpZGVyIHByb3Zpc2lvbnMgYW4gRUtTIGNsdXN0ZXIgd2l0aCBhbiBhdXRvc2NhbGluZyBncm91cCBmb3Igc2VsZi1tYW5hZ2VkIGNhcGFjaXR5LlxuICovXG5leHBvcnQgY2xhc3MgQXNnQ2x1c3RlclByb3ZpZGVyIGV4dGVuZHMgR2VuZXJpY0NsdXN0ZXJQcm92aWRlciB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IEFzZ0NsdXN0ZXJQcm92aWRlclByb3BzKSB7XG4gICAgICAgIHN1cGVyKHsuLi5kZWZhdWx0T3B0aW9ucywgLi4ucHJvcHMsIC4uLntcbiAgICAgICAgICAgIGF1dG9zY2FsaW5nTm9kZUdyb3VwczogW3tcbiAgICAgICAgICAgICAgICBpZDogcHJvcHM/LmlkID8/IHByb3BzPy5jbHVzdGVyTmFtZSA/PyBcImVrcy1ibHVlcHJpbnRzLWFzZ1wiLFxuICAgICAgICAgICAgICAgIGRlc2lyZWRTaXplOiBwcm9wcz8uZGVzaXJlZFNpemUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZTogcHJvcHM/Lm1heFNpemUsXG4gICAgICAgICAgICAgICAgbWluU2l6ZTogcHJvcHM/Lm1pblNpemUsXG4gICAgICAgICAgICAgICAgdnBjU3VibmV0czogcHJvcHM/LnZwY1N1Ym5ldHMsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VUeXBlOiBwcm9wcz8uaW5zdGFuY2VUeXBlLFxuICAgICAgICAgICAgICAgIG1hY2hpbmVJbWFnZVR5cGU6IHByb3BzPy5tYWNoaW5lSW1hZ2VUeXBlLFxuICAgICAgICAgICAgICAgIHVwZGF0ZVBvbGljeTogcHJvcHM/LnVwZGF0ZVBvbGljeVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfX0pO1xuICAgIH1cbiB9XG4iXX0=