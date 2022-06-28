import { useState, useEffect, useContext } from "react"
import { GlobalContext } from "../App"
import { MainSliderCard, MainSliderControllers } from "./"
import axios from "axios"

axios.defaults.withCredentials = true


const MainSlider = () => {
    const [fetchedCards, setFetchedCards] = useState([])
    const [index, setIndex] = useState(1);
    const [touchStart, setTouchStart] = useState({})
    const {global, setGlobal} = useContext(GlobalContext)

    const loadMainSliderCards = () => {
        return axios.post(process.env.REACT_APP_API_URL + "/main_slider_cards", {
            coordinates: global.coordinates
        })
    }

    useEffect(() => {
        let isMounted = true
        loadMainSliderCards()
        .then(response => {
            if(isMounted) {
                let data = response.data
                setFetchedCards(data.cards)
            }
        })
        return () => isMounted = false
    }, [global.coordinates])


    if(fetchedCards.length === 0) {
        return (<></>)
    }

    for(let i = 0; i < fetchedCards.length; i++) {
        fetchedCards[i].idx = i - index
    }
    if(fetchedCards.length === 1) {
        fetchedCards[0].idx = 0
    }
    const decrementIndex = () => {
        if(index === 0) {
            setIndex(fetchedCards.length - 1)
            return
        }
        setIndex(index - 1)
    }
    const incrementIndex = () => {
        if(index === fetchedCards.length - 1) {
            setIndex(0)
            return
        }
        setIndex(index + 1)
    }

    return (
        <div className="main-slider__wrapper">
            <div 
                className="main-slider__innner-wrapper"
                onTouchStart={(e) => {
                    setTouchStart(
                    {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY,
                    }
                )}}
                onTouchEnd={(e) => {
                    const deltaX = e.changedTouches[0].clientX - touchStart.x
                    const deltaY = e.changedTouches[0].clientY - touchStart.y
                    if(Math.abs(deltaX) / Math.abs(deltaY) < 1) {
                        setTouchStart({})
                        return
                    }
                    if(Math.abs(deltaX) > 20) {
                        if(deltaX > 0) {
                            decrementIndex()
                        }
                        else {
                            incrementIndex()
                        }
                    }
                    setTouchStart({})
                }}
            >
                {fetchedCards.map(val => (<MainSliderCard
                                            card={val}
                                            key={val.id}
                                            clickCB={{dI: decrementIndex, iI: incrementIndex}}
            />))}
            </div>
            <MainSliderControllers
                percent={100 * index / (fetchedCards.length - 1)}
                decrementIndex={decrementIndex}
                incrementIndex={incrementIndex}
            />
        </div>
    )
}

export default MainSlider