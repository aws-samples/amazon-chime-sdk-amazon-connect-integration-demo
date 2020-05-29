# Amazon Chime SDK and Amazon Connect Integration Demo

## Overview
This demo explains how you can use [Amazon Chime SDK](https://aws.amazon.com/chime/chime-sdk/) and [Amazon Connect](https://aws.amazon.com/connect/) to develop a video enabled contact center. Currently, Amazon Connect provides a great service to develop a chat and voice-based contact center. Using Amazon Chime SDK, you can enhance the current support experience by enabling video meeting between the agent and the customer. In this demo, you get the information on how to use Amazon Connect with Amazon Chime SDK to develop a video enabled contact center.

The demo has a customer application that uses the pre-built customer chat widget provided by Amazon Connect and a customized agent CCP application that uses [Amazon Connect Streams API](https://github.com/amazon-connect/amazon-connect-streams) in-order to subscribe to the events which provide the agent and customer state.

## Getting Started

### Customer Setup
#### Step 1: Create StartVideoCall Amazon Lex Bot
This bot is needed for the contact flow (`Chime Connect Integration flow.json`). This bot helps in branching the Amazon Connect contact flow decision making when the customer wants to do a video enabled chat or just simple chat.

1. Goto [Amazon Lex](https://console.aws.amazon.com/lex)
2. If you have never created any Amazon Lex bot, then click on Get Started → Click Cancel (This is needed to go to home page)
3. You should see the Amazon Lex home page with Create and Actions buttons and all the created Amazon Lex bots
4. Click Actions → Import bot → Upload the zip file from `/lexbot/` → Click Import
5. If it asks for overwriting intents click overwrite and the StartVideoCall Amazon Lex bot gets imported in NOT_BUILT status
6. Click on StartVideoCall Amazon Lex bot → Click Build and then Publish (In the top right corner of your page)
7. If it asks you for alias put StartVideoCall as alias and click Publish

#### Step 2: Create Amazon Connect Instance
1. Follow [Amazon Connect Create Instance](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html)
2. In Step 1: Identity Management, choose *Store users within Amazon Connect*
    1. Provide Access URL as https://`<instance_alias_name>`.awsapps.com/connect/home
3. In Step 2: Administrator, choose add new admin. This admin is required when you run the Agent CCP application for login purposes
4. Click on Create instance

#### Step 3: Add StartVideoCall Bot to Amazon Connect Instance
1. Goto [Amazon Connect](https://console.aws.amazon.com/connect)
2. Click on the instance alias for the above created Amazon connect instance
3. On the left-hand side panel click on Contact flows
4. Under Amazon Lex, select StartVideoCall against Bot and click on Add Lex Bot

#### Step 4: Import `Chime Connect Integration flow.json`
1. Goto [Amazon Connect](https://console.aws.amazon.com/connect)
2. Click on the Access URL to login on the Amazon connect instance you created; a Dashboard is displayed once logged in successfully
3. Check for Create contact flows, and click on View contact flows
4. Click on the `Create contact flow` → Select `Import flow (beta)` from dropdown. Import the contact flow by navigating to `/contact-flow/Chime Connect Integration flow.json` in this repository. Now you should have an Amazon Connect contact flow named Chime Connect Integration Flow, with Get Customer Input block having a StartVideoCall Amazon Lex bot attached to it.
5. Click Save →  Publish

#### Step 5: Create Amazon Connect Customer Chat Widget, Website and Resources
Follow [Amazon Connect Chat UI Example GitHub](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/asyncCustomerChatUX) to create a simple website that enables customer to start chat with pre-built widget.
1. Start with Step 2, In step 2, click on Launch Stack button against `us-east-1` region. It creates asyncCustomerChatUX AWS CloudFormation stack.
2. You can skip the Testing Steps for the purpose of this demo.
3. [In Adding this chat widget to your website](_https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/asyncCustomerChatUX#adding-this-chat-widget-to-your-website_) section
    1. In step 1, update the header "Access-Control-Allow-Origin" to have value "http://localhost:9000" in `buildSuccessfulResponse` and `buildResponseFailed` functions in the `asyncCustomerChatUX-InitiateChatLambda-*` AWS Lambda function created from the AWS CloudFormation template.
    2. For step 2 do only this, download the `amazon-connect-chat-interface.js` from the Amazon Simple Storage Service (Amazon S3) bucket created by the asyncCustomerChatUX AWS CloudFormation stack. Add downloaded file to `/customer/public/`. It's the minified JavaScript source file developed and provided by Amazon Connect to handle the chat functionality in the customer chat widget.
    3. Skip Step 3 and 4.

### Running the customer application
Navigate to `/customer/`

1. Update the `API_GATEWAY_ENDPOINT`, `CONTACT_FLOW_ID` and `INSTANCE_ID` in `/customer/src/ConnectChatInterfaceConfig.js`
    1. Update `AWS_REGION` if needed.
    2. Get the `API_GATEWAY_ENDPOINT` from output tab once you create the `asyncCustomerChatUX` AWS CloudFormation template stack. 
    3. You can get the `CONTACT_FLOW_ID` and `INSTANCE_ID` when you open your `Chime Connect Integration Flow` contact flow in Amazon Connect instance, check the URL in browser. The URL will have → instance/{instanceId}/contact-flow/{contactId}.
2. Check if `amazon-connect-chat-interface.js` file is added to `/customer/public` folder
3. Open terminal, navigate to `/customer/` directory
    1. Install NPM dependencies: `npm install`
    2. Build the app: `npm run build`
    3. Start the server: `npm run start`
4. Step 3 opens http://localhost:9000 in your browser

### Agent Setup

#### Step 1: Create Amazon S3 Bucket for AWS Lambda functions
1. Goto [Amazon S3](https://s3.console.aws.amazon.com/s3)
2. Click Create bucket
  1. Bucket name: `<unique Amazon S3 bucket name>`
  2. Region: `us-east-1`
  3. Keep everything rest as is and click on Create bucket
3. Goto created Amazon S3 bucket, click on Upload then click on Add files and upload the zip files from `/agent/aws_lambdas`

You should now have the Amazon S3 bucket with two lambda function zip files.


#### Step 2: Create Agent Resources
1. Goto [AWS CloudFormation](https://console.aws.amazon.com/cloudformation)
2. Click `Create Stack`
3. Create stack
    1. Prerequisite - Prepare template: `Template is ready`
    2. Specify template:
   	   1. Template source: Select `Upload a template file`
   	   2. Upload a template file → Select the `ChimeConnectIntegrationDemo.yaml` file from `/agent/` folder
   	   3. Click Next
4. Specify stack details
   1. Stack Name: `ChimeSDKConnectIntegrationDemo`
   2. In Parameters section: (These are AWS managed IAM policies)
      1. AWSAmazonAPIGatewayInvokeFullAccess: `arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess`
      2. AWSAmazonChimeSDKManagedPolicy: `arn:aws:iam::aws:policy/AmazonChimeSDK`
      3. AWSLambdaBasicExecutionManagedPolicy: `arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`
      4. AmazonS3BucketName: Amazon S3 bucket name created in [agent setup step 1](#step-1-create-amazon-s3-bucket-for-aws-lambda-functions)
   3. Click Next
5. Click Next on Configure stack options with everything as is.
6. On the final Review page, check the acknowledge option under capabilities and click Create Stack.

Once creation is complete, in the output section you will get three variables as mentioned below:
1. `ChimeConnectDemoUserAccessKey`, `ChimeConnectDemoUserSecretKey` - This is the access key and secret key for the development user to call the Amazon API Gateway endpoint's DELETE and POST method from localhost.
2. `invokeURL` - API Gateway endpoint invoke URL.

This template creates required roles, API Gateway with resources, methods and proxy AWS Lambda integration.

Follow these steps to enable CORS:
1. Go to the [Amazon APIGateway](https://console.aws.amazon.com/apigateway)
2. Click `chime-meeting-operations`
3. Check `/meeting` under resources. Select it, click on Actions dropdown and click on Enable CORS
4. Check the 4XX and 5XX for `Gateway Responses for chime-meeting-operations API` and click on `Enable CORS and replace existing CORS headers`
5. Finally click Deploy API from Actions dropdown.

### Running the agent application
Navigate to `/agent/`

1. Update the `ACCESS_KEY`, `SECRET_KEY`, `INVOKE_URL` in `/agent/src/AgentConfig.js` with values received in AWS CloudFormation output tab. Update `AWS_REGION` if needed, but keep it the same everywhere

2. Update the `AGENT_CCP_URL` in `/agent/src/AgentConfig.js` with the created Amazon Connect instance alias. You can find the instance alias by going to [Amazon Connect](https://console.aws.amazon.com/connect) check 'Instance Alias' under Amazon Connect virtual contact center instances

3. As the demo uses Amazon Connect Streams API, it is required to add your website as an approved origin to the created Amazon connect instance.
   1. To do this, goto [Amazon Connect](https://console.aws.amazon.com/connect), click 'Instance Alias' under Amazon Connect virtual contact center instances. On the left-hand side panel, you will find Application integration, click on it.
   2. Under Approved origins, click on + Add origin → enter origin URL as http://localhost:8080 and click Add.

4. Open terminal, navigate to `/agent/` directory
    1. Install NPM dependencies: `npm install`
    2. Build the app: `npm run build`
    3. Start the server: `npm run start`
5. Step 4 opens http://localhost:8080 in your browser


## Important Note

The access and secret key are included as part of the JavaScript for the purpose of this demo. In a production application, these keys should not be delivered as part of any JavaScript. You can use [Amazon Cognito](https://aws.amazon.com/cognito/) for better implementation of authentication and authorization.

Amazon Cognito lets you add user sign-up, sign-in, and access control to your web and mobile apps quickly and easily. Amazon Cognito scales to millions of users and supports sign-in with social identity providers, such as Facebook, Google, and Amazon, and enterprise identity providers via SAML 2.0.

Amazon Cognito also provides solutions to control access to backend resources from your app. You can define roles and map users to different roles so your app can access only the resources that are authorized for each user.

## Troubleshooting

* This demo is developed and tested in `us-east-1` region, if you use any other region please update the same everywhere else in the entire customer and agent application.

* If you have selected an AWS region other than `us-east-1`, the `StartVideoCall` Amazon Lex bot will not work as it was exported from `us-east-1` region, to update it do the following: 
    1. Update the `StartVideoCall` bot by going to `Chime Connect Integration flow` (imported just above) → `Get Customer Input` block
    2. Click on `Get Customer Input` and on the right side panel, under the Lex tab select the single entry of `StartVideoCall` bot from the dropdown. This updates the `StartVideoCall` Amazon Lex bot you created in your region.


## License

This project is licensed under the Apache-2.0 License.
