import { useState, useEffect, useContext } from "react"
import { useParams } from "react-router-dom";
import { GlobalContext } from "./App";
import { NavBar } from "./components"
import { Catalog, Footer } from "./containers"
import axios from "axios"

axios.defaults.withCredentials = true

const ArticlesByTag = (props) => {
    const { tag } = useParams()
    const [cards, setCards] = useState([])
    const [loaded, setLoaded] = useState(0)
    const [hasMoreCards, setHasMoreCards] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { global, setGlobal } = useContext(GlobalContext)


    const loadByTag = (isQueryNew) => {
        setIsLoading(true)

        axios.post(process.env.REACT_APP_API_URL + "/articles_by_tag", {
            coordinates: global.coordinates,
            tag: tag,
            loaded: isQueryNew ? 0 : loaded
        })
        .then(response => {
            let data = response.data
            if(isQueryNew === true) {
                setCards([...data.cards])
                setLoaded(data.cards.length)
            }
            else {
                setCards([...cards, ...data.cards])
                setLoaded(loaded + data.cards.length)
            }
            setHasMoreCards(data.hasMoreCards)
            setIsLoading(false)
        })
    }

    useEffect(() => {
        const doAsync = async () => {
            loadByTag(true)
            window.scrollTo(0, 0)
        }
        doAsync()
    }, [tag, global.coordinates])


    return (
        <>
            <NavBar />
            <Catalog
                style={{paddingTop: "120px"}}
                heading={`Tag #${tag}`}
                cards={cards}
                hasMoreCards={hasMoreCards}
                loadMoreCallBack={loadByTag}
            />
            {isLoading ? (<div className="loader-animation"></div>) : null}
            <Footer />
        </>
    )
}

export default ArticlesByTag