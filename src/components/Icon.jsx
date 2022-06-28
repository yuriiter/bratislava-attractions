const Icon = (props) => {
    return (
        <span 
            className={props.className}
            style={props.style}
            onMouseOver={props.onMouseOver}
            onMouseOut={props.onMouseOut}
            onClick={props.onClick}
        ></span>
    )
}

export default Icon