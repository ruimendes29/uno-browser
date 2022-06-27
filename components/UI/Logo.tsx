import React from 'react'
import classes from './Logo.module.scss'

const Logo = () => {
  return (
    <div className={`${classes.logo}`}>
        <div className={`${classes.square}`} style={{backgroundColor:"red"}}>R</div>
        <div className={`${classes.square}`} style={{backgroundColor:"blue"}}>U</div>
        <div className={`${classes.square}`} style={{backgroundColor:"green"}}>N</div>
        <div className={`${classes.square}`} style={{backgroundColor:"yellow"}}>O</div>
    </div>
  )
}

export default Logo