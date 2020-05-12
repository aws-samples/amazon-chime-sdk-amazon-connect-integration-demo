// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from 'amazon-chime-sdk-js';

import '../style.css';
import { domElement, domHide, domShow } from '../utils';
import { API_GATEWAY_ENDPOINT, CONTACT_FLOW_ID, INSTANCE_ID, AWS_REGION } from '../ConnectChatInterfaceConfig';

const windowAny = window;
let meetingSession = null;
let meeting = null,
  customerAttendee = null,
  map = new Map();

windowAny.addEventListener('load', async () => {
  document.getElementById('join-button').addEventListener('click', async () => {
    domHide('meeting-info');
    domShow('meeting-view');
    await initializeMeetingSession();
  });
});

$(document).ready(a => {
  windowAny.connect.ChatInterface.init({
    containerId: 'root',
    headerConfig: {
      isHTML: true,
      render: () => {
        return `
              <div class="header-wrapper">
                <h2 class="welcome-text">Chat Demo</h2>
                <p id="chatDescription">You can modify this header or use the default.</p>
              </div>
            `;
      },
    },
  });

  const buttonMeetingEnd = document.getElementById('button-end-meeting');
  buttonMeetingEnd.addEventListener('click', event => {
    leave();
  });
});

$(function() {
  $('#contactDetails').submit(function(e) {
    e.preventDefault();
    var customerName = $('#firstName').val();
    var username = $('#username').val();
    if (!customerName || !username) {
      alert('you must enter a name & username');
      document.getElementById('contactDetails').reset();
    } else {
      document.getElementById('contactDetails').reset();
      connect.ChatInterface.initiateChat(
        {
          name: customerName,
          username: username,
          region: AWS_REGION,
          apiGatewayEndpoint: API_GATEWAY_ENDPOINT,
          contactAttributes: JSON.stringify({
            customerName: customerName,
          }),
          contactFlowId: CONTACT_FLOW_ID,
          instanceId: INSTANCE_ID,
        },
        successHandler,
        failureHandler
      );
      $('#firstName').blur();
      $('#username').blur();
      const endChatEl = document.getElementById('startChat')
      setTimeout(() => {
        const xEl = document.querySelector('.sc-eHgmQL.kBXJGC.sc-gzVnrw.bsduuv')
        xEl.addEventListener('click', () => {
          endChatEl.value = "Speak to an agent"
        })
      }, 1000)
      endChatEl.disabled = true;
      endChatEl.value = "End chat";
      document.getElementById('firstName').disabled = true;
      document.getElementById('username').disabled = true;
      $('#nav').css('width', '1063');
      $('#chatWrapper').hide();
      $('#section-chat').show('slide');
      $('#section-chat').draggable({
        handle: '.header-wrapper',
      });
      $('#divSpinner')
        .delay(310)
        .fadeIn();
    }
  });
});

// Chat Management
function successHandler(chatSession) {
  // chat connected
  windowAny.chatSession = chatSession;
  $('#divSpinner').fadeOut(200);
  $('#chatWrapper').fadeIn(400);

  //Change the incoming data set
  chatSession.incomingItemDecorator = function(item) {
    if (['SYSTEM_MESSAGE'].indexOf(item.displayName) !== -1) {
      item.displayName = 'System Message';
    }
    if (chatSession.transcript.length > 0) {
      var transcriptItem = chatSession.transcript[chatSession.transcript.length - 1];
      if (transcriptItem.transportDetails.direction === 'Incoming') {
        var chatDescription = 'This is a demo of a customer chat experience.';
        var name = transcriptItem.displayName;
        if (
          ['prod', '$LATEST', 'AI Assistant', 'SYSTEM_MESSAGE', 'System Message'].indexOf(name) ===
          -1
        ) {
          chatDescription = 'You are now chatting with ' + name;
        }
        document.getElementById('chatDescription').innerHTML = chatDescription;
      }
    }
    return item;
  };

  chatSession.onIncoming(async function(data) {
    if(
      data['Content'] &&
      typeof data['Content'] === 'string'
    ) {
      if(data['Content'].startsWith('Meeting')) {
        $('span:contains("Meeting")').parent().parent().hide();
        $('.header-wrapper').next().css('visibility', 'visible');
        meeting = JSON.parse(data['Content'].replace('Meeting Info: ', ''));
        setTimeout(() => {
          $('span:contains("Meeting")').parent().parent().hide()
          $('span:contains("Let")').parent().parent().hide();
          $('.header-wrapper').next().css('visibility', 'visible');
        }, 500);
      } else if(data['Content'].startsWith('CustomerAttendee')) {
        $('span:contains("CustomerAttendee")').parent().parent().hide();
        $('.header-wrapper').next().css('visibility', 'visible');
        customerAttendee = JSON.parse(data['Content'].replace('CustomerAttendee Info: ', ''));
        setTimeout(() => {
          $('span:contains("CustomerAttendee")').parent().parent().hide()
          $('span:contains("Let")').parent().parent().hide();
          $('.header-wrapper').next().css('visibility', 'visible');
        }, 500);
      }   
    }

    if (meeting && customerAttendee) {
      domShow('meeting-info');
    }
  });

  chatSession.onChatDisconnected(function(data) {
    console.log('Chat disconnected');
    leave();
  });

  windowAny.connect.ChatInterface.init({
    containerId: 'root',
    headerConfig: {
      isHTML: true,
      render: () => {
        return `
                <div class="header-wrapper">
                  <h2 class="welcome-text">Chat Demo</h2>
                  <p id="chatDescription">This is a demo of interacting with a Lex bot.</p>
                </div>
              `;
      },
    },
  });
}

function failureHandler(error) {
  // chat failed
  console.log('[connect.ChatInterface.initiateChat] failed', error);
}


async function initializeMeetingSession() {
  const logger = new ConsoleLogger('ChimeMeetingLogs', LogLevel.INFO);
  const deviceController = new DefaultDeviceController(logger);
  const configuration = new MeetingSessionConfiguration(meeting, customerAttendee);
  meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
  meetingSession.audioVideo.addObserver(observer);
  try {
    domHide('meeting-info');
    const audioInputs = await meetingSession.audioVideo.listAudioInputDevices();
    await meetingSession.audioVideo.chooseAudioInputDevice(audioInputs[0].deviceId);
    const videoInputs = await meetingSession.audioVideo.listVideoInputDevices();
    await meetingSession.audioVideo.chooseVideoInputDevice(videoInputs[0].deviceId);
  } catch (err) {
    // handle error - unable to acquire audio device perhaps due to permissions blocking
    console.log("Failed to access the audio video devices might be due permissions blocking");
  }
  meetingSession.audioVideo.bindAudioElement(domElement('customer-audio'));
  meetingSession.audioVideo.start();
}

const observer = {
  audioVideoDidStart: () => {
    meetingSession.audioVideo.startLocalVideoTile();
  },
  videoTileDidUpdate: tileState => {
    const videoElement = tileState.localTile ? 'customer-local-video' : 'agent-remote-video';

    // setting the map to know which tileId will be bound to which video element
    if( tileState.localTile ) {
      map.set(tileState.tileId, 'customer-local-video');
    } else {
      map.set(tileState.tileId, 'agent-remote-video');
    }
    meetingSession.audioVideo.bindVideoElement(tileState.tileId, domElement(videoElement));
    domShow(videoElement);
  },
  audioVideoDidStop: sessionStatus => {
    console.log('Audio Video Stopped:', sessionStatus);
  },
  videoTileWasRemoved: tileId => {
    console.log(`Tile with ID: ${tileId} got removed`);

    // To close both the tiles and end current meeting session when agent has ended the meeting
    if(map.get(tileId) == 'agent-remote-video') {
      domShow('alert-agent-left');
      setTimeout(function() {
        domHide('alert-agent-left');
      }, 5000);
      endCurrentMeetingSession();
    }
  }
};

function resetForm() {
  domHide('alert-agent-left');
  document.getElementById('startChat').disabled = false;
  document.getElementById('firstName').disabled = false;
  document.getElementById('username').disabled = false;
  $('#section-chat').removeAttr('style');
  $('#nav').css('width', '690');
  $('#section-chat').hide('slide');
  document.getElementById('contactDetails').reset();
  document.getElementById('startChat').value = "Speak to an agent";
}

function endCurrentMeetingSession() {
  if (meetingSession) {
    meetingSession.audioVideo.stop();
    meetingSession = null;
    meeting = null;
    customerAttendee = null;
  }
  domHide('meeting-info');
  domHide('meeting-view');
}

function leave() {
  endCurrentMeetingSession();
  resetForm();
}
