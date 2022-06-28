import { useState, useContext } from "react"
import { GlobalContext } from "../App"
import { Icon } from "./"
import axios from "axios"

axios.defaults.withCredentials = true

const Heart = (props) => {
    const [isInFavourites, setIsInFavourites] = useState(props.isInFavourites)
    const {global, setGlobal} = useContext(GlobalContext)

    const toggleIsInFavourites = () => {
        if(global.sessionExpires < Date.now()) {
            return
        }
        if(isInFavourites) {
            axios.delete(process.env.REACT_APP_API_URL + "/favourites", {
                data: {articleId: props.articleId}
            })
            .then(setIsInFavourites(!isInFavourites))
        }
        else {
            axios.post(process.env.REACT_APP_API_URL + "/favourites", {
                articleId: props.articleId
            })
            .then(setIsInFavourites(!isInFavourites))
        }
    }

    return (
        <button onClick={toggleIsInFavourites} disabled={(global.sessionExpires < Date.now() ? true : false)}>
            <Icon
                className={isInFavourites ? "icon-full_heart" : "icon-heart"}
            />
        </button>
    )
}

export default Heart