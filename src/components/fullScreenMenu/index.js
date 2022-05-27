import React from 'react'
import './index.scss'

const FullScreenMenu = ({ items, show, close }) => {
	return (
		<>
			<div className={`full-screen-menu ${show ? 'show-full-menu' : ''}`}>
				<div className="full-screen-menu_close-btn" onClick={() => close()}>
          x
				</div>
				{items}
			</div>
		</>
	)
}

export default FullScreenMenu
