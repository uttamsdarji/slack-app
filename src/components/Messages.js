import React, { useRef, useLayoutEffect } from 'react';
import Loader from './Loader';

const Messages = (props) => {
  const bottomRef = useRef(null);
  useLayoutEffect(() => {
    setTimeout(() => {
      bottomRef?.current?.scrollIntoView({ behavior: "instant" });
    }, 1)
  }, [props.messages]);
  return (
    <div className='messages-list-container'>
      <Loader loading={props.messageLoading}>
        <>
          {props.messages.length === 0 &&
            <div className='no-msg-container'>
              <div>No Messages</div>
            </div>
          }
          {props.messages.length > 0 && 
            <div className='messages-list'>
              <div ref={bottomRef}></div>
              {props.messages.map((message) => {
                return (
                  <MessageItem
                    key={message.ts}
                    data={message}
                    users={props.users}
                  />
                )
              })}
            </div>
          }
        </>
      </Loader>
    </div>
  )
}

export default Messages;

const monthMapping = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
}

const MessageItem = (props) => {
  let userId = props.data.user;
  let userDetail = props.users?.members?.length > 0 ? props.users.members.find(i => i.id === userId) : null;
  let formattedTime = '';
  let formattedDate = '';
  if (props?.data?.ts) {
    let date = new Date(props.data.ts * 1000);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let month = date.getMonth();
    let dateVal = date.getDate();
    formattedTime = hours + ':' + minutes.substr(-2);
    formattedDate = dateVal + ' ' + monthMapping[month];
  }
  return (
    <div className='message-item'>
      <div className='user-photo-container'>
        <img src={userDetail?.profile?.image_72 || ''} alt='' className='user-photo' />
      </div>
      <div className='message-details'>
        <div className='message-meta'>
          <div className='user-name'>{userDetail?.profile?.display_name || userDetail?.profile?.real_name || ''}</div>
          <div className='msg-time'>{formattedDate}, {formattedTime}</div>
        </div>
        <div className='message-content'>
          {props.data?.text || ''}
        </div>
      </div>
    </div>
  )
}