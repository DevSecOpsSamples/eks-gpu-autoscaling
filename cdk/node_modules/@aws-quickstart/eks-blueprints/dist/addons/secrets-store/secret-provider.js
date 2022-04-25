"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupSsmSecretByAttrs = exports.LookupSecretsManagerSecretByArn = exports.LookupSecretsManagerSecretByName = exports.GenerateSecretManagerProvider = void 0;
const aws_secretsmanager_1 = require("aws-cdk-lib/aws-secretsmanager");
const aws_ssm_1 = require("aws-cdk-lib/aws-ssm");
/**
 * Generate a new Secret on Secrets Manager
 */
class GenerateSecretManagerProvider {
    constructor(id, secretName) {
        this.id = id;
        this.secretName = secretName;
    }
    provide(clusterInfo) {
        const secret = new aws_secretsmanager_1.Secret(clusterInfo.cluster.stack, this.id, {
            secretName: this.secretName
        });
        return secret;
    }
}
exports.GenerateSecretManagerProvider = GenerateSecretManagerProvider;
/**
 * Lookup Secret in SecretsManager by Name
 */
class LookupSecretsManagerSecretByName {
    /**
     * @param secretName
     * @param id
     */
    constructor(secretName, id) {
        this.secretName = secretName;
        this.id = id;
    }
    provide(clusterInfo) {
        var _a;
        return aws_secretsmanager_1.Secret.fromSecretNameV2(clusterInfo.cluster.stack, (_a = this.id) !== null && _a !== void 0 ? _a : `${this.secretName}-Lookup`, this.secretName);
    }
}
exports.LookupSecretsManagerSecretByName = LookupSecretsManagerSecretByName;
/**
 * Lookup Secret in SecretsManager by Arn
 */
class LookupSecretsManagerSecretByArn {
    /**
     * @param secretArn
     * @param id
     */
    constructor(secretArn, id) {
        this.secretArn = secretArn;
        this.id = id;
    }
    provide(clusterInfo) {
        var _a;
        return aws_secretsmanager_1.Secret.fromSecretCompleteArn(clusterInfo.cluster.stack, (_a = this.id) !== null && _a !== void 0 ? _a : `${this.secretArn}-Lookup`, this.secretArn);
    }
}
exports.LookupSecretsManagerSecretByArn = LookupSecretsManagerSecretByArn;
/**
 * Lookup SSM Parameter Store Secret by Name
 */
class LookupSsmSecretByAttrs {
    /**
     * @param secretName
     * @param version
     * @param encryptionKey
     * @param simpleName
     * @param id
     */
    constructor(secretName, version, encryptionKey, simpleName, id) {
        this.secretName = secretName;
        this.version = version;
        this.encryptionKey = encryptionKey;
        this.simpleName = simpleName;
        this.id = id;
    }
    /**
     * Lookup the secret string parameter
     * @param clusterInfo
     * @returns
     */
    provide(clusterInfo) {
        var _a;
        return aws_ssm_1.StringParameter.fromSecureStringParameterAttributes(clusterInfo.cluster.stack, (_a = this.id) !== null && _a !== void 0 ? _a : `${this.secretName}-Lookup`, {
            parameterName: this.secretName,
            version: this.version,
            encryptionKey: this.encryptionKey,
            simpleName: this.simpleName
        });
    }
}
exports.LookupSsmSecretByAttrs = LookupSsmSecretByAttrs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0LXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL2FkZG9ucy9zZWNyZXRzLXN0b3JlL3NlY3JldC1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1RUFBaUU7QUFDakUsaURBQXdFO0FBV3hFOztHQUVHO0FBQ0gsTUFBYSw2QkFBNkI7SUFFeEMsWUFBb0IsRUFBVSxFQUFVLFVBQWtCO1FBQXRDLE9BQUUsR0FBRixFQUFFLENBQVE7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFRO0lBQUcsQ0FBQztJQUU5RCxPQUFPLENBQUMsV0FBd0I7UUFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSwyQkFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDMUQsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1NBQzlCLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDRjtBQVhELHNFQVdDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLGdDQUFnQztJQUMzQzs7O09BR0c7SUFDSCxZQUFvQixVQUFrQixFQUFVLEVBQVc7UUFBdkMsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUFVLE9BQUUsR0FBRixFQUFFLENBQVM7SUFBRyxDQUFDO0lBRS9ELE9BQU8sQ0FBQyxXQUF3Qjs7UUFDOUIsT0FBTywyQkFBTSxDQUFDLGdCQUFnQixDQUM1QixXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFDekIsTUFBQSxJQUFJLENBQUMsRUFBRSxtQ0FBSSxHQUFHLElBQUksQ0FBQyxVQUFVLFNBQVMsRUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQWRELDRFQWNDO0FBRUQ7O0dBRUc7QUFDRixNQUFhLCtCQUErQjtJQUMzQzs7O09BR0c7SUFDSCxZQUFvQixTQUFpQixFQUFVLEVBQVc7UUFBdEMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFVLE9BQUUsR0FBRixFQUFFLENBQVM7SUFBRyxDQUFDO0lBRTlELE9BQU8sQ0FBQyxXQUF3Qjs7UUFDOUIsT0FBTywyQkFBTSxDQUFDLHFCQUFxQixDQUNqQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFDekIsTUFBQSxJQUFJLENBQUMsRUFBRSxtQ0FBSSxHQUFHLElBQUksQ0FBQyxTQUFTLFNBQVMsRUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FDZixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBZEEsMEVBY0E7QUFFRDs7R0FFRztBQUNGLE1BQWEsc0JBQXNCO0lBQ2xDOzs7Ozs7T0FNRztJQUNILFlBQ1UsVUFBa0IsRUFDbEIsT0FBZSxFQUNmLGFBQW9CLEVBQ3BCLFVBQW9CLEVBQ3BCLEVBQVc7UUFKWCxlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixrQkFBYSxHQUFiLGFBQWEsQ0FBTztRQUNwQixlQUFVLEdBQVYsVUFBVSxDQUFVO1FBQ3BCLE9BQUUsR0FBRixFQUFFLENBQVM7SUFDbEIsQ0FBQztJQUVKOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsV0FBd0I7O1FBQzlCLE9BQU8seUJBQWUsQ0FBQyxtQ0FBbUMsQ0FDeEQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQ3pCLE1BQUEsSUFBSSxDQUFDLEVBQUUsbUNBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxTQUFTLEVBQUU7WUFDdEMsYUFBYSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDakMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1NBQzVCLENBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQWhDQSx3REFnQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbHVzdGVySW5mbyB9IGZyb20gJy4uLy4uL3NwaSc7XG5pbXBvcnQgeyBJU2VjcmV0LCBTZWNyZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VjcmV0c21hbmFnZXInO1xuaW1wb3J0IHsgSVN0cmluZ1BhcmFtZXRlciwgU3RyaW5nUGFyYW1ldGVyIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNzbSc7XG5pbXBvcnQgeyBJS2V5IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWttcyc7XG5cbi8qKlxuICogU2VjcmV0IFByb3ZpZGVyIEludGVyZmFjZVxuICogWW91IGNhbiBwcm92aWRlKCkgeW91ciBvd24gU2VjcmV0c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlY3JldFByb3ZpZGVyIHtcbiAgcHJvdmlkZShjbHVzdGVySW5mbz86IENsdXN0ZXJJbmZvKTogSVNlY3JldCB8IElTdHJpbmdQYXJhbWV0ZXI7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYSBuZXcgU2VjcmV0IG9uIFNlY3JldHMgTWFuYWdlclxuICovXG5leHBvcnQgY2xhc3MgR2VuZXJhdGVTZWNyZXRNYW5hZ2VyUHJvdmlkZXIgaW1wbGVtZW50cyBTZWNyZXRQcm92aWRlciB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpZDogc3RyaW5nLCBwcml2YXRlIHNlY3JldE5hbWU6IHN0cmluZykge31cblxuICBwcm92aWRlKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IElTZWNyZXQge1xuICAgICAgY29uc3Qgc2VjcmV0ID0gbmV3IFNlY3JldChjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLCB0aGlzLmlkLCB7XG4gICAgICAgICAgc2VjcmV0TmFtZTogdGhpcy5zZWNyZXROYW1lXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlY3JldDtcbiAgfVxufVxuXG4vKipcbiAqIExvb2t1cCBTZWNyZXQgaW4gU2VjcmV0c01hbmFnZXIgYnkgTmFtZVxuICovXG5leHBvcnQgY2xhc3MgTG9va3VwU2VjcmV0c01hbmFnZXJTZWNyZXRCeU5hbWUgaW1wbGVtZW50cyBTZWNyZXRQcm92aWRlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0gc2VjcmV0TmFtZVxuICAgKiBAcGFyYW0gaWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc2VjcmV0TmFtZTogc3RyaW5nLCBwcml2YXRlIGlkPzogc3RyaW5nKSB7fVxuXG4gIHByb3ZpZGUoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogSVNlY3JldCB7XG4gICAgcmV0dXJuIFNlY3JldC5mcm9tU2VjcmV0TmFtZVYyKFxuICAgICAgY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjayxcbiAgICAgIHRoaXMuaWQgPz8gYCR7dGhpcy5zZWNyZXROYW1lfS1Mb29rdXBgLFxuICAgICAgdGhpcy5zZWNyZXROYW1lXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIExvb2t1cCBTZWNyZXQgaW4gU2VjcmV0c01hbmFnZXIgYnkgQXJuXG4gKi9cbiBleHBvcnQgY2xhc3MgTG9va3VwU2VjcmV0c01hbmFnZXJTZWNyZXRCeUFybiBpbXBsZW1lbnRzIFNlY3JldFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSBzZWNyZXRBcm5cbiAgICogQHBhcmFtIGlkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNlY3JldEFybjogc3RyaW5nLCBwcml2YXRlIGlkPzogc3RyaW5nKSB7fVxuXG4gIHByb3ZpZGUoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogSVNlY3JldCB7XG4gICAgcmV0dXJuIFNlY3JldC5mcm9tU2VjcmV0Q29tcGxldGVBcm4oXG4gICAgICBjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLFxuICAgICAgdGhpcy5pZCA/PyBgJHt0aGlzLnNlY3JldEFybn0tTG9va3VwYCxcbiAgICAgIHRoaXMuc2VjcmV0QXJuXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIExvb2t1cCBTU00gUGFyYW1ldGVyIFN0b3JlIFNlY3JldCBieSBOYW1lXG4gKi9cbiBleHBvcnQgY2xhc3MgTG9va3VwU3NtU2VjcmV0QnlBdHRycyBpbXBsZW1lbnRzIFNlY3JldFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSBzZWNyZXROYW1lIFxuICAgKiBAcGFyYW0gdmVyc2lvbiBcbiAgICogQHBhcmFtIGVuY3J5cHRpb25LZXkgXG4gICAqIEBwYXJhbSBzaW1wbGVOYW1lIFxuICAgKiBAcGFyYW0gaWQgXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHNlY3JldE5hbWU6IHN0cmluZyxcbiAgICBwcml2YXRlIHZlcnNpb246IG51bWJlcixcbiAgICBwcml2YXRlIGVuY3J5cHRpb25LZXk/OiBJS2V5LFxuICAgIHByaXZhdGUgc2ltcGxlTmFtZT86IGJvb2xlYW4sXG4gICAgcHJpdmF0ZSBpZD86IHN0cmluZyxcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBMb29rdXAgdGhlIHNlY3JldCBzdHJpbmcgcGFyYW1ldGVyXG4gICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICogQHJldHVybnMgXG4gICAqL1xuICBwcm92aWRlKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IElTdHJpbmdQYXJhbWV0ZXIge1xuICAgIHJldHVybiBTdHJpbmdQYXJhbWV0ZXIuZnJvbVNlY3VyZVN0cmluZ1BhcmFtZXRlckF0dHJpYnV0ZXMoXG4gICAgICBjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLFxuICAgICAgdGhpcy5pZCA/PyBgJHt0aGlzLnNlY3JldE5hbWV9LUxvb2t1cGAsIHtcbiAgICAgICAgcGFyYW1ldGVyTmFtZTogdGhpcy5zZWNyZXROYW1lLFxuICAgICAgICB2ZXJzaW9uOiB0aGlzLnZlcnNpb24sXG4gICAgICAgIGVuY3J5cHRpb25LZXk6IHRoaXMuZW5jcnlwdGlvbktleSxcbiAgICAgICAgc2ltcGxlTmFtZTogdGhpcy5zaW1wbGVOYW1lXG4gICAgICB9XG4gICAgKTtcbiAgfVxufSJdfQ==