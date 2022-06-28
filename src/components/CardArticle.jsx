import { useState, useContext } from "react"
import { GlobalContext } from "../App"

import { Button, MainSliderControllers, CatalogCard, ShareSocial, Heart, Rating } from "./"
import { distance } from "../utils.js"

import googleNavigateIcon from "../assets/google_navigate.svg"
import distanceIcon from "../assets/distance.svg"
import pinIcon from "../assets/pin.svg"
import labelIcon from "../assets/label.svg"
import linkIcon from "../assets/link.svg"
import phoneIcon from "../assets/phone.svg"
import timeIcon from "../assets/time.svg"
import shareIcon from "../assets/share.svg"


const CardArticle = (props) => {
    const [slideIdx, setSlideIdx] = useState(0)
    const [touchStart, setTouchStart] = useState({})
    
    const {global, setGlobal} = useContext(GlobalContext)

    const decrementIdx = () => {
        if(slideIdx > 0) {
            setSlideIdx(slideIdx - 1)
        }
        else {
            setSlideIdx(card.articleSliderPics.length - 1)
        }
    }
    const incrementIdx = () => {
        if(slideIdx < card.articleSliderPics.length - 1) {
            setSlideIdx(slideIdx + 1)
        }
        else {
            setSlideIdx(0)
        }
    }

    const card = props.card

    if(card === null) {
        return (<></>)
    }

    let distanceToAttraction = card.distance.toFixed(2)

    return (
        <div className="article__card">
            <div className="container">
                <div className="article__card-wrapper">
                    <div className="row">
                        <div className="article__card-info-col px-15px">
                            <div className="article__card-title">
                                <h3>{card.name}</h3>
                                <div className={global.sessionExpires <= Date.now() ? "inactive-button" : ""}>
                                    <Heart isInFavourites={card.isInFavourites} articleId={card.id} />
                                    <div className="inactive-button--tooltip">Prihláste sa pre tu funkciu</div>
                                </div>

                            </div>
                            <div className="article__card-rating">
                                <Rating
                                    countOfRated={card.countOfRated}
                                    rating={card.rating}
                                    articleId={card.id}
                                    hasUserRated={card.hasUserRated}
                                />
                            </div>
                            <div className="article__card-info">
                                <p><div className="article__card-info__icon-wrapper"><img src={distanceIcon} alt={"Distance of '" + card.name + "'"} /></div>{distanceToAttraction} km {global.fromLocation}</p>
                                <p><div className="article__card-info__icon-wrapper"><img src={pinIcon} alt={"Coordinates of '" + card.name + "'"} /></div><a href={"https://maps.google.com/?q=" + card.coordinates.replaceAll(" ", "")} target="_blank">{card.coordinates.split(", ").map(val => {return Number.parseFloat(val).toFixed(5)}).join(", ")} {card.locationName}</a></p>
                                {card.tags && card.tags.length > 0 ? (<p className="article__card-info__tags"><div className="article__card-info__icon-wrapper"><img src={labelIcon} alt={"Tags of '" + card.name + "'"} /></div><span>{card.tags.map((val, key) => {return (<a href={"/tags/" + val} key={key}>#{val} </a>)})}</span></p>) : (<></>)}
                                {card.websiteLink && (<p><div className="article__card-info__icon-wrapper"><img src={linkIcon} alt={"Link of '" + card.name + "'"} /></div><a href={card.websiteLink}>{card.websiteLink}</a></p>)}
                                {card.phone && (<p><div className="article__card-info__icon-wrapper"><img src={phoneIcon} alt={"Phone of '" + card.name + "'"} /></div><a href={"tel:" + card.phone}>{card.phone}</a></p>)}
                                {card.openTimesInfo && (<p><div className="article__card-info__icon-wrapper"><img src={timeIcon} alt={"Time information of '" + card.name + "'"} /></div>{card.openTimesInfo}</p>)}
                            </div>
                            <div className="article__card-buttons">
                                <Button
                                    src={googleNavigateIcon}
                                    textFirst={false}
                                    href={"https://www.google.com/maps/dir/?api=1&destination=" + card.coordinates.replaceAll(" ", "")}
                                    className="white-button article__card-button--navigate"
                                    text="Navigácia"
                                    external={true}
                                />
                                <ShareSocial
                                    url={window.location.href}
                                    title={card.name}
                                    description={card.description}
                                    tags={card.tags}
                                >
                                    <Button
                                        src={shareIcon}
                                        textFirst={true}
                                        className="article__card-button--share"
                                        text="Zdieľať"
                                    />
                                </ShareSocial>

                            </div>
                        </div>
                        <div className="article__card-slider-col px-15px">
                            <div 
                                className="article__card-slider"
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
                                            decrementIdx()
                                        }
                                        else {
                                            incrementIdx()
                                        }
                                    }
                                    setTouchStart({})
                                }}
                            
                            >
                                {card.articleSliderPics.map((val, key) => {
                                    return (
                                        <div style={{transform: "translateX(" + ((key - slideIdx) * 100) + "%)"}} className="article__card-slider__slide" key={key}><img src={`/img/${val}.webp`} /></div>
                                    )
                                })}
                            </div>
                            <MainSliderControllers
                                percent={100 * slideIdx / (card.articleSliderPics.length - 1)}
                                decrementIndex={decrementIdx}
                                incrementIndex={incrementIdx}
                                className={card.articleSliderPics.length <= 1 ? "d-none" : "article__card-slider-controllers"}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="catalog__card-splitter article__card-splitter">
                            <div className="catalog__card-splitter--left"></div>
                            <p>Opis</p>
                            <div className="catalog__card-splitter--right"></div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="article__card-description px-15px free-text">
                            <pre>{card.description}</pre>
                        </div>
                    </div>
                    
                    {card.relatedCards && card.relatedCards.length === 0 ? <></> : (
                        <div className="row article__card-related">
                            <h3 className="article__card-related__title">Podobné</h3>
                            <div className="catalog__card-splitter article__card-splitter article__card-splitter--related">
                                <div className="catalog__card-splitter--left"></div>
                                <div className="catalog__card-splitter--right"></div>
                            </div>
                            <div className="article__card-related__cards d-flex flex-wrap">
                                {card.relatedCards.map(val => {
                                    return (
                                        <div key={val.id}><CatalogCard card={val} /></div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CardArticle