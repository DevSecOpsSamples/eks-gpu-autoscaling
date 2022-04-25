"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VpcCniAddOn = void 0;
const core_addon_1 = require("../core-addon");
/**
 * Implementation of VpcCni EKS add-on.
 */
class VpcCniAddOn extends core_addon_1.CoreAddOn {
    constructor(version) {
        super({
            addOnName: "vpc-cni",
            version: version !== null && version !== void 0 ? version : "v1.10.2-eksbuild.1"
        });
    }
}
exports.VpcCniAddOn = VpcCniAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3ZwYy1jbmkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQTBDO0FBRTFDOztHQUVHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsc0JBQVM7SUFFdEMsWUFBWSxPQUFnQjtRQUN4QixLQUFLLENBQUM7WUFDRixTQUFTLEVBQUUsU0FBUztZQUNwQixPQUFPLEVBQUUsT0FBTyxhQUFQLE9BQU8sY0FBUCxPQUFPLEdBQUksb0JBQW9CO1NBQzNDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQVJELGtDQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29yZUFkZE9uIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBWcGNDbmkgRUtTIGFkZC1vbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFZwY0NuaUFkZE9uIGV4dGVuZHMgQ29yZUFkZE9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHZlcnNpb24/OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgYWRkT25OYW1lOiBcInZwYy1jbmlcIixcbiAgICAgICAgICAgIHZlcnNpb246IHZlcnNpb24gPz8gXCJ2MS4xMC4yLWVrc2J1aWxkLjFcIlxuICAgICAgICB9KTtcbiAgICB9XG59Il19