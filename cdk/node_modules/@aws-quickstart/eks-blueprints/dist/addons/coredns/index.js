"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreDnsAddOn = void 0;
const core_addon_1 = require("../core-addon");
/**
 * Implementation of CoreDns EKS add-on.
 */
class CoreDnsAddOn extends core_addon_1.CoreAddOn {
    constructor(version) {
        super({
            addOnName: "coredns",
            version: version !== null && version !== void 0 ? version : "v1.8.4-eksbuild.1"
        });
    }
}
exports.CoreDnsAddOn = CoreDnsAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2NvcmVkbnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQTBDO0FBRTFDOztHQUVHO0FBQ0gsTUFBYSxZQUFhLFNBQVEsc0JBQVM7SUFFdkMsWUFBWSxPQUFnQjtRQUN4QixLQUFLLENBQUM7WUFDRixTQUFTLEVBQUUsU0FBUztZQUNwQixPQUFPLEVBQUUsT0FBTyxhQUFQLE9BQU8sY0FBUCxPQUFPLEdBQUksbUJBQW1CO1NBQzFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQVJELG9DQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29yZUFkZE9uIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBDb3JlRG5zIEVLUyBhZGQtb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBDb3JlRG5zQWRkT24gZXh0ZW5kcyBDb3JlQWRkT24ge1xuXG4gICAgY29uc3RydWN0b3IodmVyc2lvbj86IHN0cmluZykge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBhZGRPbk5hbWU6IFwiY29yZWRuc1wiLFxuICAgICAgICAgICAgdmVyc2lvbjogdmVyc2lvbiA/PyBcInYxLjguNC1la3NidWlsZC4xXCJcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19