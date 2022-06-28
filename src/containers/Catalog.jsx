import { useState, useEffect } from "react"
import { CatalogCard, Button } from "../components"

import arrowIcon from "../assets/arrow_load.svg"


const Catalog = (props) => {
    const [searchQuery, setSearchQuery] = useState(props.searchQuery)
    const [cards, setCards] = useState([])
    const [hasMoreCards, setHasMoreCards] = useState(props.hasMoreCards)

    useEffect(() => {
        setHasMoreCards(props.hasMoreCards)
    }, [props.hasMoreCards])

    useEffect(() => {
        setCards(props.cards)
    }, [props.cards])


    const loadMore = () => {
        props.loadMoreCallBack(null)
    }

    return (
        <div className={"catalog " + props.className} style={props.style}>
            <div className="container">
                <div className="row justify-content-between">
                    <div className="col-lg-3 col-12">
                        <h3 className="catalog__heading">
                            {searchQuery === undefined ? (props.heading ?? "Zoznam atrákcii") : searchQuery}
                        </h3>
                    </div>
                    <div className="col-lg-8 col-12">
                        {props.children}
                    </div>
                </div>
                <div className="row">
                    <div className="col-12"><div className="split-line"></div></div>
                </div>
                {cards === undefined || cards.length === 0 ? (<h4 style={{fontWeight: 900, color: "#fff", textAlign: "center"}}>Nič nebolo nájdené</h4>) : (
                    <div className="row flex-wrap catalog__cards">
                    {cards.map(card => {
                        return (
                            <div className="col-xl-3 col-lg-4 col-sm-6 col-12" key={card.id}>
                                <CatalogCard
                                    card={card}
                                />
                            </div>
                        )
                    })}
                </div>
                )}
                <div className="row">
                    <div className="col">
                        {hasMoreCards ? (
                            <Button 
                                href=""
                                text="Viac lokalít"
                                className="catalog__load"
                                textFirst="true"
                                src={arrowIcon}
                                onClick={loadMore}
                            />
                        ) : (<></>)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Catalog