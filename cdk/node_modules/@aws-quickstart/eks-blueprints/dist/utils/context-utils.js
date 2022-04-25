"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueFromContext = void 0;
/**
 * Looks up default value from context (cdk.json, cdk.context.json and ~/.cdk.json)
 * @param construct
 * @param key
 * @param defaultValue
 * @returns
 */
function valueFromContext(construct, key, defaultValue) {
    var _a;
    return (_a = construct.node.tryGetContext(key)) !== null && _a !== void 0 ? _a : defaultValue;
}
exports.valueFromContext = valueFromContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlscy9jb250ZXh0LXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOzs7Ozs7R0FNRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLFNBQW9CLEVBQUUsR0FBVyxFQUFFLFlBQWlCOztJQUNqRixPQUFPLE1BQUEsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLG1DQUFJLFlBQVksQ0FBQztBQUM3RCxDQUFDO0FBRkQsNENBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuXG4vKipcbiAqIExvb2tzIHVwIGRlZmF1bHQgdmFsdWUgZnJvbSBjb250ZXh0IChjZGsuanNvbiwgY2RrLmNvbnRleHQuanNvbiBhbmQgfi8uY2RrLmpzb24pXG4gKiBAcGFyYW0gY29uc3RydWN0IFxuICogQHBhcmFtIGtleSBcbiAqIEBwYXJhbSBkZWZhdWx0VmFsdWUgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlRnJvbUNvbnRleHQoY29uc3RydWN0OiBDb25zdHJ1Y3QsIGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IGFueSkge1xuICAgIHJldHVybiBjb25zdHJ1Y3Qubm9kZS50cnlHZXRDb250ZXh0KGtleSkgPz8gZGVmYXVsdFZhbHVlO1xufSJdfQ==