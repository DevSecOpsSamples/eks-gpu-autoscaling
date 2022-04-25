"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSecret = exports.getSecretValue = void 0;
const aws_sdk_1 = require("aws-sdk");
/**
 * Gets secret value from AWS Secret Manager. Requires access rights to the secret, specified by the secretName parameter.
 * @param secretName name of the secret to retrieve
 * @param region
 * @returns
*/
async function getSecretValue(secretName, region) {
    const secretManager = new aws_sdk_1.SecretsManager({ region });
    let secretString = "";
    try {
        let response = await secretManager.getSecretValue({ SecretId: secretName }).promise();
        if (response) {
            if (response.SecretString) {
                secretString = response.SecretString;
            }
            else if (response.SecretBinary) {
                throw new Error(`Invalid secret format for ${secretName}. Expected string value, received binary.`);
            }
        }
        return secretString;
    }
    catch (error) {
        console.log(`error getting secret ${secretName}: ` + error);
        throw error;
    }
}
exports.getSecretValue = getSecretValue;
/**
 * Throws an error if secret is undefined in the target region.
 * @returns ARN of the secret if exists.
 */
async function validateSecret(secretName, region) {
    const secretManager = new aws_sdk_1.SecretsManager({ region });
    try {
        const response = await secretManager.describeSecret({ SecretId: secretName }).promise();
        return response.ARN;
    }
    catch (error) {
        console.log(`Secret ${secretName} is not defined: ` + error);
        throw error;
    }
}
exports.validateSecret = validateSecret;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0cy1tYW5hZ2VyLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWxzL3NlY3JldHMtbWFuYWdlci11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBeUM7QUFDekM7Ozs7O0VBS0U7QUFDTSxLQUFLLFVBQVUsY0FBYyxDQUFDLFVBQWtCLEVBQUUsTUFBYztJQUNwRSxNQUFNLGFBQWEsR0FBRyxJQUFJLHdCQUFjLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUN0QixJQUFJO1FBQ0EsSUFBSSxRQUFRLEdBQUcsTUFBTSxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEYsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLFlBQVksR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDO2FBQ3hDO2lCQUFNLElBQUksUUFBUSxDQUFDLFlBQVksRUFBRTtnQkFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsVUFBVSwyQ0FBMkMsQ0FBQyxDQUFDO2FBQ3ZHO1NBQ0o7UUFDRCxPQUFPLFlBQVksQ0FBQztLQUN2QjtJQUNELE9BQU8sS0FBSyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsVUFBVSxJQUFJLEdBQUksS0FBSyxDQUFDLENBQUM7UUFDN0QsTUFBTSxLQUFLLENBQUM7S0FDZjtBQUNMLENBQUM7QUFsQkEsd0NBa0JBO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLGNBQWMsQ0FBQyxVQUFrQixFQUFFLE1BQWM7SUFDbkUsTUFBTSxhQUFhLEdBQUcsSUFBSSx3QkFBYyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNyRCxJQUFJO1FBQ0EsTUFBTSxRQUFRLEdBQUcsTUFBTSxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEYsT0FBTyxRQUFRLENBQUMsR0FBSSxDQUFDO0tBQ3hCO0lBQ0QsT0FBTyxLQUFLLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsVUFBVSxtQkFBbUIsR0FBSSxLQUFLLENBQUMsQ0FBQztRQUM5RCxNQUFNLEtBQUssQ0FBQztLQUNmO0FBQ0wsQ0FBQztBQVZELHdDQVVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VjcmV0c01hbmFnZXIgfSBmcm9tIFwiYXdzLXNka1wiO1xuLyoqXG4gKiBHZXRzIHNlY3JldCB2YWx1ZSBmcm9tIEFXUyBTZWNyZXQgTWFuYWdlci4gUmVxdWlyZXMgYWNjZXNzIHJpZ2h0cyB0byB0aGUgc2VjcmV0LCBzcGVjaWZpZWQgYnkgdGhlIHNlY3JldE5hbWUgcGFyYW1ldGVyLlxuICogQHBhcmFtIHNlY3JldE5hbWUgbmFtZSBvZiB0aGUgc2VjcmV0IHRvIHJldHJpZXZlXG4gKiBAcGFyYW0gcmVnaW9uIFxuICogQHJldHVybnMgXG4qL1xuIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZWNyZXRWYWx1ZShzZWNyZXROYW1lOiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBzZWNyZXRNYW5hZ2VyID0gbmV3IFNlY3JldHNNYW5hZ2VyKHsgcmVnaW9uIH0pO1xuICAgIGxldCBzZWNyZXRTdHJpbmcgPSBcIlwiO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHNlY3JldE1hbmFnZXIuZ2V0U2VjcmV0VmFsdWUoeyBTZWNyZXRJZDogc2VjcmV0TmFtZSB9KS5wcm9taXNlKCk7XG4gICAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLlNlY3JldFN0cmluZykge1xuICAgICAgICAgICAgICAgIHNlY3JldFN0cmluZyA9IHJlc3BvbnNlLlNlY3JldFN0cmluZztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UuU2VjcmV0QmluYXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHNlY3JldCBmb3JtYXQgZm9yICR7c2VjcmV0TmFtZX0uIEV4cGVjdGVkIHN0cmluZyB2YWx1ZSwgcmVjZWl2ZWQgYmluYXJ5LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZWNyZXRTdHJpbmc7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgZXJyb3IgZ2V0dGluZyBzZWNyZXQgJHtzZWNyZXROYW1lfTogYCAgKyBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaHJvd3MgYW4gZXJyb3IgaWYgc2VjcmV0IGlzIHVuZGVmaW5lZCBpbiB0aGUgdGFyZ2V0IHJlZ2lvbi5cbiAqIEByZXR1cm5zIEFSTiBvZiB0aGUgc2VjcmV0IGlmIGV4aXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2VjcmV0KHNlY3JldE5hbWU6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHNlY3JldE1hbmFnZXIgPSBuZXcgU2VjcmV0c01hbmFnZXIoeyByZWdpb24gfSk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZWNyZXRNYW5hZ2VyLmRlc2NyaWJlU2VjcmV0KHsgU2VjcmV0SWQ6IHNlY3JldE5hbWUgfSkucHJvbWlzZSgpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuQVJOITtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTZWNyZXQgJHtzZWNyZXROYW1lfSBpcyBub3QgZGVmaW5lZDogYCAgKyBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn0iXX0=