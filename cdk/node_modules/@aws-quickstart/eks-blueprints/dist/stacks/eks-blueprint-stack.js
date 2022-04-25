"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksBlueprint = exports.BlueprintBuilder = exports.EksBlueprintProps = void 0;
const cdk = require("aws-cdk-lib");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const utils_1 = require("../utils");
const mng_cluster_provider_1 = require("../cluster-providers/mng-cluster-provider");
const vpc_1 = require("../resource-providers/vpc");
const spi = require("../spi");
const utils_2 = require("../utils");
class EksBlueprintProps {
    constructor() {
        /**
         * Add-ons if any.
         */
        this.addOns = [];
        /**
         * Teams if any
         */
        this.teams = [];
        /**
         * EC2 or Fargate are supported in the blueprint but any implementation conforming the interface
         * will work
         */
        this.clusterProvider = new mng_cluster_provider_1.MngClusterProvider();
        /**
         * Kubernetes version (must be initialized for addons to work properly)
         */
        this.version = aws_eks_1.KubernetesVersion.V1_21;
        /**
         * Named resource providers to leverage for cluster resources.
         * The resource can represent Vpc, Hosting Zones or other resources, see {@link spi.ResourceType}.
         * VPC for the cluster can be registed under the name of 'vpc' or as a single provider of type
         */
        this.resourceProviders = new Map();
    }
}
exports.EksBlueprintProps = EksBlueprintProps;
/**
 * Blueprint builder implements a builder pattern that improves readability (no bloated constructors)
 * and allows creating a blueprint in an abstract state that can be applied to various instantiations
 * in accounts and regions.
 */
class BlueprintBuilder {
    constructor() {
        this.props = { addOns: new Array(), teams: new Array(), resourceProviders: new Map() };
        this.env = {};
    }
    name(name) {
        this.props = { ...this.props, ...{ name } };
        return this;
    }
    account(account) {
        this.env.account = account;
        return this;
    }
    region(region) {
        this.env.region = region;
        return this;
    }
    version(version) {
        this.props = { ...this.props, ...{ version } };
        return this;
    }
    enableControlPlaneLogTypes(...types) {
        this.props = { ...this.props, ...{ enableControlPlaneLogTypes: types } };
        return this;
    }
    withBlueprintProps(props) {
        const resourceProviders = this.props.resourceProviders;
        this.props = { ...this.props, ...(0, utils_1.cloneDeep)(props) };
        if (props.resourceProviders) {
            this.props.resourceProviders = new Map([...resourceProviders.entries(), ...props.resourceProviders.entries()]);
        }
        return this;
    }
    addOns(...addOns) {
        var _a;
        this.props = { ...this.props, ...{ addOns: (_a = this.props.addOns) === null || _a === void 0 ? void 0 : _a.concat(addOns) } };
        return this;
    }
    clusterProvider(clusterProvider) {
        this.props = { ...this.props, ...{ clusterProvider: clusterProvider } };
        return this;
    }
    id(id) {
        this.props = { ...this.props, ...{ id } };
        return this;
    }
    teams(...teams) {
        var _a;
        this.props = { ...this.props, ...{ teams: (_a = this.props.teams) === null || _a === void 0 ? void 0 : _a.concat(teams) } };
        return this;
    }
    resourceProvider(name, provider) {
        var _a;
        (_a = this.props.resourceProviders) === null || _a === void 0 ? void 0 : _a.set(name, provider);
        return this;
    }
    clone(region, account) {
        return new BlueprintBuilder().withBlueprintProps({ ...this.props })
            .account(account !== null && account !== void 0 ? account : this.env.account).region(region !== null && region !== void 0 ? region : this.env.region);
    }
    build(scope, id, stackProps) {
        return new EksBlueprint(scope, { ...this.props, ...{ id } }, { ...{ env: this.env }, ...stackProps });
    }
    async buildAsync(scope, id, stackProps) {
        return this.build(scope, id, stackProps).waitForAsyncTasks();
    }
}
exports.BlueprintBuilder = BlueprintBuilder;
/**
 * Entry point to the platform provisioning. Creates a CFN stack based on the provided configuration
 * and orchestrates provisioning of add-ons, teams and post deployment hooks.
 */
class EksBlueprint extends cdk.Stack {
    constructor(scope, blueprintProps, props) {
        var _a, _b, _c, _d;
        super(scope, blueprintProps.id, (0, utils_2.withUsageTracking)(EksBlueprint.USAGE_ID, props));
        this.validateInput(blueprintProps);
        const resourceContext = this.provideNamedResources(blueprintProps);
        let vpcResource = resourceContext.get(spi.GlobalResources.Vpc);
        if (!vpcResource) {
            vpcResource = resourceContext.add(spi.GlobalResources.Vpc, new vpc_1.VpcProvider());
        }
        const version = (_a = blueprintProps.version) !== null && _a !== void 0 ? _a : aws_eks_1.KubernetesVersion.V1_21;
        const clusterProvider = (_b = blueprintProps.clusterProvider) !== null && _b !== void 0 ? _b : new mng_cluster_provider_1.MngClusterProvider({
            id: `${(_c = blueprintProps.name) !== null && _c !== void 0 ? _c : blueprintProps.id}-ng`,
            version
        });
        this.clusterInfo = clusterProvider.createCluster(this, vpcResource);
        this.clusterInfo.setResourceContext(resourceContext);
        let enableLogTypes = blueprintProps.enableControlPlaneLogTypes;
        if (enableLogTypes) {
            (0, utils_2.setupClusterLogging)(this.clusterInfo.cluster.stack, this.clusterInfo.cluster, enableLogTypes);
        }
        const postDeploymentSteps = Array();
        for (let addOn of ((_d = blueprintProps.addOns) !== null && _d !== void 0 ? _d : [])) { // must iterate in the strict order
            const result = addOn.deploy(this.clusterInfo);
            if (result) {
                const addOnKey = (0, utils_2.getAddOnNameOrId)(addOn);
                this.clusterInfo.addScheduledAddOn(addOnKey, result);
            }
            const postDeploy = addOn;
            if (postDeploy.postDeploy !== undefined) {
                postDeploymentSteps.push(postDeploy);
            }
        }
        const scheduledAddOns = this.clusterInfo.getAllScheduledAddons();
        const addOnKeys = [...scheduledAddOns.keys()];
        const promises = scheduledAddOns.values();
        this.asyncTasks = Promise.all(promises).then((constructs) => {
            var _a;
            constructs.forEach((construct, index) => {
                this.clusterInfo.addProvisionedAddOn(addOnKeys[index], construct);
            });
            if (blueprintProps.teams != null) {
                for (let team of blueprintProps.teams) {
                    team.setup(this.clusterInfo);
                }
            }
            for (let step of postDeploymentSteps) {
                step.postDeploy(this.clusterInfo, (_a = blueprintProps.teams) !== null && _a !== void 0 ? _a : []);
            }
        });
        this.asyncTasks.catch(err => {
            console.error(err);
            throw new Error(err);
        });
    }
    static builder() {
        return new BlueprintBuilder();
    }
    /**
     * Since constructor cannot be marked as async, adding a separate method to wait
     * for async code to finish.
     * @returns Promise that resolves to the blueprint
     */
    async waitForAsyncTasks() {
        if (this.asyncTasks) {
            return this.asyncTasks.then(() => {
                return this;
            });
        }
        return Promise.resolve(this);
    }
    /**
     * This method returns all the constructs produced by during the cluster creation (e.g. add-ons).
     * May be used in testing for verification.
     * @returns cluster info object
     */
    getClusterInfo() {
        return this.clusterInfo;
    }
    provideNamedResources(blueprintProps) {
        var _a;
        const result = new spi.ResourceContext(this, blueprintProps);
        for (let [key, value] of (_a = blueprintProps.resourceProviders) !== null && _a !== void 0 ? _a : []) {
            result.add(key, value);
        }
        return result;
    }
    validateInput(blueprintProps) {
        const teamNames = new Set();
        if (blueprintProps.teams) {
            blueprintProps.teams.forEach(e => {
                if (teamNames.has(e.name)) {
                    throw new Error(`Team ${e.name} is registered more than once`);
                }
                teamNames.add(e.name);
            });
        }
    }
}
exports.EksBlueprint = EksBlueprint;
EksBlueprint.USAGE_ID = "qs-1s1r465hk";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzLWJsdWVwcmludC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zdGFja3MvZWtzLWJsdWVwcmludC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtQ0FBbUM7QUFHbkMsaURBQXdEO0FBRXhELG9DQUFxQztBQUNyQyxvRkFBK0U7QUFDL0UsbURBQXdEO0FBQ3hELDhCQUE4QjtBQUM5QixvQ0FBb0Y7QUFFcEYsTUFBYSxpQkFBaUI7SUFBOUI7UUFZSTs7V0FFRztRQUNNLFdBQU0sR0FBNkIsRUFBRSxDQUFDO1FBRS9DOztXQUVHO1FBQ00sVUFBSyxHQUFxQixFQUFFLENBQUM7UUFFdEM7OztXQUdHO1FBQ00sb0JBQWUsR0FBeUIsSUFBSSx5Q0FBa0IsRUFBRSxDQUFDO1FBRTFFOztXQUVHO1FBQ00sWUFBTyxHQUF1QiwyQkFBaUIsQ0FBQyxLQUFLLENBQUM7UUFFL0Q7Ozs7V0FJRztRQUNILHNCQUFpQixHQUF1QyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBT3RFLENBQUM7Q0FBQTtBQTdDRCw4Q0E2Q0M7QUFHRDs7OztHQUlHO0FBQ0gsTUFBYSxnQkFBZ0I7SUFRekI7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFvQixFQUFFLEtBQUssRUFBRSxJQUFJLEtBQUssRUFBWSxFQUFFLGlCQUFpQixFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUNuSCxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRU0sSUFBSSxDQUFDLElBQVk7UUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUM1QyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQWdCO1FBQzNCLElBQUksQ0FBQyxH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YyxDQUFDLEtBQUssRUFBRTtZQUN0QixjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLCtCQUErQixDQUFDLENBQUM7aUJBQ2xFO2dCQUNELFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDOztBQTFITCxvQ0EySEM7QUF6SG1CLHFCQUFRLEdBQUcsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgU3RhY2tQcm9wcyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IElWcGMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IEt1YmVybmV0ZXNWZXJzaW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVrcyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IGNsb25lRGVlcCB9IGZyb20gXCIuLi91dGlsc1wiO1xuaW1wb3J0IHsgTW5nQ2x1c3RlclByb3ZpZGVyIH0gZnJvbSAnLi4vY2x1c3Rlci1wcm92aWRlcnMvbW5nLWNsdXN0ZXItcHJvdmlkZXInO1xuaW1wb3J0IHsgVnBjUHJvdmlkZXIgfSBmcm9tICcuLi9yZXNvdXJjZS1wcm92aWRlcnMvdnBjJztcbmltcG9ydCAqIGFzIHNwaSBmcm9tICcuLi9zcGknO1xuaW1wb3J0IHsgZ2V0QWRkT25OYW1lT3JJZCwgc2V0dXBDbHVzdGVyTG9nZ2luZywgd2l0aFVzYWdlVHJhY2tpbmcgfSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBjbGFzcyBFa3NCbHVlcHJpbnRQcm9wcyB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaWQgZm9yIHRoZSBibHVlcHJpbnQuXG4gICAgICovXG4gICAgcmVhZG9ubHkgaWQ6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHRzIHRvIGlkIGlmIG5vdCBwcm92aWRlZFxuICAgICAqL1xuICAgIHJlYWRvbmx5IG5hbWU/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBBZGQtb25zIGlmIGFueS5cbiAgICAgKi9cbiAgICByZWFkb25seSBhZGRPbnM/OiBBcnJheTxzcGkuQ2x1c3RlckFkZE9uPiA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVGVhbXMgaWYgYW55XG4gICAgICovXG4gICAgcmVhZG9ubHkgdGVhbXM/OiBBcnJheTxzcGkuVGVhbT4gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEVDMiBvciBGYXJnYXRlIGFyZSBzdXBwb3J0ZWQgaW4gdGhlIGJsdWVwcmludCBidXQgYW55IGltcGxlbWVudGF0aW9uIGNvbmZvcm1pbmcgdGhlIGludGVyZmFjZVxuICAgICAqIHdpbGwgd29ya1xuICAgICAqL1xuICAgIHJlYWRvbmx5IGNsdXN0ZXJQcm92aWRlcj86IHNwaS5DbHVzdGVyUHJvdmlkZXIgPSBuZXcgTW5nQ2x1c3RlclByb3ZpZGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBLdWJlcm5ldGVzIHZlcnNpb24gKG11c3QgYmUgaW5pdGlhbGl6ZWQgZm9yIGFkZG9ucyB0byB3b3JrIHByb3Blcmx5KVxuICAgICAqL1xuICAgIHJlYWRvbmx5IHZlcnNpb24/OiBLdWJlcm5ldGVzVmVyc2lvbiA9IEt1YmVybmV0ZXNWZXJzaW9uLlYxXzIxO1xuXG4gICAgLyoqXG4gICAgICogTmFtZWQgcmVzb3VyY2UgcHJvdmlkZXJzIHRvIGxldmVyYWdlIGZvciBjbHVzdGVyIHJlc291cmNlcy5cbiAgICAgKiBUaGUgcmVzb3VyY2UgY2FuIHJlcHJlc2VudCBWcGMsIEhvc3RpbmcgWm9uZXMgb3Igb3RoZXIgcmVzb3VyY2VzLCBzZWUge0BsaW5rIHNwaS5SZXNvdXJjZVR5cGV9LlxuICAgICAqIFZQQyBmb3IgdGhlIGNsdXN0ZXIgY2FuIGJlIHJlZ2lzdGVkIHVuZGVyIHRoZSBuYW1lIG9mICd2cGMnIG9yIGFzIGEgc2luZ2xlIHByb3ZpZGVyIG9mIHR5cGUgXG4gICAgICovXG4gICAgcmVzb3VyY2VQcm92aWRlcnM/OiBNYXA8c3RyaW5nLCBzcGkuUmVzb3VyY2VQcm92aWRlcj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBDb250cm9sIFBsYW5lIGxvZyB0eXBlcyB0byBiZSBlbmFibGVkIChpZiBub3QgcGFzc2VkLCBub25lKVxuICAgICAqIElmIHdyb25nIHR5cGVzIGFyZSBpbmNsdWRlZCwgd2lsbCB0aHJvdyBhbiBlcnJvci5cbiAgICAgKi9cbiAgICByZWFkb25seSBlbmFibGVDb250cm9sUGxhbmVMb2dUeXBlcz86IHN0cmluZ1tdO1xufVxuXG5cbi8qKlxuICogQmx1ZXByaW50IGJ1aWxkZXIgaW1wbGVtZW50cyBhIGJ1aWxkZXIgcGF0dGVybiB0aGF0IGltcHJvdmVzIHJlYWRhYmlsaXR5IChubyBibG9hdGVkIGNvbnN0cnVjdG9ycylcbiAqIGFuZCBhbGxvd3MgY3JlYXRpbmcgYSBibHVlcHJpbnQgaW4gYW4gYWJzdHJhY3Qgc3RhdGUgdGhhdCBjYW4gYmUgYXBwbGllZCB0byB2YXJpb3VzIGluc3RhbnRpYXRpb25zIFxuICogaW4gYWNjb3VudHMgYW5kIHJlZ2lvbnMuIFxuICovXG5leHBvcnQgY2xhc3MgQmx1ZXByaW50QnVpbGRlciBpbXBsZW1lbnRzIHNwaS5Bc3luY1N0YWNrQnVpbGRlciB7XG5cbiAgICBwcm9wczogUGFydGlhbDxFa3NCbHVlcHJpbnRQcm9wcz47XG4gICAgZW52OiB7XG4gICAgICAgIGFjY291bnQ/OiBzdHJpbmcsXG4gICAgICAgIHJlZ2lvbj86IHN0cmluZ1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgYWRkT25zOiBuZXcgQXJyYXk8c3BpLkNsdXN0ZXJBZGRPbj4oKSwgdGVhbXM6IG5ldyBBcnJheTxzcGkuVGVhbT4oKSwgcmVzb3VyY2VQcm92aWRlcnM6IG5ldyBNYXAoKSB9O1xuICAgICAgICB0aGlzLmVudiA9IHt9O1xuICAgIH1cblxuICAgIHB1YmxpYyBuYW1lKG5hbWU6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IG5hbWUgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGFjY291bnQoYWNjb3VudD86IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLmVudi5hY2NvdW50ID0gYWNjb3VudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHJlZ2lvbihyZWdpb24/OiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbnYucmVnaW9uID0gcmVnaW9uO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgdmVyc2lvbih2ZXJzaW9uOiBLdWJlcm5ldGVzVmVyc2lvbik6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IHZlcnNpb24gfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZW5hYmxlQ29udHJvbFBsYW5lTG9nVHlwZXMoLi4udHlwZXM6IHN0cmluZ1tdKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgZW5hYmxlQ29udHJvbFBsYW5lTG9nVHlwZXM6IHR5cGVzIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHdpdGhCbHVlcHJpbnRQcm9wcyhwcm9wczogUGFydGlhbDxFa3NCbHVlcHJpbnRQcm9wcz4pOiB0aGlzIHtcbiAgICAgICAgY29uc3QgcmVzb3VyY2VQcm92aWRlcnMgPSB0aGlzLnByb3BzLnJlc291cmNlUHJvdmlkZXJzITtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4uY2xvbmVEZWVwKHByb3BzKSB9O1xuICAgICAgICBpZihwcm9wcy5yZXNvdXJjZVByb3ZpZGVycykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNvdXJjZVByb3ZpZGVycyA9IG5ldyBNYXAoWy4uLnJlc291cmNlUHJvdmlkZXJzIS5lbnRyaWVzKCksIC4uLnByb3BzLnJlc291cmNlUHJvdmlkZXJzLmVudHJpZXMoKV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRPbnMoLi4uYWRkT25zOiBzcGkuQ2x1c3RlckFkZE9uW10pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyBhZGRPbnM6IHRoaXMucHJvcHMuYWRkT25zPy5jb25jYXQoYWRkT25zKSB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbHVzdGVyUHJvdmlkZXIoY2x1c3RlclByb3ZpZGVyOiBzcGkuQ2x1c3RlclByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgY2x1c3RlclByb3ZpZGVyOiBjbHVzdGVyUHJvdmlkZXIgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaWQoaWQ6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IGlkIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHRlYW1zKC4uLnRlYW1zOiBzcGkuVGVhbVtdKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgdGVhbXM6IHRoaXMucHJvcHMudGVhbXM/LmNvbmNhdCh0ZWFtcykgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzb3VyY2VQcm92aWRlcihuYW1lOiBzdHJpbmcsIHByb3ZpZGVyOiBzcGkuUmVzb3VyY2VQcm92aWRlcik6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzLnJlc291cmNlUHJvdmlkZXJzPy5zZXQobmFtZSwgcHJvdmlkZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xvbmUocmVnaW9uPzogc3RyaW5nLCBhY2NvdW50Pzogc3RyaW5nKTogQmx1ZXByaW50QnVpbGRlciB7XG4gICAgICAgIHJldHVybiBuZXcgQmx1ZXByaW50QnVpbGRlcigpLndpdGhCbHVlcHJpbnRQcm9wcyh7IC4uLnRoaXMucHJvcHMgfSlcbiAgICAgICAgICAgIC5hY2NvdW50KGFjY291bnQ/PyB0aGlzLmVudi5hY2NvdW50KS5yZWdpb24ocmVnaW9uPz8gdGhpcy5lbnYucmVnaW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYnVpbGQoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgc3RhY2tQcm9wcz86IFN0YWNrUHJvcHMpOiBFa3NCbHVlcHJpbnQge1xuICAgICAgICByZXR1cm4gbmV3IEVrc0JsdWVwcmludChzY29wZSwgeyAuLi50aGlzLnByb3BzLCAuLi57IGlkIH0gfSxcbiAgICAgICAgICAgIHsgLi4ueyBlbnY6IHRoaXMuZW52IH0sIC4uLnN0YWNrUHJvcHMgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGJ1aWxkQXN5bmMoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgc3RhY2tQcm9wcz86IFN0YWNrUHJvcHMpOiBQcm9taXNlPEVrc0JsdWVwcmludD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5idWlsZChzY29wZSwgaWQsIHN0YWNrUHJvcHMpLndhaXRGb3JBc3luY1Rhc2tzKCk7XG4gICAgfVxufVxuXG5cbi8qKlxuICogRW50cnkgcG9pbnQgdG8gdGhlIHBsYXRmb3JtIHByb3Zpc2lvbmluZy4gQ3JlYXRlcyBhIENGTiBzdGFjayBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgY29uZmlndXJhdGlvblxuICogYW5kIG9yY2hlc3RyYXRlcyBwcm92aXNpb25pbmcgb2YgYWRkLW9ucywgdGVhbXMgYW5kIHBvc3QgZGVwbG95bWVudCBob29rcy4gXG4gKi9cbmV4cG9ydCBjbGFzcyBFa3NCbHVlcHJpbnQgZXh0ZW5kcyBjZGsuU3RhY2sge1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IFVTQUdFX0lEID0gXCJxcy0xczFyNDY1aGtcIjtcblxuICAgIHByaXZhdGUgYXN5bmNUYXNrczogUHJvbWlzZTx2b2lkIHwgQ29uc3RydWN0W10+O1xuXG4gICAgcHJpdmF0ZSBjbHVzdGVySW5mbzogc3BpLkNsdXN0ZXJJbmZvO1xuXG4gICAgcHVibGljIHN0YXRpYyBidWlsZGVyKCk6IEJsdWVwcmludEJ1aWxkZXIge1xuICAgICAgICByZXR1cm4gbmV3IEJsdWVwcmludEJ1aWxkZXIoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBibHVlcHJpbnRQcm9wczogRWtzQmx1ZXByaW50UHJvcHMsIHByb3BzPzogU3RhY2tQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgYmx1ZXByaW50UHJvcHMuaWQsIHdpdGhVc2FnZVRyYWNraW5nKEVrc0JsdWVwcmludC5VU0FHRV9JRCwgcHJvcHMpKTtcbiAgICAgICAgdGhpcy52YWxpZGF0ZUlucHV0KGJsdWVwcmludFByb3BzKTtcbiAgICAgICBcbiAgICAgICAgY29uc3QgcmVzb3VyY2VDb250ZXh0ID0gdGhpcy5wcm92aWRlTmFtZWRSZXNvdXJjZXMoYmx1ZXByaW50UHJvcHMpO1xuXG4gICAgICAgIGxldCB2cGNSZXNvdXJjZSA6IElWcGMgfCB1bmRlZmluZWQgPSByZXNvdXJjZUNvbnRleHQuZ2V0KHNwaS5HbG9iYWxSZXNvdXJjZXMuVnBjKTtcblxuICAgICAgICBpZighdnBjUmVzb3VyY2UpIHtcbiAgICAgICAgICAgIHZwY1Jlc291cmNlID0gcmVzb3VyY2VDb250ZXh0LmFkZChzcGkuR2xvYmFsUmVzb3VyY2VzLlZwYywgbmV3IFZwY1Byb3ZpZGVyKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IGJsdWVwcmludFByb3BzLnZlcnNpb24gPz8gS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjE7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXJQcm92aWRlciA9IGJsdWVwcmludFByb3BzLmNsdXN0ZXJQcm92aWRlciA/PyBuZXcgTW5nQ2x1c3RlclByb3ZpZGVyKHsgXG4gICAgICAgICAgICBpZDogYCR7IGJsdWVwcmludFByb3BzLm5hbWUgPz8gYmx1ZXByaW50UHJvcHMuaWQgfS1uZ2AsXG4gICAgICAgICAgICB2ZXJzaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2x1c3RlckluZm8gPSBjbHVzdGVyUHJvdmlkZXIuY3JlYXRlQ2x1c3Rlcih0aGlzLCB2cGNSZXNvdXJjZSEpO1xuICAgICAgICB0aGlzLmNsdXN0ZXJJbmZvLnNldFJlc291cmNlQ29udGV4dChyZXNvdXJjZUNvbnRleHQpO1xuXG4gICAgICAgIGxldCBlbmFibGVMb2dUeXBlcyA6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gYmx1ZXByaW50UHJvcHMuZW5hYmxlQ29udHJvbFBsYW5lTG9nVHlwZXM7XG4gICAgICAgIGlmIChlbmFibGVMb2dUeXBlcykge1xuICAgICAgICAgICAgc2V0dXBDbHVzdGVyTG9nZ2luZyh0aGlzLmNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssIHRoaXMuY2x1c3RlckluZm8uY2x1c3RlciwgZW5hYmxlTG9nVHlwZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcG9zdERlcGxveW1lbnRTdGVwcyA9IEFycmF5PHNwaS5DbHVzdGVyUG9zdERlcGxveT4oKTtcblxuICAgICAgICBmb3IgKGxldCBhZGRPbiBvZiAoYmx1ZXByaW50UHJvcHMuYWRkT25zID8/IFtdKSkgeyAvLyBtdXN0IGl0ZXJhdGUgaW4gdGhlIHN0cmljdCBvcmRlclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYWRkT24uZGVwbG95KHRoaXMuY2x1c3RlckluZm8pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkZE9uS2V5ID0gZ2V0QWRkT25OYW1lT3JJZChhZGRPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVySW5mby5hZGRTY2hlZHVsZWRBZGRPbihhZGRPbktleSwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBvc3REZXBsb3k6IGFueSA9IGFkZE9uO1xuICAgICAgICAgICAgaWYgKChwb3N0RGVwbG95IGFzIHNwaS5DbHVzdGVyUG9zdERlcGxveSkucG9zdERlcGxveSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zdERlcGxveW1lbnRTdGVwcy5wdXNoKDxzcGkuQ2x1c3RlclBvc3REZXBsb3k+cG9zdERlcGxveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY2hlZHVsZWRBZGRPbnMgPSB0aGlzLmNsdXN0ZXJJbmZvLmdldEFsbFNjaGVkdWxlZEFkZG9ucygpO1xuICAgICAgICBjb25zdCBhZGRPbktleXMgPSBbLi4uc2NoZWR1bGVkQWRkT25zLmtleXMoKV07XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gc2NoZWR1bGVkQWRkT25zLnZhbHVlcygpO1xuXG4gICAgICAgIHRoaXMuYXN5bmNUYXNrcyA9IFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKChjb25zdHJ1Y3RzKSA9PiB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RzLmZvckVhY2goKGNvbnN0cnVjdCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXJJbmZvLmFkZFByb3Zpc2lvbmVkQWRkT24oYWRkT25LZXlzW2luZGV4XSwgY29uc3RydWN0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoYmx1ZXByaW50UHJvcHMudGVhbXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgYmx1ZXByaW50UHJvcHMudGVhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGVhbS5zZXR1cCh0aGlzLmNsdXN0ZXJJbmZvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAobGV0IHN0ZXAgb2YgcG9zdERlcGxveW1lbnRTdGVwcykge1xuICAgICAgICAgICAgICAgIHN0ZXAucG9zdERlcGxveSh0aGlzLmNsdXN0ZXJJbmZvLCBibHVlcHJpbnRQcm9wcy50ZWFtcyA/PyBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYXN5bmNUYXNrcy5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpOyBcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpOyBcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgY29uc3RydWN0b3IgY2Fubm90IGJlIG1hcmtlZCBhcyBhc3luYywgYWRkaW5nIGEgc2VwYXJhdGUgbWV0aG9kIHRvIHdhaXRcbiAgICAgKiBmb3IgYXN5bmMgY29kZSB0byBmaW5pc2guIFxuICAgICAqIEByZXR1cm5zIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgYmx1ZXByaW50XG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHdhaXRGb3JBc3luY1Rhc2tzKCk6IFByb21pc2U8RWtzQmx1ZXByaW50PiB7XG4gICAgICAgIGlmICh0aGlzLmFzeW5jVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFzeW5jVGFza3MudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYWxsIHRoZSBjb25zdHJ1Y3RzIHByb2R1Y2VkIGJ5IGR1cmluZyB0aGUgY2x1c3RlciBjcmVhdGlvbiAoZS5nLiBhZGQtb25zKS5cbiAgICAgKiBNYXkgYmUgdXNlZCBpbiB0ZXN0aW5nIGZvciB2ZXJpZmljYXRpb24uXG4gICAgICogQHJldHVybnMgY2x1c3RlciBpbmZvIG9iamVjdFxuICAgICAqL1xuICAgIGdldENsdXN0ZXJJbmZvKCkgOiBzcGkuQ2x1c3RlckluZm8ge1xuICAgICAgICByZXR1cm4gdGhpcy5jbHVzdGVySW5mbztcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb3ZpZGVOYW1lZFJlc291cmNlcyhibHVlcHJpbnRQcm9wczogRWtzQmx1ZXByaW50UHJvcHMpIDogc3BpLlJlc291cmNlQ29udGV4dCB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBzcGkuUmVzb3VyY2VDb250ZXh0KHRoaXMsIGJsdWVwcmludFByb3BzKTtcblxuICAgICAgICBmb3IobGV0IFtrZXksIHZhbHVlXSBvZiBibHVlcHJpbnRQcm9wcy5yZXNvdXJjZVByb3ZpZGVycyA/PyBbXSkge1xuICAgICAgICAgICAgcmVzdWx0LmFkZChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHZhbGlkYXRlSW5wdXQoYmx1ZXByaW50UHJvcHM6IEVrc0JsdWVwcmludFByb3BzKSB7XG4gICAgICAgIGNvbnN0IHRlYW1OYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBpZiAoYmx1ZXByaW50UHJvcHMudGVhbXMpIHtcbiAgICAgICAgICAgIGJsdWVwcmludFByb3BzLnRlYW1zLmZvckVhY2goZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRlYW1OYW1lcy5oYXMoZS5uYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRlYW0gJHtlLm5hbWV9IGlzIHJlZ2lzdGVyZWQgbW9yZSB0aGFuIG9uY2VgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGVhbU5hbWVzLmFkZChlLm5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59Il19