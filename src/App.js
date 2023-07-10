import React from 'react';
import Messages from './components/Messages';
import TextInput from './components/TextInput';
import useMessages from './hooks/useMessages';
import useUsers from './hooks/useUsers';

import './App.css';

function App() {
  const { users } = useUsers();
  const { messages , publishMessage , messageLoading , publishLoading } = useMessages();
  return (
    <div className="App">
      <div className='channel-name-bar'>
        <div className='channel-name'>#slack-app</div>
      </div>
      <Messages
        messages={messages}
        users={users}
        messageLoading={messageLoading}
      />
      <TextInput
        publishMessage={publishMessage}
        publishLoading={publishLoading}
      />
    </div>
  );
}

export default App;
