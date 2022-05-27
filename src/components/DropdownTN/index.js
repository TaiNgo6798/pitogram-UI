import React from 'react'
import './index.scss'
import { Dropdown } from 'antd'

const DropDownTN = (props) => {
	const {
		overlay: {
			props: { children: overlayChild },
		},
		showScroll=false,
		...etc
	} = props

	return (
		<Dropdown
			overlayClassName={`dropdown-modified-by-taingo ${showScroll ? 'show-scroll custom-scroll-bar' : 'hide-scroll'}`}
			overlay={overlayChild}
			{...etc}
		>
			{props.children}
		</Dropdown>
	)
}

export default DropDownTN
