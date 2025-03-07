import React from 'react'

const Banner = ({img, title, subtitle}) => {
  return (
    <div className='banner'>
        <div>
            <img src={img} alt="banner"/>
        </div>
        <div>
            <h1>{title}</h1>
        </div>
    </div>
  )
}

export default Banner
