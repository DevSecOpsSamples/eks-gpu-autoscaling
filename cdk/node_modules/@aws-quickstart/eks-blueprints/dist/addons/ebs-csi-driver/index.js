"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EbsCsiDriverAddOn = void 0;
const core_addon_1 = require("../core-addon");
const iam_policy_1 = require("./iam-policy");
/**
 * Default values for the add-on
 */
const defaultProps = {
    addOnName: 'aws-ebs-csi-driver',
    version: 'v1.4.0-eksbuild.preview'
};
/**
 * Implementation of EBS CSI Driver EKS add-on.
 */
class EbsCsiDriverAddOn extends core_addon_1.CoreAddOn {
    constructor(version) {
        super({
            addOnName: defaultProps.addOnName,
            version: version !== null && version !== void 0 ? version : defaultProps.version,
            policyDocumentProvider: iam_policy_1.getEbsDriverPolicyDocument
        });
    }
}
exports.EbsCsiDriverAddOn = EbsCsiDriverAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Vicy1jc2ktZHJpdmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhDQUEwQztBQUMxQyw2Q0FBMEQ7QUFFMUQ7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBRztJQUNqQixTQUFTLEVBQUUsb0JBQW9CO0lBQy9CLE9BQU8sRUFBRSx5QkFBeUI7Q0FDckMsQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBYSxpQkFBa0IsU0FBUSxzQkFBUztJQUU1QyxZQUFZLE9BQWdCO1FBQ3hCLEtBQUssQ0FBQztZQUNGLFNBQVMsRUFBRSxZQUFZLENBQUMsU0FBUztZQUNqQyxPQUFPLEVBQUUsT0FBTyxhQUFQLE9BQU8sY0FBUCxPQUFPLEdBQUksWUFBWSxDQUFDLE9BQU87WUFDeEMsc0JBQXNCLEVBQUUsdUNBQTBCO1NBQ3JELENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQVRELDhDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29yZUFkZE9uIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcbmltcG9ydCB7IGdldEVic0RyaXZlclBvbGljeURvY3VtZW50IH0gZnJvbSBcIi4vaWFtLXBvbGljeVwiO1xuXG4vKipcbiAqIERlZmF1bHQgdmFsdWVzIGZvciB0aGUgYWRkLW9uXG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgICBhZGRPbk5hbWU6ICdhd3MtZWJzLWNzaS1kcml2ZXInLFxuICAgIHZlcnNpb246ICd2MS40LjAtZWtzYnVpbGQucHJldmlldydcbn07XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgRUJTIENTSSBEcml2ZXIgRUtTIGFkZC1vbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEVic0NzaURyaXZlckFkZE9uIGV4dGVuZHMgQ29yZUFkZE9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHZlcnNpb24/OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgYWRkT25OYW1lOiBkZWZhdWx0UHJvcHMuYWRkT25OYW1lLFxuICAgICAgICAgICAgdmVyc2lvbjogdmVyc2lvbiA/PyBkZWZhdWx0UHJvcHMudmVyc2lvbixcbiAgICAgICAgICAgIHBvbGljeURvY3VtZW50UHJvdmlkZXI6IGdldEVic0RyaXZlclBvbGljeURvY3VtZW50XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=