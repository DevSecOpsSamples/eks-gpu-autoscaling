"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conflictsWith = exports.dependable = exports.getAddOnNameOrId = void 0;
const assert = require("assert");
/**
 * Returns AddOn Id if defined else returns the class name
 * @param addOn
 * @returns string
 */
function getAddOnNameOrId(addOn) {
    var _a;
    return (_a = addOn.id) !== null && _a !== void 0 ? _a : addOn.constructor.name;
}
exports.getAddOnNameOrId = getAddOnNameOrId;
/**
 * Decorator function that accepts a list of AddOns and
 * ensures addons are scheduled to be added as well as
 * add them as dependencies
 * @param addOns
 * @returns
 */
function dependable(...addOns) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target, key, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const dependencies = Array();
            const clusterInfo = args[0];
            const stack = clusterInfo.cluster.stack.stackName;
            addOns.forEach((addOn) => {
                const dep = clusterInfo.getScheduledAddOn(addOn);
                assert(dep, `Missing a dependency for ${addOn} for ${stack}`);
                dependencies.push(dep);
            });
            const result = originalMethod.apply(this, args);
            Promise.all(dependencies.values()).then((constructs) => {
                constructs.forEach((construct) => {
                    result.then((resource) => {
                        resource.node.addDependency(construct);
                    });
                });
            }).catch(err => { throw new Error(err); });
            return result;
        };
        return descriptor;
    };
}
exports.dependable = dependable;
/**
 * Decorator function that accepts a list of AddOns and
 * throws error if those addons are scheduled to be added as well
 * As they should not be deployed with
 * @param addOns
 * @returns
 */
function conflictsWith(...addOns) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target, key, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            // const dependencies: (Promise<Construct> | undefined)[] = [];
            const clusterInfo = args[0];
            const stack = clusterInfo.cluster.stack.stackName;
            addOns.forEach((addOn) => {
                const dep = clusterInfo.getScheduledAddOn(addOn);
                if (dep) {
                    throw new Error(`Deploying ${stack} failed due to conflicting add-on: ${addOn}.`);
                }
            });
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.conflictsWith = conflictsWith;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkb24tdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvYWRkb24tdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaUNBQWlDO0FBR2pDOzs7O0dBSUc7QUFDSCxTQUFnQixnQkFBZ0IsQ0FBQyxLQUFtQjs7SUFDbEQsT0FBTyxNQUFBLEtBQUssQ0FBQyxFQUFFLG1DQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQzVDLENBQUM7QUFGRCw0Q0FFQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLFVBQVUsQ0FBQyxHQUFHLE1BQWdCO0lBQzVDLHdEQUF3RDtJQUN4RCxPQUFPLFVBQVUsTUFBYyxFQUFFLEdBQW9CLEVBQUUsVUFBOEI7UUFDbkYsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUV4QyxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxJQUFXO1lBQ3pDLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBc0IsQ0FBQztZQUNqRCxNQUFNLFdBQVcsR0FBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUVsRCxNQUFNLENBQUMsT0FBTyxDQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ3hCLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSw0QkFBNEIsS0FBSyxRQUFRLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQzlELFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLE1BQU0sR0FBdUIsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDckQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO29CQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQ3ZCLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN6QyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUzQyxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFRixPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDLENBQUM7QUFDSixDQUFDO0FBL0JELGdDQStCQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLGFBQWEsQ0FBQyxHQUFHLE1BQWdCO0lBQy9DLHdEQUF3RDtJQUN4RCxPQUFPLFVBQVUsTUFBYyxFQUFFLEdBQW9CLEVBQUUsVUFBOEI7UUFDbkYsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUV4QyxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxJQUFXO1lBQ3pDLCtEQUErRDtZQUMvRCxNQUFNLFdBQVcsR0FBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUVsRCxNQUFNLENBQUMsT0FBTyxDQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ3hCLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakQsSUFBSSxHQUFHLEVBQUM7b0JBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLEtBQUssc0NBQXNDLEtBQUssR0FBRyxDQUFDLENBQUM7aUJBQ25GO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQztRQUVGLE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUMsQ0FBQztBQUNKLENBQUM7QUF0QkQsc0NBc0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tIFwiYXNzZXJ0XCI7XG5pbXBvcnQgeyBDbHVzdGVyQWRkT24sIENsdXN0ZXJJbmZvIH0gZnJvbSAnLi4vc3BpJztcblxuLyoqXG4gKiBSZXR1cm5zIEFkZE9uIElkIGlmIGRlZmluZWQgZWxzZSByZXR1cm5zIHRoZSBjbGFzcyBuYW1lXG4gKiBAcGFyYW0gYWRkT25cbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWRkT25OYW1lT3JJZChhZGRPbjogQ2x1c3RlckFkZE9uKTogc3RyaW5nIHtcbiAgcmV0dXJuIGFkZE9uLmlkID8/IGFkZE9uLmNvbnN0cnVjdG9yLm5hbWU7XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBhIGxpc3Qgb2YgQWRkT25zIGFuZFxuICogZW5zdXJlcyBhZGRvbnMgYXJlIHNjaGVkdWxlZCB0byBiZSBhZGRlZCBhcyB3ZWxsIGFzXG4gKiBhZGQgdGhlbSBhcyBkZXBlbmRlbmNpZXNcbiAqIEBwYXJhbSBhZGRPbnMgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcGVuZGFibGUoLi4uYWRkT25zOiBzdHJpbmdbXSkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10eXBlc1xuICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogT2JqZWN0LCBrZXk6IHN0cmluZyB8IHN5bWJvbCwgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBkZXNjcmlwdG9yLnZhbHVlO1xuXG4gICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uKCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgY29uc3QgZGVwZW5kZW5jaWVzID0gQXJyYXk8UHJvbWlzZTxDb25zdHJ1Y3Q+PigpO1xuICAgICAgY29uc3QgY2x1c3RlckluZm86IENsdXN0ZXJJbmZvID0gYXJnc1swXTtcbiAgICAgIGNvbnN0IHN0YWNrID0gY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjay5zdGFja05hbWU7XG5cbiAgICAgIGFkZE9ucy5mb3JFYWNoKCAoYWRkT24pID0+IHtcbiAgICAgICAgY29uc3QgZGVwID0gY2x1c3RlckluZm8uZ2V0U2NoZWR1bGVkQWRkT24oYWRkT24pO1xuICAgICAgICBhc3NlcnQoZGVwLCBgTWlzc2luZyBhIGRlcGVuZGVuY3kgZm9yICR7YWRkT259IGZvciAke3N0YWNrfWApOyBcbiAgICAgICAgZGVwZW5kZW5jaWVzLnB1c2goZGVwISk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPENvbnN0cnVjdD4gPSBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcblxuICAgICAgUHJvbWlzZS5hbGwoZGVwZW5kZW5jaWVzLnZhbHVlcygpKS50aGVuKChjb25zdHJ1Y3RzKSA9PiB7XG4gICAgICAgIGNvbnN0cnVjdHMuZm9yRWFjaCgoY29uc3RydWN0KSA9PiB7XG4gICAgICAgICAgICByZXN1bHQudGhlbigocmVzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgcmVzb3VyY2Uubm9kZS5hZGREZXBlbmRlbmN5KGNvbnN0cnVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4geyB0aHJvdyBuZXcgRXJyb3IoZXJyKTsgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICB9O1xufVxuXG4vKipcbiAqIERlY29yYXRvciBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYSBsaXN0IG9mIEFkZE9ucyBhbmRcbiAqIHRocm93cyBlcnJvciBpZiB0aG9zZSBhZGRvbnMgYXJlIHNjaGVkdWxlZCB0byBiZSBhZGRlZCBhcyB3ZWxsXG4gKiBBcyB0aGV5IHNob3VsZCBub3QgYmUgZGVwbG95ZWQgd2l0aFxuICogQHBhcmFtIGFkZE9ucyBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZmxpY3RzV2l0aCguLi5hZGRPbnM6IHN0cmluZ1tdKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzXG4gIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBPYmplY3QsIGtleTogc3RyaW5nIHwgc3ltYm9sLCBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IpIHtcbiAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgICBkZXNjcmlwdG9yLnZhbHVlID0gZnVuY3Rpb24oIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAvLyBjb25zdCBkZXBlbmRlbmNpZXM6IChQcm9taXNlPENvbnN0cnVjdD4gfCB1bmRlZmluZWQpW10gPSBbXTtcbiAgICAgIGNvbnN0IGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyA9IGFyZ3NbMF07XG4gICAgICBjb25zdCBzdGFjayA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2suc3RhY2tOYW1lO1xuXG4gICAgICBhZGRPbnMuZm9yRWFjaCggKGFkZE9uKSA9PiB7XG4gICAgICAgIGNvbnN0IGRlcCA9IGNsdXN0ZXJJbmZvLmdldFNjaGVkdWxlZEFkZE9uKGFkZE9uKTtcbiAgICAgICAgaWYgKGRlcCl7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEZXBsb3lpbmcgJHtzdGFja30gZmFpbGVkIGR1ZSB0byBjb25mbGljdGluZyBhZGQtb246ICR7YWRkT259LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH07XG5cbiAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgfTtcbn0iXX0=