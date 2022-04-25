import * as r53 from 'aws-cdk-lib/aws-route53';
import { ResourceContext, ResourceProvider } from "../spi";
/**
 * Simple lookup host zone provider
 */
export declare class LookupHostedZoneProvider implements ResourceProvider<r53.IHostedZone> {
    private hostedZoneName;
    private id?;
    /**
     * @param hostedZoneName name of the host zone to lookup
     * @param id  optional id for the structure (for tracking). set to hostzonename by default
     */
    constructor(hostedZoneName: string, id?: string | undefined);
    provide(context: ResourceContext): r53.IHostedZone;
}
/**
 * Direct import hosted zone provider, based on a known hosted zone ID.
 * Recommended method if hosted zone id is known, as it avoids extra look-ups.
 */
export declare class ImportHostedZoneProvider implements ResourceProvider<r53.IHostedZone> {
    private hostedZoneId;
    private id?;
    constructor(hostedZoneId: string, id?: string | undefined);
    provide(context: ResourceContext): r53.IHostedZone;
}
export interface DelegatingHostedZoneProviderProps {
    /**
     * Parent domain name.
     */
    parentDomain: string;
    /**
     * Name for the child zone (expected to be a subdomain of the parent hosted zone).
     */
    subdomain: string;
    /**
     * Account Id for the parent hosted zone.
     */
    parentDnsAccountId: string;
    /**
     * Role name in the parent account for delegation. Must have trust relationship set up with the workload account where
     * the EKS Cluster Blueprint is provisioned (account level trust).
     */
    delegatingRoleName: string;
    /**
     * Where a wild-card entry should be created for the subdomain. In this case a wildcard CNAME record is created along with the subdomain.
     */
    wildcardSubdomain?: boolean;
}
/**
 * Delegating provider is a convenience approach to have a global hosted zone record in a centralized
 * account and subdomain records in respective workload accounts.
 *
 * The delegation part allows routing subdomain entries to the child hosted zone in the workload account.
 */
export declare class DelegatingHostedZoneProvider implements ResourceProvider<r53.IHostedZone> {
    private options;
    constructor(options: DelegatingHostedZoneProviderProps);
    provide(context: ResourceContext): r53.IHostedZone;
}
