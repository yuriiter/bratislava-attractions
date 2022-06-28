import { useState, useEffect, useContext } from "react"
import { GlobalContext } from "../App"
import { NavLink } from "react-router-dom"
import { Button, ShareSocial, Heart, Rating } from "./"

import shareIcon from "../assets/share.svg"


const MainSliderCard = (props) => {
    const {global, setGlobal} = useContext(GlobalContext)

    const [idx, setIdx] = useState(props.card.idx)
    useEffect(() => {
        setIdx(props.card.idx)
    }, [props.card.idx])

    let card = props.card

    let className = "main-slider__card"
    className += (idx === 0 ? " main-slider__card--active" : "")

    let translateX = idx * 653;
    let translateY = 0
    
    if(idx === 0) {
        translateY = 60
    }
    else {
        translateY = 104
    }

    let clickCB
    if(idx === 1) {
        clickCB = props.clickCB.iI
    }
    else if(idx === -1) {
        clickCB = props.clickCB.dI
    }

    return (
        <div
            className={className}
            style={{
                transform: `translateX(calc(${translateX}px - 50%))` +
                             `translateY(${translateY}px)`
            }}
            onClick={idx === 1 || idx === -1 ? clickCB : null}
        >
            {idx !== 0 ? (<div className="main-slider__card-darken"></div>) : <></>}
            
            <div className="main-slider__card-wrapper">
                <img src={`/img/${card.img}.webp`} alt={card.name} />
                <div className="main-slider__card-info">
                    <div className="main-slider__card-title">
                        <h3><NavLink to={"/articles/" + card.id}>{card.name}</NavLink></h3>
                        <div className={global.sessionExpires <= Date.now() ? "inactive-button" : ""}>
                            <Heart articleId={card.id} isInFavourites={card.isInFavourites} />
                            <div className="inactive-button--tooltip">Prihláste sa pre tu funkciu</div>
                        </div>
                    </div>
                    <div className="main-slider__card-down">
                        <div className="main-slider__card-rating">
                            <Rating
                                articleId={card.id}
                                rating={card.rating}
                                countOfRated={card.countOfRated}
                                ratingDisabled={true}
                            />
                        </div>
                        <p className="main-slider__card-tags">
                            <NavLink to={"/tags/" + card.distance.toFixed(2) + "km"}>
                                #{card.distance.toFixed(2) + "km "}
                            </NavLink>
                            {card.tags?.map((val, idx) => {
                                return (
                                    <NavLink to={"/tags/" + val} key={idx}>#{val} </NavLink>
                                )
                            })}
                        </p>
                        <div className="main-slider__card-splitter">
                            <div></div>
                            <p>Opis</p>
                        </div>
                        <div className="main-slider__card-description"><p>{card.description}</p></div>
                        <div className="main-slider__card-buttons">
                            <Button 
                                text="Zistiť viac"
                                href={"/articles/" + card.id} 
                                className="main-slider__card-buttons__more"
                            />
                            <ShareSocial
                                url={window.location.href.replace(new RegExp(window.location.pathname + '$'), "") + `/articles/${card.id}`}
                                title={card.name}
                                description={card.description}
                                tags={card.tags}
                            >
                                <Button
                                    textFirst="true"
                                    src={shareIcon}
                                    text="Zdieľať"
                                    className="main-slider__card-buttons__share"
                                />
                            </ShareSocial>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainSliderCard