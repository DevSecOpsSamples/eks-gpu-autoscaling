"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalDnsAddOn = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const helm_addon_1 = require("../helm-addon");
const defaultProps = {
    name: 'external-dns',
    chart: 'external-dns',
    namespace: 'external-dns',
    repository: 'https://charts.bitnami.com/bitnami',
    release: 'blueprints-addon-external-dns',
    version: '5.1.3'
};
/**
 * Implementation of the External DNS service: https://github.com/kubernetes-sigs/external-dns/.
 * It is required to integrate with Route53 for external DNS resolution.
 */
class ExternalDnsAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const region = clusterInfo.cluster.stack.region;
        const cluster = clusterInfo.cluster;
        const namespace = (_a = this.options.namespace) !== null && _a !== void 0 ? _a : this.options.name;
        const namespaceManifest = new aws_eks_1.KubernetesManifest(cluster.stack, 'external-dns-ns', {
            cluster,
            manifest: [{
                    apiVersion: 'v1',
                    kind: 'Namespace',
                    metadata: { name: namespace },
                }],
            overwrite: true
        });
        const sa = cluster.addServiceAccount(this.props.name, { name: 'external-dns-sa', namespace });
        const hostedZones = this.options.hostedZoneResources.map(e => clusterInfo.getRequiredResource(e));
        sa.addToPrincipalPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['route53:ChangeResourceRecordSets', 'route53:ListResourceRecordSets'],
            resources: hostedZones.map(hostedZone => hostedZone.hostedZoneArn),
        }));
        sa.addToPrincipalPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['route53:ListHostedZones'],
            resources: ['*'],
        }));
        sa.node.addDependency(namespaceManifest);
        const chart = this.addHelmChart(clusterInfo, {
            provider: 'aws',
            zoneIdFilters: hostedZones.map(hostedZone => hostedZone.hostedZoneId),
            aws: {
                region,
            },
            serviceAccount: {
                create: false,
                name: sa.serviceAccountName,
            },
        });
        chart.node.addDependency(namespaceManifest);
        // return the Promise Construct for any teams that may depend on this
        return Promise.resolve(chart);
    }
}
exports.ExternalDnsAddOn = ExternalDnsAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2V4dGVybmFsLWRucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBeUQ7QUFDekQsaURBQThEO0FBSTlELDhDQUE4RDtBQWM5RCxNQUFNLFlBQVksR0FBRztJQUNqQixJQUFJLEVBQUUsY0FBYztJQUNwQixLQUFLLEVBQUUsY0FBYztJQUNyQixTQUFTLEVBQUUsY0FBYztJQUN6QixVQUFVLEVBQUUsb0NBQW9DO0lBQ2hELE9BQU8sRUFBRSwrQkFBK0I7SUFDeEMsT0FBTyxFQUFFLE9BQU87Q0FDbkIsQ0FBQztBQUVGOzs7R0FHRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEsc0JBQVM7SUFJM0MsWUFBWSxLQUF1QjtRQUMvQixLQUFLLENBQUMsRUFBRSxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBeUIsQ0FBQztJQUNsRCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCOztRQUMzQixNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDaEQsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxtQ0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUU5RCxNQUFNLGlCQUFpQixHQUFHLElBQUksNEJBQWtCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsRUFBRTtZQUMvRSxPQUFPO1lBQ1AsUUFBUSxFQUFFLENBQUM7b0JBQ1AsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLElBQUksRUFBRSxXQUFXO29CQUNqQixRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2lCQUNoQyxDQUFDO1lBQ0YsU0FBUyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFOUYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvRyxFQUFFLENBQUMsb0JBQW9CLENBQ25CLElBQUkseUJBQWUsQ0FBQztZQUNoQixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO1lBQ3BCLE9BQU8sRUFBRSxDQUFDLGtDQUFrQyxFQUFFLGdDQUFnQyxDQUFDO1lBQy9FLFNBQVMsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVyxDQUFDLGFBQWEsQ0FBQztTQUN0RSxDQUFDLENBQ0wsQ0FBQztRQUVGLEVBQUUsQ0FBQyxvQkFBb0IsQ0FDbkIsSUFBSSx5QkFBZSxDQUFDO1lBQ2hCLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7WUFDcEIsT0FBTyxFQUFFLENBQUMseUJBQXlCLENBQUM7WUFDcEMsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ25CLENBQUMsQ0FDTCxDQUFDO1FBRUYsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUV6QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRTtZQUN6QyxRQUFRLEVBQUUsS0FBSztZQUNmLGFBQWEsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVyxDQUFDLFlBQVksQ0FBQztZQUN0RSxHQUFHLEVBQUU7Z0JBQ0QsTUFBTTthQUNUO1lBQ0QsY0FBYyxFQUFFO2dCQUNaLE1BQU0sRUFBRSxLQUFLO2dCQUNiLElBQUksRUFBRSxFQUFFLENBQUMsa0JBQWtCO2FBQzlCO1NBQ0osQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM1QyxxRUFBcUU7UUFDckUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSjtBQTlERCw0Q0E4REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBLdWJlcm5ldGVzTWFuaWZlc3QgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7IEVmZmVjdCwgUG9saWN5U3RhdGVtZW50IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBJSG9zdGVkWm9uZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBDbHVzdGVySW5mbyB9IGZyb20gJy4uLy4uL3NwaSc7XG5pbXBvcnQgeyBIZWxtQWRkT24sIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gJy4uL2hlbG0tYWRkb24nO1xuXG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUgZXh0ZXJuYWwgRE5TIGFkZC1vbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHRlcm5hbERuc1Byb3BzIGV4dGVuZHMgSGVsbUFkZE9uVXNlclByb3BzIHtcbiAgICAvKipcbiAgICAgKiBOYW1lcyBvZiBob3N0ZWQgem9uZSBwcm92aWRlciBuYW1lZCByZXNvdXJjZXMgKEBzZWUgTG9va3VwSG9zdGVkWm9uZVByb3ZpZGVyKSBmb3IgZXh0ZXJuYWwgRE5TLlxuICAgICAqIEhvc3RlZCB6b25lIHByb3ZpZGVycyBhcmUgcmVnaXN0ZXJlZCBhcyBuYW1lZCByZXNvdXJjZSBwcm92aWRlcnMgd2l0aCB0aGUgRWtzQmx1ZXByaW50UHJvcHMuXG4gICAgICovXG4gICAgcmVhZG9ubHkgaG9zdGVkWm9uZVJlc291cmNlczogc3RyaW5nW107XG59XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgICBuYW1lOiAnZXh0ZXJuYWwtZG5zJyxcbiAgICBjaGFydDogJ2V4dGVybmFsLWRucycsXG4gICAgbmFtZXNwYWNlOiAnZXh0ZXJuYWwtZG5zJyxcbiAgICByZXBvc2l0b3J5OiAnaHR0cHM6Ly9jaGFydHMuYml0bmFtaS5jb20vYml0bmFtaScsXG4gICAgcmVsZWFzZTogJ2JsdWVwcmludHMtYWRkb24tZXh0ZXJuYWwtZG5zJyxcbiAgICB2ZXJzaW9uOiAnNS4xLjMnXG59O1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBFeHRlcm5hbCBETlMgc2VydmljZTogaHR0cHM6Ly9naXRodWIuY29tL2t1YmVybmV0ZXMtc2lncy9leHRlcm5hbC1kbnMvLlxuICogSXQgaXMgcmVxdWlyZWQgdG8gaW50ZWdyYXRlIHdpdGggUm91dGU1MyBmb3IgZXh0ZXJuYWwgRE5TIHJlc29sdXRpb24uIFxuICovXG5leHBvcnQgY2xhc3MgRXh0ZXJuYWxEbnNBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XG5cbiAgICBwcml2YXRlIG9wdGlvbnM6IEV4dGVybmFsRG5zUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogRXh0ZXJuYWxEbnNQcm9wcykge1xuICAgICAgICBzdXBlcih7IC4uLmRlZmF1bHRQcm9wcywgLi4ucHJvcHMgfSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHRoaXMucHJvcHMgYXMgRXh0ZXJuYWxEbnNQcm9wcztcbiAgICB9XG5cbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICAgICAgY29uc3QgcmVnaW9uID0gY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjay5yZWdpb247XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSB0aGlzLm9wdGlvbnMubmFtZXNwYWNlID8/IHRoaXMub3B0aW9ucy5uYW1lO1xuXG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZU1hbmlmZXN0ID0gbmV3IEt1YmVybmV0ZXNNYW5pZmVzdChjbHVzdGVyLnN0YWNrLCAnZXh0ZXJuYWwtZG5zLW5zJywge1xuICAgICAgICAgICAgY2x1c3RlcixcbiAgICAgICAgICAgIG1hbmlmZXN0OiBbe1xuICAgICAgICAgICAgICAgIGFwaVZlcnNpb246ICd2MScsXG4gICAgICAgICAgICAgICAga2luZDogJ05hbWVzcGFjZScsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHsgbmFtZTogbmFtZXNwYWNlIH0sXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIG92ZXJ3cml0ZTogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzYSA9IGNsdXN0ZXIuYWRkU2VydmljZUFjY291bnQodGhpcy5wcm9wcy5uYW1lLCB7IG5hbWU6ICdleHRlcm5hbC1kbnMtc2EnLCBuYW1lc3BhY2UgfSk7XG5cbiAgICAgICAgY29uc3QgaG9zdGVkWm9uZXMgPSB0aGlzLm9wdGlvbnMuaG9zdGVkWm9uZVJlc291cmNlcy5tYXAoZSA9PiBjbHVzdGVySW5mby5nZXRSZXF1aXJlZFJlc291cmNlPElIb3N0ZWRab25lPihlKSk7XG5cbiAgICAgICAgc2EuYWRkVG9QcmluY2lwYWxQb2xpY3koXG4gICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ3JvdXRlNTM6Q2hhbmdlUmVzb3VyY2VSZWNvcmRTZXRzJywgJ3JvdXRlNTM6TGlzdFJlc291cmNlUmVjb3JkU2V0cyddLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogaG9zdGVkWm9uZXMubWFwKGhvc3RlZFpvbmUgPT4gaG9zdGVkWm9uZSEuaG9zdGVkWm9uZUFybiksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcblxuICAgICAgICBzYS5hZGRUb1ByaW5jaXBhbFBvbGljeShcbiAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsncm91dGU1MzpMaXN0SG9zdGVkWm9uZXMnXSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICk7XG5cbiAgICAgICAgc2Eubm9kZS5hZGREZXBlbmRlbmN5KG5hbWVzcGFjZU1hbmlmZXN0KTtcblxuICAgICAgICBjb25zdCBjaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCB7XG4gICAgICAgICAgICBwcm92aWRlcjogJ2F3cycsXG4gICAgICAgICAgICB6b25lSWRGaWx0ZXJzOiBob3N0ZWRab25lcy5tYXAoaG9zdGVkWm9uZSA9PiBob3N0ZWRab25lIS5ob3N0ZWRab25lSWQpLFxuICAgICAgICAgICAgYXdzOiB7XG4gICAgICAgICAgICAgICAgcmVnaW9uLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlcnZpY2VBY2NvdW50OiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBzYS5zZXJ2aWNlQWNjb3VudE5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjaGFydC5ub2RlLmFkZERlcGVuZGVuY3kobmFtZXNwYWNlTWFuaWZlc3QpO1xuICAgICAgICAvLyByZXR1cm4gdGhlIFByb21pc2UgQ29uc3RydWN0IGZvciBhbnkgdGVhbXMgdGhhdCBtYXkgZGVwZW5kIG9uIHRoaXNcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XG4gICAgfVxufSJdfQ==