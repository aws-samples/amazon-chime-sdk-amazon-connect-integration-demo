import { apiGatewayClient } from '../ApiGatewayClient';
import { domHide, domShow } from '../utils';

export async function endMeeting(meeting) {
  if(meeting) {
    const meetingId = meeting.Meeting.MeetingId;
    const pathParams = {};
    const pathTemplate = '/meeting';
    const method = 'DELETE';
    const additionalParams = {
      queryParams: {
        'meetingId': meetingId
      }
    };
    const body = {};
    const response = await apiGatewayClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body);
    if(response.data == 'meeting deleted successfully') {
      domShow('alert-agent-end-meeting');
      setTimeout(function() {
        domHide('alert-agent-end-meeting')
      }, 5000);
    } else {
      console.log("In endMeeting meetingDelete Error:", err);
    }
  }
 }

export async function createMeetingAndAddCustomerAndAgentAttendee() {
  const pathParams = {};
  const pathTemplate = '/meeting';
  const method = 'POST';
  const additionalParams = {};
  const body = {};
  const response = await apiGatewayClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body);
  return response.data;
}