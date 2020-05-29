// Your AWS region, by default its 'us-east-1'
export const AWS_REGION = 'us-east-1';

// Check the apiGatewayEndpoint under output tab once the CF template is in CREATE_COMPLETE state
export const API_GATEWAY_ENDPOINT = `https://<apiGatewayEndpoint>.execute-api.${AWS_REGION}.amazonaws.com/Prod`;

export const CONTACT_FLOW_ID = '<YOUR CHIME CONNECT INTEGRATION FLOW ID>';

export const INSTANCE_ID = '<YOUR AMAZON CONNECT INSTANCE ID>';
