import 'amazon-connect-streams';
import 'amazon-connect-chatjs';
import './style.css';
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from 'amazon-chime-sdk-js';

import { endMeeting, createMeetingAndAddCustomerAndAgentAttendee } from '../meeting-operations/meeting';
import { AGENT_CCP_URL, AWS_REGION } from '../AgentConfig';
import { domElement, domHide, domShow } from '../utils';

let agentAttendee = null,
    customerAttendee = null,
    meeting = null,
    observer = null,
    session = null, joinInfo = null;

window.contact = window.contact || {};
window.connect = window.connect || {};
window.agent = window.agent || {};


window.addEventListener('load', () => {
  initCCP();
  initButtons();
});

function initButtons() {
  if(session == null) {
    domHide("btn-toggle-video");
  }
  const videoToggleButton = domElement("btn-toggle-video");
  videoToggleButton.addEventListener('click', handleVideoToggleButton);

  const endMeetingButton = domElement("btn-end-meeting");
  endMeetingButton.addEventListener('click', handleEndMeeting)
}

async function handleVideoToggleButton(event) {
  const videoToggleButton = event.target;
  if(videoToggleButton.innerHTML === "Join Video") {
    if(session == null) {
      await initializaMeetingSession();
    }
    domShow('agent-view');
    videoToggleButton.innerHTML = "Hide Video";
  } else if(videoToggleButton.innerHTML === "Hide Video") {
    domHide('agent-view');
    videoToggleButton.innerHTML = "Join Video";
  }
}

function initCCP() {
  const agentChatWindow = document.getElementById('agent-chat-window');
  connect.core.initCCP(agentChatWindow, {
    ccpUrl: AGENT_CCP_URL,
    region: AWS_REGION
  });
  window.connect = connect;
  connect.agent(subscribeToAgentEvents);
  connect.contact(subscribeToContactEvents);
}

function subscribeToAgentEvents(agent) {
  console.log("Agent connected:" , agent);
  window.agent = agent;
}

function subscribeToContactEvents(contact) {
  contact.onAccepted(handleContactAccepted(contact));
  contact.onEnded(handleContactEnded(contact));
}

const handleContactAccepted = contact => async ({ contactId }) => {
  joinInfo = await createMeetingAndAddCustomerAndAgentAttendee();
  getMeetingInfo(joinInfo);
  const controller = await contact.getAgentConnection().getMediaController();
  setTimeout(sendMessage("Meeting Info: " + JSON.stringify(joinInfo.meeting), controller),5000);
  setTimeout(sendMessage("CustomerAttendee Info: " + JSON.stringify(joinInfo.customerAttendee), controller), 10000);
  setTimeout(domShow('btn-toggle-video'), 10000);
}



async function handleContactEnded(contact) {
  if (contact) {
    console.log("[contact.onEnded] Contact has ended.");
  } else {
    console.log("[contact.onEnded] Contact has ended. Null contact passed to event handler");
  }
  await endMeeting(meeting);
  leave();
}


function getMeetingInfo(joinInfo) {
  try {
    if(joinInfo && typeof joinInfo === 'string') {
      joinInfo = JSON.parse(joinInfo);
    }
    meeting = joinInfo.meeting;
    agentAttendee = joinInfo.agentAttendee;
    customerAttendee = joinInfo.customerAttendee;
  } catch(err) {
    console.log("error parsing json", err);
  }
}

function sendMessage(message, controller) {
  const args = {
    message: message,
    contentType: "text/plain"
  };
  controller.sendMessage(args);
}

observer = {
  audioVideoDidStart: () => {
    session && session.audioVideo.startLocalVideoTile();
  },
  videoTileDidUpdate: tileState => {
    const { videoElement, loader } = tileState.localTile ? 
                                      { 'videoElement': 'help-desk-local-video', 'loader': 'local-video-loader' } 
                                      : { 'videoElement': 'help-desk-remote-video', 'loader': 'remote-video-loader'  };
    session && session.audioVideo.bindVideoElement(tileState.tileId, domElement(videoElement));
    domHide(loader);
    domShow(videoElement);
  },
  audioVideoDidStop: (sessionStatus) => {
    console.log("Audio video communication stopped", sessionStatus);
  }
};

async function initializaMeetingSession() {
  const logger = new ConsoleLogger('SDK', LogLevel.OFF);
  session = new DefaultMeetingSession(
    new MeetingSessionConfiguration(
      meeting,
      agentAttendee,
    ),
    logger,
    new DefaultDeviceController(logger),
  );

  session.audioVideo.addObserver(observer);

  const firstAudioDeviceId = (await session.audioVideo.listAudioInputDevices())[0].deviceId;
  await session.audioVideo.chooseAudioInputDevice(firstAudioDeviceId);

  const firstVideoDeviceId = (await session.audioVideo.listVideoInputDevices())[0].deviceId;
  await session.audioVideo.chooseVideoInputDevice(firstVideoDeviceId);

  session.audioVideo.bindAudioElement(domElement('help-desk-audio'));

  session.audioVideo.start();
}



function leave() {
  if (session) {
    session.audioVideo.stop();
  }
  session = null;
  meeting = null;
  agentAttendee = null;
  customerAttendee = null;
  domShow('local-video-loader');
  domShow('remote-video-loader');
  domHide('agent-view');
  domElement("btn-toggle-video").innerHTML = "Join Video";
  domHide("btn-toggle-video");
}


async function handleEndMeeting() {
  await endMeeting(meeting);
  leave();
}