"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserNameSecretRef = exports.createSshSecretRef = exports.createSecretRef = void 0;
const __1 = require("..");
/**
 * Creates CsiSecretProps that contains secret template for ssh/username/pwd credentials.
 * In each case, the secret is expected to be a JSON structure containing url and either sshPrivateKey
 * or username and password attributes.
 * @param credentialsType SSH | USERNAME | TOKEN
 * @param secretName
 * @returns
 */
function createSecretRef(credentialsType, secretName) {
    switch (credentialsType) {
        case "SSH":
            return createSshSecretRef(secretName);
        case "USERNAME":
        case "TOKEN":
            return createUserNameSecretRef(secretName);
        default:
            throw new Error(`credentials type ${credentialsType} is not supported by ArgoCD add-on.`);
    }
}
exports.createSecretRef = createSecretRef;
/**
 * Local function to create a secret reference for SSH key.
 * @param url
 * @param secretName
 * @returns
 */
function createSshSecretRef(secretName) {
    return {
        secretProvider: new __1.LookupSecretsManagerSecretByName(secretName),
        jmesPath: [{ path: "url", objectAlias: "url" }, { path: "sshPrivateKey", objectAlias: "sshPrivateKey" }],
        kubernetesSecret: {
            secretName: secretName,
            labels: { "argocd.argoproj.io/secret-type": "repo-creds" },
            data: [
                { key: "url", objectName: "url" },
                { key: "sshPrivateKey", objectName: "sshPrivateKey" }
            ]
        }
    };
}
exports.createSshSecretRef = createSshSecretRef;
/**
 * Local function to a secret reference for username/pwd or username/token key.
 * @param url
 * @param secretName
 * @returns
 */
function createUserNameSecretRef(secretName) {
    return {
        secretProvider: new __1.LookupSecretsManagerSecretByName(secretName),
        jmesPath: [{ path: "url", objectAlias: "url" }, { path: "username", objectAlias: "username" }, { path: "password", objectAlias: "password" }],
        kubernetesSecret: {
            secretName: secretName,
            labels: new Map([
                ["argocd.argoproj.io/secret-type", "repo-creds"]
            ]),
            data: [
                { key: "url", objectName: "url" },
                { key: "username", objectName: "username" },
                { key: "password", objectName: "password" }
            ]
        }
    };
}
exports.createUserNameSecretRef = createUserNameSecretRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuaWZlc3QtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2FyZ29jZC9tYW5pZmVzdC11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQkFBc0U7QUFFdEU7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLGVBQWUsQ0FBQyxlQUF1QixFQUFFLFVBQWtCO0lBQ3ZFLFFBQVEsZUFBZSxFQUFFO1FBQ3JCLEtBQUssS0FBSztZQUNOLE9BQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUMsS0FBSyxVQUFVLENBQUM7UUFDaEIsS0FBSyxPQUFPO1lBQ1IsT0FBTyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQztZQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLGVBQWUscUNBQXFDLENBQUMsQ0FBQztLQUNqRztBQUNMLENBQUM7QUFWRCwwQ0FVQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsVUFBa0I7SUFDakQsT0FBTztRQUNILGNBQWMsRUFBRSxJQUFJLG9DQUFnQyxDQUFDLFVBQVUsQ0FBQztRQUNoRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLENBQUM7UUFDeEcsZ0JBQWdCLEVBQUU7WUFDZCxVQUFVLEVBQUUsVUFBVTtZQUN0QixNQUFNLEVBQUUsRUFBRSxnQ0FBZ0MsRUFBRSxZQUFZLEVBQUU7WUFDMUQsSUFBSSxFQUFFO2dCQUNGLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFO2dCQUNqQyxFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRTthQUN4RDtTQUNKO0tBQ0osQ0FBQztBQUNOLENBQUM7QUFiRCxnREFhQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsdUJBQXVCLENBQUMsVUFBa0I7SUFDdEQsT0FBTztRQUNILGNBQWMsRUFBRSxJQUFJLG9DQUFnQyxDQUFDLFVBQVUsQ0FBQztRQUNoRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQztRQUM3SSxnQkFBZ0IsRUFBRTtZQUNkLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLE1BQU0sRUFBRSxJQUFJLEdBQUcsQ0FBQztnQkFDWixDQUFFLGdDQUFnQyxFQUFFLFlBQVksQ0FBRTthQUNyRCxDQUFDO1lBQ0YsSUFBSSxFQUFFO2dCQUNGLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFO2dCQUNqQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRTtnQkFDM0MsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUU7YUFDOUM7U0FDSjtLQUNKLENBQUM7QUFDTixDQUFDO0FBaEJELDBEQWdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENzaVNlY3JldFByb3BzLCBMb29rdXBTZWNyZXRzTWFuYWdlclNlY3JldEJ5TmFtZSB9IGZyb20gXCIuLlwiO1xuXG4vKipcbiAqIENyZWF0ZXMgQ3NpU2VjcmV0UHJvcHMgdGhhdCBjb250YWlucyBzZWNyZXQgdGVtcGxhdGUgZm9yIHNzaC91c2VybmFtZS9wd2QgY3JlZGVudGlhbHMuXG4gKiBJbiBlYWNoIGNhc2UsIHRoZSBzZWNyZXQgaXMgZXhwZWN0ZWQgdG8gYmUgYSBKU09OIHN0cnVjdHVyZSBjb250YWluaW5nIHVybCBhbmQgZWl0aGVyIHNzaFByaXZhdGVLZXlcbiAqIG9yIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIGNyZWRlbnRpYWxzVHlwZSBTU0ggfCBVU0VSTkFNRSB8IFRPS0VOXG4gKiBAcGFyYW0gc2VjcmV0TmFtZSBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2VjcmV0UmVmKGNyZWRlbnRpYWxzVHlwZTogc3RyaW5nLCBzZWNyZXROYW1lOiBzdHJpbmcpOiBDc2lTZWNyZXRQcm9wcyB7XG4gICAgc3dpdGNoIChjcmVkZW50aWFsc1R5cGUpIHtcbiAgICAgICAgY2FzZSBcIlNTSFwiOlxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVNzaFNlY3JldFJlZihzZWNyZXROYW1lKTtcbiAgICAgICAgY2FzZSBcIlVTRVJOQU1FXCI6XG4gICAgICAgIGNhc2UgXCJUT0tFTlwiOlxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVVzZXJOYW1lU2VjcmV0UmVmKHNlY3JldE5hbWUpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjcmVkZW50aWFscyB0eXBlICR7Y3JlZGVudGlhbHNUeXBlfSBpcyBub3Qgc3VwcG9ydGVkIGJ5IEFyZ29DRCBhZGQtb24uYCk7XG4gICAgfVxufVxuXG4vKipcbiAqIExvY2FsIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIHNlY3JldCByZWZlcmVuY2UgZm9yIFNTSCBrZXkuXG4gKiBAcGFyYW0gdXJsIFxuICogQHBhcmFtIHNlY3JldE5hbWUgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNzaFNlY3JldFJlZihzZWNyZXROYW1lOiBzdHJpbmcpOiBDc2lTZWNyZXRQcm9wcyB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VjcmV0UHJvdmlkZXI6IG5ldyBMb29rdXBTZWNyZXRzTWFuYWdlclNlY3JldEJ5TmFtZShzZWNyZXROYW1lKSxcbiAgICAgICAgam1lc1BhdGg6IFt7IHBhdGg6IFwidXJsXCIsIG9iamVjdEFsaWFzOiBcInVybFwiIH0sIHsgcGF0aDogXCJzc2hQcml2YXRlS2V5XCIsIG9iamVjdEFsaWFzOiBcInNzaFByaXZhdGVLZXlcIiB9XSxcbiAgICAgICAga3ViZXJuZXRlc1NlY3JldDoge1xuICAgICAgICAgICAgc2VjcmV0TmFtZTogc2VjcmV0TmFtZSxcbiAgICAgICAgICAgIGxhYmVsczogeyBcImFyZ29jZC5hcmdvcHJvai5pby9zZWNyZXQtdHlwZVwiOiBcInJlcG8tY3JlZHNcIiB9LCBcbiAgICAgICAgICAgIGRhdGE6IFtcbiAgICAgICAgICAgICAgICB7IGtleTogXCJ1cmxcIiwgb2JqZWN0TmFtZTogXCJ1cmxcIiB9LFxuICAgICAgICAgICAgICAgIHsga2V5OiBcInNzaFByaXZhdGVLZXlcIiwgb2JqZWN0TmFtZTogXCJzc2hQcml2YXRlS2V5XCIgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgfTtcbn1cblxuLyoqXG4gKiBMb2NhbCBmdW5jdGlvbiB0byBhIHNlY3JldCByZWZlcmVuY2UgZm9yIHVzZXJuYW1lL3B3ZCBvciB1c2VybmFtZS90b2tlbiBrZXkuXG4gKiBAcGFyYW0gdXJsIFxuICogQHBhcmFtIHNlY3JldE5hbWUgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVzZXJOYW1lU2VjcmV0UmVmKHNlY3JldE5hbWU6IHN0cmluZyk6IENzaVNlY3JldFByb3BzIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzZWNyZXRQcm92aWRlcjogbmV3IExvb2t1cFNlY3JldHNNYW5hZ2VyU2VjcmV0QnlOYW1lKHNlY3JldE5hbWUpLFxuICAgICAgICBqbWVzUGF0aDogW3sgcGF0aDogXCJ1cmxcIiwgb2JqZWN0QWxpYXM6IFwidXJsXCIgfSwgeyBwYXRoOiBcInVzZXJuYW1lXCIsIG9iamVjdEFsaWFzOiBcInVzZXJuYW1lXCIgfSwgeyBwYXRoOiBcInBhc3N3b3JkXCIsIG9iamVjdEFsaWFzOiBcInBhc3N3b3JkXCIgfV0sXG4gICAgICAgIGt1YmVybmV0ZXNTZWNyZXQ6IHtcbiAgICAgICAgICAgIHNlY3JldE5hbWU6IHNlY3JldE5hbWUsXG4gICAgICAgICAgICBsYWJlbHM6IG5ldyBNYXAoW1xuICAgICAgICAgICAgICAgIFsgXCJhcmdvY2QuYXJnb3Byb2ouaW8vc2VjcmV0LXR5cGVcIiwgXCJyZXBvLWNyZWRzXCIgXVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBkYXRhOiBbXG4gICAgICAgICAgICAgICAgeyBrZXk6IFwidXJsXCIsIG9iamVjdE5hbWU6IFwidXJsXCIgfSxcbiAgICAgICAgICAgICAgICB7IGtleTogXCJ1c2VybmFtZVwiLCBvYmplY3ROYW1lOiBcInVzZXJuYW1lXCIgfSxcbiAgICAgICAgICAgICAgICB7IGtleTogXCJwYXNzd29yZFwiLCBvYmplY3ROYW1lOiBcInBhc3N3b3JkXCIgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==