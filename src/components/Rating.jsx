import { useState, useContext, useEffect } from "react"
import { countStars } from "../utils"
import { GlobalContext } from "../App"
import { Icon } from "."
import axios from "axios"

axios.defaults.withCredentials = true

const Rating = (props) => {
    const [rating, setRating] = useState(props.rating)
    const [countOfRated, setCountOfRated] = useState(props.countOfRated)
    const [hasUserRated, setHasUserRated] = useState(props.hasUserRated)
    const [hoveredIdx, setHoveredIdx] = useState(-1)

    const {global, setGlobal} = useContext(GlobalContext)

    const stars = countStars(rating)

    useEffect(() => {
        setHasUserRated(props.hasUserRated)
        setRating(props.rating)
        setCountOfRated(props.countOfRated)
    }, [props.hasUserRated, props.countOfRated, props.rating])


    const rate = (idx) => {
        if(!hasUserRated && global.sessionExpires > Date.now() && props.ratingDisabled !== true) {
            axios.post(process.env.REACT_APP_API_URL + "/rate", {articleId: props.articleId, rating: idx + 1})
            .then(() => {
                setRating((rating * countOfRated + (idx + 1)) / (countOfRated + 1))
                setCountOfRated(countOfRated + 1)
                setHasUserRated(true)
            })
        }
    }

    let starArr = []

    for(let i = 0; i < stars.full; i++) {
        starArr.push({className: "icon-full_star"})
    }
    for(let i = 0; i < stars.half; i++) {
        starArr.push({className: "icon-half_star"})
    }
    for(let i = 0; i < stars.empty; i++) {
        starArr.push({className: "icon-emptystar"})
    }

    starArr = starArr.map((val, idx) => {
        let className
        let style
        if(props.ratingDisabled || global.sessionExpires < Date.now()) {
            className = val.className
        }
        else {
            if(hoveredIdx === -1) {
                className = val.className
                if(hasUserRated) {
                    style = {color: "#28ACB5"}
                }
            }
            else {
                if(!hasUserRated) {
                    if(idx <= hoveredIdx) {
                        className = "icon-full_star"
                    }
                    else {
                        className = "icon-emptystar"
                    }
                    style = {color: "#28ACB5"}
                }
                else {
                    className = val.className
                    style = {color: "#28ACB5"}
                }
            }
        }
        return (
            <Icon
                className={className}
                key={idx}
                onMouseOver={() => setHoveredIdx(idx)}
                onMouseOut={() => setHoveredIdx(-1)}
                onClick={() => rate(idx)}
                style={style}
            />
        )
    })
    return (
        <>
            <p>{rating.toFixed(1)}</p>
            <div>
                {starArr}
            </div>
            <p>({countOfRated.toLocaleString()})</p>
        </>
    )
}

export default Rating