import { KubernetesManifest, ServiceAccount } from "aws-cdk-lib/aws-eks";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Configuration options for the add-on.
 */
export interface VeleroAddOnProps extends HelmAddOnUserProps {
    createNamespace: boolean;
}
export declare class VeleroAddOn extends HelmAddOn {
    private options;
    constructor(props?: VeleroAddOnProps);
    /**
     * Implementation of the add-on contract deploy method.
    */
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
    /**
     * Return S3 Bucket
     * @param clusterInfo
     * @param id S3-Bucket-Postfix
     * @param existingBucketName exiting provided S3 BucketName if it exists
     * @returns the existing provided S3 bucket  or the newly created S3 bucket as s3.IBucket
     */
    protected getOrCreateS3Bucket(clusterInfo: ClusterInfo, id: string, existingBucketName: null | string): s3.IBucket;
    /**
     * Return Velero Namespace where Velero will be installed onto
     * @param clusterInfo
     * @param defaultName the Default Namespace for Velero if nothing specified
     * @param namespace
     * @returns the namespace created or existed.
     */
    protected createNamespaceIfNeeded(clusterInfo: ClusterInfo, defaultName: string, namespace: string, create: boolean): {
        name: string;
        manifest?: KubernetesManifest;
    };
    /**
     * Return Velero Namespace where Velero will be installed onto
     * @param clusterInfo
     * @param id
     * @param namespace Velero namespace name
     * @param s3BucketName the S3 BucketName where Velero will stores the backup onto
     * @returns the service Account
     */
    protected createServiceAccountWithIamRoles(clusterInfo: ClusterInfo, id: string, namespace: string, s3Bucket: s3.IBucket): ServiceAccount;
}
