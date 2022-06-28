import { useState, useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import { NavBar } from "./components"
import { Catalog, Footer } from "./containers"
import { GlobalContext } from "./App"
import axios from "axios"

axios.defaults.withCredentials = true

const SearchResults = (props) => {
    let { searchQueryParam } = useParams()
    const [cards, setCards] = useState([])
    const [loaded, setLoaded] = useState(0)
    const [hasMoreCards, setHasMoreCards] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const {global, setGlobal} = useContext(GlobalContext)

    const searchData = (isQueryNew) => {
        axios.post(process.env.REACT_APP_API_URL + "/search", {
            coordinates: global.coordinates,
            searchQuery: decodeURI(searchQueryParam),
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
            searchData(true)
            window.scrollTo(0, 0)
        }
        doAsync()
    }, [searchQueryParam, global.coordinates])


    return (
        <>
            <NavBar />
            <Catalog
                style={{paddingTop: "120px"}}
                heading={decodeURI(searchQueryParam)}
                cards={cards}
                hasMoreCards={hasMoreCards}
                loadMoreCallBack={searchData}
            >
            </Catalog>
            {isLoading ? (<div className="loader-animation"></div>) : null}
            <Footer />
        </>
    )
}

export default SearchResults