import React, { useState, useEffect } from 'react';
import Loader from './Loader';

const TextInput = (props) => {
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    if (!props.publishLoading) {
      setInputValue('');
    }
  }, [props.publishLoading])
  const onSubmit = () => {
    props.publishMessage(inputValue);
  }
  const onEnterPress = (e) => {
    if(e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      if (inputValue && !props.publishLoading) {
        onSubmit();   
      }
    }
  }
  return (
    <div className='text-input-wrapper'>
      <div className='text-input-container'>
        <textarea placeholder='Type your message here'  value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={onEnterPress} />
        <div className='submit-container'>
          <div className='submit-btn'>
            <Loader loading={props.publishLoading} small={true}>
              <button onClick={onSubmit} disabled={!inputValue}>Send Message</button>
            </Loader>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextInput