import { useState, useEffect } from "react"

const countStars = (rating) => {
    const roundedRating = rating.toFixed(1)
    let full = Number.parseInt(roundedRating)
    const decimal = roundedRating[2]
    const diff = 0.5 - decimal / 10
    let half = false
    if(Math.abs(diff) < 0.2) {
        half = true
    }
    else {
        if(diff < 0) {
            full += 1
        }
    }
    const empty = 5 - (full + (half ? 1 : 0))

    return {
        full: full,
        half: (half ? 1 : 0),
        empty: empty
    }
}


const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  })
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    
    window.addEventListener("resize", handleResize)
    
    handleResize()
    
    return () => window.removeEventListener("resize", handleResize)
    }, [])

    return windowSize
}


const useScroll = () => {
  const [y, setY] = useState(window.scrollY)

  useEffect(() => {
    const handleScroll = () => {
      setY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return y
}


const distance = (c1, c2) => {
  let [lat1, lon1] = c1.split(", ").map(val => Number.parseFloat(val))
  let [lat2, lon2] = c2.split(", ").map(val => Number.parseFloat(val))


	if((lat1 === lat2) && (lon1 === lon2)) {
		return 0
	}
	else {
		let radlat1 = Math.PI * lat1 / 180;
		let radlat2 = Math.PI * lat2 / 180;
		let theta = lon1-lon2;
		let radtheta = Math.PI * theta / 180;
		let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if(dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180 / Math.PI;
		dist = dist * 60 * 1.1515;
    dist = dist * 1.609344
		return dist;
	}
}


const compareStringArrays = (arrA, arrB) => {
  if(arrA.length === 0 && arrB.length === 0) {
    return false
  }
  else if(arrA.length !== arrB.length) {
    return true
  }
  for(let i = 0; i < arrA.length; i++) {
    if(arrA[i] !== arrB[i]) {
      return true
    }
  }
  return false
}


const validateInput = (input, minWordLen, maxWordLen, minArrLen, maxArrLen, callback) => {
  if(input === undefined) {
    return false
  }
  if(!Array.isArray(input)) {
    if(minWordLen && input.length < minWordLen) {
      return false
    }
    if(maxWordLen && input.length > maxWordLen) {
      return false
    }
    if(callback && !callback(input)) {
      return false
    }
  }
  else {
    if(minArrLen && input.length < minArrLen) {
      return false
    }
    if(maxArrLen && input.length > maxArrLen) {
      return false
    }
    for(let i = 0; i < input.length; i++) {
      let testValue = input[i]
      if(minWordLen && testValue.length < minWordLen) {
        return false
      }
      if(maxWordLen && testValue.length > maxWordLen) {
        return false
      }
      if(callback && !callback(input)) {
        return false
      }
    }
  }
  return true
}


export { countStars, useWindowSize, useScroll, distance, compareStringArrays, validateInput }