"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegatingHostedZoneProvider = exports.ImportHostedZoneProvider = exports.LookupHostedZoneProvider = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const r53 = require("aws-cdk-lib/aws-route53");
/**
 * Simple lookup host zone provider
 */
class LookupHostedZoneProvider {
    /**
     * @param hostedZoneName name of the host zone to lookup
     * @param id  optional id for the structure (for tracking). set to hostzonename by default
     */
    constructor(hostedZoneName, id) {
        this.hostedZoneName = hostedZoneName;
        this.id = id;
    }
    provide(context) {
        var _a;
        return r53.HostedZone.fromLookup(context.scope, (_a = this.id) !== null && _a !== void 0 ? _a : `${this.hostedZoneName}-Lookup`, { domainName: this.hostedZoneName });
    }
}
exports.LookupHostedZoneProvider = LookupHostedZoneProvider;
/**
 * Direct import hosted zone provider, based on a known hosted zone ID.
 * Recommended method if hosted zone id is known, as it avoids extra look-ups.
 */
class ImportHostedZoneProvider {
    constructor(hostedZoneId, id) {
        this.hostedZoneId = hostedZoneId;
        this.id = id;
    }
    provide(context) {
        var _a;
        return r53.HostedZone.fromHostedZoneId(context.scope, (_a = this.id) !== null && _a !== void 0 ? _a : `${this.hostedZoneId}-Import`, this.hostedZoneId);
    }
}
exports.ImportHostedZoneProvider = ImportHostedZoneProvider;
/**
 * Delegating provider is a convenience approach to have a global hosted zone record in a centralized
 * account and subdomain records in respective workload accounts.
 *
 * The delegation part allows routing subdomain entries to the child hosted zone in the workload account.
 */
class DelegatingHostedZoneProvider {
    constructor(options) {
        this.options = options;
    }
    provide(context) {
        const stack = context.scope;
        const subZone = new r53.PublicHostedZone(stack, `${this.options.subdomain}-SubZone`, {
            zoneName: this.options.subdomain
        });
        if (this.options.wildcardSubdomain) {
            new r53.CnameRecord(stack, `${this.options.subdomain}-cname`, {
                zone: subZone,
                domainName: `${this.options.subdomain}`,
                recordName: `*.${this.options.subdomain}`
            });
        }
        // 
        // import the delegation role by constructing the roleArn.
        // Assuming the parent account has the delegating role with 
        // trust relationship setup to the child account.
        //
        const delegationRoleArn = stack.formatArn({
            region: '',
            service: 'iam',
            account: this.options.parentDnsAccountId,
            resource: 'role',
            resourceName: this.options.delegatingRoleName
        });
        const delegationRole = aws_iam_1.Role.fromRoleArn(stack, 'DelegationRole', delegationRoleArn);
        // create the record
        new r53.CrossAccountZoneDelegationRecord(stack, `${this.options.subdomain}-delegate`, {
            delegatedZone: subZone,
            parentHostedZoneName: this.options.parentDomain,
            delegationRole
        });
        return subZone;
    }
}
exports.DelegatingHostedZoneProvider = DelegatingHostedZoneProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdGVkLXpvbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvcmVzb3VyY2UtcHJvdmlkZXJzL2hvc3RlZC16b25lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlEQUEyQztBQUMzQywrQ0FBK0M7QUFHL0M7O0dBRUc7QUFDSCxNQUFhLHdCQUF3QjtJQUVqQzs7O09BR0c7SUFDSCxZQUFvQixjQUFzQixFQUFVLEVBQVc7UUFBM0MsbUJBQWMsR0FBZCxjQUFjLENBQVE7UUFBVSxPQUFFLEdBQUYsRUFBRSxDQUFTO0lBQUksQ0FBQztJQUVwRSxPQUFPLENBQUMsT0FBd0I7O1FBQzVCLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFBLElBQUksQ0FBQyxFQUFFLG1DQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3JJLENBQUM7Q0FDSjtBQVhELDREQVdDO0FBQ0Q7OztHQUdHO0FBQ0gsTUFBYSx3QkFBd0I7SUFFakMsWUFBb0IsWUFBb0IsRUFBVSxFQUFXO1FBQXpDLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQVUsT0FBRSxHQUFGLEVBQUUsQ0FBUztJQUFJLENBQUM7SUFFbEUsT0FBTyxDQUFDLE9BQXdCOztRQUM1QixPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFBLElBQUksQ0FBQyxFQUFFLG1DQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2SCxDQUFDO0NBRUo7QUFSRCw0REFRQztBQStCRDs7Ozs7R0FLRztBQUNILE1BQWEsNEJBQTRCO0lBQ3JDLFlBQW9CLE9BQTBDO1FBQTFDLFlBQU8sR0FBUCxPQUFPLENBQW1DO0lBQUksQ0FBQztJQUVuRSxPQUFPLENBQUMsT0FBd0I7UUFDNUIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUU1QixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsVUFBVSxFQUFFO1lBQ2pGLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVM7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO1lBQ2hDLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsUUFBUSxFQUFFO2dCQUMxRCxJQUFJLEVBQUUsT0FBTztnQkFDYixVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtnQkFDdkMsVUFBVSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7YUFDNUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxHQUFHO1FBQ0gsMERBQTBEO1FBQzFELDREQUE0RDtRQUM1RCxpREFBaUQ7UUFDakQsRUFBRTtRQUNGLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUN0QyxNQUFNLEVBQUUsRUFBRTtZQUNWLE9BQU8sRUFBRSxLQUFLO1lBQ2QsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCO1lBQ3hDLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQjtTQUNoRCxDQUFDLENBQUM7UUFFSCxNQUFNLGNBQWMsR0FBRyxjQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRXBGLG9CQUFvQjtRQUNwQixJQUFJLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsV0FBVyxFQUFFO1lBQ2xGLGFBQWEsRUFBRSxPQUFPO1lBQ3RCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWTtZQUMvQyxjQUFjO1NBQ2pCLENBQUMsQ0FBQztRQUVILE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQTFDRCxvRUEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSb2xlIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCAqIGFzIHI1MyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgeyBSZXNvdXJjZUNvbnRleHQsIFJlc291cmNlUHJvdmlkZXIgfSBmcm9tIFwiLi4vc3BpXCI7XG5cbi8qKlxuICogU2ltcGxlIGxvb2t1cCBob3N0IHpvbmUgcHJvdmlkZXJcbiAqL1xuZXhwb3J0IGNsYXNzIExvb2t1cEhvc3RlZFpvbmVQcm92aWRlciBpbXBsZW1lbnRzIFJlc291cmNlUHJvdmlkZXI8cjUzLklIb3N0ZWRab25lPiB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gaG9zdGVkWm9uZU5hbWUgbmFtZSBvZiB0aGUgaG9zdCB6b25lIHRvIGxvb2t1cFxuICAgICAqIEBwYXJhbSBpZCAgb3B0aW9uYWwgaWQgZm9yIHRoZSBzdHJ1Y3R1cmUgKGZvciB0cmFja2luZykuIHNldCB0byBob3N0em9uZW5hbWUgYnkgZGVmYXVsdFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdGVkWm9uZU5hbWU6IHN0cmluZywgcHJpdmF0ZSBpZD86IHN0cmluZykgeyB9XG5cbiAgICBwcm92aWRlKGNvbnRleHQ6IFJlc291cmNlQ29udGV4dCk6IHI1My5JSG9zdGVkWm9uZSB7XG4gICAgICAgIHJldHVybiByNTMuSG9zdGVkWm9uZS5mcm9tTG9va3VwKGNvbnRleHQuc2NvcGUsIHRoaXMuaWQgPz8gYCR7dGhpcy5ob3N0ZWRab25lTmFtZX0tTG9va3VwYCwgeyBkb21haW5OYW1lOiB0aGlzLmhvc3RlZFpvbmVOYW1lIH0pO1xuICAgIH1cbn1cbi8qKlxuICogRGlyZWN0IGltcG9ydCBob3N0ZWQgem9uZSBwcm92aWRlciwgYmFzZWQgb24gYSBrbm93biBob3N0ZWQgem9uZSBJRC4gXG4gKiBSZWNvbW1lbmRlZCBtZXRob2QgaWYgaG9zdGVkIHpvbmUgaWQgaXMga25vd24sIGFzIGl0IGF2b2lkcyBleHRyYSBsb29rLXVwcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEltcG9ydEhvc3RlZFpvbmVQcm92aWRlciBpbXBsZW1lbnRzIFJlc291cmNlUHJvdmlkZXI8cjUzLklIb3N0ZWRab25lPiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3RlZFpvbmVJZDogc3RyaW5nLCBwcml2YXRlIGlkPzogc3RyaW5nKSB7IH1cblxuICAgIHByb3ZpZGUoY29udGV4dDogUmVzb3VyY2VDb250ZXh0KTogcjUzLklIb3N0ZWRab25lIHtcbiAgICAgICAgcmV0dXJuIHI1My5Ib3N0ZWRab25lLmZyb21Ib3N0ZWRab25lSWQoY29udGV4dC5zY29wZSwgdGhpcy5pZCA/PyBgJHt0aGlzLmhvc3RlZFpvbmVJZH0tSW1wb3J0YCwgdGhpcy5ob3N0ZWRab25lSWQpO1xuICAgIH1cblxufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVsZWdhdGluZ0hvc3RlZFpvbmVQcm92aWRlclByb3BzIHtcblxuICAgIC8qKlxuICAgICAqIFBhcmVudCBkb21haW4gbmFtZS5cbiAgICAgKi9cbiAgICBwYXJlbnREb21haW46IHN0cmluZyxcbiAgICAvKipcbiAgICAgKiBOYW1lIGZvciB0aGUgY2hpbGQgem9uZSAoZXhwZWN0ZWQgdG8gYmUgYSBzdWJkb21haW4gb2YgdGhlIHBhcmVudCBob3N0ZWQgem9uZSkuXG4gICAgICovXG4gICAgc3ViZG9tYWluOiBzdHJpbmcsXG5cbiAgICAvKipcbiAgICAgKiBBY2NvdW50IElkIGZvciB0aGUgcGFyZW50IGhvc3RlZCB6b25lLlxuICAgICAqL1xuICAgIHBhcmVudERuc0FjY291bnRJZDogc3RyaW5nLFxuXG4gICAgLyoqXG4gICAgICogUm9sZSBuYW1lIGluIHRoZSBwYXJlbnQgYWNjb3VudCBmb3IgZGVsZWdhdGlvbi4gTXVzdCBoYXZlIHRydXN0IHJlbGF0aW9uc2hpcCBzZXQgdXAgd2l0aCB0aGUgd29ya2xvYWQgYWNjb3VudCB3aGVyZVxuICAgICAqIHRoZSBFS1MgQ2x1c3RlciBCbHVlcHJpbnQgaXMgcHJvdmlzaW9uZWQgKGFjY291bnQgbGV2ZWwgdHJ1c3QpLlxuICAgICAqL1xuICAgIGRlbGVnYXRpbmdSb2xlTmFtZTogc3RyaW5nLFxuXG4gICAgLyoqXG4gICAgICogV2hlcmUgYSB3aWxkLWNhcmQgZW50cnkgc2hvdWxkIGJlIGNyZWF0ZWQgZm9yIHRoZSBzdWJkb21haW4uIEluIHRoaXMgY2FzZSBhIHdpbGRjYXJkIENOQU1FIHJlY29yZCBpcyBjcmVhdGVkIGFsb25nIHdpdGggdGhlIHN1YmRvbWFpbi5cbiAgICAgKi9cbiAgICB3aWxkY2FyZFN1YmRvbWFpbj86IGJvb2xlYW5cbn1cblxuLyoqXG4gKiBEZWxlZ2F0aW5nIHByb3ZpZGVyIGlzIGEgY29udmVuaWVuY2UgYXBwcm9hY2ggdG8gaGF2ZSBhIGdsb2JhbCBob3N0ZWQgem9uZSByZWNvcmQgaW4gYSBjZW50cmFsaXplZCBcbiAqIGFjY291bnQgYW5kIHN1YmRvbWFpbiByZWNvcmRzIGluIHJlc3BlY3RpdmUgd29ya2xvYWQgYWNjb3VudHMuIFxuICogXG4gKiBUaGUgZGVsZWdhdGlvbiBwYXJ0IGFsbG93cyByb3V0aW5nIHN1YmRvbWFpbiBlbnRyaWVzIHRvIHRoZSBjaGlsZCBob3N0ZWQgem9uZSBpbiB0aGUgd29ya2xvYWQgYWNjb3VudC5cbiAqL1xuZXhwb3J0IGNsYXNzIERlbGVnYXRpbmdIb3N0ZWRab25lUHJvdmlkZXIgaW1wbGVtZW50cyBSZXNvdXJjZVByb3ZpZGVyPHI1My5JSG9zdGVkWm9uZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgb3B0aW9uczogRGVsZWdhdGluZ0hvc3RlZFpvbmVQcm92aWRlclByb3BzKSB7IH1cblxuICAgIHByb3ZpZGUoY29udGV4dDogUmVzb3VyY2VDb250ZXh0KTogcjUzLklIb3N0ZWRab25lIHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBjb250ZXh0LnNjb3BlO1xuXG4gICAgICAgIGNvbnN0IHN1YlpvbmUgPSBuZXcgcjUzLlB1YmxpY0hvc3RlZFpvbmUoc3RhY2ssIGAke3RoaXMub3B0aW9ucy5zdWJkb21haW59LVN1YlpvbmVgLCB7XG4gICAgICAgICAgICB6b25lTmFtZTogdGhpcy5vcHRpb25zLnN1YmRvbWFpblxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndpbGRjYXJkU3ViZG9tYWluKSB7XG4gICAgICAgICAgICBuZXcgcjUzLkNuYW1lUmVjb3JkKHN0YWNrLCBgJHt0aGlzLm9wdGlvbnMuc3ViZG9tYWlufS1jbmFtZWAsIHtcbiAgICAgICAgICAgICAgICB6b25lOiBzdWJab25lLFxuICAgICAgICAgICAgICAgIGRvbWFpbk5hbWU6IGAke3RoaXMub3B0aW9ucy5zdWJkb21haW59YCxcbiAgICAgICAgICAgICAgICByZWNvcmROYW1lOiBgKi4ke3RoaXMub3B0aW9ucy5zdWJkb21haW59YFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcbiAgICAgICAgLy8gaW1wb3J0IHRoZSBkZWxlZ2F0aW9uIHJvbGUgYnkgY29uc3RydWN0aW5nIHRoZSByb2xlQXJuLlxuICAgICAgICAvLyBBc3N1bWluZyB0aGUgcGFyZW50IGFjY291bnQgaGFzIHRoZSBkZWxlZ2F0aW5nIHJvbGUgd2l0aCBcbiAgICAgICAgLy8gdHJ1c3QgcmVsYXRpb25zaGlwIHNldHVwIHRvIHRoZSBjaGlsZCBhY2NvdW50LlxuICAgICAgICAvL1xuICAgICAgICBjb25zdCBkZWxlZ2F0aW9uUm9sZUFybiA9IHN0YWNrLmZvcm1hdEFybih7XG4gICAgICAgICAgICByZWdpb246ICcnLCAvLyBJQU0gaXMgZ2xvYmFsIGluIGVhY2ggcGFydGl0aW9uXG4gICAgICAgICAgICBzZXJ2aWNlOiAnaWFtJyxcbiAgICAgICAgICAgIGFjY291bnQ6IHRoaXMub3B0aW9ucy5wYXJlbnREbnNBY2NvdW50SWQsXG4gICAgICAgICAgICByZXNvdXJjZTogJ3JvbGUnLFxuICAgICAgICAgICAgcmVzb3VyY2VOYW1lOiB0aGlzLm9wdGlvbnMuZGVsZWdhdGluZ1JvbGVOYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRlbGVnYXRpb25Sb2xlID0gUm9sZS5mcm9tUm9sZUFybihzdGFjaywgJ0RlbGVnYXRpb25Sb2xlJywgZGVsZWdhdGlvblJvbGVBcm4pO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgcmVjb3JkXG4gICAgICAgIG5ldyByNTMuQ3Jvc3NBY2NvdW50Wm9uZURlbGVnYXRpb25SZWNvcmQoc3RhY2ssIGAke3RoaXMub3B0aW9ucy5zdWJkb21haW59LWRlbGVnYXRlYCwge1xuICAgICAgICAgICAgZGVsZWdhdGVkWm9uZTogc3ViWm9uZSxcbiAgICAgICAgICAgIHBhcmVudEhvc3RlZFpvbmVOYW1lOiB0aGlzLm9wdGlvbnMucGFyZW50RG9tYWluLCAvLyBvciB5b3UgY2FuIHVzZSBwYXJlbnRIb3N0ZWRab25lSWRcbiAgICAgICAgICAgIGRlbGVnYXRpb25Sb2xlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzdWJab25lO1xuICAgIH1cbn1cbiJdfQ==