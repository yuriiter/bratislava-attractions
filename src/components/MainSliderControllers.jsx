import { useState, useEffect } from "react"

import { Icon } from "./"

const MainSliderControllers = (props) => {
    const [percent, setPercent] = useState(10)
    useEffect(() => {
        setPercent(props.percent)
    }, [props.percent])

    const leftW = percent * 0.01 * (317 - 75)
    const rightW = 317 - (leftW + 75)

    return (
        <div className={"main-slider__controllers " + props.className}>
            <div className="main-slider__controllers-indicator">
                <div className="indicator-left" style={{width: leftW + "px"}}><div></div></div>
                <div className="indicator-slider"><div></div></div>
                <div className="indicator-right" style={{width: rightW + "px"}}><div></div></div>
            </div>
            <div className="main-slider__controllers-buttons">
                <button onClick={props.decrementIndex}><Icon className="icon-arrow icon-arrow--left" /></button>
                <button onClick={props.incrementIndex}><Icon className="icon-arrow" /></button>
            </div>
        </div>
    )
}

export default MainSliderControllers