"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsiDriverProviderAws = void 0;
const cdk = require("aws-cdk-lib");
const yaml_utils_1 = require("../../utils/yaml-utils");
const ts_deepmerge_1 = require("ts-deepmerge");
class CsiDriverProviderAws {
    constructor(props) {
        this.props = props;
    }
    deploy(clusterInfo) {
        var _a;
        const cluster = clusterInfo.cluster;
        let values = {
            linux: {
                image: {
                    tag: this.props.version
                }
            },
            grpcSupportedProviders: 'aws'
        };
        if (typeof (this.props.rotationPollInterval) === 'string') {
            values.enableSecretRotation = 'true';
            values.rotationPollInterval = this.props.rotationPollInterval;
        }
        if (this.props.syncSecrets === true) {
            values.syncSecret = {
                enabled: 'true'
            };
        }
        values = (0, ts_deepmerge_1.default)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        const secretStoreCSIDriverHelmChart = cluster.addHelmChart('SecretsStoreCSIDriver', {
            chart: this.props.chart,
            repository: this.props.repository,
            namespace: this.props.namespace,
            release: this.props.release,
            version: this.props.version,
            wait: true,
            timeout: cdk.Duration.minutes(15),
            values,
        });
        const manifestUrl = this.props.ascpUrl;
        const manifest = (0, yaml_utils_1.loadExternalYaml)(manifestUrl);
        const secretProviderManifest = clusterInfo.cluster.addManifest('SecretsStoreCsiDriverProviderAws', ...manifest);
        secretProviderManifest.node.addDependency(secretStoreCSIDriverHelmChart);
        return secretProviderManifest;
    }
}
exports.CsiDriverProviderAws = CsiDriverProviderAws;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NpLWRyaXZlci1wcm92aWRlci1hd3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3NlY3JldHMtc3RvcmUvY3NpLWRyaXZlci1wcm92aWRlci1hd3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLHVEQUEwRDtBQUcxRCwrQ0FBaUM7QUFHakMsTUFBYSxvQkFBb0I7SUFFL0IsWUFBb0IsS0FBNkI7UUFBN0IsVUFBSyxHQUFMLEtBQUssQ0FBd0I7SUFBRyxDQUFDO0lBRXJELE1BQU0sQ0FBQyxXQUF3Qjs7UUFDN0IsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQWdCcEMsSUFBSSxNQUFNLEdBQWdCO1lBQ3hCLEtBQUssRUFBRTtnQkFDTCxLQUFLLEVBQUU7b0JBQ0wsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBUTtpQkFDekI7YUFDRjtZQUNELHNCQUFzQixFQUFFLEtBQUs7U0FDOUIsQ0FBQztRQUVGLElBQUksT0FBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDeEQsTUFBTSxDQUFDLG9CQUFvQixHQUFHLE1BQU0sQ0FBQztZQUNyQyxNQUFNLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztTQUMvRDtRQUVELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQ25DLE1BQU0sQ0FBQyxVQUFVLEdBQUc7Z0JBQ2xCLE9BQU8sRUFBRSxNQUFNO2FBQ2hCLENBQUM7U0FDSDtRQUVELE1BQU0sR0FBRyxJQUFBLHNCQUFLLEVBQUMsTUFBTSxFQUFFLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWhELE1BQU0sNkJBQTZCLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsRUFBRTtZQUNsRixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFNO1lBQ3hCLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVc7WUFDbEMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBVTtZQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPO1lBQzNCLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87WUFDM0IsSUFBSSxFQUFFLElBQUk7WUFDVixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2pDLE1BQU07U0FDUCxDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQztRQUN4QyxNQUFNLFFBQVEsR0FBMEIsSUFBQSw2QkFBZ0IsRUFBQyxXQUFXLENBQUMsQ0FBQztRQUN0RSxNQUFNLHNCQUFzQixHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDaEgsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sc0JBQXNCLENBQUM7SUFDaEMsQ0FBQztDQUNGO0FBNURELG9EQTREQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHsgbG9hZEV4dGVybmFsWWFtbCB9IGZyb20gXCIuLi8uLi91dGlscy95YW1sLXV0aWxzXCI7XG5pbXBvcnQgeyBLdWJlcm5ldGVzTWFuaWZlc3QgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgU2VjcmV0c1N0b3JlQWRkT25Qcm9wcyB9IGZyb20gXCIuXCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuXG5cbmV4cG9ydCBjbGFzcyBDc2lEcml2ZXJQcm92aWRlckF3cyB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwcm9wczogU2VjcmV0c1N0b3JlQWRkT25Qcm9wcykge31cblxuICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogS3ViZXJuZXRlc01hbmlmZXN0IHtcbiAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcblxuICAgIHR5cGUgY2hhcnRWYWx1ZXMgPSB7XG4gICAgICBsaW51eDoge1xuICAgICAgICBpbWFnZToge1xuICAgICAgICAgIHRhZzogc3RyaW5nXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBlbmFibGVTZWNyZXRSb3RhdGlvbj86IHN0cmluZyxcbiAgICAgIHJvdGF0aW9uUG9sbEludGVydmFsPzogc3RyaW5nLFxuICAgICAgc3luY1NlY3JldD86IHtcbiAgICAgICAgZW5hYmxlZDogc3RyaW5nXG4gICAgICB9LFxuICAgICAgZ3JwY1N1cHBvcnRlZFByb3ZpZGVyczogc3RyaW5nXG4gICAgfVxuXG4gICAgbGV0IHZhbHVlczogY2hhcnRWYWx1ZXMgPSB7XG4gICAgICBsaW51eDoge1xuICAgICAgICBpbWFnZToge1xuICAgICAgICAgIHRhZzogdGhpcy5wcm9wcy52ZXJzaW9uIVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ3JwY1N1cHBvcnRlZFByb3ZpZGVyczogJ2F3cydcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZih0aGlzLnByb3BzLnJvdGF0aW9uUG9sbEludGVydmFsKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlcy5lbmFibGVTZWNyZXRSb3RhdGlvbiA9ICd0cnVlJztcbiAgICAgIHZhbHVlcy5yb3RhdGlvblBvbGxJbnRlcnZhbCA9IHRoaXMucHJvcHMucm90YXRpb25Qb2xsSW50ZXJ2YWw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuc3luY1NlY3JldHMgPT09IHRydWUpIHtcbiAgICAgIHZhbHVlcy5zeW5jU2VjcmV0ID0ge1xuICAgICAgICBlbmFibGVkOiAndHJ1ZSdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFsdWVzID0gbWVyZ2UodmFsdWVzLCB0aGlzLnByb3BzLnZhbHVlcyA/PyB7fSk7XG5cbiAgICBjb25zdCBzZWNyZXRTdG9yZUNTSURyaXZlckhlbG1DaGFydCA9IGNsdXN0ZXIuYWRkSGVsbUNoYXJ0KCdTZWNyZXRzU3RvcmVDU0lEcml2ZXInLCB7XG4gICAgICBjaGFydDogdGhpcy5wcm9wcy5jaGFydCEsXG4gICAgICByZXBvc2l0b3J5OiB0aGlzLnByb3BzLnJlcG9zaXRvcnkhLFxuICAgICAgbmFtZXNwYWNlOiB0aGlzLnByb3BzLm5hbWVzcGFjZSEsXG4gICAgICByZWxlYXNlOiB0aGlzLnByb3BzLnJlbGVhc2UsXG4gICAgICB2ZXJzaW9uOiB0aGlzLnByb3BzLnZlcnNpb24sXG4gICAgICB3YWl0OiB0cnVlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMTUpLFxuICAgICAgdmFsdWVzLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbWFuaWZlc3RVcmwgPSB0aGlzLnByb3BzLmFzY3BVcmwhO1xuICAgIGNvbnN0IG1hbmlmZXN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+W10gPSBsb2FkRXh0ZXJuYWxZYW1sKG1hbmlmZXN0VXJsKTtcbiAgICBjb25zdCBzZWNyZXRQcm92aWRlck1hbmlmZXN0ID0gY2x1c3RlckluZm8uY2x1c3Rlci5hZGRNYW5pZmVzdCgnU2VjcmV0c1N0b3JlQ3NpRHJpdmVyUHJvdmlkZXJBd3MnLCAuLi5tYW5pZmVzdCk7XG4gICAgc2VjcmV0UHJvdmlkZXJNYW5pZmVzdC5ub2RlLmFkZERlcGVuZGVuY3koc2VjcmV0U3RvcmVDU0lEcml2ZXJIZWxtQ2hhcnQpO1xuICAgIHJldHVybiBzZWNyZXRQcm92aWRlck1hbmlmZXN0O1xuICB9XG59Il19