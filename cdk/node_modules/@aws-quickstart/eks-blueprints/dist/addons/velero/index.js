"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeleroAddOn = void 0;
const iam = require("aws-cdk-lib/aws-iam");
const s3 = require("aws-cdk-lib/aws-s3");
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    name: 'velero',
    version: "2.23.6",
    namespace: "velero",
    createNamespace: true,
    chart: "velero",
    repository: "https://vmware-tanzu.github.io/helm-charts/",
    release: "blueprints-addon-velero",
    values: {
        initContainers: [
            {
                name: "velero-plugin-for-aws",
                image: "velero/velero-plugin-for-aws:v1.2.0",
                imagePullPolicy: "IfNotPresent",
                volumeMounts: [
                    {
                        mountPath: "/target",
                        name: "plugins"
                    }
                ]
            }
        ],
        configuration: {
            provider: "aws",
            backupStorageLocation: {
                name: "default",
                config: {}
            },
            volumeSnapshotLocation: {
                name: "default",
                config: {}
            },
        },
        serviceAccount: {
            server: {}
        }
    },
};
class VeleroAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super((0, ts_deepmerge_1.default)(defaultProps, props !== null && props !== void 0 ? props : {}));
        this.options = this.props;
    }
    /**
     * Implementation of the add-on contract deploy method.
    */
    deploy(clusterInfo) {
        var _a, _b, _c, _d;
        const cluster = clusterInfo.cluster;
        const props = this.options;
        // Create S3 bucket if no existing bucket, create s3 bucket and corresponding KMS key
        const s3Bucket = this.getOrCreateS3Bucket(clusterInfo, "backup-bucket", props.values.configuration.backupStorageLocation.bucket);
        // Create Namespace if namespace is not explicied defined.
        const veleroNamespace = this.createNamespaceIfNeeded(clusterInfo, "velero", props.namespace, props.createNamespace);
        // Setup IAM Role for Service Accounts (IRSA) for the Velero Service Account    
        const veleroServiceAccount = this.createServiceAccountWithIamRoles(clusterInfo, "velero-account", veleroNamespace.name, s3Bucket);
        // if veleroName space does not exist and needs creation, add the dependency
        if (veleroNamespace.manifest) {
            veleroServiceAccount.node.addDependency(veleroNamespace.manifest);
        }
        // Setup the values for the helm chart
        const valueVariable = {
            values: {
                configuration: {
                    backupStorageLocation: {
                        prefix: (_a = props.values.configuration.backupStorageLocation.prefix) !== null && _a !== void 0 ? _a : "velero/" + cluster.clusterName,
                        bucket: s3Bucket.bucketName,
                        config: {
                            region: (_b = props.values.configuration.backupStorageLocation.config.region) !== null && _b !== void 0 ? _b : cluster.stack.region,
                        }
                    },
                    volumeSnapshotLocation: {
                        config: {
                            region: (_c = props.values.configuration.backupStorageLocation.config.region) !== null && _c !== void 0 ? _c : cluster.stack.region
                        }
                    }
                },
                // IAM role for Service Account
                serviceAccount: {
                    server: {
                        create: false,
                        name: veleroServiceAccount.serviceAccountName,
                    }
                }
            }
        };
        const values = (_d = (0, ts_deepmerge_1.default)(props.values, valueVariable.values)) !== null && _d !== void 0 ? _d : {};
        const chartNode = this.addHelmChart(clusterInfo, values);
        chartNode.node.addDependency(veleroServiceAccount);
        return Promise.resolve(chartNode);
    }
    /**
     * Return S3 Bucket
     * @param clusterInfo
     * @param id S3-Bucket-Postfix
     * @param existingBucketName exiting provided S3 BucketName if it exists
     * @returns the existing provided S3 bucket  or the newly created S3 bucket as s3.IBucket
     */
    getOrCreateS3Bucket(clusterInfo, id, existingBucketName) {
        if (!existingBucketName) {
            const bucket = new s3.Bucket(clusterInfo.cluster, "velero-${id}", {
                encryption: s3.BucketEncryption.KMS_MANAGED,
                blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
                publicReadAccess: false,
                enforceSSL: true // Encryption in Transit
            });
            return s3.Bucket.fromBucketName(clusterInfo.cluster, 'getOrCreateS3Bucket', bucket.bucketName);
        }
        else {
            return s3.Bucket.fromBucketName(clusterInfo.cluster, 'getOrCreateS3Bucket', existingBucketName);
        }
    }
    /**
     * Return Velero Namespace where Velero will be installed onto
     * @param clusterInfo
     * @param defaultName the Default Namespace for Velero if nothing specified
     * @param namespace
     * @returns the namespace created or existed.
     */
    createNamespaceIfNeeded(clusterInfo, defaultName, namespace, create) {
        // Create Namespace if namespace is not explicied defined.
        if (namespace) {
            // Create Namespace if the "create" option is true
            if (create) {
                const namespaceManifest = (0, utils_1.createNamespace)(namespace, clusterInfo.cluster);
                return { name: namespace, manifest: namespaceManifest };
            }
            // If the "create" option if false, then namespace will not be created, return namespace.name
            else {
                return { name: namespace };
            }
        }
        else {
            return { name: defaultName }; // initial value of veleroNamespace
        }
    }
    /**
     * Return Velero Namespace where Velero will be installed onto
     * @param clusterInfo
     * @param id
     * @param namespace Velero namespace name
     * @param s3BucketName the S3 BucketName where Velero will stores the backup onto
     * @returns the service Account
     */
    createServiceAccountWithIamRoles(clusterInfo, id, namespace, s3Bucket) {
        // Setup IAM Role for Service Accounts (IRSA) for the Velero Service Account
        const veleroServiceAccount = clusterInfo.cluster.addServiceAccount(id, {
            name: id,
            namespace: namespace
        });
        // IAM policy for Velero
        const veleroPolicyDocument = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:DescribeVolumes",
                        "ec2:DescribeSnapshots",
                        "ec2:CreateTags",
                        "ec2:CreateVolume",
                        "ec2:CreateSnapshot",
                        "ec2:DeleteSnapshot"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:GetObject",
                        "s3:DeleteObject",
                        "s3:PutObject",
                        "s3:AbortMultipartUpload",
                        "s3:ListMultipartUploadParts",
                        "s3:ListBucket"
                    ],
                    "Resource": [
                        s3Bucket.arnForObjects("*"),
                        s3Bucket.bucketArn
                    ]
                }
            ]
        };
        const veleroCustomPolicyDocument = iam.PolicyDocument.fromJson(veleroPolicyDocument);
        const veleroPolicy = new iam.ManagedPolicy(clusterInfo.cluster, "velero-managed-policy", {
            document: veleroCustomPolicyDocument
        });
        veleroServiceAccount.role.addManagedPolicy(veleroPolicy);
        return veleroServiceAccount;
    }
}
exports.VeleroAddOn = VeleroAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3ZlbGVyby9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwyQ0FBMkM7QUFDM0MseUNBQXlDO0FBRXpDLCtDQUFpQztBQUVqQyx1Q0FBOEM7QUFDOUMsOENBQThEO0FBUzlEOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQUc7SUFDakIsSUFBSSxFQUFFLFFBQVE7SUFDZCxPQUFPLEVBQUUsUUFBUTtJQUNqQixTQUFTLEVBQUUsUUFBUTtJQUNuQixlQUFlLEVBQUUsSUFBSTtJQUNyQixLQUFLLEVBQUUsUUFBUTtJQUNmLFVBQVUsRUFBRSw2Q0FBNkM7SUFDekQsT0FBTyxFQUFFLHlCQUF5QjtJQUNsQyxNQUFNLEVBQUM7UUFDSCxjQUFjLEVBQUM7WUFDWDtnQkFDSSxJQUFJLEVBQUUsdUJBQXVCO2dCQUM3QixLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxlQUFlLEVBQUUsY0FBYztnQkFDL0IsWUFBWSxFQUFDO29CQUNUO3dCQUNJLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixJQUFJLEVBQUUsU0FBUztxQkFDbEI7aUJBQ0o7YUFDSjtTQUNKO1FBQ0QsYUFBYSxFQUFFO1lBQ1gsUUFBUSxFQUFFLEtBQUs7WUFDZixxQkFBcUIsRUFBQztnQkFDbEIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsTUFBTSxFQUFDLEVBQUU7YUFDWjtZQUNELHNCQUFzQixFQUFDO2dCQUNuQixJQUFJLEVBQUUsU0FBUztnQkFDZixNQUFNLEVBQUMsRUFBRTthQUNaO1NBQ0o7UUFDRCxjQUFjLEVBQUU7WUFDWixNQUFNLEVBQUMsRUFBRTtTQUNaO0tBQ0o7Q0FDSixDQUFDO0FBRUYsTUFBYSxXQUFZLFNBQVEsc0JBQVM7SUFJdEMsWUFBWSxLQUF3QjtRQUNoQyxLQUFLLENBQUMsSUFBQSxzQkFBSyxFQUFDLFlBQVksRUFBRSxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FB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OUQsRUFBRSxFQUNGO1lBQ0ksSUFBSSxFQUFFLEVBQUU7WUFDUixTQUFTLEVBQUUsU0FBUztTQUN2QixDQUNKLENBQUM7UUFFRix3QkFBd0I7UUFDeEIsTUFBTSxvQkFBb0IsR0FBRztZQUN6QixTQUFTLEVBQUUsWUFBWTtZQUN2QixXQUFXLEVBQUU7Z0JBQ1g7b0JBQ0ksUUFBUSxFQUFFLE9BQU87b0JBQ2pCLFFBQVEsRUFBRTt3QkFDTixxQkFBcUI7d0JBQ3JCLHVCQUF1Qjt3QkFDdkIsZ0JBQWdCO3dCQUNoQixrQkFBa0I7d0JBQ2xCLG9CQUFvQjt3QkFDcEIsb0JBQW9CO3FCQUN2QjtvQkFDRCxVQUFVLEVBQUUsR0FBRztpQkFDbEI7Z0JBQ0Q7b0JBQ0UsUUFBUSxFQUFFLE9BQU87b0JBQ2pCLFFBQVEsRUFBRTt3QkFDTixjQUFjO3dCQUNkLGlCQUFpQjt3QkFDakIsY0FBYzt3QkFDZCx5QkFBeUI7d0JBQ3pCLDZCQUE2Qjt3QkFDN0IsZUFBZTtxQkFDbEI7b0JBQ0QsVUFBVSxFQUFFO3dCQUNSLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO3dCQUMzQixRQUFRLENBQUMsU0FBUztxQkFDckI7aUJBQ0Y7YUFDRjtTQUNKLENBQUM7UUFFRixNQUFNLDBCQUEwQixHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDckYsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUU7WUFDckYsUUFBUSxFQUFFLDBCQUEwQjtTQUN2QyxDQUFDLENBQUM7UUFDSCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDekQsT0FBTyxvQkFBb0IsQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUExS0Qsa0NBMEtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgS3ViZXJuZXRlc01hbmlmZXN0LCBTZXJ2aWNlQWNjb3VudCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8gfSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5pbXBvcnQgeyBjcmVhdGVOYW1lc3BhY2UgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uVXNlclByb3BzIH0gZnJvbSBcIi4uL2hlbG0tYWRkb25cIjtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBhZGQtb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmVsZXJvQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7ICAgIFxuICAgIGNyZWF0ZU5hbWVzcGFjZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZWZhdWx0cyBvcHRpb25zIGZvciB0aGUgYWRkLW9uXG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgICBuYW1lOiAndmVsZXJvJyxcbiAgICB2ZXJzaW9uOiBcIjIuMjMuNlwiLFxuICAgIG5hbWVzcGFjZTogXCJ2ZWxlcm9cIixcbiAgICBjcmVhdGVOYW1lc3BhY2U6IHRydWUsXG4gICAgY2hhcnQ6IFwidmVsZXJvXCIsXG4gICAgcmVwb3NpdG9yeTogXCJodHRwczovL3Ztd2FyZS10YW56dS5naXRodWIuaW8vaGVsbS1jaGFydHMvXCIsXG4gICAgcmVsZWFzZTogXCJibHVlcHJpbnRzLWFkZG9uLXZlbGVyb1wiLFxuICAgIHZhbHVlczp7XG4gICAgICAgIGluaXRDb250YWluZXJzOltcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcInZlbGVyby1wbHVnaW4tZm9yLWF3c1wiLFxuICAgICAgICAgICAgICAgIGltYWdlOiBcInZlbGVyby92ZWxlcm8tcGx1Z2luLWZvci1hd3M6djEuMi4wXCIsXG4gICAgICAgICAgICAgICAgaW1hZ2VQdWxsUG9saWN5OiBcIklmTm90UHJlc2VudFwiLFxuICAgICAgICAgICAgICAgIHZvbHVtZU1vdW50czpbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdW50UGF0aDogXCIvdGFyZ2V0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcInBsdWdpbnNcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBjb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICBwcm92aWRlcjogXCJhd3NcIixcbiAgICAgICAgICAgIGJhY2t1cFN0b3JhZ2VMb2NhdGlvbjp7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJkZWZhdWx0XCIsXG4gICAgICAgICAgICAgICAgY29uZmlnOnt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdm9sdW1lU25hcHNob3RMb2NhdGlvbjp7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJkZWZhdWx0XCIsXG4gICAgICAgICAgICAgICAgY29uZmlnOnt9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBzZXJ2aWNlQWNjb3VudDoge1xuICAgICAgICAgICAgc2VydmVyOnt9XG4gICAgICAgIH1cbiAgICB9LFxufTtcblxuZXhwb3J0IGNsYXNzIFZlbGVyb0FkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcblxuICAgIHByaXZhdGUgb3B0aW9uczogUmVxdWlyZWQ8VmVsZXJvQWRkT25Qcm9wcz47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IFZlbGVyb0FkZE9uUHJvcHMpIHtcbiAgICAgICAgc3VwZXIobWVyZ2UoZGVmYXVsdFByb3BzLCBwcm9wcyA/PyB7fSkpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzIGFzIFJlcXVpcmVkPFZlbGVyb0FkZE9uUHJvcHM+O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBhZGQtb24gY29udHJhY3QgZGVwbG95IG1ldGhvZC5cbiAgICAqL1xuICAgIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuICAgICAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcbiAgICAgICAgY29uc3QgcHJvcHMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIFMzIGJ1Y2tldCBpZiBubyBleGlzdGluZyBidWNrZXQsIGNyZWF0ZSBzMyBidWNrZXQgYW5kIGNvcnJlc3BvbmRpbmcgS01TIGtleVxuICAgICAgICBjb25zdCBzM0J1Y2tldCA9IHRoaXMuZ2V0T3JDcmVhdGVTM0J1Y2tldChjbHVzdGVySW5mbywgXCJiYWNrdXAtYnVja2V0XCIsIHByb3BzLnZhbHVlcy5jb25maWd1cmF0aW9uLmJhY2t1cFN0b3JhZ2VMb2NhdGlvbi5idWNrZXQpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBOYW1lc3BhY2UgaWYgbmFtZXNwYWNlIGlzIG5vdCBleHBsaWNpZWQgZGVmaW5lZC5cbiAgICAgICAgY29uc3QgdmVsZXJvTmFtZXNwYWNlID0gdGhpcy5jcmVhdGVOYW1lc3BhY2VJZk5lZWRlZChjbHVzdGVySW5mbywgXCJ2ZWxlcm9cIiwgcHJvcHMubmFtZXNwYWNlLCBwcm9wcy5jcmVhdGVOYW1lc3BhY2UpO1xuXG4gICAgICAgIC8vIFNldHVwIElBTSBSb2xlIGZvciBTZXJ2aWNlIEFjY291bnRzIChJUlNBKSBmb3IgdGhlIFZlbGVybyBTZXJ2aWNlIEFjY291bnQgICAgXG4gICAgICAgIGNvbnN0IHZlbGVyb1NlcnZpY2VBY2NvdW50ID0gdGhpcy5jcmVhdGVTZXJ2aWNlQWNjb3VudFdpdGhJYW1Sb2xlcyhjbHVzdGVySW5mbywgXCJ2ZWxlcm8tYWNjb3VudFwiLCB2ZWxlcm9OYW1lc3BhY2UubmFtZSwgczNCdWNrZXQpO1xuICAgICAgICBcbiAgICAgICAgLy8gaWYgdmVsZXJvTmFtZSBzcGFjZSBkb2VzIG5vdCBleGlzdCBhbmQgbmVlZHMgY3JlYXRpb24sIGFkZCB0aGUgZGVwZW5kZW5jeVxuICAgICAgICBpZiAodmVsZXJvTmFtZXNwYWNlLm1hbmlmZXN0KSB7XG4gICAgICAgICAgICB2ZWxlcm9TZXJ2aWNlQWNjb3VudC5ub2RlLmFkZERlcGVuZGVuY3kodmVsZXJvTmFtZXNwYWNlLm1hbmlmZXN0KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU2V0dXAgdGhlIHZhbHVlcyBmb3IgdGhlIGhlbG0gY2hhcnRcbiAgICAgICAgY29uc3QgdmFsdWVWYXJpYWJsZSA9IHtcbiAgICAgICAgICAgIHZhbHVlczoge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgYmFja3VwU3RvcmFnZUxvY2F0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXg6IHByb3BzLnZhbHVlcyEuY29uZmlndXJhdGlvbi5iYWNrdXBTdG9yYWdlTG9jYXRpb24ucHJlZml4ID8/IFwidmVsZXJvL1wiICsgY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1Y2tldDogczNCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzp7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb246IHByb3BzLnZhbHVlcyEuY29uZmlndXJhdGlvbi5iYWNrdXBTdG9yYWdlTG9jYXRpb24uY29uZmlnLnJlZ2lvbiA/PyBjbHVzdGVyLnN0YWNrLnJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdm9sdW1lU25hcHNob3RMb2NhdGlvbjp7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbjogcHJvcHMudmFsdWVzIS5jb25maWd1cmF0aW9uLmJhY2t1cFN0b3JhZ2VMb2NhdGlvbi5jb25maWcucmVnaW9uID8/IGNsdXN0ZXIuc3RhY2sucmVnaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC8vIElBTSByb2xlIGZvciBTZXJ2aWNlIEFjY291bnRcbiAgICAgICAgICAgICAgICBzZXJ2aWNlQWNjb3VudDoge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB2ZWxlcm9TZXJ2aWNlQWNjb3VudC5zZXJ2aWNlQWNjb3VudE5hbWUsICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB2YWx1ZXMgPSBtZXJnZShwcm9wcy52YWx1ZXMhLCB2YWx1ZVZhcmlhYmxlLnZhbHVlcykgPz8ge307IFxuIFxuICAgICAgICBjb25zdCBjaGFydE5vZGUgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywgdmFsdWVzKTtcbiAgICAgICAgY2hhcnROb2RlLm5vZGUuYWRkRGVwZW5kZW5jeSh2ZWxlcm9TZXJ2aWNlQWNjb3VudCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2hhcnROb2RlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gUzMgQnVja2V0XG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvIFxuICAgICAqIEBwYXJhbSBpZCBTMy1CdWNrZXQtUG9zdGZpeCBcbiAgICAgKiBAcGFyYW0gZXhpc3RpbmdCdWNrZXROYW1lIGV4aXRpbmcgcHJvdmlkZWQgUzMgQnVja2V0TmFtZSBpZiBpdCBleGlzdHMgXG4gICAgICogQHJldHVybnMgdGhlIGV4aXN0aW5nIHByb3ZpZGVkIFMzIGJ1Y2tldCAgb3IgdGhlIG5ld2x5IGNyZWF0ZWQgUzMgYnVja2V0IGFzIHMzLklCdWNrZXRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0T3JDcmVhdGVTM0J1Y2tldChjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIGlkOiBzdHJpbmcsIGV4aXN0aW5nQnVja2V0TmFtZTogbnVsbHxzdHJpbmcgKTogczMuSUJ1Y2tldCB7XG4gICAgICAgIGlmICghZXhpc3RpbmdCdWNrZXROYW1lKXtcbiAgICAgICAgICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQoY2x1c3RlckluZm8uY2x1c3RlciwgXCJ2ZWxlcm8tJHtpZH1cIiwge1xuICAgICAgICAgICAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uS01TX01BTkFHRUQsIC8vIFZlbGVybyBLbm93biBidWcgZm9yIHN1cHBvcnQgd2l0aCBTMyB3aXRoIFNTRS1LTVMgd2l0aCBDTUssIHRodXMgaXQgZG9lcyBub3Qgc3VwcG9ydCBTMyBCdWNrZXQgS2V5OiBodHRwczovL2dpdGh1Yi5jb20vdm13YXJlLXRhbnp1L2hlbG0tY2hhcnRzL2lzc3Vlcy84M1xuICAgICAgICAgICAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsIC8vIEJsb2NrIFB1YmxpYyBBY2Nlc3MgZm9yIFMzXG4gICAgICAgICAgICAgICAgcHVibGljUmVhZEFjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW5mb3JjZVNTTDogdHJ1ZSAvLyBFbmNyeXB0aW9uIGluIFRyYW5zaXRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHMzLkJ1Y2tldC5mcm9tQnVja2V0TmFtZShjbHVzdGVySW5mby5jbHVzdGVyLCAnZ2V0T3JDcmVhdGVTM0J1Y2tldCcsIGJ1Y2tldC5idWNrZXROYW1lICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gczMuQnVja2V0LmZyb21CdWNrZXROYW1lKGNsdXN0ZXJJbmZvLmNsdXN0ZXIsICdnZXRPckNyZWF0ZVMzQnVja2V0JywgZXhpc3RpbmdCdWNrZXROYW1lICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gVmVsZXJvIE5hbWVzcGFjZSB3aGVyZSBWZWxlcm8gd2lsbCBiZSBpbnN0YWxsZWQgb250b1xuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mb1xuICAgICAqIEBwYXJhbSBkZWZhdWx0TmFtZSB0aGUgRGVmYXVsdCBOYW1lc3BhY2UgZm9yIFZlbGVybyBpZiBub3RoaW5nIHNwZWNpZmllZCBcbiAgICAgKiBAcGFyYW0gbmFtZXNwYWNlXG4gICAgICogQHJldHVybnMgdGhlIG5hbWVzcGFjZSBjcmVhdGVkIG9yIGV4aXN0ZWQuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZU5hbWVzcGFjZUlmTmVlZGVkKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbywgZGVmYXVsdE5hbWU6IHN0cmluZywgbmFtZXNwYWNlOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IHtuYW1lOiBzdHJpbmcsIG1hbmlmZXN0PzogS3ViZXJuZXRlc01hbmlmZXN0fSB7XG4gICAgICAgIC8vIENyZWF0ZSBOYW1lc3BhY2UgaWYgbmFtZXNwYWNlIGlzIG5vdCBleHBsaWNpZWQgZGVmaW5lZC5cbiAgICAgICAgaWYgKG5hbWVzcGFjZSl7XG4gICAgICAgICAgICAvLyBDcmVhdGUgTmFtZXNwYWNlIGlmIHRoZSBcImNyZWF0ZVwiIG9wdGlvbiBpcyB0cnVlXG4gICAgICAgICAgICBpZiAoY3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZXNwYWNlTWFuaWZlc3QgPSBjcmVhdGVOYW1lc3BhY2UobmFtZXNwYWNlLCBjbHVzdGVySW5mby5jbHVzdGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBuYW1lOiBuYW1lc3BhY2UsIG1hbmlmZXN0OiBuYW1lc3BhY2VNYW5pZmVzdCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgdGhlIFwiY3JlYXRlXCIgb3B0aW9uIGlmIGZhbHNlLCB0aGVuIG5hbWVzcGFjZSB3aWxsIG5vdCBiZSBjcmVhdGVkLCByZXR1cm4gbmFtZXNwYWNlLm5hbWVcbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbmFtZTogbmFtZXNwYWNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHJldHVybiB7IG5hbWU6IGRlZmF1bHROYW1lIH07IC8vIGluaXRpYWwgdmFsdWUgb2YgdmVsZXJvTmFtZXNwYWNlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gVmVsZXJvIE5hbWVzcGFjZSB3aGVyZSBWZWxlcm8gd2lsbCBiZSBpbnN0YWxsZWQgb250b1xuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mb1xuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEBwYXJhbSBuYW1lc3BhY2UgVmVsZXJvIG5hbWVzcGFjZSBuYW1lXG4gICAgICogQHBhcmFtIHMzQnVja2V0TmFtZSB0aGUgUzMgQnVja2V0TmFtZSB3aGVyZSBWZWxlcm8gd2lsbCBzdG9yZXMgdGhlIGJhY2t1cCBvbnRvXG4gICAgICogQHJldHVybnMgdGhlIHNlcnZpY2UgQWNjb3VudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVTZXJ2aWNlQWNjb3VudFdpdGhJYW1Sb2xlcyhjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIGlkOiBzdHJpbmcsIG5hbWVzcGFjZTogc3RyaW5nLCBzM0J1Y2tldDogczMuSUJ1Y2tldCk6IFNlcnZpY2VBY2NvdW50IHtcbiAgICAgICAgLy8gU2V0dXAgSUFNIFJvbGUgZm9yIFNlcnZpY2UgQWNjb3VudHMgKElSU0EpIGZvciB0aGUgVmVsZXJvIFNlcnZpY2UgQWNjb3VudFxuICAgICAgICBjb25zdCB2ZWxlcm9TZXJ2aWNlQWNjb3VudCA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuYWRkU2VydmljZUFjY291bnQgKFxuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogaWQsXG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBuYW1lc3BhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBJQU0gcG9saWN5IGZvciBWZWxlcm9cbiAgICAgICAgY29uc3QgdmVsZXJvUG9saWN5RG9jdW1lbnQgPSB7XG4gICAgICAgICAgICBcIlZlcnNpb25cIjogXCIyMDEyLTEwLTE3XCIsXG4gICAgICAgICAgICBcIlN0YXRlbWVudFwiOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZVZvbHVtZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZVNuYXBzaG90c1wiLFxuICAgICAgICAgICAgICAgICAgICAgIFwiZWMyOkNyZWF0ZVRhZ3NcIixcbiAgICAgICAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVWb2x1bWVcIixcbiAgICAgICAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVTbmFwc2hvdFwiLFxuICAgICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlbGV0ZVNuYXBzaG90XCJcbiAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IFwiKlwiXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcInMzOkdldE9iamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICBcInMzOkRlbGV0ZU9iamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICBcInMzOlB1dE9iamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICBcInMzOkFib3J0TXVsdGlwYXJ0VXBsb2FkXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiczM6TGlzdE11bHRpcGFydFVwbG9hZFBhcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiczM6TGlzdEJ1Y2tldFwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgczNCdWNrZXQuYXJuRm9yT2JqZWN0cyhcIipcIiksXG4gICAgICAgICAgICAgICAgICAgIHMzQnVja2V0LmJ1Y2tldEFybiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB2ZWxlcm9DdXN0b21Qb2xpY3lEb2N1bWVudCA9IGlhbS5Qb2xpY3lEb2N1bWVudC5mcm9tSnNvbih2ZWxlcm9Qb2xpY3lEb2N1bWVudCk7XG4gICAgICAgIGNvbnN0IHZlbGVyb1BvbGljeSA9IG5ldyBpYW0uTWFuYWdlZFBvbGljeShjbHVzdGVySW5mby5jbHVzdGVyLCBcInZlbGVyby1tYW5hZ2VkLXBvbGljeVwiLCB7XG4gICAgICAgICAgICBkb2N1bWVudDogdmVsZXJvQ3VzdG9tUG9saWN5RG9jdW1lbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHZlbGVyb1NlcnZpY2VBY2NvdW50LnJvbGUuYWRkTWFuYWdlZFBvbGljeSh2ZWxlcm9Qb2xpY3kpO1xuICAgICAgICByZXR1cm4gdmVsZXJvU2VydmljZUFjY291bnQ7XG4gICAgfVxufSJdfQ==