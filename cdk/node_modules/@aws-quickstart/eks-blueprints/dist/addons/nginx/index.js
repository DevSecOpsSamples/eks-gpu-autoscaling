"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NginxAddOn = void 0;
const __1 = require("..");
const utils_1 = require("../../utils");
const object_utils_1 = require("../../utils/object-utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    name: "nginx-ingress",
    chart: "nginx-ingress",
    release: "blueprints-addon-nginx",
    version: "0.11.3",
    repository: "https://helm.nginx.com/stable",
    backendProtocol: 'tcp',
    crossZoneEnabled: true,
    internetFacing: true,
    targetType: 'ip',
    namespace: 'kube-system'
};
class NginxAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a, _b, _c;
        const props = this.options;
        const presetAnnotations = {
            'service.beta.kubernetes.io/aws-load-balancer-backend-protocol': props.backendProtocol,
            'service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled': `${props.crossZoneEnabled}`,
            'service.beta.kubernetes.io/aws-load-balancer-scheme': props.internetFacing ? 'internet-facing' : 'internal',
            'service.beta.kubernetes.io/aws-load-balancer-type': 'external',
            'service.beta.kubernetes.io/aws-load-balancer-nlb-target-type': props.targetType,
            'external-dns.alpha.kubernetes.io/hostname': props.externalDnsHostname,
        };
        const values = { ...(_a = props.values) !== null && _a !== void 0 ? _a : {} };
        if (props.certificateResourceName) {
            presetAnnotations['service.beta.kubernetes.io/aws-load-balancer-ssl-ports'] = 'https';
            const certificate = clusterInfo.getResource(props.certificateResourceName);
            presetAnnotations['service.beta.kubernetes.io/aws-load-balancer-ssl-cert'] = certificate === null || certificate === void 0 ? void 0 : certificate.certificateArn;
            (0, object_utils_1.setPath)(values, "controller.service.httpsPort.targetPort", "http");
            (0, object_utils_1.setPath)(values, "controller.service.httpPort.enable", "false");
        }
        const serviceAnnotations = { ...(_c = (_b = values.controller) === null || _b === void 0 ? void 0 : _b.service) === null || _c === void 0 ? void 0 : _c.annotations, ...presetAnnotations };
        (0, object_utils_1.setPath)(values, 'controller.service.annotations', serviceAnnotations);
        const nginxHelmChart = this.addHelmChart(clusterInfo, values);
        return Promise.resolve(nginxHelmChart);
    }
}
__decorate([
    (0, utils_1.dependable)(__1.AwsLoadBalancerControllerAddOn.name)
], NginxAddOn.prototype, "deploy", null);
exports.NginxAddOn = NginxAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL25naW54L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUVBLDBCQUFvRDtBQUVwRCx1Q0FBeUM7QUFDekMsMkRBQW1EO0FBQ25ELDhDQUE4RDtBQWdEOUQ7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBb0I7SUFDbEMsSUFBSSxFQUFFLGVBQWU7SUFDckIsS0FBSyxFQUFFLGVBQWU7SUFDdEIsT0FBTyxFQUFFLHdCQUF3QjtJQUNqQyxPQUFPLEVBQUUsUUFBUTtJQUNqQixVQUFVLEVBQUUsK0JBQStCO0lBQzNDLGVBQWUsRUFBRSxLQUFLO0lBQ3RCLGdCQUFnQixFQUFFLElBQUk7SUFDdEIsY0FBYyxFQUFFLElBQUk7SUFDcEIsVUFBVSxFQUFFLElBQUk7SUFDaEIsU0FBUyxFQUFFLGFBQWE7Q0FDM0IsQ0FBQztBQUVGLE1BQWEsVUFBVyxTQUFRLHNCQUFTO0lBSXJDLFlBQVksS0FBdUI7UUFDL0IsS0FBSyxDQUFDLEVBQUUsR0FBRyxZQUFtQixFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDOUIsQ0FBQztJQUdELE1BQU0sQ0FBQyxXQUF3Qjs7UUFFM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUUzQixNQUFNLGlCQUFpQixHQUFRO1lBQzNCLCtEQUErRCxFQUFFLEtBQUssQ0FBQyxlQUFlO1lBQ3RGLGdGQUFnRixFQUFFLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixFQUFFO1lBQzdHLHFEQUFxRCxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQzVHLG1EQUFtRCxFQUFFLFVBQVU7WUFDL0QsOERBQThELEVBQUUsS0FBSyxDQUFDLFVBQVU7WUFDaEYsMkNBQTJDLEVBQUUsS0FBSyxDQUFDLG1CQUFtQjtTQUN6RSxDQUFDO1FBRUYsTUFBTSxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQUEsS0FBSyxDQUFDLE1BQU0sbUNBQUksRUFBRSxFQUFFLENBQUM7UUFFekMsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUU7WUFDL0IsaUJBQWlCLENBQUMsd0RBQXdELENBQUMsR0FBRyxPQUFPLENBQUM7WUFDdEYsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBZSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN6RixpQkFBaUIsQ0FBQyx1REFBdUQsQ0FBQyxHQUFHLFdBQVcsYUFBWCxXQUFXLHVCQUFYLFdBQVcsQ0FBRSxjQUFjLENBQUM7WUFDekcsSUFBQSxzQkFBTyxFQUFDLE1BQU0sRUFBRSx5Q0FBeUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuRSxJQUFBLHNCQUFPLEVBQUMsTUFBTSxFQUFFLG9DQUFvQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsTUFBTSxrQkFBa0IsR0FBRyxFQUFFLEdBQUcsTUFBQSxNQUFBLE1BQU0sQ0FBQyxVQUFVLDBDQUFFLE9BQU8sMENBQUUsV0FBVyxFQUFFLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztRQUNoRyxJQUFBLHNCQUFPLEVBQUMsTUFBTSxFQUFFLGdDQUFnQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFFdEUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFOUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzNDLENBQUM7Q0FDSjtBQTlCRztJQURDLElBQUEsa0JBQVUsRUFBQyxrQ0FBOEIsQ0FBQyxJQUFJLENBQUM7d0NBOEIvQztBQXZDTCxnQ0F3Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJQ2VydGlmaWNhdGUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNlcnRpZmljYXRlbWFuYWdlclwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IEF3c0xvYWRCYWxhbmNlckNvbnRyb2xsZXJBZGRPbiB9IGZyb20gXCIuLlwiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8gfSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5pbXBvcnQgeyBkZXBlbmRhYmxlIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5pbXBvcnQgeyBzZXRQYXRoIH0gZnJvbSBcIi4uLy4uL3V0aWxzL29iamVjdC11dGlsc1wiO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuXG5cbi8qKlxuICogUHJvcGVydGllcyBhdmFpbGFibGUgdG8gY29uZmlndXJlIHRoZSBuZ2lueCBpbmdyZXNzIGNvbnRyb2xsZXIuXG4gKiBWYWx1ZXMgdG8gcGFzcyB0byB0aGUgY2hhcnQgYXMgcGVyIGh0dHBzOi8vZG9jcy5uZ2lueC5jb20vbmdpbngtaW5ncmVzcy1jb250cm9sbGVyL2luc3RhbGxhdGlvbi9pbnN0YWxsYXRpb24td2l0aC1oZWxtLyNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ2lueEFkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuIFxuICAgIC8qKlxuICAgICAqIHRjcCwgaHR0cFxuICAgICAqIEBkZWZhdWx0IHRjcFxuICAgICAqL1xuICAgIGJhY2tlbmRQcm90b2NvbD86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEVuYWJsaW5nIGNyb3NzIEFaIGxvYWRiYWxhbmNpbmcgZm9yIFxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjcm9zc1pvbmVFbmFibGVkPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIElmIHRoZSBsb2FkIGJhbGFuY2VyIGNyZWF0ZWQgZm9yIHRoZSBpbmdyZXNzIGlzIGludGVybmV0IGZhY2luZy5cbiAgICAgKiBJbnRlcm5hbCBpZiBzZXQgdG8gZmFsc2UuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGludGVybmV0RmFjaW5nPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIElQIG9yIGluc3RhbmNlIG1vZGUuIERlZmF1bHQ6IElQLCByZXF1aXJlcyBWUEMtQ05JLCBoYXMgYmV0dGVyIHBlcmZvcm1hbmNlIGVsaW1pbmF0aW5nIGEgaG9wIHRocm91Z2gga3ViZXByb3h5XG4gICAgICogSW5zdGFuY2UgbW9kZTogdHJhZGl0aW9uYWwgTm9kZVBvcnQgbW9kZSBvbiB0aGUgaW5zdGFuY2UuIFxuICAgICAqIEBkZWZhdWx0IGlwXG4gICAgICovXG4gICAgdGFyZ2V0VHlwZT86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBleHRlcm5hbCBETlMgYWRkLW9uIHRvIGhhbmRsZSBhdXRvbWF0aWMgcmVnaXN0cmF0aW9uIG9mIHRoZSBzZXJ2aWNlIHdpdGggUm91dGU1My4gIFxuICAgICAqL1xuICAgIGV4dGVybmFsRG5zSG9zdG5hbWU/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBOYW1lIG9mIHRoZSBjZXJ0aWZpY2F0ZSB7QGxpbmsgTmFtZWRSZXNvdXJjZVByb3ZpZGVyfSB0byBiZSB1c2VkIGZvciBjZXJ0aWZpY2F0ZSBsb29rIHVwLiBcbiAgICAgKiBAc2VlIHtAbGluayBJbXBvcnRDZXJ0aWZpY2F0ZVByb3ZpZGVyfSBhbmQge0BsaW5rIENyZWF0ZUNlcnRpZmljYXRlUHJvdmlkZXJ9IGZvciBleGFtcGxlcyBvZiBjZXJ0aWZpY2F0ZSBwcm92aWRlcnMuXG4gICAgICovXG4gICAgY2VydGlmaWNhdGVSZXNvdXJjZU5hbWU/OiBzdHJpbmcsXG59XG5cblxuLyoqXG4gKiBEZWZhdWx0cyBvcHRpb25zIGZvciB0aGUgYWRkLW9uXG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wczogTmdpbnhBZGRPblByb3BzID0ge1xuICAgIG5hbWU6IFwibmdpbngtaW5ncmVzc1wiLFxuICAgIGNoYXJ0OiBcIm5naW54LWluZ3Jlc3NcIixcbiAgICByZWxlYXNlOiBcImJsdWVwcmludHMtYWRkb24tbmdpbnhcIixcbiAgICB2ZXJzaW9uOiBcIjAuMTEuM1wiLFxuICAgIHJlcG9zaXRvcnk6IFwiaHR0cHM6Ly9oZWxtLm5naW54LmNvbS9zdGFibGVcIixcbiAgICBiYWNrZW5kUHJvdG9jb2w6ICd0Y3AnLFxuICAgIGNyb3NzWm9uZUVuYWJsZWQ6IHRydWUsXG4gICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgdGFyZ2V0VHlwZTogJ2lwJyxcbiAgICBuYW1lc3BhY2U6ICdrdWJlLXN5c3RlbSdcbn07XG5cbmV4cG9ydCBjbGFzcyBOZ2lueEFkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcblxuICAgIHJlYWRvbmx5IG9wdGlvbnM6IE5naW54QWRkT25Qcm9wcztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogTmdpbnhBZGRPblByb3BzKSB7XG4gICAgICAgIHN1cGVyKHsgLi4uZGVmYXVsdFByb3BzIGFzIGFueSwgLi4ucHJvcHMgfSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHRoaXMucHJvcHM7XG4gICAgfVxuXG4gICAgQGRlcGVuZGFibGUoQXdzTG9hZEJhbGFuY2VyQ29udHJvbGxlckFkZE9uLm5hbWUpXG4gICAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG5cbiAgICAgICAgY29uc3QgcHJvcHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgY29uc3QgcHJlc2V0QW5ub3RhdGlvbnM6IGFueSA9IHtcbiAgICAgICAgICAgICdzZXJ2aWNlLmJldGEua3ViZXJuZXRlcy5pby9hd3MtbG9hZC1iYWxhbmNlci1iYWNrZW5kLXByb3RvY29sJzogcHJvcHMuYmFja2VuZFByb3RvY29sLFxuICAgICAgICAgICAgJ3NlcnZpY2UuYmV0YS5rdWJlcm5ldGVzLmlvL2F3cy1sb2FkLWJhbGFuY2VyLWNyb3NzLXpvbmUtbG9hZC1iYWxhbmNpbmctZW5hYmxlZCc6IGAke3Byb3BzLmNyb3NzWm9uZUVuYWJsZWR9YCxcbiAgICAgICAgICAgICdzZXJ2aWNlLmJldGEua3ViZXJuZXRlcy5pby9hd3MtbG9hZC1iYWxhbmNlci1zY2hlbWUnOiBwcm9wcy5pbnRlcm5ldEZhY2luZyA/ICdpbnRlcm5ldC1mYWNpbmcnIDogJ2ludGVybmFsJyxcbiAgICAgICAgICAgICdzZXJ2aWNlLmJldGEua3ViZXJuZXRlcy5pby9hd3MtbG9hZC1iYWxhbmNlci10eXBlJzogJ2V4dGVybmFsJyxcbiAgICAgICAgICAgICdzZXJ2aWNlLmJldGEua3ViZXJuZXRlcy5pby9hd3MtbG9hZC1iYWxhbmNlci1ubGItdGFyZ2V0LXR5cGUnOiBwcm9wcy50YXJnZXRUeXBlLFxuICAgICAgICAgICAgJ2V4dGVybmFsLWRucy5hbHBoYS5rdWJlcm5ldGVzLmlvL2hvc3RuYW1lJzogcHJvcHMuZXh0ZXJuYWxEbnNIb3N0bmFtZSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB2YWx1ZXMgPSB7IC4uLnByb3BzLnZhbHVlcyA/PyB7fSB9O1xuXG4gICAgICAgIGlmIChwcm9wcy5jZXJ0aWZpY2F0ZVJlc291cmNlTmFtZSkge1xuICAgICAgICAgICAgcHJlc2V0QW5ub3RhdGlvbnNbJ3NlcnZpY2UuYmV0YS5rdWJlcm5ldGVzLmlvL2F3cy1sb2FkLWJhbGFuY2VyLXNzbC1wb3J0cyddID0gJ2h0dHBzJztcbiAgICAgICAgICAgIGNvbnN0IGNlcnRpZmljYXRlID0gY2x1c3RlckluZm8uZ2V0UmVzb3VyY2U8SUNlcnRpZmljYXRlPihwcm9wcy5jZXJ0aWZpY2F0ZVJlc291cmNlTmFtZSk7XG4gICAgICAgICAgICBwcmVzZXRBbm5vdGF0aW9uc1snc2VydmljZS5iZXRhLmt1YmVybmV0ZXMuaW8vYXdzLWxvYWQtYmFsYW5jZXItc3NsLWNlcnQnXSA9IGNlcnRpZmljYXRlPy5jZXJ0aWZpY2F0ZUFybjtcbiAgICAgICAgICAgIHNldFBhdGgodmFsdWVzLCBcImNvbnRyb2xsZXIuc2VydmljZS5odHRwc1BvcnQudGFyZ2V0UG9ydFwiLCBcImh0dHBcIik7XG4gICAgICAgICAgICBzZXRQYXRoKHZhbHVlcywgXCJjb250cm9sbGVyLnNlcnZpY2UuaHR0cFBvcnQuZW5hYmxlXCIsIFwiZmFsc2VcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXJ2aWNlQW5ub3RhdGlvbnMgPSB7IC4uLnZhbHVlcy5jb250cm9sbGVyPy5zZXJ2aWNlPy5hbm5vdGF0aW9ucywgLi4ucHJlc2V0QW5ub3RhdGlvbnMgfTtcbiAgICAgICAgc2V0UGF0aCh2YWx1ZXMsICdjb250cm9sbGVyLnNlcnZpY2UuYW5ub3RhdGlvbnMnLCBzZXJ2aWNlQW5ub3RhdGlvbnMpO1xuXG4gICAgICAgIGNvbnN0IG5naW54SGVsbUNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcyk7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZ2lueEhlbG1DaGFydCk7XG4gICAgfVxufSJdfQ==