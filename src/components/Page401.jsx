import { useContext } from "react"
import { GlobalContext } from "../App"
import { GoogleLogin } from 'react-google-login'
import axios from 'axios'
import { Button } from "./"

import googleIcon from "../assets/google_signin.svg"


axios.defaults.withCredentials = true

const Page401 = () => {
    const {global, setGlobal} = useContext(GlobalContext)
    
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
            <div className="error-page">
                <div className="container">
                    <div className="row">
                        <div className="col error-page__shadow-card">
                            <h3 className="error-page__title">
                                Potrebujete sa prihlásiť pre prístup k tej stránke
                            </h3>
                                <GoogleLogin
                                    render={renderProps => (
                                        <Button 
                                            text="Prihlásiť sa"
                                            className="sign-in white-button mx-auto"
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
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page401