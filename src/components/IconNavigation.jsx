import { GlobalContext } from "../App"
import { useContext } from "react"
import { NavLink } from "react-router-dom"

import { Icon } from "./"

const IconNavigation = (props) => {
    const {global, setGlobal} = useContext(GlobalContext)

    const classes = "nav_bar__icon-links" + " " + props.className
    return (
        <ul className={classes}>
            <li><NavLink className={global.sessionExpires <= Date.now() ? "inactive-button" : ""} to={global.sessionExpires < Date.now() ? false : "/favourites"}>
                    <Icon className="icon-heart" />
                    <div className="inactive-button--tooltip">Prihláste sa pre tu funkciu</div>
                </NavLink>
            </li>
            <li><a href="https://www.facebook.com/vylety_po_slovensku-105900741094109"><Icon className="icon-fb" /></a></li>
            <li><a href="https://www.instagram.com/vylety_po_slovensku/"><Icon className="icon-instagram" /></a></li>
            <li><a href="https://www.youtube.com/c/VisitBratislava"><Icon className="icon-youtube" /></a></li>
        </ul>
    )
}

export default IconNavigation