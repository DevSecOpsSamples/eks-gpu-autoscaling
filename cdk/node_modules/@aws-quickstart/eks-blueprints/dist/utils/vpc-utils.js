"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagSubnets = exports.tagSecurityGroup = void 0;
const ec2 = require("aws-cdk-lib/aws-ec2");
const custom_resources_1 = require("aws-cdk-lib/custom-resources");
/**
 * Tags EC2 Security Group with given tag and value - used for EKS Security Group Tagging
 * @param stack - CDK Stack
 * @param securityGroupId - Security Group Resource ID
 * @param key - Tag Key
 * @param value - Tag Value
 */
function tagSecurityGroup(stack, securityGroupId, key, value) {
    const tags = [{
            Key: key,
            Value: value
        }];
    const arn = `arn:${stack.partition}:ec2:${stack.region}:${stack.account}:security-group/` + securityGroupId;
    const parameters = {
        Resources: [securityGroupId],
        Tags: tags
    };
    applyEC2Tag("eks-sg", stack, parameters, key, [arn]);
}
exports.tagSecurityGroup = tagSecurityGroup;
/**
 * Tags VPC Subnets with given tag and value.
 * @param stack - CDK Stack
 * @param subnets - a list of subnets
 * @param key - Tag Key
 * @param value - Tag Value
 */
function tagSubnets(stack, subnets, key, value) {
    for (const subnet of subnets) {
        if (!ec2.Subnet.isVpcSubnet(subnet)) {
            throw new Error('This is not a valid subnet.');
        }
    }
    const tags = [{
            Key: key,
            Value: value
        }];
    const arns = subnets.map(function (val, _) {
        return `arn:${stack.partition}:ec2:${stack.region}:${stack.account}:subnet/` + val.subnetId;
    });
    const parameters = {
        Resources: subnets.map((arn) => arn.subnetId),
        Tags: tags
    };
    applyEC2Tag("subnet", stack, parameters, key, arns);
}
exports.tagSubnets = tagSubnets;
function applyEC2Tag(id, stack, parameters, tag, resources) {
    const sdkCall = {
        service: 'EC2',
        action: 'createTags',
        parameters: parameters,
        physicalResourceId: { id: `${tag}-${id}-Tagger` }
    };
    new custom_resources_1.AwsCustomResource(stack, `${id}-tags-${tag}`, {
        policy: custom_resources_1.AwsCustomResourcePolicy.fromSdkCalls({
            resources: resources,
        }),
        onCreate: sdkCall,
        onUpdate: sdkCall,
        onDelete: {
            ...sdkCall,
            action: 'deleteTags',
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnBjLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWxzL3ZwYy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBMkM7QUFFM0MsbUVBQXNHO0FBRXRHOzs7Ozs7R0FNRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEtBQVksRUFBRSxlQUF1QixFQUFFLEdBQVcsRUFBRSxLQUFhO0lBQzlGLE1BQU0sSUFBSSxHQUFHLENBQUM7WUFDVixHQUFHLEVBQUUsR0FBRztZQUNSLEtBQUssRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxHQUFHLEdBQUcsT0FBTyxLQUFLLENBQUMsU0FBUyxRQUFRLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sa0JBQWtCLEdBQUMsZUFBZSxDQUFDO0lBRTFHLE1BQU0sVUFBVSxHQUFHO1FBQ2YsU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDO1FBQzVCLElBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQztJQUVGLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFkRCw0Q0FjQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLFVBQVUsQ0FBQyxLQUFZLEVBQUUsT0FBc0IsRUFBRSxHQUFXLEVBQUUsS0FBYTtJQUN2RixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBQztRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDakMsTUFBTSxJQUFJLEtBQUssQ0FDWCw2QkFBNkIsQ0FDaEMsQ0FBQztTQUNMO0tBQ0o7SUFFRCxNQUFNLElBQUksR0FBRyxDQUFDO1lBQ1YsR0FBRyxFQUFFLEdBQUc7WUFDUixLQUFLLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztJQUVILE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQyxPQUFPLE9BQU8sS0FBSyxDQUFDLFNBQVMsUUFBUSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLFVBQVUsR0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO0lBQzlGLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLEdBQUc7UUFDZixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUM3QyxJQUFJLEVBQUUsSUFBSTtLQUNiLENBQUM7SUFFRixXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUF4QkQsZ0NBd0JDO0FBRUQsU0FBUyxXQUFXLENBQUUsRUFBVSxFQUFFLEtBQVksRUFBRSxVQUE4QixFQUFFLEdBQVcsRUFBRSxTQUFtQjtJQUM1RyxNQUFNLE9BQU8sR0FBZTtRQUN4QixPQUFPLEVBQUUsS0FBSztRQUNkLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLFVBQVUsRUFBRSxVQUFVO1FBQ3RCLGtCQUFrQixFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxJQUFJLEVBQUUsU0FBUyxFQUFDO0tBQ25ELENBQUM7SUFFRixJQUFJLG9DQUFpQixDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxHQUFHLEVBQUUsRUFBRTtRQUM5QyxNQUFNLEVBQUUsMENBQXVCLENBQUMsWUFBWSxDQUFDO1lBQ3pDLFNBQVMsRUFBRSxTQUFTO1NBQ3ZCLENBQUM7UUFFRixRQUFRLEVBQUUsT0FBTztRQUNqQixRQUFRLEVBQUUsT0FBTztRQUNqQixRQUFRLEVBQUU7WUFDTixHQUFHLE9BQU87WUFDVixNQUFNLEVBQUUsWUFBWTtTQUN2QjtLQUNKLENBQUMsQ0FBQztBQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgeyBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEF3c0N1c3RvbVJlc291cmNlLCBBd3NDdXN0b21SZXNvdXJjZVBvbGljeSwgQXdzU2RrQ2FsbCB9IGZyb20gXCJhd3MtY2RrLWxpYi9jdXN0b20tcmVzb3VyY2VzXCI7XG5cbi8qKlxuICogVGFncyBFQzIgU2VjdXJpdHkgR3JvdXAgd2l0aCBnaXZlbiB0YWcgYW5kIHZhbHVlIC0gdXNlZCBmb3IgRUtTIFNlY3VyaXR5IEdyb3VwIFRhZ2dpbmdcbiAqIEBwYXJhbSBzdGFjayAtIENESyBTdGFja1xuICogQHBhcmFtIHNlY3VyaXR5R3JvdXBJZCAtIFNlY3VyaXR5IEdyb3VwIFJlc291cmNlIElEXG4gKiBAcGFyYW0ga2V5IC0gVGFnIEtleVxuICogQHBhcmFtIHZhbHVlIC0gVGFnIFZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YWdTZWN1cml0eUdyb3VwKHN0YWNrOiBTdGFjaywgc2VjdXJpdHlHcm91cElkOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgdGFncyA9IFt7XG4gICAgICAgIEtleToga2V5LFxuICAgICAgICBWYWx1ZTogdmFsdWVcbiAgICB9XTtcblxuICAgIGNvbnN0IGFybiA9IGBhcm46JHtzdGFjay5wYXJ0aXRpb259OmVjMjoke3N0YWNrLnJlZ2lvbn06JHtzdGFjay5hY2NvdW50fTpzZWN1cml0eS1ncm91cC9gK3NlY3VyaXR5R3JvdXBJZDtcblxuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB7XG4gICAgICAgIFJlc291cmNlczogW3NlY3VyaXR5R3JvdXBJZF0sXG4gICAgICAgIFRhZ3M6IHRhZ3NcbiAgICB9O1xuXG4gICAgYXBwbHlFQzJUYWcoXCJla3Mtc2dcIiwgc3RhY2ssIHBhcmFtZXRlcnMsIGtleSwgW2Fybl0pO1xufVxuXG4vKipcbiAqIFRhZ3MgVlBDIFN1Ym5ldHMgd2l0aCBnaXZlbiB0YWcgYW5kIHZhbHVlLlxuICogQHBhcmFtIHN0YWNrIC0gQ0RLIFN0YWNrXG4gKiBAcGFyYW0gc3VibmV0cyAtIGEgbGlzdCBvZiBzdWJuZXRzXG4gKiBAcGFyYW0ga2V5IC0gVGFnIEtleVxuICogQHBhcmFtIHZhbHVlIC0gVGFnIFZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YWdTdWJuZXRzKHN0YWNrOiBTdGFjaywgc3VibmV0czogZWMyLklTdWJuZXRbXSwga2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHN1Ym5ldCBvZiBzdWJuZXRzKXtcbiAgICAgICAgaWYgKCFlYzIuU3VibmV0LmlzVnBjU3VibmV0KHN1Ym5ldCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAnVGhpcyBpcyBub3QgYSB2YWxpZCBzdWJuZXQuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBcbiAgICB9XG4gICAgXG4gICAgY29uc3QgdGFncyA9IFt7XG4gICAgICAgIEtleToga2V5LFxuICAgICAgICBWYWx1ZTogdmFsdWVcbiAgICB9XTtcblxuICAgIGNvbnN0IGFybnMgPSBzdWJuZXRzLm1hcChmdW5jdGlvbih2YWwsIF8pe1xuICAgICAgICByZXR1cm4gYGFybjoke3N0YWNrLnBhcnRpdGlvbn06ZWMyOiR7c3RhY2sucmVnaW9ufToke3N0YWNrLmFjY291bnR9OnN1Ym5ldC9gK3ZhbC5zdWJuZXRJZDtcbiAgICB9KTtcblxuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB7XG4gICAgICAgIFJlc291cmNlczogc3VibmV0cy5tYXAoKGFybikgPT4gYXJuLnN1Ym5ldElkKSxcbiAgICAgICAgVGFnczogdGFnc1xuICAgIH07XG5cbiAgICBhcHBseUVDMlRhZyhcInN1Ym5ldFwiLCBzdGFjaywgcGFyYW1ldGVycywga2V5LCBhcm5zKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlFQzJUYWcoIGlkOiBzdHJpbmcsIHN0YWNrOiBTdGFjaywgcGFyYW1ldGVyczogUmVjb3JkPHN0cmluZyxhbnk+LCB0YWc6IHN0cmluZywgcmVzb3VyY2VzOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGNvbnN0IHNka0NhbGw6IEF3c1Nka0NhbGwgPSB7XG4gICAgICAgIHNlcnZpY2U6ICdFQzInLFxuICAgICAgICBhY3Rpb246ICdjcmVhdGVUYWdzJyxcbiAgICAgICAgcGFyYW1ldGVyczogcGFyYW1ldGVycyxcbiAgICAgICAgcGh5c2ljYWxSZXNvdXJjZUlkOiB7IGlkOiBgJHt0YWd9LSR7aWR9LVRhZ2dlcmB9XG4gICAgfTtcbiAgICBcbiAgICBuZXcgQXdzQ3VzdG9tUmVzb3VyY2Uoc3RhY2ssIGAke2lkfS10YWdzLSR7dGFnfWAsIHtcbiAgICAgICAgcG9saWN5OiBBd3NDdXN0b21SZXNvdXJjZVBvbGljeS5mcm9tU2RrQ2FsbHMoe1xuICAgICAgICAgICAgcmVzb3VyY2VzOiByZXNvdXJjZXMsXG4gICAgICAgIH0pLFxuXG4gICAgICAgIG9uQ3JlYXRlOiBzZGtDYWxsLFxuICAgICAgICBvblVwZGF0ZTogc2RrQ2FsbCxcbiAgICAgICAgb25EZWxldGU6IHsgXG4gICAgICAgICAgICAuLi5zZGtDYWxsLCBcbiAgICAgICAgICAgIGFjdGlvbjogJ2RlbGV0ZVRhZ3MnLFxuICAgICAgICB9LFxuICAgIH0pO1xufSJdfQ==