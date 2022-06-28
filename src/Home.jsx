import { Header, Catalog, Footer } from "./containers"
import { Filter } from "./components"
import { useContext, useState, useEffect } from "react"
import { GlobalContext } from "./App"
import axios from "axios"

axios.defaults.withCredentials = true

const Home = () => {
    const [cards, setCards] = useState([])
    const [loaded, setLoaded] = useState(0)
    const [hasMoreCards, setHasMoreCards] = useState(false)
    const [maxDistance, setMaxDistance] = useState()
    const [savedFilters, setSavedFilters] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const { global, setGlobal } = useContext(GlobalContext)

    const loadMaxDistance = (setMaxDistanceCallBack) => {
        axios.post(process.env.REACT_APP_API_URL + "/max_distance", {coordinates: global.coordinates})
        .then(response => {
            let data = response.data
            setMaxDistanceCallBack(data.maxDistance)
        })
    }
    const loadCardsWithFilters = (filtersArg) => {
        setIsLoading(true)
        let filters
        let loaded_
        if(filtersArg === null) {
            filters = savedFilters
            loaded_ = loaded
        }
        else {
            filters = filtersArg
            loaded_ = 0
            setLoaded(0)
            setSavedFilters(filters)
        }
        axios.post(process.env.REACT_APP_API_URL + "/catalog", {
            filter_distance: filters.filterDistance,
            filter_sort_by: filters.filterSortBy,
            filter_sort_order: filters.filterSortOrder,
            filter_tags: filters.filterTags,
            coordinates: global.coordinates,
            loaded: loaded_
        })
        .then(response => {
            let data = response.data
            if(filtersArg === null) {
                setCards([...cards, ...data.cards])
                setLoaded(loaded_ + data.cards.length)
            }
            else {
                setCards([...data.cards])
                setLoaded(data.cards.length)
            }
            setHasMoreCards(data.hasMoreCards)
            setIsLoading(false)
        })
    }

    useEffect(() => {
        loadMaxDistance(setMaxDistance)
    }, [global.coordinates])


    return (
        <div>
            <Header />
            {maxDistance !== undefined ? (
                <Catalog
                    heading="Katalóg"
                    cards={cards}
                    hasMoreCards={hasMoreCards}
                    loadMoreCallBack={loadCardsWithFilters}
                >
                    <Filter
                        maxDistance={maxDistance}
                        loadCardsWithFilters={loadCardsWithFilters}
                    />
                </Catalog>
            ) : (<></>)}
            {isLoading ? (<div className="loader-animation"></div>) : null}
            <Footer />
        </div>
    )
}

export default Home
