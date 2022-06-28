import React from "react"
import { useState, useEffect, useContext } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { GoogleLogin } from 'react-google-login'
import { Button, IconNavigation } from "./" 
import { useWindowSize, useScroll } from "../utils"
import { GlobalContext } from "../App"
import axios from 'axios'

import logoIcon from "../assets/logo_icon.svg"
import searchIcon from "../assets/search_icon.svg"
import gridIcon from "../assets/grid.svg"
import googleIcon from "../assets/google_signin.svg"

axios.defaults.withCredentials = true

const NavBar = () => {
    const [searchVal, setSearchVal] = useState("")
    const { width } = useWindowSize()
    const [lastScrollY, setLastScrollY] = useState(window.scrollY);
    const currentScrollY = useScroll()
    const [hideNav, setHideNav] = useState(false)
    const {global, setGlobal} = useContext(GlobalContext)
    const [articleTotal, setArticleTotal] = useState(global.articleTotal ?? 0)
    const navigate = useNavigate()
    const location = useLocation()


    useEffect(() => {
        if(lastScrollY - currentScrollY < 0) {
            setHideNav(true)
        }
        else if(lastScrollY - currentScrollY > 0) {
            setHideNav(false)
        }
        setLastScrollY(currentScrollY)
    }, [currentScrollY, lastScrollY])

    const loadArticleCount = () => {
        axios.get(process.env.REACT_APP_API_URL + "/article_count")
        .then(response => {
            let data = response.data
            global.articleTotal = data.articleTotal
            setGlobal({...global})
            setArticleTotal(data.articleTotal)
        })
    }


    const checkIsLoggedIn = () => {
        axios.get(process.env.REACT_APP_API_URL + "/is_logged_in")
        .then(response => {
            let data = response.data
            if(data.isLoggedIn) {
                global.sessionExpires = data.sessionExpires
                setGlobal({...global})
                return
            }
        })
        .catch(err => {
            global.sessionExpires = 0
            setGlobal({...global})
        })
    }


    useEffect(() => {
        loadArticleCount()
    }, [])
    
    useEffect(() => {
        checkIsLoggedIn()
    }, [location])

    const submitSearchForm = (e) => {
        e.preventDefault()
        let searchQuery = searchVal
        searchQuery = encodeURI(searchQuery)
        navigate("/search/" + searchQuery)
    }

    const googleSuccessLogin = (userData) => {
        axios.post(process.env.REACT_APP_API_URL + "/login", {token: userData.tokenId})
        .then((response) => {
            let data = response.data
            
            global.sessionExpires = data.sessionExpires
            setGlobal({...global})
        })
    }


    return (
        <>
            <div className={"nav_bar" + (hideNav ? " nav_bar--hidden" : "")}>
                <div className="container">
                    <div className="row">
                        <div className="col-xl-3 col-lg-4 col-md-5 col-3">
                            <NavLink to="/" className="flex flex-row logo">
                                <img src={logoIcon} alt="Logo of the search website" style={{width: "57px", height: "49px"}} />
                                <div className="logo__splitter d-md-block d-none"></div>
                                <p className="d-md-block d-none">
                                    <span>Vyhľadávač <br /></span>
                                    najkrajších lokalít Bratislavy
                                </p>
                            </NavLink>
                        </div>
                        <div className="col-xl-6 col-lg-8 col-md-7 col-6 nav_bar__middle">
                            <div className="flex nav_bar__center-content">
                                <form className="nav_bar__search" onSubmit={e => submitSearchForm(e)}>
                                    <input
                                        type="text"
                                        placeholder={width < 992 ? "Hľadať" : `Hľadat medzi ${articleTotal ? articleTotal.toLocaleString() : "0"} lokalitami`}
                                        value={searchVal}
                                        onChange={(e) => { setSearchVal(e.target.value) }}
                                        maxLength={50}
                                        minLength={4}
                                        required
                                    />
                                    
                                    <button type="submit">
                                        <img
                                            src={searchIcon}
                                            alt="Search locations on our site"
                                            style={{with: "20px", height: "21px"}}
                                        />
                                    </button>
                                </form>
                                {global.sessionExpires <= Date.now() ? (
                                    <GoogleLogin
                                        render={renderProps => (
                                            <Button 
                                                text="Prihlásiť sa"
                                                className="sign-in white-button d-none d-md-flex"
                                                onClick={renderProps.onClick}
                                                disabled={renderProps.disabled}
                                                src={googleIcon}
                                            />
                                        )}
                                        onSuccess={googleSuccessLogin}
                                        onFailure={(err) => console.log(err)}
                                        cookiePolicy={'single_host_origin'}
                                        clientId={process.env.REACT_APP_OAUTH_CLIENT_ID}
                                    />
                                ) : (
                                    <Button 
                                        text="Dashboard"
                                        className="sign-in white-button d-none d-md-flex"
                                        src={gridIcon}
                                        href="/dashboard"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="d-md-none d-flex col-3">
                            {global.sessionExpires <= Date.now() ? (
                                <GoogleLogin
                                    render={renderProps => (
                                        <Button 
                                            text="Prihlásiť sa"
                                            className="sign-in white-button d-md-none d-flex"
                                            onClick={renderProps.onClick}
                                            disabled={renderProps.disabled}
                                            src={googleIcon}
                                        />
                                    )}
                                    onSuccess={googleSuccessLogin}
                                    onFailure={(err) => console.log(err)}
                                    cookiePolicy={'single_host_origin'}
                                    clientId={process.env.REACT_APP_OAUTH_CLIENT_ID}
                                />
                            ) : (
                                <Button 
                                    className="sign-in white-button d-md-none d-flex"
                                    src={gridIcon}
                                    href="/dashboard"
                                />
                            )}
                        </div>

                        <div className="d-none d-xl-flex col-3">
                            <div className="flex nav_bar__icon-links__wrapper">
                                <IconNavigation />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={"fixed-icons-nav d-block d-xl-none" + (hideNav ? " fixed-icons-nav--hidden" : "")}>
                    <IconNavigation 
                        className=""
                    />
            </div>
        </>
    )
}

export default NavBar