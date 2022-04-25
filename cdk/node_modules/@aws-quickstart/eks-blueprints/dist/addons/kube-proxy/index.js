"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KubeProxyAddOn = void 0;
const core_addon_1 = require("../core-addon");
/**
 * Implementation of KubeProxy EKS add-on.
 */
class KubeProxyAddOn extends core_addon_1.CoreAddOn {
    constructor(version) {
        super({
            addOnName: "kube-proxy",
            version: version !== null && version !== void 0 ? version : "v1.21.2-eksbuild.2"
        });
    }
}
exports.KubeProxyAddOn = KubeProxyAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2t1YmUtcHJveHkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQTBDO0FBRTFDOztHQUVHO0FBQ0gsTUFBYSxjQUFlLFNBQVEsc0JBQVM7SUFFekMsWUFBWSxPQUFnQjtRQUN4QixLQUFLLENBQUM7WUFDRixTQUFTLEVBQUUsWUFBWTtZQUN2QixPQUFPLEVBQUUsT0FBTyxhQUFQLE9BQU8sY0FBUCxPQUFPLEdBQUksb0JBQW9CO1NBQzNDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQVJELHdDQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29yZUFkZE9uIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBLdWJlUHJveHkgRUtTIGFkZC1vbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEt1YmVQcm94eUFkZE9uIGV4dGVuZHMgQ29yZUFkZE9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHZlcnNpb24/OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgYWRkT25OYW1lOiBcImt1YmUtcHJveHlcIixcbiAgICAgICAgICAgIHZlcnNpb246IHZlcnNpb24gPz8gXCJ2MS4yMS4yLWVrc2J1aWxkLjJcIlxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=