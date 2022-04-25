"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atob = exports.btoa = void 0;
/**
 * Encode utf8 to Base64.
 * @param str
 * @returns
 */
function btoa(str) { return Buffer.from(str).toString('base64'); }
exports.btoa = btoa;
/**
 * Decode from base64 (to utf8).
 * @param b64Encoded
 * @returns
 */
function atob(b64Encoded) { return Buffer.from(b64Encoded, 'base64').toString(); }
exports.atob = atob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWxzL3N0cmluZy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQTs7OztHQUlHO0FBQ0gsU0FBZ0IsSUFBSSxDQUFDLEdBQVcsSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFqRixvQkFBaUY7QUFHakY7Ozs7R0FJRztBQUNILFNBQWdCLElBQUksQ0FBQyxVQUFrQixJQUFJLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQWpHLG9CQUFpRyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBFbmNvZGUgdXRmOCB0byBCYXNlNjQuXG4gKiBAcGFyYW0gc3RyIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidG9hKHN0cjogc3RyaW5nKSB7IHJldHVybiBCdWZmZXIuZnJvbShzdHIpLnRvU3RyaW5nKCdiYXNlNjQnKTsgfVxuXG5cbi8qKlxuICogRGVjb2RlIGZyb20gYmFzZTY0ICh0byB1dGY4KS5cbiAqIEBwYXJhbSBiNjRFbmNvZGVkIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdG9iKGI2NEVuY29kZWQ6IHN0cmluZykgeyByZXR1cm4gQnVmZmVyLmZyb20oYjY0RW5jb2RlZCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7IH0iXX0=