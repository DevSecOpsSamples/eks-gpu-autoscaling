import * as spi from '../spi';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
/**
 * Certificate provider that imports certificate into the current stack by arn.
 */
export declare class ImportCertificateProvider implements spi.ResourceProvider<acm.ICertificate> {
    private readonly certificateArn;
    private readonly id;
    constructor(certificateArn: string, id: string);
    provide(context: spi.ResourceContext): acm.ICertificate;
}
/**
 * Certificate provider that creates a new certificate.
 * Expects a hosted zone to be registed for validation.
 */
export declare class CreateCertificateProvider implements spi.ResourceProvider<acm.ICertificate> {
    readonly name: string;
    readonly domainName: string;
    readonly hostedZoneResourceName: string;
    /**
     * Creates the certificate provider.
     * @param name Name of this resource that other resource providers, add-ons and teams can use for look-up.
     * @param domainName
     * @param hostedZoneResourceName
     */
    constructor(name: string, domainName: string, hostedZoneResourceName: string);
    provide(context: spi.ResourceContext): acm.ICertificate;
}
