
const ComputerVisionClient = require('@azure/cognitiveservices-computervision')
	.ComputerVisionClient
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials

/**
 * AUTHENTICATE
 * This single client is used for all examples.
 */
const key = '02765b53d6da440db797d975b33ce741'
const endpoint = 'https://pitogram.cognitiveservices.azure.com/'
const computerVisionClient = new ComputerVisionClient(
	new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }),
	endpoint,
)

const useVisionAPI = (type) => {
	switch (type) {
	case 'autoTags':
		return autoTags
	case 'checkAdult':
		return checkAdultContent
	case 'checkContent': 
		return checkContent
	default:
		break
	}
}

const autoTags = async (url) => {
	const res = await computerVisionClient.tagImage(url)
	return res.tags.map(v => v.name)
}

const checkAdultContent = async (url) => {
	const res = await computerVisionClient.analyzeImage(url, {
		visualFeatures: ['Adult']
	})
	return res.adult.isAdultContent
}

const checkContent = async (url) => {
	const res = await computerVisionClient.analyzeImage(url, {
		visualFeatures: ['Adult', 'Tags']
	})
	return {
		'isAdultContent': res.adult.isAdultContent,
		'tags': res.tags.map(v => v.name)
	}
}

export  {useVisionAPI} 
