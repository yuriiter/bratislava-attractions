import { useState } from "react";
import { Animated } from "react-animated-css";
import closeIcon from "../assets/close.svg"

import { 
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
    PinterestShareButton, 
    PinterestIcon
}  from "react-share"

const ShareSocial = (props) => {
    const [showShareButtons, setShowShareButtons] = useState(false)
    const [fbAnimate, setFbAnimate] = useState(false)
    const [twAnimate, setTwAnimate] = useState(false)
    const [pAnimate, setPAnimate] = useState(false)

    return (
        <div style={{position: "relative"}}>
            <div onClick={() => setShowShareButtons(!showShareButtons)}>
                {props.children}
            </div>
            <Animated
                animationIn="fadeIn" 
                animationOut="fadeOut"
                animationInDuration={200} 
                animationOutDuration={200} 
                isVisible={showShareButtons}
            >
                <div style={{
                    position: "absolute",
                    display: "flex",
                    columnGap: "10px",
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "1000px",
                    left: "50%",
                    top: "-100%",
                    transform: "translate(-50%, -20px)",
                    boxShadow: "-1px 3px 10px 0px rgba(34, 60, 80, 0.2)",

                }}>
                    <FacebookShareButton
                        url={props.url}
                        quote={props.title}
                        hashtag={props.tags?.map(val => "#" + val).join(", ")}
                        description={props.description}
                        className={fbAnimate ? "animated rubberBand" : "animated"}
                        onMouseOver={() => setFbAnimate(true)}
                        onAnimationEnd={() => setFbAnimate(false)}
                    >
                        <FacebookIcon size={32} round="true" 
                            style={{boxShadow: "1px 2px 6px 0px rgba(34, 60, 80, 0.2)", borderRadius: "1000px"}} />
                    </FacebookShareButton>
                    <TwitterShareButton
                        title={props.title}
                        url={props.url}
                        hashtags={props.tags}
                        className={twAnimate ? "animated rubberBand" : "animated"}
                        onMouseOver={() => setTwAnimate(true)}
                        onAnimationEnd={() => setTwAnimate(false)}
                    >
                        <TwitterIcon size={32} round="true" 
                            style={{boxShadow: "1px 2px 6px 0px rgba(34, 60, 80, 0.2)", borderRadius: "1000px"}} />
                    </TwitterShareButton>
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10000px",
                            boxShadow: "1px 2px 6px 0px rgba(34, 60, 80, 0.2)",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onClick={() => setShowShareButtons(false)}
                    >
                        <img src={closeIcon} alt="Close Sharing Modal"
                            style={{
                                opacity: "0.5",
                                width: "60%",
                                height: "60%"
                            }} />
                    </div>
                </div>                                
            </Animated>
        </div>
    )
}

export default ShareSocial