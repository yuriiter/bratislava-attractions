const { OAuth2Client } = require('google-auth-library')
const imageType = require('image-type')

exports.validateToken = async (token) => {
    if (!token) {
        return undefined
    }
    const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID)
    const clientId = process.env.OAUTH_CLIENT_ID

    const verifyObject = {}
    verifyObject.idToken = token
    verifyObject.audience = clientId
    let response = await client.verifyIdToken(verifyObject)

    const { email_verified } = response.payload
    if (email_verified) {
        return response.payload
    }
    else {
        return undefined
    }

}


exports.validateCoordinates = (coordinates) => {
    if (coordinates === undefined || typeof coordinates !== "string") {
        return false
    }
    if (coordinates.match(/\d{1,}\.\d{1,}, \d{1,}\.\d{1,}|\d{1,}, \d{1,}\.\d{1,}|\d{1,}\.\d{1,}, \d{1,}|\d{1,}, \d{1,}/) !== null) {
        return true
    }
    return false
}

exports.validateTags = (tags) => {
    if (tags === undefined || tags?.length === 0) {
        return false
    }
    const regex = new RegExp(/^[a-zA-Z0-9]{1,}$/)
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i]
        if (regex.test(tag) === false || tag.length > 12) {
            return false
        }
    }
    return true
}


exports.distance = (c1, c2) => {
    let [lat1, lon1] = c1.split(", ").map(val => Number.parseFloat(val))
    let [lat2, lon2] = c2.split(", ").map(val => Number.parseFloat(val))
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0
    }
    else {
        let radlat1 = Math.PI * lat1 / 180
        let radlat2 = Math.PI * lat2 / 180
        let theta = lon1 - lon2
        let radtheta = Math.PI * theta / 180
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
        if (dist > 1) {
            dist = 1
        }
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515
        dist = dist * 1.609344
        return dist
    }
}

exports.validateImg = (buffer) => {
    if(!buffer) return false
    const imgType = imageType(buffer)
    if(!imgType || (imgType.ext !== 'jpg' && imgType.ext !== 'jpeg' && imgType.ext !== 'png')) {
        return false
    }
    return true
}