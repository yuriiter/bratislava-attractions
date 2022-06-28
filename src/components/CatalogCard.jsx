import { useContext } from "react"
import { GlobalContext } from "../App"

import { NavLink } from "react-router-dom"

import { Icon, Button, ShareSocial, Heart, Rating } from "./"
import { countStars } from "../utils"

import shareIcon from "../assets/share.svg"


const CatalogCard = (props) => {
    const {global, setGlobal} = useContext(GlobalContext)
    const card = props.card

    return (
        <div className="catalog__card">
            <img src={`/img/${card.img}.webp`} alt={card.name} className="catalog__card-bg" />
            <div className="catalog__card-info">
                <div className="info-wrapper">

                    <div className="catalog__card-title">
                        <h3><NavLink to={"/articles/" + card.id}>{card.name}</NavLink></h3>
                        <div className={global.sessionExpires <= Date.now() ? "inactive-button" : ""}>
                            <Heart articleId={card.id} isInFavourites={card.isInFavourites} />
                            <div className="inactive-button--tooltip">Prihláste sa pre tu funkciu</div>
                        </div>
                    </div>
                    <div className="catalog__card-rating">
                        <Rating
                            articleId={card.id}
                            rating={card.rating}
                            countOfRated={card.countOfRated}
                            ratingDisabled={true}
                        />
                    </div>
                    <p className="catalog__card-tags">
                        <NavLink to={"/tags/" + card.distance.toFixed(2) + "km"}>
                            #{card.distance.toFixed(2) + "km "}
                        </NavLink>
                        {card.tags.map((val, idx) => {
                            return (
                                <NavLink to={"/tags/" + val} key={idx}>
                                    #{val + " "}
                                </NavLink>
                            )
                        })}
                    </p>
                    <div className="catalog__card-splitter">
                        <div className="catalog__card-splitter--left"></div>
                        <p>Opis</p>
                        <div className="catalog__card-splitter--right"></div>
                    </div>
                    <div className="catalog__card-description"><p>{card.description}</p></div>
                    <div className="catalog__card-buttons">
                        <Button 
                            text="Zistiť viac"
                            href={"/articles/" + card.id} 
                            className="catalog__card-buttons__more"
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
                                className="catalog__card-buttons__share"
                            />
                        </ShareSocial>
                    </div>


                </div>
            </div>
        </div>
    )
}

export default CatalogCard