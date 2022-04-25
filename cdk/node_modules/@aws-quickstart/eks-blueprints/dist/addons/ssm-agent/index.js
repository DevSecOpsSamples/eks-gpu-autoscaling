"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSMAgentAddOn = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const cluster_providers_1 = require("../../cluster-providers");
class SSMAgentAddOn {
    deploy(clusterInfo) {
        const cluster = clusterInfo.cluster;
        const nodeGroups = (0, cluster_providers_1.assertEC2NodeGroup)(clusterInfo, SSMAgentAddOn.name);
        // Add AWS Managed Policy for SSM
        nodeGroups.forEach(nodeGroup => nodeGroup.role.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')));
        // Apply manifest.
        // See APG Pattern https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/install-ssm-agent-on-amazon-eks-worker-nodes-by-using-kubernetes-daemonset.html
        const appLabel = { app: "ssm-installer" };
        const daemonSet = {
            apiVersion: "apps/v1",
            kind: "DaemonSet",
            metadata: {
                name: "ssm-installer",
                namespace: "kube-system"
            },
            spec: {
                selector: { matchLabels: appLabel },
                updateStrategy: { type: "RollingUpdate" },
                template: {
                    metadata: { labels: appLabel },
                    spec: {
                        containers: [
                            {
                                name: "pause",
                                image: "gcr.io/google_containers/pause",
                                resources: {
                                    limits: {
                                        cpu: "100m",
                                        memory: "128Mi",
                                    },
                                    requests: {
                                        cpu: "100m",
                                        memory: "128Mi",
                                    },
                                }
                            }
                        ],
                        initContainers: [
                            {
                                image: "public.ecr.aws/amazon-ssm-agent/amazon-ssm-agent:3.1.90.0",
                                imagePullPolicy: "Always",
                                name: "ssm-install",
                                securityContext: {
                                    allowPrivilegeEscalation: true
                                },
                                volumeMounts: [
                                    {
                                        mountPath: "/etc/cron.d",
                                        name: "cronfile"
                                    }
                                ],
                                resources: {
                                    limits: {
                                        cpu: "100m",
                                        memory: "256Mi",
                                    },
                                    requests: {
                                        cpu: "100m",
                                        memory: "256Mi",
                                    },
                                },
                                terminationMessagePath: "/dev/termination.log",
                                terminationMessagePolicy: "File",
                            }
                        ],
                        volumes: [
                            {
                                name: "cronfile",
                                hostPath: {
                                    path: "/etc/cron.d",
                                    type: "Directory"
                                }
                            }
                        ],
                        dnsPolicy: "ClusterFirst",
                        restartPolicy: "Always",
                        schedulerName: "default-scheduler",
                        terminationGracePeriodSeconds: 30
                    }
                }
            }
        };
        new aws_eks_1.KubernetesManifest(cluster.stack, "ssm-agent", {
            cluster,
            manifest: [daemonSet]
        });
    }
}
exports.SSMAgentAddOn = SSMAgentAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3NzbS1hZ2VudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBeUQ7QUFDekQsaURBQW9EO0FBQ3BELCtEQUE2RDtBQUc3RCxNQUFhLGFBQWE7SUFDdEIsTUFBTSxDQUFDLFdBQXdCO1FBQzNCLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEMsTUFBTSxVQUFVLEdBQUcsSUFBQSxzQ0FBa0IsRUFBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZFLGlDQUFpQztRQUNqQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQzNCLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3RyxrQkFBa0I7UUFDbEIsb0tBQW9LO1FBQ3BLLE1BQU0sUUFBUSxHQUFHLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRSxDQUFDO1FBRTFDLE1BQU0sU0FBUyxHQUFHO1lBQ2QsVUFBVSxFQUFFLFNBQVM7WUFDckIsSUFBSSxFQUFFLFdBQVc7WUFDakIsUUFBUSxFQUFFO2dCQUNOLElBQUksRUFBRSxlQUFlO2dCQUNyQixTQUFTLEVBQUUsYUFBYTthQUMzQjtZQUNELElBQUksRUFBRTtnQkFDRixRQUFRLEVBQUUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFO2dCQUNuQyxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFO2dCQUN6QyxRQUFRLEVBQUU7b0JBQ04sUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtvQkFDOUIsSUFBSSxFQUFFO3dCQUNGLFVBQVUsRUFBRTs0QkFDUjtnQ0FDSSxJQUFJLEVBQUUsT0FBTztnQ0FDYixLQUFLLEVBQUUsZ0NBQWdDO2dDQUN2QyxTQUFTLEVBQUU7b0NBQ1AsTUFBTSxFQUFFO3dDQUNKLEdBQUcsRUFBRSxNQUFNO3dDQUNYLE1BQU0sRUFBRSxPQUFPO3FDQUNsQjtvQ0FDRCxRQUFRLEVBQUU7d0NBQ04sR0FBRyxFQUFFLE1BQU07d0NBQ1gsTUFBTSxFQUFFLE9BQU87cUNBQ2xCO2lDQUNKOzZCQUNKO3lCQUNKO3dCQUNELGNBQWMsRUFBRTs0QkFDWjtnQ0FDSSxLQUFLLEVBQUUsMkRBQTJEO2dDQUNsRSxlQUFlLEVBQUUsUUFBUTtnQ0FDekIsSUFBSSxFQUFFLGFBQWE7Z0NBQ25CLGVBQWUsRUFBRTtvQ0FDYix3QkFBd0IsRUFBRSxJQUFJO2lDQUNqQztnQ0FDRCxZQUFZLEVBQUU7b0NBQ1Y7d0NBQ0ksU0FBUyxFQUFFLGFBQWE7d0NBQ3hCLElBQUksRUFBRSxVQUFVO3FDQUNuQjtpQ0FDSjtnQ0FDRCxTQUFTLEVBQUU7b0NBQ1AsTUFBTSxFQUFFO3dDQUNKLEdBQUcsRUFBRSxNQUFNO3dDQUNYLE1BQU0sRUFBRSxPQUFPO3FDQUNsQjtvQ0FDRCxRQUFRLEVBQUU7d0NBQ04sR0FBRyxFQUFFLE1BQU07d0NBQ1gsTUFBTSxFQUFFLE9BQU87cUNBQ2xCO2lDQUNKO2dDQUNELHNCQUFzQixFQUFFLHNCQUFzQjtnQ0FDOUMsd0JBQXdCLEVBQUUsTUFBTTs2QkFDbkM7eUJBQ0o7d0JBQ0QsT0FBTyxFQUFFOzRCQUNMO2dDQUNJLElBQUksRUFBRSxVQUFVO2dDQUNoQixRQUFRLEVBQUU7b0NBQ04sSUFBSSxFQUFFLGFBQWE7b0NBQ25CLElBQUksRUFBRSxXQUFXO2lDQUNwQjs2QkFDSjt5QkFDSjt3QkFDRCxTQUFTLEVBQUUsY0FBYzt3QkFDekIsYUFBYSxFQUFFLFFBQVE7d0JBQ3ZCLGFBQWEsRUFBRSxtQkFBbUI7d0JBQ2xDLDZCQUE2QixFQUFFLEVBQUU7cUJBQ3BDO2lCQUNKO2FBQ0o7U0FDSixDQUFDO1FBRUYsSUFBSSw0QkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRTtZQUMvQyxPQUFPO1lBQ1AsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDO1NBQ3hCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTdGRCxzQ0E2RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBLdWJlcm5ldGVzTWFuaWZlc3QgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgTWFuYWdlZFBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgeyBhc3NlcnRFQzJOb2RlR3JvdXAgfSBmcm9tIFwiLi4vLi4vY2x1c3Rlci1wcm92aWRlcnNcIjtcbmltcG9ydCB7IENsdXN0ZXJBZGRPbiwgQ2x1c3RlckluZm8gfSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5cbmV4cG9ydCBjbGFzcyBTU01BZ2VudEFkZE9uIGltcGxlbWVudHMgQ2x1c3RlckFkZE9uIHtcbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBjb25zdCBub2RlR3JvdXBzID0gYXNzZXJ0RUMyTm9kZUdyb3VwKGNsdXN0ZXJJbmZvLCBTU01BZ2VudEFkZE9uLm5hbWUpO1xuXG4gICAgICAgIC8vIEFkZCBBV1MgTWFuYWdlZCBQb2xpY3kgZm9yIFNTTVxuICAgICAgICBub2RlR3JvdXBzLmZvckVhY2gobm9kZUdyb3VwID0+IFxuICAgICAgICAgICAgbm9kZUdyb3VwLnJvbGUuYWRkTWFuYWdlZFBvbGljeShNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uU1NNTWFuYWdlZEluc3RhbmNlQ29yZScpKSk7XG5cbiAgICAgICAgLy8gQXBwbHkgbWFuaWZlc3QuXG4gICAgICAgIC8vIFNlZSBBUEcgUGF0dGVybiBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vcHJlc2NyaXB0aXZlLWd1aWRhbmNlL2xhdGVzdC9wYXR0ZXJucy9pbnN0YWxsLXNzbS1hZ2VudC1vbi1hbWF6b24tZWtzLXdvcmtlci1ub2Rlcy1ieS11c2luZy1rdWJlcm5ldGVzLWRhZW1vbnNldC5odG1sXG4gICAgICAgIGNvbnN0IGFwcExhYmVsID0geyBhcHA6IFwic3NtLWluc3RhbGxlclwiIH07XG5cbiAgICAgICAgY29uc3QgZGFlbW9uU2V0ID0ge1xuICAgICAgICAgICAgYXBpVmVyc2lvbjogXCJhcHBzL3YxXCIsXG4gICAgICAgICAgICBraW5kOiBcIkRhZW1vblNldFwiLFxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcInNzbS1pbnN0YWxsZXJcIixcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IFwia3ViZS1zeXN0ZW1cIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNwZWM6IHtcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogeyBtYXRjaExhYmVsczogYXBwTGFiZWwgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGVTdHJhdGVneTogeyB0eXBlOiBcIlJvbGxpbmdVcGRhdGVcIiB9LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7IGxhYmVsczogYXBwTGFiZWwgfSxcbiAgICAgICAgICAgICAgICAgICAgc3BlYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJwYXVzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogXCJnY3IuaW8vZ29vZ2xlX2NvbnRhaW5lcnMvcGF1c2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW1pdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcHU6IFwiMTAwbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbW9yeTogXCIxMjhNaVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3B1OiBcIjEwMG1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1vcnk6IFwiMTI4TWlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdENvbnRhaW5lcnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBcInB1YmxpYy5lY3IuYXdzL2FtYXpvbi1zc20tYWdlbnQvYW1hem9uLXNzbS1hZ2VudDozLjEuOTAuMFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVB1bGxQb2xpY3k6IFwiQWx3YXlzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwic3NtLWluc3RhbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjdXJpdHlDb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1ByaXZpbGVnZUVzY2FsYXRpb246IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9sdW1lTW91bnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW91bnRQYXRoOiBcIi9ldGMvY3Jvbi5kXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJjcm9uZmlsZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGltaXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3B1OiBcIjEwMG1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1vcnk6IFwiMjU2TWlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwdTogXCIxMDBtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtb3J5OiBcIjI1Nk1pXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXJtaW5hdGlvbk1lc3NhZ2VQYXRoOiBcIi9kZXYvdGVybWluYXRpb24ubG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0aW9uTWVzc2FnZVBvbGljeTogXCJGaWxlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvbHVtZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiY3JvbmZpbGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdFBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IFwiL2V0Yy9jcm9uLmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiRGlyZWN0b3J5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkbnNQb2xpY3k6IFwiQ2x1c3RlckZpcnN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN0YXJ0UG9saWN5OiBcIkFsd2F5c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NoZWR1bGVyTmFtZTogXCJkZWZhdWx0LXNjaGVkdWxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVybWluYXRpb25HcmFjZVBlcmlvZFNlY29uZHM6IDMwXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbmV3IEt1YmVybmV0ZXNNYW5pZmVzdChjbHVzdGVyLnN0YWNrLCBcInNzbS1hZ2VudFwiLCB7XG4gICAgICAgICAgICBjbHVzdGVyLFxuICAgICAgICAgICAgbWFuaWZlc3Q6IFtkYWVtb25TZXRdXG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=