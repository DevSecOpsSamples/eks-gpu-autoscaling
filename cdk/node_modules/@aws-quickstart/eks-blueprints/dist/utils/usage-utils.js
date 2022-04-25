"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withUsageTracking = void 0;
/**
 * Adds usage tracking info to the stack props
 * @param usageIdentifier
 * @param stackProps
 * @returns
 */
function withUsageTracking(usageIdentifier, stackProps) {
    var _a;
    const result = stackProps !== null && stackProps !== void 0 ? stackProps : {};
    const trackableDescription = `${(_a = result.description) !== null && _a !== void 0 ? _a : ""} Blueprints tracking (${usageIdentifier})`.trimLeft();
    return { ...stackProps, ...{ description: trackableDescription } };
}
exports.withUsageTracking = withUsageTracking;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNhZ2UtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvdXNhZ2UtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUE7Ozs7O0dBS0c7QUFDRixTQUFnQixpQkFBaUIsQ0FBQyxlQUF1QixFQUFFLFVBQXVCOztJQUMvRSxNQUFNLE1BQU0sR0FBSSxVQUFVLGFBQVYsVUFBVSxjQUFWLFVBQVUsR0FBSSxFQUFFLENBQUM7SUFDakMsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLE1BQUEsTUFBTSxDQUFDLFdBQVcsbUNBQUcsRUFBRSx5QkFBeUIsZUFBZSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDOUcsT0FBTyxFQUFFLEdBQUcsVUFBVSxFQUFFLEdBQUcsRUFBQyxXQUFXLEVBQUUsb0JBQW9CLEVBQUMsRUFBQyxDQUFDO0FBQ3BFLENBQUM7QUFKQSw4Q0FJQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0YWNrUHJvcHMgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcblxuLyoqXG4gKiBBZGRzIHVzYWdlIHRyYWNraW5nIGluZm8gdG8gdGhlIHN0YWNrIHByb3BzXG4gKiBAcGFyYW0gdXNhZ2VJZGVudGlmaWVyIFxuICogQHBhcmFtIHN0YWNrUHJvcHMgXG4gKiBAcmV0dXJucyBcbiAqL1xuIGV4cG9ydCBmdW5jdGlvbiB3aXRoVXNhZ2VUcmFja2luZyh1c2FnZUlkZW50aWZpZXI6IHN0cmluZywgc3RhY2tQcm9wcz86IFN0YWNrUHJvcHMpOiBTdGFja1Byb3BzIHtcbiAgICBjb25zdCByZXN1bHQgPSAgc3RhY2tQcm9wcyA/PyB7fTtcbiAgICBjb25zdCB0cmFja2FibGVEZXNjcmlwdGlvbiA9IGAke3Jlc3VsdC5kZXNjcmlwdGlvbj8/IFwiXCJ9IEJsdWVwcmludHMgdHJhY2tpbmcgKCR7dXNhZ2VJZGVudGlmaWVyfSlgLnRyaW1MZWZ0KCk7XG4gICAgcmV0dXJuIHsgLi4uc3RhY2tQcm9wcywgLi4ue2Rlc2NyaXB0aW9uOiB0cmFja2FibGVEZXNjcmlwdGlvbn19O1xufSJdfQ==