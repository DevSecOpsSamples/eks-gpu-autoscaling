"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultTeamRoles = void 0;
class DefaultTeamRoles {
    createManifest(namespace) {
        return [
            {
                apiVersion: "rbac.authorization.k8s.io/v1",
                kind: "ClusterRole",
                metadata: {
                    name: `${namespace}-team-cluster-role`
                },
                rules: [
                    {
                        apiGroups: [
                            ""
                        ],
                        resources: [
                            "nodes",
                            "namespaces"
                        ],
                        verbs: [
                            "get",
                            "list"
                        ]
                    }
                ]
            },
            {
                apiVersion: "rbac.authorization.k8s.io/v1",
                kind: "ClusterRoleBinding",
                metadata: {
                    name: `${namespace}-team-cluster-role-binding`
                },
                subjects: [
                    {
                        kind: "Group",
                        name: `${namespace}-team-group`,
                        apiGroup: "rbac.authorization.k8s.io"
                    }
                ],
                roleRef: {
                    kind: "ClusterRole",
                    name: `${namespace}-team-cluster-role`,
                    apiGroup: "rbac.authorization.k8s.io"
                }
            },
            {
                apiVersion: "rbac.authorization.k8s.io/v1",
                kind: "Role",
                metadata: {
                    namespace: namespace,
                    name: `${namespace}-team-role`
                },
                rules: [
                    {
                        apiGroups: [
                            ""
                        ],
                        resources: [
                            "pods"
                        ],
                        verbs: [
                            "get",
                            "list"
                        ]
                    },
                    {
                        apiGroups: [
                            "apps"
                        ],
                        resources: [
                            "deployments",
                            "daemonsets",
                            "statefulsets",
                            "replicasets"
                        ],
                        verbs: [
                            "get",
                            "list"
                        ]
                    },
                    {
                        apiGroups: [
                            "batch"
                        ],
                        resources: [
                            "jobs"
                        ],
                        verbs: [
                            "get",
                            "list"
                        ]
                    }
                ]
            },
            {
                apiVersion: "rbac.authorization.k8s.io/v1",
                kind: "RoleBinding",
                metadata: {
                    name: `${namespace}-team-role-binding`,
                    namespace: namespace
                },
                subjects: [
                    {
                        kind: "Group",
                        name: `${namespace}-team-group`,
                        apiGroup: "rbac.authorization.k8s.io"
                    }
                ],
                roleRef: {
                    kind: "Role",
                    name: `${namespace}-team-role`,
                    apiGroup: "rbac.authorization.k8s.io"
                }
            }
        ];
    }
}
exports.DefaultTeamRoles = DefaultTeamRoles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC10ZWFtLXJvbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3RlYW1zL2RlZmF1bHQtdGVhbS1yb2xlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLGdCQUFnQjtJQUV6QixjQUFjLENBQUMsU0FBaUI7UUFDNUIsT0FBTztZQUNIO2dCQUNJLFVBQVUsRUFBRSw4QkFBOEI7Z0JBQzFDLElBQUksRUFBRSxhQUFhO2dCQUNuQixRQUFRLEVBQUU7b0JBQ04sSUFBSSxFQUFFLEdBQUcsU0FBUyxvQkFBb0I7aUJBQ3pDO2dCQUNELEtBQUssRUFBRTtvQkFDSDt3QkFDSSxTQUFTLEVBQUU7NEJBQ1AsRUFBRTt5QkFDTDt3QkFDRCxTQUFTLEVBQUU7NEJBQ1AsT0FBTzs0QkFDUCxZQUFZO3lCQUNmO3dCQUNELEtBQUssRUFBRTs0QkFDSCxLQUFLOzRCQUNMLE1BQU07eUJBQ1Q7cUJBQ0o7aUJBQ0o7YUFDSjtZQUNEO2dCQUNJLFVBQVUsRUFBRSw4QkFBOEI7Z0JBQzFDLElBQUksRUFBRSxvQkFBb0I7Z0JBQzFCLFFBQVEsRUFBRTtvQkFDTixJQUFJLEVBQUUsR0FBRyxTQUFTLDRCQUE0QjtpQkFDakQ7Z0JBQ0QsUUFBUSxFQUFFO29CQUNOO3dCQUNJLElBQUksRUFBRSxPQUFPO3dCQUNiLElBQUksRUFBRSxHQUFHLFNBQVMsYUFBYTt3QkFDL0IsUUFBUSxFQUFFLDJCQUEyQjtxQkFDeEM7aUJBQ0o7Z0JBQ0QsT0FBTyxFQUFFO29CQUNMLElBQUksRUFBRSxhQUFhO29CQUNuQixJQUFJLEVBQUUsR0FBRyxTQUFTLG9CQUFvQjtvQkFDdEMsUUFBUSxFQUFFLDJCQUEyQjtpQkFDeEM7YUFDSjtZQUNEO2dCQUNJLFVBQVUsRUFBRSw4QkFBOEI7Z0JBQzFDLElBQUksRUFBRSxNQUFNO2dCQUNaLFFBQVEsRUFBRTtvQkFDTixTQUFTLEVBQUUsU0FBUztvQkFDcEIsSUFBSSxFQUFFLEdBQUcsU0FBUyxZQUFZO2lCQUNqQztnQkFDRCxLQUFLLEVBQUU7b0JBQ0g7d0JBQ0ksU0FBUyxFQUFFOzRCQUNQLEVBQUU7eUJBQ0w7d0JBQ0QsU0FBUyxFQUFFOzRCQUNQLE1BQU07eUJBQ1Q7d0JBQ0QsS0FBSyxFQUFFOzRCQUNILEtBQUs7NEJBQ0wsTUFBTTt5QkFDVDtxQkFDSjtvQkFDRDt3QkFDSSxTQUFTLEVBQUU7NEJBQ1AsTUFBTTt5QkFDVDt3QkFDRCxTQUFTLEVBQUU7NEJBQ1AsYUFBYTs0QkFDYixZQUFZOzRCQUNaLGNBQWM7NEJBQ2QsYUFBYTt5QkFDaEI7d0JBQ0QsS0FBSyxFQUFFOzRCQUNILEtBQUs7NEJBQ0wsTUFBTTt5QkFDVDtxQkFDSjtvQkFDRDt3QkFDSSxTQUFTLEVBQUU7NEJBQ1AsT0FBTzt5QkFDVjt3QkFDRCxTQUFTLEVBQUU7NEJBQ1AsTUFBTTt5QkFDVDt3QkFDRCxLQUFLLEVBQUU7NEJBQ0gsS0FBSzs0QkFDTCxNQUFNO3lCQUNUO3FCQUNKO2lCQUNKO2FBQ0o7WUFDRDtnQkFDSSxVQUFVLEVBQUUsOEJBQThCO2dCQUMxQyxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsUUFBUSxFQUFFO29CQUNOLElBQUksRUFBRSxHQUFHLFNBQVMsb0JBQW9CO29CQUN0QyxTQUFTLEVBQUUsU0FBUztpQkFDdkI7Z0JBQ0QsUUFBUSxFQUFFO29CQUNOO3dCQUNJLElBQUksRUFBRSxPQUFPO3dCQUNiLElBQUksRUFBRSxHQUFHLFNBQVMsYUFBYTt3QkFDL0IsUUFBUSxFQUFFLDJCQUEyQjtxQkFDeEM7aUJBQ0o7Z0JBQ0QsT0FBTyxFQUFFO29CQUNMLElBQUksRUFBRSxNQUFNO29CQUNaLElBQUksRUFBRSxHQUFHLFNBQVMsWUFBWTtvQkFDOUIsUUFBUSxFQUFFLDJCQUEyQjtpQkFDeEM7YUFDSjtTQUNKLENBQUM7SUFFTixDQUFDO0NBQ0o7QUFySEQsNENBcUhDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIERlZmF1bHRUZWFtUm9sZXMge1xuXG4gICAgY3JlYXRlTWFuaWZlc3QobmFtZXNwYWNlOiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+W10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFwaVZlcnNpb246IFwicmJhYy5hdXRob3JpemF0aW9uLms4cy5pby92MVwiLFxuICAgICAgICAgICAgICAgIGtpbmQ6IFwiQ2x1c3RlclJvbGVcIixcbiAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBgJHtuYW1lc3BhY2V9LXRlYW0tY2x1c3Rlci1yb2xlYFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpR3JvdXBzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibm9kZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVzcGFjZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcmJzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJnZXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxpc3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhcGlWZXJzaW9uOiBcInJiYWMuYXV0aG9yaXphdGlvbi5rOHMuaW8vdjFcIixcbiAgICAgICAgICAgICAgICBraW5kOiBcIkNsdXN0ZXJSb2xlQmluZGluZ1wiLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke25hbWVzcGFjZX0tdGVhbS1jbHVzdGVyLXJvbGUtYmluZGluZ2BcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1YmplY3RzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwiR3JvdXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke25hbWVzcGFjZX0tdGVhbS1ncm91cGAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcGlHcm91cDogXCJyYmFjLmF1dGhvcml6YXRpb24uazhzLmlvXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcm9sZVJlZjoge1xuICAgICAgICAgICAgICAgICAgICBraW5kOiBcIkNsdXN0ZXJSb2xlXCIsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke25hbWVzcGFjZX0tdGVhbS1jbHVzdGVyLXJvbGVgLFxuICAgICAgICAgICAgICAgICAgICBhcGlHcm91cDogXCJyYmFjLmF1dGhvcml6YXRpb24uazhzLmlvXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFwaVZlcnNpb246IFwicmJhYy5hdXRob3JpemF0aW9uLms4cy5pby92MVwiLFxuICAgICAgICAgICAgICAgIGtpbmQ6IFwiUm9sZVwiLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBgJHtuYW1lc3BhY2V9LXRlYW0tcm9sZWBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaUdyb3VwczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvZHNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcmJzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJnZXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxpc3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGlHcm91cHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFwcHNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVwbG95bWVudHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhZW1vbnNldHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YXRlZnVsc2V0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVwbGljYXNldHNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcmJzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJnZXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxpc3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGlHcm91cHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhdGNoXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImpvYnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcmJzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJnZXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxpc3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhcGlWZXJzaW9uOiBcInJiYWMuYXV0aG9yaXphdGlvbi5rOHMuaW8vdjFcIixcbiAgICAgICAgICAgICAgICBraW5kOiBcIlJvbGVCaW5kaW5nXCIsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYCR7bmFtZXNwYWNlfS10ZWFtLXJvbGUtYmluZGluZ2AsXG4gICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWJqZWN0czogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBcIkdyb3VwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBgJHtuYW1lc3BhY2V9LXRlYW0tZ3JvdXBgLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXBpR3JvdXA6IFwicmJhYy5hdXRob3JpemF0aW9uLms4cy5pb1wiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJvbGVSZWY6IHtcbiAgICAgICAgICAgICAgICAgICAga2luZDogXCJSb2xlXCIsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke25hbWVzcGFjZX0tdGVhbS1yb2xlYCxcbiAgICAgICAgICAgICAgICAgICAgYXBpR3JvdXA6IFwicmJhYy5hdXRob3JpemF0aW9uLms4cy5pb1wiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgfVxufSJdfQ==