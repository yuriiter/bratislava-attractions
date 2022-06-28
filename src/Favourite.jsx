import { useState, useEffect, useContext } from "react"
import { GlobalContext } from "./App"
import { NavBar, Page401 } from "./components"
import { Catalog, Footer } from "./containers"
import axios from "axios"

axios.defaults.withCredentials = true

const Favourite = () => {
    const [cards, setCards] = useState([])
    const [loaded, setLoaded] = useState(0)
    const [hasMoreCards, setHasMoreCards] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { global } = useContext(GlobalContext)


    const loadFavourites = () => {
        setIsLoading(true)
        let loaded_ = loaded

        axios.post(process.env.REACT_APP_API_URL + "/favourite_articles", {
            coordinates: global.coordinates,
            loaded: loaded_,
        })
        .then(response => {
            let data = response.data
            setCards([...cards, ...data.cards])
            setLoaded(loaded_ + data.cards.length)
            setHasMoreCards(data.hasMoreCards)
            setIsLoading(false)
        })
    }

    useEffect(() => {
        loadFavourites()
    }, [global.coordinates])


    return (
        <>
            <NavBar />
            {global.sessionExpires > Date.now() ? (
                <>
                    <Catalog
                        heading="Obľubené"
                        style={{paddingTop: "120px"}}
                        cards={cards}
                        hasMoreCards={hasMoreCards}
                        loadMoreCallBack={loadFavourites}
                    />
                    {isLoading ? (<div className="loader-animation"></div>) : null}
                </>
            ) : <Page401 />}
            <Footer />
        </>
    )
}

export default Favourite