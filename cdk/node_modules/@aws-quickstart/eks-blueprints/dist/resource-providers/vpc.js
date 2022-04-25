"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectVpcProvider = exports.VpcProvider = void 0;
const ec2 = require("aws-cdk-lib/aws-ec2");
/**
 * VPC resource provider
 */
class VpcProvider {
    constructor(vpcId) {
        this.vpcId = vpcId;
    }
    provide(context) {
        const id = context.scope.node.id;
        let vpc = undefined;
        if (this.vpcId) {
            if (this.vpcId === "default") {
                console.log(`looking up completely default VPC`);
                vpc = ec2.Vpc.fromLookup(context.scope, id + "-vpc", { isDefault: true });
            }
            else {
                console.log(`looking up non-default ${this.vpcId} VPC`);
                vpc = ec2.Vpc.fromLookup(context.scope, id + "-vpc", { vpcId: this.vpcId });
            }
        }
        if (vpc == null) {
            // It will automatically divide the provided VPC CIDR range, and create public and private subnets per Availability Zone.
            // Network routing for the public subnets will be configured to allow outbound access directly via an Internet Gateway.
            // Network routing for the private subnets will be configured to allow outbound access via a set of resilient NAT Gateways (one per AZ).
            vpc = new ec2.Vpc(context.scope, id + "-vpc");
        }
        return vpc;
    }
}
exports.VpcProvider = VpcProvider;
class DirectVpcProvider {
    constructor(vpc) {
        this.vpc = vpc;
    }
    provide(_context) {
        return this.vpc;
    }
}
exports.DirectVpcProvider = DirectVpcProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnBjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3Jlc291cmNlLXByb3ZpZGVycy92cGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTJDO0FBRzNDOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBR3BCLFlBQVksS0FBYztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRUQsT0FBTyxDQUFDLE9BQXdCO1FBQzVCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUM7UUFFcEIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1osSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO2dCQUNqRCxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDN0U7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsSUFBSSxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUM7Z0JBQ3hELEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDL0U7U0FDSjtRQUVELElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtZQUNiLHlIQUF5SDtZQUN6SCx1SEFBdUg7WUFDdkgsd0lBQXdJO1lBQ3hJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7U0FDakQ7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQTlCRCxrQ0E4QkM7QUFFRCxNQUFhLGlCQUFpQjtJQUN6QixZQUFxQixHQUFhO1FBQWIsUUFBRyxHQUFILEdBQUcsQ0FBVTtJQUFJLENBQUM7SUFFeEMsT0FBTyxDQUFDLFFBQXlCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0NBQ0o7QUFORCw4Q0FNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IFJlc291cmNlQ29udGV4dCwgUmVzb3VyY2VQcm92aWRlciB9IGZyb20gXCIuLi9zcGlcIjtcblxuLyoqXG4gKiBWUEMgcmVzb3VyY2UgcHJvdmlkZXIgXG4gKi9cbmV4cG9ydCBjbGFzcyBWcGNQcm92aWRlciBpbXBsZW1lbnRzIFJlc291cmNlUHJvdmlkZXI8ZWMyLklWcGM+IHtcbiAgICByZWFkb25seSB2cGNJZD86IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHZwY0lkPzogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudnBjSWQgPSB2cGNJZDtcbiAgICB9XG5cbiAgICBwcm92aWRlKGNvbnRleHQ6IFJlc291cmNlQ29udGV4dCk6IGVjMi5JVnBjIHtcbiAgICAgICAgY29uc3QgaWQgPSBjb250ZXh0LnNjb3BlLm5vZGUuaWQ7XG4gICAgICAgIGxldCB2cGMgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMudnBjSWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZwY0lkID09PSBcImRlZmF1bHRcIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBsb29raW5nIHVwIGNvbXBsZXRlbHkgZGVmYXVsdCBWUENgKTtcbiAgICAgICAgICAgICAgICB2cGMgPSBlYzIuVnBjLmZyb21Mb29rdXAoY29udGV4dC5zY29wZSwgaWQgKyBcIi12cGNcIiwgeyBpc0RlZmF1bHQ6IHRydWUgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBsb29raW5nIHVwIG5vbi1kZWZhdWx0ICR7dGhpcy52cGNJZH0gVlBDYCk7XG4gICAgICAgICAgICAgICAgdnBjID0gZWMyLlZwYy5mcm9tTG9va3VwKGNvbnRleHQuc2NvcGUsIGlkICsgXCItdnBjXCIsIHsgdnBjSWQ6IHRoaXMudnBjSWQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodnBjID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEl0IHdpbGwgYXV0b21hdGljYWxseSBkaXZpZGUgdGhlIHByb3ZpZGVkIFZQQyBDSURSIHJhbmdlLCBhbmQgY3JlYXRlIHB1YmxpYyBhbmQgcHJpdmF0ZSBzdWJuZXRzIHBlciBBdmFpbGFiaWxpdHkgWm9uZS5cbiAgICAgICAgICAgIC8vIE5ldHdvcmsgcm91dGluZyBmb3IgdGhlIHB1YmxpYyBzdWJuZXRzIHdpbGwgYmUgY29uZmlndXJlZCB0byBhbGxvdyBvdXRib3VuZCBhY2Nlc3MgZGlyZWN0bHkgdmlhIGFuIEludGVybmV0IEdhdGV3YXkuXG4gICAgICAgICAgICAvLyBOZXR3b3JrIHJvdXRpbmcgZm9yIHRoZSBwcml2YXRlIHN1Ym5ldHMgd2lsbCBiZSBjb25maWd1cmVkIHRvIGFsbG93IG91dGJvdW5kIGFjY2VzcyB2aWEgYSBzZXQgb2YgcmVzaWxpZW50IE5BVCBHYXRld2F5cyAob25lIHBlciBBWikuXG4gICAgICAgICAgICB2cGMgPSBuZXcgZWMyLlZwYyhjb250ZXh0LnNjb3BlLCBpZCArIFwiLXZwY1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2cGM7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlyZWN0VnBjUHJvdmlkZXIgaW1wbGVtZW50cyBSZXNvdXJjZVByb3ZpZGVyPGVjMi5JVnBjPiB7XG4gICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHZwYzogZWMyLklWcGMpIHsgfVxuXG4gICAgcHJvdmlkZShfY29udGV4dDogUmVzb3VyY2VDb250ZXh0KTogZWMyLklWcGMge1xuICAgICAgICByZXR1cm4gdGhpcy52cGM7XG4gICAgfSAgICBcbn0iXX0=