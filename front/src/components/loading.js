import React from 'react'
import ReactLoading from 'react-loading';

export const Loading = () => {
  return (
    <div className='Loading-container'>
        <ReactLoading type={'spin'} height={75} width={75} />
    </div>
  )
}
