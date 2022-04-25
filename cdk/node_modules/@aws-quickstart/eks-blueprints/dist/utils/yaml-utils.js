"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeYaml = exports.loadExternalYaml = exports.loadYaml = exports.readYamlDocument = exports.applyYamlFromDir = void 0;
const fs = require("fs");
const yaml = require("js-yaml");
const sync_request_1 = require("sync-request");
/**
 * Applies all manifests from a directory. Note: The manifests are not checked,
 * so user must ensure the manifests have the correct namespaces.
 * @param dir
 * @param cluster
 * @param namespaceManifest
 */
function applyYamlFromDir(dir, cluster, namespaceManifest) {
    fs.readdirSync(dir, { encoding: 'utf8' }).forEach((file, index) => {
        if (file.split('.').pop() == 'yaml') {
            const data = fs.readFileSync(dir + file, 'utf8');
            if (data != undefined) {
                yaml.loadAll(data, function (item) {
                    const resources = cluster.addManifest(file.substring(0, file.length - 5) + index, item);
                    resources.node.addDependency(namespaceManifest);
                });
            }
        }
    });
}
exports.applyYamlFromDir = applyYamlFromDir;
function readYamlDocument(path) {
    try {
        const doc = fs.readFileSync(path, 'utf8');
        return doc;
    }
    catch (e) {
        console.log(e + ' for path: ' + path);
        throw e;
    }
}
exports.readYamlDocument = readYamlDocument;
function loadYaml(document) {
    return yaml.load(document);
}
exports.loadYaml = loadYaml;
function loadExternalYaml(url) {
    return yaml.loadAll((0, sync_request_1.default)('GET', url).getBody().toString());
}
exports.loadExternalYaml = loadExternalYaml;
function serializeYaml(document) {
    return yaml.dump(document);
}
exports.serializeYaml = serializeYaml;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFtbC11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlscy95YW1sLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHlCQUF5QjtBQUN6QixnQ0FBZ0M7QUFDaEMsK0NBQW1DO0FBRW5DOzs7Ozs7R0FNRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFvQixFQUFFLGlCQUFxQztJQUNyRyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUM5RCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksTUFBTSxFQUFFO1lBQ2pDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNqRCxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsSUFBSTtvQkFDN0IsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBeUIsSUFBSSxDQUFDLENBQUM7b0JBQy9HLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3BELENBQUMsQ0FBQyxDQUFDO2FBQ047U0FDSjtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQVpELDRDQVlDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBWTtJQUN6QyxJQUFJO1FBQ0EsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUMsT0FBTyxHQUFHLENBQUM7S0FDZDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxDQUFDO0tBQ1g7QUFDTCxDQUFDO0FBUkQsNENBUUM7QUFHRCxTQUFnQixRQUFRLENBQUMsUUFBZ0I7SUFDckMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUVELFNBQWdCLGdCQUFnQixDQUFDLEdBQVc7SUFDeEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUEsc0JBQU8sRUFBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRkQsNENBRUM7QUFFRCxTQUFnQixhQUFhLENBQUMsUUFBYTtJQUN2QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELHNDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZWtzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0IHsgS3ViZXJuZXRlc01hbmlmZXN0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVrcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB5YW1sIGZyb20gJ2pzLXlhbWwnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnc3luYy1yZXF1ZXN0JztcblxuLyoqXG4gKiBBcHBsaWVzIGFsbCBtYW5pZmVzdHMgZnJvbSBhIGRpcmVjdG9yeS4gTm90ZTogVGhlIG1hbmlmZXN0cyBhcmUgbm90IGNoZWNrZWQsIFxuICogc28gdXNlciBtdXN0IGVuc3VyZSB0aGUgbWFuaWZlc3RzIGhhdmUgdGhlIGNvcnJlY3QgbmFtZXNwYWNlcy4gXG4gKiBAcGFyYW0gZGlyIFxuICogQHBhcmFtIGNsdXN0ZXIgXG4gKiBAcGFyYW0gbmFtZXNwYWNlTWFuaWZlc3QgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVlhbWxGcm9tRGlyKGRpcjogc3RyaW5nLCBjbHVzdGVyOiBla3MuQ2x1c3RlciwgbmFtZXNwYWNlTWFuaWZlc3Q6IEt1YmVybmV0ZXNNYW5pZmVzdCk6IHZvaWQge1xuICAgIGZzLnJlYWRkaXJTeW5jKGRpciwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pLmZvckVhY2goKGZpbGUsIGluZGV4KSA9PiB7XG4gICAgICAgIGlmIChmaWxlLnNwbGl0KCcuJykucG9wKCkgPT0gJ3lhbWwnKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGRpciArIGZpbGUsICd1dGY4Jyk7XG4gICAgICAgICAgICBpZiAoZGF0YSAhPSB1bmRlZmluZWQpIHsgIFxuICAgICAgICAgICAgICAgIHlhbWwubG9hZEFsbChkYXRhLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNvdXJjZXMgPSBjbHVzdGVyLmFkZE1hbmlmZXN0KGZpbGUuc3Vic3RyaW5nKDAsIGZpbGUubGVuZ3RoIC0gNSkgKyBpbmRleCwgPFJlY29yZDxzdHJpbmcsIGFueT5bXT5pdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzLm5vZGUuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2VNYW5pZmVzdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRZYW1sRG9jdW1lbnQocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkb2MgPSBmcy5yZWFkRmlsZVN5bmMocGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgcmV0dXJuIGRvYztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUgKyAnIGZvciBwYXRoOiAnICsgcGF0aCk7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkWWFtbChkb2N1bWVudDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4geWFtbC5sb2FkKGRvY3VtZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRFeHRlcm5hbFlhbWwodXJsOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB5YW1sLmxvYWRBbGwocmVxdWVzdCgnR0VUJywgdXJsKS5nZXRCb2R5KCkudG9TdHJpbmcoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVZYW1sKGRvY3VtZW50OiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiB5YW1sLmR1bXAoZG9jdW1lbnQpO1xufSJdfQ==