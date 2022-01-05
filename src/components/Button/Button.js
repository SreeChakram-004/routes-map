import React from 'react'

function Button() {
    function refreshPage() {
        window.location.reload();
      }
    return (
       
        <div className="button-style">
        <button className="cv-btn" onClick={ refreshPage }>Home</button>
        </div>
    )
}

export default Button
