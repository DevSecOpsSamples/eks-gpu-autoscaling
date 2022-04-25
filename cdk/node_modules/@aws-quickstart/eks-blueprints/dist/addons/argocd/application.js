"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgoApplication = void 0;
const dot = require("dot-object");
/**
 * Argo Application is a utility class that can generate an ArgoCD application
 * from generic GitOps application properties.
 */
class ArgoApplication {
    constructor(bootstrapRepo) {
        this.bootstrapRepo = bootstrapRepo;
    }
    generate(deployment, syncOrder) {
        var _a, _b;
        const flatValues = dot.dot(deployment.values);
        const nameValues = [];
        for (let key in flatValues) {
            nameValues.push({ name: key, value: `${flatValues[key]}` });
        }
        const repository = (_a = deployment.repository) !== null && _a !== void 0 ? _a : this.generateDefaultRepo(deployment.name);
        return {
            apiVersion: "argoproj.io/v1alpha1",
            kind: "Application",
            metadata: {
                name: deployment.name,
                namespace: 'argocd',
                annotations: {
                    "argocd.argoproj.io/sync-wave": syncOrder == undefined ? "-1" : `${syncOrder}`
                }
            },
            spec: {
                destination: {
                    namespace: deployment.namespace,
                    server: "https://kubernetes.default.svc"
                },
                project: "default",
                source: {
                    helm: {
                        valueFiles: ["values.yaml"],
                        parameters: nameValues
                    },
                    path: repository.path,
                    repoURL: repository.repoUrl,
                    targetRevision: (_b = repository.targetRevision) !== null && _b !== void 0 ? _b : 'HEAD'
                },
                syncPolicy: {
                    automated: {}
                }
            }
        };
    }
    /**
     * Creates an opinionated path.
     * @param name
     * @returns
     */
    generateDefaultRepo(name) {
        if (this.bootstrapRepo) {
            return {
                name: this.bootstrapRepo.name,
                repoUrl: this.bootstrapRepo.repoUrl,
                path: this.bootstrapRepo.path + `/addons/${name}`,
                targetRevision: this.bootstrapRepo.targetRevision
            };
        }
        throw new Error("With GitOps configuration management enabled either specify GitOps repository for each add-on or provide a bootstrap application to the ArgoCD add-on.");
    }
}
exports.ArgoApplication = ArgoApplication;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2FyZ29jZC9hcHBsaWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrQ0FBa0M7QUFHbEM7OztHQUdHO0FBQ0gsTUFBYSxlQUFlO0lBRXhCLFlBQTZCLGFBQWlEO1FBQWpELGtCQUFhLEdBQWIsYUFBYSxDQUFvQztJQUFHLENBQUM7SUFFM0UsUUFBUSxDQUFDLFVBQXVDLEVBQUUsU0FBa0I7O1FBRXZFLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUV0QixLQUFLLElBQUksR0FBRyxJQUFJLFVBQVUsRUFBRTtZQUN4QixVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUM7U0FDOUQ7UUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFBLFVBQVUsQ0FBQyxVQUFVLG1DQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEYsT0FBTztZQUNILFVBQVUsRUFBRSxzQkFBc0I7WUFDbEMsSUFBSSxFQUFFLGFBQWE7WUFDbkIsUUFBUSxFQUFFO2dCQUNOLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtnQkFDckIsU0FBUyxFQUFFLFFBQVE7Z0JBQ25CLFdBQVcsRUFBRTtvQkFDVCw4QkFBOEIsRUFBRSxTQUFTLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxFQUFFO2lCQUNqRjthQUNKO1lBQ0QsSUFBSSxFQUFFO2dCQUNGLFdBQVcsRUFBRTtvQkFDVCxTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVM7b0JBQy9CLE1BQU0sRUFBRSxnQ0FBZ0M7aUJBQzNDO2dCQUNELE9BQU8sRUFBRSxTQUFTO2dCQUNsQixNQUFNLEVBQUU7b0JBQ0osSUFBSSxFQUFFO3dCQUNGLFVBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQzt3QkFDM0IsVUFBVSxFQUFFLFVBQVU7cUJBQ3pCO29CQUNELElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtvQkFDckIsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPO29CQUMzQixjQUFjLEVBQUUsTUFBQSxVQUFVLENBQUMsY0FBYyxtQ0FBSSxNQUFNO2lCQUN0RDtnQkFDRCxVQUFVLEVBQUU7b0JBQ1IsU0FBUyxFQUFFLEVBQUU7aUJBQ2hCO2FBQ0o7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxtQkFBbUIsQ0FBQyxJQUFZO1FBQzVCLElBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNuQixPQUFPO2dCQUNILElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUk7Z0JBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU87Z0JBQ25DLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksR0FBRyxXQUFXLElBQUksRUFBRTtnQkFDakQsY0FBYyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYzthQUNwRCxDQUFDO1NBQ0w7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHdKQUF3SixDQUFDLENBQUM7SUFDOUssQ0FBQztDQUNKO0FBL0RELDBDQStEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGRvdCBmcm9tICdkb3Qtb2JqZWN0JztcbmltcG9ydCB7IEdpdE9wc0FwcGxpY2F0aW9uRGVwbG95bWVudCwgR2l0UmVwb3NpdG9yeVJlZmVyZW5jZSB9IGZyb20gJy4uLy4uL3NwaSc7XG5cbi8qKlxuICogQXJnbyBBcHBsaWNhdGlvbiBpcyBhIHV0aWxpdHkgY2xhc3MgdGhhdCBjYW4gZ2VuZXJhdGUgYW4gQXJnb0NEIGFwcGxpY2F0aW9uXG4gKiBmcm9tIGdlbmVyaWMgR2l0T3BzIGFwcGxpY2F0aW9uIHByb3BlcnRpZXMuICBcbiAqL1xuZXhwb3J0IGNsYXNzIEFyZ29BcHBsaWNhdGlvbiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGJvb3RzdHJhcFJlcG86IEdpdFJlcG9zaXRvcnlSZWZlcmVuY2UgfCB1bmRlZmluZWQpIHt9XG5cbiAgICBwdWJsaWMgZ2VuZXJhdGUoZGVwbG95bWVudDogR2l0T3BzQXBwbGljYXRpb25EZXBsb3ltZW50LCBzeW5jT3JkZXI/OiBudW1iZXIpIHtcblxuICAgICAgICBjb25zdCBmbGF0VmFsdWVzID0gZG90LmRvdChkZXBsb3ltZW50LnZhbHVlcyk7XG4gICAgICAgIGNvbnN0IG5hbWVWYWx1ZXMgPSBbXTtcblxuICAgICAgICBmb3IoIGxldCBrZXkgaW4gZmxhdFZhbHVlcykge1xuICAgICAgICAgICAgbmFtZVZhbHVlcy5wdXNoKHsgbmFtZToga2V5LCB2YWx1ZTogYCR7ZmxhdFZhbHVlc1trZXldfWB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcG9zaXRvcnkgPSBkZXBsb3ltZW50LnJlcG9zaXRvcnkgPz8gdGhpcy5nZW5lcmF0ZURlZmF1bHRSZXBvKGRlcGxveW1lbnQubmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFwaVZlcnNpb246IFwiYXJnb3Byb2ouaW8vdjFhbHBoYTFcIixcbiAgICAgICAgICAgIGtpbmQ6IFwiQXBwbGljYXRpb25cIixcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogZGVwbG95bWVudC5uYW1lLFxuICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogJ2FyZ29jZCcsXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJhcmdvY2QuYXJnb3Byb2ouaW8vc3luYy13YXZlXCI6IHN5bmNPcmRlciA9PSB1bmRlZmluZWQgPyBcIi0xXCIgOiBgJHtzeW5jT3JkZXJ9YFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzcGVjOiB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBkZXBsb3ltZW50Lm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyOiBcImh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Y1wiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0OiBcImRlZmF1bHRcIiwgLy9UT0RPOiBtYWtlIHByb2plY3QgY29uZmlndXJhYmxlXG4gICAgICAgICAgICAgICAgc291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlbG06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlRmlsZXM6IFtcInZhbHVlcy55YW1sXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVyczogbmFtZVZhbHVlc1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiByZXBvc2l0b3J5LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHJlcG9VUkw6IHJlcG9zaXRvcnkucmVwb1VybCxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UmV2aXNpb246IHJlcG9zaXRvcnkudGFyZ2V0UmV2aXNpb24gPz8gJ0hFQUQnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzeW5jUG9saWN5OiB7XG4gICAgICAgICAgICAgICAgICAgIGF1dG9tYXRlZDoge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvcGluaW9uYXRlZCBwYXRoLlxuICAgICAqIEBwYXJhbSBuYW1lIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGdlbmVyYXRlRGVmYXVsdFJlcG8obmFtZTogc3RyaW5nKTogR2l0UmVwb3NpdG9yeVJlZmVyZW5jZSB7XG4gICAgICAgIGlmKHRoaXMuYm9vdHN0cmFwUmVwbykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmJvb3RzdHJhcFJlcG8ubmFtZSxcbiAgICAgICAgICAgICAgICByZXBvVXJsOiB0aGlzLmJvb3RzdHJhcFJlcG8ucmVwb1VybCxcbiAgICAgICAgICAgICAgICBwYXRoOiB0aGlzLmJvb3RzdHJhcFJlcG8ucGF0aCArIGAvYWRkb25zLyR7bmFtZX1gLFxuICAgICAgICAgICAgICAgIHRhcmdldFJldmlzaW9uOiB0aGlzLmJvb3RzdHJhcFJlcG8udGFyZ2V0UmV2aXNpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2l0aCBHaXRPcHMgY29uZmlndXJhdGlvbiBtYW5hZ2VtZW50IGVuYWJsZWQgZWl0aGVyIHNwZWNpZnkgR2l0T3BzIHJlcG9zaXRvcnkgZm9yIGVhY2ggYWRkLW9uIG9yIHByb3ZpZGUgYSBib290c3RyYXAgYXBwbGljYXRpb24gdG8gdGhlIEFyZ29DRCBhZGQtb24uXCIpO1xuICAgIH1cbn0iXX0=