
import { INVOKE_URL, ACCESS_KEY, SECRET_KEY, AWS_REGION } from './AgentConfig';

const APIGatewayClientConfig = {
  invokeUrl: INVOKE_URL,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
  region: AWS_REGION
};

export default APIGatewayClientConfig;