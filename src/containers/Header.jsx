import { NavBar, MainSlider, Button } from "../components"
import { useContext } from "react"
import { GoogleLogin } from 'react-google-login'
import { GlobalContext } from "../App"
import headerBackground from "../assets/header_bg.webp"
import axios from "axios"

axios.defaults.withCredentials = true

const backgroundStyle = (img, position = 'center top') => {
    return {
        backgroundImage: `url(${img})`,
        backgroundPosition: position,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#322747'
    }
}


const Header = () => {
    const { global, setGlobal } = useContext(GlobalContext)

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
            <div style={backgroundStyle(headerBackground)}>
                <NavBar />
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-sm-8 col-12">
                            <div className="header__cta text-center">
                                <h1>
                                    Nájdite v Bratislave lokalitu v svojom blízkom okolí
                                </h1>
                                <p>
                                    Spoznajte nádherné miesta v Bratislave a jej okolí.
                                    Na webovej stránke je funkcionál vyhľadávania blízkych
                                    atrakcií s filtrom a triedením podľa vzdialenosti.
                                </p>

                                {global.sessionExpires <= Date.now() ? (
                                    <GoogleLogin
                                        render={renderProps => (
                                            <Button 
                                                text="Prihlásiť sa"
                                                className="header__cta-button"
                                                onClick={renderProps.onClick}
                                                disabled={renderProps.disabled}
                                            />
                                        )}
                                        onSuccess={googleSuccessLogin}
                                        onFailure={(err) => console.log(err)}
                                        cookiePolicy={'single_host_origin'}
                                        clientId={process.env.REACT_APP_OAUTH_CLIENT_ID}
                                    />
                                ) : (
                                    <Button 
                                        text="Pridať recenziu"
                                        className="header__cta-button"
                                        href="/dashboard"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <MainSlider />
            </div>
        </>
    )
}

export default Header
