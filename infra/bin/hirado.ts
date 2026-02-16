#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HiradoStack } from '../lib/hirado-stack';

const app = new cdk.App();
new HiradoStack(app, 'HiradoStack', {
  env: { 
    account: '335716056515', 
    region: 'eu-central-1' 
  },
});
