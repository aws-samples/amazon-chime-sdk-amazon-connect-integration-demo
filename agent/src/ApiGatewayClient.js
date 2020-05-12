const apigClientFactory = require('aws-api-gateway-client').default;

import APIGatewayClientConfig from './ApiGatewayClientConfig';

export const apiGatewayClient = apigClientFactory.newClient(APIGatewayClientConfig);
