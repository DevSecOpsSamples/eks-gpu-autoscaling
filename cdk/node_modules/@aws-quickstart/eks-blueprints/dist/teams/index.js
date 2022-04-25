"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformTeam = exports.ApplicationTeam = exports.TeamProps = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const iam = require("aws-cdk-lib/aws-iam");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const csi_driver_provider_aws_secrets_1 = require("../addons/secrets-store/csi-driver-provider-aws-secrets");
const yaml_utils_1 = require("../utils/yaml-utils");
const default_team_roles_1 = require("./default-team-roles");
/**
 * Team properties.
 */
class TeamProps {
    constructor() {
        /**
         *  Annotations such as necessary for GitOps engine.
         */
        this.namespaceAnnotations = { "argocd.argoproj.io/sync-wave": "-1" };
        /**
         * Optional, but highly recommended setting to ensure predictable demands.
         */
        this.namespaceHardLimits = {
            'requests.cpu': '10',
            'requests.memory': '10Gi',
            'limits.cpu': '20',
            'limits.memory': '20Gi'
        };
    }
}
exports.TeamProps = TeamProps;
class ApplicationTeam {
    constructor(teamProps) {
        var _a;
        this.name = teamProps.name;
        this.teamProps = {
            name: teamProps.name,
            namespace: (_a = teamProps.namespace) !== null && _a !== void 0 ? _a : "team-" + teamProps.name,
            users: teamProps.users,
            namespaceAnnotations: teamProps.namespaceAnnotations,
            namespaceLabels: teamProps.namespaceLabels,
            namespaceHardLimits: teamProps.namespaceHardLimits,
            serviceAccountName: teamProps.serviceAccountName,
            userRoleArn: teamProps.userRoleArn,
            teamSecrets: teamProps.teamSecrets,
            teamManifestDir: teamProps.teamManifestDir
        };
    }
    setup(clusterInfo) {
        this.defaultSetupAccess(clusterInfo);
        this.setupNamespace(clusterInfo);
        this.setupServiceAccount(clusterInfo);
        this.setupSecrets(clusterInfo);
    }
    defaultSetupAccess(clusterInfo) {
        var _a;
        const props = this.teamProps;
        const awsAuth = clusterInfo.cluster.awsAuth;
        const users = (_a = this.teamProps.users) !== null && _a !== void 0 ? _a : [];
        const teamRole = this.getOrCreateRole(clusterInfo, users, props.userRoleArn);
        if (teamRole) {
            awsAuth.addRoleMapping(teamRole, { groups: [props.namespace + "-team-group"], username: props.name });
            new aws_cdk_lib_1.CfnOutput(clusterInfo.cluster.stack, props.name + ' team role ', { value: teamRole ? teamRole.roleArn : "none" });
        }
    }
    /**
     *
     * @param clusterInfo
     */
    defaultSetupAdminAccess(clusterInfo) {
        var _a;
        const props = this.teamProps;
        const awsAuth = clusterInfo.cluster.awsAuth;
        const admins = (_a = this.teamProps.users) !== null && _a !== void 0 ? _a : [];
        const adminRole = this.getOrCreateRole(clusterInfo, admins, props.userRoleArn);
        new aws_cdk_lib_1.CfnOutput(clusterInfo.cluster.stack, props.name + ' team admin ', { value: adminRole ? adminRole.roleArn : "none" });
        if (adminRole) {
            awsAuth.addMastersRole(adminRole, this.teamProps.name);
        }
    }
    /**
     * Creates a new role with trust relationship or adds trust relationship for an existing role.
     * @param clusterInfo
     * @param users
     * @param role may be null if both role and users were not provided
     * @returns
     */
    getOrCreateRole(clusterInfo, users, roleArn) {
        let role = undefined;
        if (roleArn) {
            role = iam.Role.fromRoleArn(clusterInfo.cluster.stack, `${this.name}-team-role`, roleArn);
            users.forEach(user => role === null || role === void 0 ? void 0 : role.grant(user, "sts:assumeRole"));
        }
        else if (users && users.length > 0) {
            role = new iam.Role(clusterInfo.cluster.stack, this.teamProps.namespace + 'AccessRole', {
                assumedBy: new iam.CompositePrincipal(...users)
            });
            role.addToPrincipalPolicy(new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: [clusterInfo.cluster.clusterArn],
                actions: [
                    "eks:DescribeNodegroup",
                    "eks:ListNodegroups",
                    "eks:DescribeCluster",
                    "eks:ListClusters",
                    "eks:AccessKubernetesApi",
                    "ssm:GetParameter",
                    "eks:ListUpdates",
                    "eks:ListFargateProfiles"
                ]
            }));
            role.addToPrincipalPolicy(new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: ["*"],
                actions: [
                    "eks:ListClusters"
                ]
            }));
        }
        return role;
    }
    /**
     * Creates namespace and sets up policies.
     * @param clusterInfo
     */
    setupNamespace(clusterInfo) {
        const props = this.teamProps;
        const namespaceName = props.namespace;
        const teamManifestDir = props.teamManifestDir;
        this.namespaceManifest = new aws_eks_1.KubernetesManifest(clusterInfo.cluster.stack, props.name, {
            cluster: clusterInfo.cluster,
            manifest: [{
                    apiVersion: 'v1',
                    kind: 'Namespace',
                    metadata: {
                        name: namespaceName,
                        annotations: props.namespaceAnnotations,
                        labels: props.namespaceLabels
                    }
                }],
            overwrite: true,
            prune: true
        });
        if (props.namespaceHardLimits) {
            this.setupNamespacePolicies(clusterInfo, namespaceName);
        }
        const defaultRoles = new default_team_roles_1.DefaultTeamRoles().createManifest(namespaceName); //TODO: add support for custom RBAC
        const rbacManifest = new aws_eks_1.KubernetesManifest(clusterInfo.cluster.stack, namespaceName + "-rbac", {
            cluster: clusterInfo.cluster,
            manifest: defaultRoles,
            overwrite: true,
            prune: true
        });
        rbacManifest.node.addDependency(this.namespaceManifest);
        if (teamManifestDir) {
            (0, yaml_utils_1.applyYamlFromDir)(teamManifestDir, clusterInfo.cluster, this.namespaceManifest);
        }
    }
    /**
     * Sets up quotas
     * @param clusterInfo
     * @param namespaceName
     */
    setupNamespacePolicies(clusterInfo, namespaceName) {
        const quotaName = this.teamProps.name + "-quota";
        const quotaManifest = clusterInfo.cluster.addManifest(quotaName, {
            apiVersion: 'v1',
            kind: 'ResourceQuota',
            metadata: {
                name: quotaName,
                namespace: namespaceName
            },
            spec: {
                hard: this.teamProps.namespaceHardLimits
            }
        });
        quotaManifest.node.addDependency(this.namespaceManifest);
    }
    /**
     * Sets up ServiceAccount for the team namespace
     * @param clusterInfo
     */
    setupServiceAccount(clusterInfo) {
        const serviceAccountName = this.teamProps.serviceAccountName ? this.teamProps.serviceAccountName : `${this.teamProps.name}-sa`;
        const cluster = clusterInfo.cluster;
        this.serviceAccount = cluster.addServiceAccount(`${this.teamProps.name}-service-account`, {
            name: serviceAccountName,
            namespace: this.teamProps.namespace
        });
        this.serviceAccount.node.addDependency(this.namespaceManifest);
        const serviceAccountOutput = new aws_cdk_lib_1.CfnOutput(clusterInfo.cluster.stack, `${this.teamProps.name}-sa`, {
            value: serviceAccountName
        });
        serviceAccountOutput.node.addDependency(this.namespaceManifest);
    }
    /**
     * Sets up secrets
     * @param clusterInfo
     */
    setupSecrets(clusterInfo) {
        if (this.teamProps.teamSecrets) {
            const secretProviderClassName = this.teamProps.name + '-aws-secrets';
            new csi_driver_provider_aws_secrets_1.SecretProviderClass(clusterInfo, this.serviceAccount, secretProviderClassName, ...this.teamProps.teamSecrets);
        }
    }
}
exports.ApplicationTeam = ApplicationTeam;
/**
 * Platform team will setup all team members as admin access to the cluster by adding them to the master group.
 * The setup skips namespace/quota configuration.
 */
class PlatformTeam extends ApplicationTeam {
    constructor(teamProps) {
        super(teamProps);
    }
    /**
     * Override
     * @param clusterInfo
     */
    setup(clusterInfo) {
        this.defaultSetupAdminAccess(clusterInfo);
    }
}
exports.PlatformTeam = PlatformTeam;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdGVhbXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaURBQXlFO0FBQ3pFLDJDQUEyQztBQUUzQyw2Q0FBd0M7QUFDeEMsNkdBQThHO0FBRTlHLG9EQUF1RDtBQUN2RCw2REFBd0Q7QUFFeEQ7O0dBRUc7QUFDSCxNQUFhLFNBQVM7SUFBdEI7UUFhSTs7V0FFRztRQUNNLHlCQUFvQixHQUE4QixFQUFFLDhCQUE4QixFQUFFLElBQUksRUFBRSxDQUFDO1FBT3BHOztXQUVHO1FBQ00sd0JBQW1CLEdBQVk7WUFDcEMsY0FBYyxFQUFFLElBQUk7WUFDcEIsaUJBQWlCLEVBQUUsTUFBTTtZQUN6QixZQUFZLEVBQUUsSUFBSTtZQUNsQixlQUFlLEVBQUUsTUFBTTtTQUMxQixDQUFDO0lBMkJOLENBQUM7Q0FBQTtBQTFERCw4QkEwREM7QUFFRCxNQUFhLGVBQWU7SUFVeEIsWUFBWSxTQUFvQjs7UUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDYixJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7WUFDcEIsU0FBUyxFQUFFLE1BQUEsU0FBUyxDQUFDLFNBQVMsbUNBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJO1lBQzFELEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSztZQUN0QixvQkFBb0IsRUFBRSxTQUFTLENBQUMsb0JBQW9CO1lBQ3BELGVBQWUsRUFBRSxTQUFTLENBQUMsZUFBZTtZQUMxQyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsbUJBQW1CO1lBQ2xELGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxrQkFBa0I7WUFDaEQsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXO1lBQ2xDLFdBQVcsRUFBRSxTQUFTLENBQUMsV0FBVztZQUNsQyxlQUFlLEVBQUUsU0FBUyxDQUFDLGVBQWU7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T0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLEVBQUU7WUFDL0YsS0FBSyxFQUFFLGtCQUFrQjtTQUM1QixDQUFDLENBQUM7UUFDSCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7O09BR0c7SUFDTyxZQUFZLENBQUMsV0FBd0I7UUFDM0MsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRTtZQUM1QixNQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQztZQUNyRSxJQUFJLHFEQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLHVCQUF1QixFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNySDtJQUNMLENBQUM7Q0FDSjtBQTVNRCwwQ0E0TUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFhLFlBQWEsU0FBUSxlQUFlO0lBRTdDLFlBQVksU0FBb0I7UUFDNUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsV0FBd0I7UUFDMUIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDSjtBQWJELG9DQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgS3ViZXJuZXRlc01hbmlmZXN0LCBTZXJ2aWNlQWNjb3VudCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgSVJvbGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENmbk91dHB1dCB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENzaVNlY3JldFByb3BzLCBTZWNyZXRQcm92aWRlckNsYXNzIH0gZnJvbSAnLi4vYWRkb25zL3NlY3JldHMtc3RvcmUvY3NpLWRyaXZlci1wcm92aWRlci1hd3Mtc2VjcmV0cyc7XG5pbXBvcnQgeyBDbHVzdGVySW5mbywgVGVhbSwgVmFsdWVzIH0gZnJvbSAnLi4vc3BpJztcbmltcG9ydCB7IGFwcGx5WWFtbEZyb21EaXIgfSBmcm9tICcuLi91dGlscy95YW1sLXV0aWxzJztcbmltcG9ydCB7IERlZmF1bHRUZWFtUm9sZXMgfSBmcm9tICcuL2RlZmF1bHQtdGVhbS1yb2xlcyc7XG5cbi8qKlxuICogVGVhbSBwcm9wZXJ0aWVzLlxuICovXG5leHBvcnQgY2xhc3MgVGVhbVByb3BzIHtcblxuICAgIC8qKlxuICAgICAqIFJlcXVpcmVkIHVuaXF1ZSBuYW1lIGZvciBvcmdhbml6YXRpb24uXG4gICAgICogTWF5IG1hcCB0byBhbiBPVSBuYW1lLiBcbiAgICAgKi9cbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0cyB0byB0ZWFtIG5hbWUgcHJlZml4ZWQgYnkgXCJ0ZWFtLVwiXG4gICAgICovXG4gICAgcmVhZG9ubHkgbmFtZXNwYWNlPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogIEFubm90YXRpb25zIHN1Y2ggYXMgbmVjZXNzYXJ5IGZvciBHaXRPcHMgZW5naW5lLiBcbiAgICAgKi9cbiAgICByZWFkb25seSBuYW1lc3BhY2VBbm5vdGF0aW9ucz8gOiB7IFtrZXk6IHN0cmluZ106IGFueTsgfSA9IHsgXCJhcmdvY2QuYXJnb3Byb2ouaW8vc3luYy13YXZlXCI6IFwiLTFcIiB9O1xuXG4gICAgLyoqXG4gICAgICogTGFiZWxzIHN1Y2ggYXMgbmVjZXNzYXJ5IGZvciBBV1MgQXBwTWVzaCBcbiAgICAgKi9cbiAgICByZWFkb25seSBuYW1lc3BhY2VMYWJlbHM/IDogeyBba2V5OiBzdHJpbmddOiBhbnk7IH07XG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCwgYnV0IGhpZ2hseSByZWNvbW1lbmRlZCBzZXR0aW5nIHRvIGVuc3VyZSBwcmVkaWN0YWJsZSBkZW1hbmRzLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IG5hbWVzcGFjZUhhcmRMaW1pdHM/OiBWYWx1ZXMgPSB7XG4gICAgICAgICdyZXF1ZXN0cy5jcHUnOiAnMTAnLCAvLyBUT0RPIHZlcmlmeSBzYW5lIGRlZmF1bHRzXG4gICAgICAgICdyZXF1ZXN0cy5tZW1vcnknOiAnMTBHaScsXG4gICAgICAgICdsaW1pdHMuY3B1JzogJzIwJyxcbiAgICAgICAgJ2xpbWl0cy5tZW1vcnknOiAnMjBHaSdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2VydmljZSBBY2NvdW50IE5hbWVcbiAgICAgKi9cbiAgICByZWFkb25seSBzZXJ2aWNlQWNjb3VudE5hbWU/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiAgVGVhbSBtZW1iZXJzIHdobyBuZWVkIHRvIGdldCBhY2Nlc3MgdG8gdGhlIGNsdXN0ZXJcbiAgICAgKi9cbiAgICByZWFkb25seSB1c2Vycz86IEFycmF5PGlhbS5Bcm5QcmluY2lwYWw+O1xuXG4gICAgLyoqXG4gICAgICogT3B0aW9ucyBleGlzdGluZyByb2xlIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIGNsdXN0ZXIgYWNjZXNzLiBcbiAgICAgKiBJZiB1c2VyUm9sZSBhbmQgdXNlcnMgYXJlIG5vdCBwcm92aWRlZCwgdGhlbiBubyBJQU0gc2V0dXAgaXMgcGVyZm9ybWVkLiBcbiAgICAgKi9cbiAgICByZWFkb25seSB1c2VyUm9sZUFybj86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFRlYW0gU2VjcmV0c1xuICAgICAqL1xuICAgIHJlYWRvbmx5IHRlYW1TZWNyZXRzPzogQ3NpU2VjcmV0UHJvcHNbXTtcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsLCBkaXJlY3Rvcnkgd2hlcmUgYSB0ZWFtJ3MgbWFuaWZlc3RzIGFyZSBzdG9yZWRcbiAgICAgKi9cbiAgICAgcmVhZG9ubHkgdGVhbU1hbmlmZXN0RGlyPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25UZWFtIGltcGxlbWVudHMgVGVhbSB7XG5cbiAgICByZWFkb25seSB0ZWFtUHJvcHM6IFRlYW1Qcm9wcztcblxuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcblxuICAgIHB1YmxpYyBuYW1lc3BhY2VNYW5pZmVzdDogS3ViZXJuZXRlc01hbmlmZXN0O1xuXG4gICAgcHVibGljIHNlcnZpY2VBY2NvdW50OiBTZXJ2aWNlQWNjb3VudDtcblxuICAgIGNvbnN0cnVjdG9yKHRlYW1Qcm9wczogVGVhbVByb3BzKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IHRlYW1Qcm9wcy5uYW1lO1xuICAgICAgICB0aGlzLnRlYW1Qcm9wcyA9IHtcbiAgICAgICAgICAgIG5hbWU6IHRlYW1Qcm9wcy5uYW1lLFxuICAgICAgICAgICAgbmFtZXNwYWNlOiB0ZWFtUHJvcHMubmFtZXNwYWNlID8/IFwidGVhbS1cIiArIHRlYW1Qcm9wcy5uYW1lLFxuICAgICAgICAgICAgdXNlcnM6IHRlYW1Qcm9wcy51c2VycyxcbiAgICAgICAgICAgIG5hbWVzcGFjZUFubm90YXRpb25zOiB0ZWFtUHJvcHMubmFtZXNwYWNlQW5ub3RhdGlvbnMsXG4gICAgICAgICAgICBuYW1lc3BhY2VMYWJlbHM6IHRlYW1Qcm9wcy5uYW1lc3BhY2VMYWJlbHMsXG4gICAgICAgICAgICBuYW1lc3BhY2VIYXJkTGltaXRzOiB0ZWFtUHJvcHMubmFtZXNwYWNlSGFyZExpbWl0cyxcbiAgICAgICAgICAgIHNlcnZpY2VBY2NvdW50TmFtZTogdGVhbVByb3BzLnNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgIHVzZXJSb2xlQXJuOiB0ZWFtUHJvcHMudXNlclJvbGVBcm4sXG4gICAgICAgICAgICB0ZWFtU2VjcmV0czogdGVhbVByb3BzLnRlYW1TZWNyZXRzLFxuICAgICAgICAgICAgdGVhbU1hbmlmZXN0RGlyOiB0ZWFtUHJvcHMudGVhbU1hbmlmZXN0RGlyXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIHNldHVwKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IHZvaWQge1xuICAgICAgICB0aGlzLmRlZmF1bHRTZXR1cEFjY2VzcyhjbHVzdGVySW5mbyk7XG4gICAgICAgIHRoaXMuc2V0dXBOYW1lc3BhY2UoY2x1c3RlckluZm8pO1xuICAgICAgICB0aGlzLnNldHVwU2VydmljZUFjY291bnQoY2x1c3RlckluZm8pO1xuICAgICAgICB0aGlzLnNldHVwU2VjcmV0cyhjbHVzdGVySW5mbyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRlZmF1bHRTZXR1cEFjY2VzcyhjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pIHtcbiAgICAgICAgY29uc3QgcHJvcHMgPSB0aGlzLnRlYW1Qcm9wcztcbiAgICAgICAgY29uc3QgYXdzQXV0aCA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuYXdzQXV0aDtcblxuICAgICAgICBjb25zdCB1c2VycyA9IHRoaXMudGVhbVByb3BzLnVzZXJzID8/IFtdO1xuICAgICAgICBjb25zdCB0ZWFtUm9sZSA9IHRoaXMuZ2V0T3JDcmVhdGVSb2xlKGNsdXN0ZXJJbmZvLCB1c2VycywgcHJvcHMudXNlclJvbGVBcm4pO1xuXG4gICAgICAgIGlmICh0ZWFtUm9sZSkge1xuICAgICAgICAgICAgYXdzQXV0aC5hZGRSb2xlTWFwcGluZyh0ZWFtUm9sZSwgeyBncm91cHM6IFtwcm9wcy5uYW1lc3BhY2UhICsgXCItdGVhbS1ncm91cFwiXSwgdXNlcm5hbWU6IHByb3BzLm5hbWUgfSk7XG4gICAgICAgICAgICBuZXcgQ2ZuT3V0cHV0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssIHByb3BzLm5hbWUgKyAnIHRlYW0gcm9sZSAnLCB7IHZhbHVlOiB0ZWFtUm9sZSA/IHRlYW1Sb2xlLnJvbGVBcm4gOiBcIm5vbmVcIiB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZGVmYXVsdFNldHVwQWRtaW5BY2Nlc3MoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKSB7XG4gICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy50ZWFtUHJvcHM7XG4gICAgICAgIGNvbnN0IGF3c0F1dGggPSBjbHVzdGVySW5mby5jbHVzdGVyLmF3c0F1dGg7XG4gICAgICAgIGNvbnN0IGFkbWlucyA9IHRoaXMudGVhbVByb3BzLnVzZXJzID8/IFtdO1xuICAgICAgICBjb25zdCBhZG1pblJvbGUgPSB0aGlzLmdldE9yQ3JlYXRlUm9sZShjbHVzdGVySW5mbywgYWRtaW5zLCBwcm9wcy51c2VyUm9sZUFybik7XG5cbiAgICAgICAgbmV3IENmbk91dHB1dChjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLCBwcm9wcy5uYW1lICsgJyB0ZWFtIGFkbWluICcsIHsgdmFsdWU6IGFkbWluUm9sZSA/IGFkbWluUm9sZS5yb2xlQXJuIDogXCJub25lXCIgfSk7XG5cbiAgICAgICAgaWYgKGFkbWluUm9sZSkge1xuICAgICAgICAgICAgYXdzQXV0aC5hZGRNYXN0ZXJzUm9sZShhZG1pblJvbGUsIHRoaXMudGVhbVByb3BzLm5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyByb2xlIHdpdGggdHJ1c3QgcmVsYXRpb25zaGlwIG9yIGFkZHMgdHJ1c3QgcmVsYXRpb25zaGlwIGZvciBhbiBleGlzdGluZyByb2xlLlxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKiBAcGFyYW0gdXNlcnMgXG4gICAgICogQHBhcmFtIHJvbGUgbWF5IGJlIG51bGwgaWYgYm90aCByb2xlIGFuZCB1c2VycyB3ZXJlIG5vdCBwcm92aWRlZFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRPckNyZWF0ZVJvbGUoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCB1c2VyczogQXJyYXk8aWFtLkFyblByaW5jaXBhbD4sIHJvbGVBcm4/OiBzdHJpbmcpOiBpYW0uSVJvbGUgfCB1bmRlZmluZWQge1xuICAgICAgICBsZXQgcm9sZTogSVJvbGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIFxuICAgICAgICBpZiAocm9sZUFybikge1xuICAgICAgICAgICAgcm9sZSA9IGlhbS5Sb2xlLmZyb21Sb2xlQXJuKGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssIGAke3RoaXMubmFtZX0tdGVhbS1yb2xlYCwgcm9sZUFybik7XG4gICAgICAgICAgICB1c2Vycy5mb3JFYWNoKHVzZXIgPT4gcm9sZT8uZ3JhbnQodXNlciwgXCJzdHM6YXNzdW1lUm9sZVwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih1c2VycyAmJiB1c2Vycy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHJvbGUgPSBuZXcgaWFtLlJvbGUoY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjaywgdGhpcy50ZWFtUHJvcHMubmFtZXNwYWNlICsgJ0FjY2Vzc1JvbGUnLCB7XG4gICAgICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLkNvbXBvc2l0ZVByaW5jaXBhbCguLi51c2VycylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcm9sZS5hZGRUb1ByaW5jaXBhbFBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogW2NsdXN0ZXJJbmZvLmNsdXN0ZXIuY2x1c3RlckFybl0sXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcImVrczpEZXNjcmliZU5vZGVncm91cFwiLFxuICAgICAgICAgICAgICAgICAgICBcImVrczpMaXN0Tm9kZWdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVrczpEZXNjcmliZUNsdXN0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJla3M6TGlzdENsdXN0ZXJzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWtzOkFjY2Vzc0t1YmVybmV0ZXNBcGlcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzc206R2V0UGFyYW1ldGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWtzOkxpc3RVcGRhdGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWtzOkxpc3RGYXJnYXRlUHJvZmlsZXNcIlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcm9sZS5hZGRUb1ByaW5jaXBhbFBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiZWtzOkxpc3RDbHVzdGVyc1wiXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByb2xlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbmFtZXNwYWNlIGFuZCBzZXRzIHVwIHBvbGljaWVzLlxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0dXBOYW1lc3BhY2UoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKSB7XG4gICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy50ZWFtUHJvcHM7XG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZU5hbWUgPSBwcm9wcy5uYW1lc3BhY2UhO1xuICAgICAgICBjb25zdCB0ZWFtTWFuaWZlc3REaXIgPSBwcm9wcy50ZWFtTWFuaWZlc3REaXI7XG5cbiAgICAgICAgdGhpcy5uYW1lc3BhY2VNYW5pZmVzdCA9IG5ldyBLdWJlcm5ldGVzTWFuaWZlc3QoY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjaywgcHJvcHMubmFtZSwge1xuICAgICAgICAgICAgY2x1c3RlcjogY2x1c3RlckluZm8uY2x1c3RlcixcbiAgICAgICAgICAgIG1hbmlmZXN0OiBbe1xuICAgICAgICAgICAgICAgIGFwaVZlcnNpb246ICd2MScsXG4gICAgICAgICAgICAgICAga2luZDogJ05hbWVzcGFjZScsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZXNwYWNlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHByb3BzLm5hbWVzcGFjZUFubm90YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IHByb3BzLm5hbWVzcGFjZUxhYmVsc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgb3ZlcndyaXRlOiB0cnVlLFxuICAgICAgICAgICAgcHJ1bmU6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHByb3BzLm5hbWVzcGFjZUhhcmRMaW1pdHMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBOYW1lc3BhY2VQb2xpY2llcyhjbHVzdGVySW5mbywgbmFtZXNwYWNlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWZhdWx0Um9sZXMgPSBuZXcgRGVmYXVsdFRlYW1Sb2xlcygpLmNyZWF0ZU1hbmlmZXN0KG5hbWVzcGFjZU5hbWUpOyAvL1RPRE86IGFkZCBzdXBwb3J0IGZvciBjdXN0b20gUkJBQ1xuXG4gICAgICAgIGNvbnN0IHJiYWNNYW5pZmVzdCA9IG5ldyBLdWJlcm5ldGVzTWFuaWZlc3QoY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjaywgbmFtZXNwYWNlTmFtZSArIFwiLXJiYWNcIiwge1xuICAgICAgICAgICAgY2x1c3RlcjogY2x1c3RlckluZm8uY2x1c3RlcixcbiAgICAgICAgICAgIG1hbmlmZXN0OiBkZWZhdWx0Um9sZXMsXG4gICAgICAgICAgICBvdmVyd3JpdGU6IHRydWUsXG4gICAgICAgICAgICBwcnVuZTogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgICAgICByYmFjTWFuaWZlc3Qubm9kZS5hZGREZXBlbmRlbmN5KHRoaXMubmFtZXNwYWNlTWFuaWZlc3QpO1xuXG4gICAgICAgIGlmICh0ZWFtTWFuaWZlc3REaXIpe1xuICAgICAgICAgICAgYXBwbHlZYW1sRnJvbURpcih0ZWFtTWFuaWZlc3REaXIsIGNsdXN0ZXJJbmZvLmNsdXN0ZXIsIHRoaXMubmFtZXNwYWNlTWFuaWZlc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBxdW90YXNcbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm8gXG4gICAgICogQHBhcmFtIG5hbWVzcGFjZU5hbWUgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldHVwTmFtZXNwYWNlUG9saWNpZXMoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCBuYW1lc3BhY2VOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcXVvdGFOYW1lID0gdGhpcy50ZWFtUHJvcHMubmFtZSArIFwiLXF1b3RhXCI7XG4gICAgICAgIGNvbnN0IHF1b3RhTWFuaWZlc3QgPSBjbHVzdGVySW5mby5jbHVzdGVyLmFkZE1hbmlmZXN0KHF1b3RhTmFtZSwge1xuICAgICAgICAgICAgYXBpVmVyc2lvbjogJ3YxJyxcbiAgICAgICAgICAgIGtpbmQ6ICdSZXNvdXJjZVF1b3RhJyxcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogcXVvdGFOYW1lLFxuICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlTmFtZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNwZWM6IHtcbiAgICAgICAgICAgICAgICBoYXJkOiB0aGlzLnRlYW1Qcm9wcy5uYW1lc3BhY2VIYXJkTGltaXRzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBxdW90YU1hbmlmZXN0Lm5vZGUuYWRkRGVwZW5kZW5jeSh0aGlzLm5hbWVzcGFjZU1hbmlmZXN0KTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBTZXJ2aWNlQWNjb3VudCBmb3IgdGhlIHRlYW0gbmFtZXNwYWNlXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXR1cFNlcnZpY2VBY2NvdW50KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbykge1xuICAgICAgICBjb25zdCBzZXJ2aWNlQWNjb3VudE5hbWUgPSB0aGlzLnRlYW1Qcm9wcy5zZXJ2aWNlQWNjb3VudE5hbWU/IHRoaXMudGVhbVByb3BzLnNlcnZpY2VBY2NvdW50TmFtZSA6IGAke3RoaXMudGVhbVByb3BzLm5hbWV9LXNhYDtcbiAgICAgICAgY29uc3QgY2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNlcnZpY2VBY2NvdW50ID0gY2x1c3Rlci5hZGRTZXJ2aWNlQWNjb3VudChgJHt0aGlzLnRlYW1Qcm9wcy5uYW1lfS1zZXJ2aWNlLWFjY291bnRgLCB7XG4gICAgICAgICAgICBuYW1lOiBzZXJ2aWNlQWNjb3VudE5hbWUsXG4gICAgICAgICAgICBuYW1lc3BhY2U6IHRoaXMudGVhbVByb3BzLm5hbWVzcGFjZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXJ2aWNlQWNjb3VudC5ub2RlLmFkZERlcGVuZGVuY3kodGhpcy5uYW1lc3BhY2VNYW5pZmVzdCk7XG5cbiAgICAgICAgY29uc3Qgc2VydmljZUFjY291bnRPdXRwdXQgPSBuZXcgQ2ZuT3V0cHV0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssIGAke3RoaXMudGVhbVByb3BzLm5hbWV9LXNhYCwge1xuICAgICAgICAgICAgdmFsdWU6IHNlcnZpY2VBY2NvdW50TmFtZVxuICAgICAgICB9KTtcbiAgICAgICAgc2VydmljZUFjY291bnRPdXRwdXQubm9kZS5hZGREZXBlbmRlbmN5KHRoaXMubmFtZXNwYWNlTWFuaWZlc3QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgc2VjcmV0c1xuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mb1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXR1cFNlY3JldHMoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKSB7XG4gICAgICAgIGlmICh0aGlzLnRlYW1Qcm9wcy50ZWFtU2VjcmV0cykge1xuICAgICAgICAgICAgY29uc3Qgc2VjcmV0UHJvdmlkZXJDbGFzc05hbWUgPSB0aGlzLnRlYW1Qcm9wcy5uYW1lICsgJy1hd3Mtc2VjcmV0cyc7XG4gICAgICAgICAgICBuZXcgU2VjcmV0UHJvdmlkZXJDbGFzcyhjbHVzdGVySW5mbywgdGhpcy5zZXJ2aWNlQWNjb3VudCwgc2VjcmV0UHJvdmlkZXJDbGFzc05hbWUsIC4uLnRoaXMudGVhbVByb3BzLnRlYW1TZWNyZXRzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQbGF0Zm9ybSB0ZWFtIHdpbGwgc2V0dXAgYWxsIHRlYW0gbWVtYmVycyBhcyBhZG1pbiBhY2Nlc3MgdG8gdGhlIGNsdXN0ZXIgYnkgYWRkaW5nIHRoZW0gdG8gdGhlIG1hc3RlciBncm91cC5cbiAqIFRoZSBzZXR1cCBza2lwcyBuYW1lc3BhY2UvcXVvdGEgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFBsYXRmb3JtVGVhbSBleHRlbmRzIEFwcGxpY2F0aW9uVGVhbSB7XG5cbiAgICBjb25zdHJ1Y3Rvcih0ZWFtUHJvcHM6IFRlYW1Qcm9wcykge1xuICAgICAgICBzdXBlcih0ZWFtUHJvcHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvXG4gICAgICovXG4gICAgc2V0dXAoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGVmYXVsdFNldHVwQWRtaW5BY2Nlc3MoY2x1c3RlckluZm8pO1xuICAgIH1cbn1cbiJdfQ==