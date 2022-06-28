import { NavLink } from "react-router-dom"

const Button = (props) => {
    if(props.onClick !== undefined || props.href === undefined) {
        return (
            <button
                style={props.style}
                onClick={props.onClick}
                className={props.className + " button"}
            >
                {props.src != undefined && !props.textFirst ? (<img src={props.src} alt={props.alt} />) : <></>}
                <span>{props.text}</span>
                {props.src != undefined && props.textFirst ? (<img src={props.src} alt={props.alt} />) : <></>}
            </button>
        )
    }

    if(props.href !== undefined && props.external == true) {
        return (
            <a
                href={props.href}
                style={props.style}
                className={props.className + " button"}
            >
                {props.src != undefined && !props.textFirst ? (<img src={props.src} alt={props.alt} />) : <></>}
                <span>{props.text}</span>
                {props.src != undefined && props.textFirst ? (<img src={props.src} alt={props.alt} />) : <></>}
            </a>
        )
    }
    return (
        <NavLink
            to={props.href}
            style={props.style}
            className={props.className + " button"}
        >
            {props.src != undefined && !props.textFirst ? (<img src={props.src} alt={props.alt} />) : <></>}
            <span>{props.text}</span>
            {props.src != undefined && props.textFirst ? (<img src={props.src} alt={props.alt} />) : <></>}
        </NavLink>
    )
}

export default Button