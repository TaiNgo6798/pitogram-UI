import React from 'react'
import './index.scss'

import Camera_icon from '@assets/images/Camera.png'
import Aperture_icon from '@assets/images/aperture.png'
import Focal_icon from '@assets/images/focal-length.png'
import ISO_icon from '@assets/images/iso.png'
import Shutter_icon from '@assets/images/shutter.png'
import Flash_icon from '@assets//images/flash.png'

const Exif = ({ flash, focalLength, iso, lensModel, make, model }) => {
	return (
		<div className="detail__exif">
			<div className="detail__exif__up">
				<img src={Camera_icon} />
				<div className="detail__exif__left_camera-info">
					<p>{`${make || 'unknow'} ${model || ''}`}</p>
					<p>{lensModel || ''}</p>
				</div>
			</div>
			<div className="detail__exif__down">
				<div className="detail__exif__right_col-left">
					<div className="exif-item">
						<img src={Aperture_icon} />
						<p>f/1.8</p>
					</div>
					<div className="exif-item">
						<img src={Shutter_icon} />
						<p>1/500</p>
					</div>
					<div className="exif-item">
						<img src={Flash_icon} />
						<p>{(flash || 'unknow').split(',')[0]}</p>
					</div>
				</div>
				<div className="detail__exif__right_col-right">
					<div className="exif-item">
						<img src={Focal_icon} />
						<p>{focalLength || 'unknow'}</p>
					</div>
					<div className="exif-item">
						<img src={ISO_icon} />
						<p>{iso || 'unknow'}</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Exif
