import React from 'react';
import LoadingGif from '../assets/loading.gif';

const Loader = (props) => {
  let loaderStyle = {
    width: props.small ? '30px' : '50px',
    height: props.small ? '30px' : '50px'
  }
  return (
    <>
    {
      props.loading ?
        <div className='loader-container' style={{display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center'}}>
          <img className='loader' src={LoadingGif} alt='Loading...' style={loaderStyle} />
        </div>
        :
        props.children
    }
    </>
  )
}

export default Loader