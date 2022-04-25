#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import EksBlueprintStack from '../lib/cluster-stack';

import { CLUSTER_NAME } from '../lib/cluster-config';

const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
    stage: app.node.tryGetContext('stage') || 'local'
};

new EksBlueprintStack(app, `${CLUSTER_NAME}-${env.stage}`, { env });

