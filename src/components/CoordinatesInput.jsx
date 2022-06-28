import { useState, useEffect} from "react"
import { MapContainer, TileLayer, Popup, Marker, useMap } from "react-leaflet"
import { icon } from "leaflet"
import markerIcon from "../assets/marker.png"


const Icon = icon({
    iconUrl: markerIcon,
    iconSize: [32, 32]
})


const MapEvents = (props) => {
    const map = useMap();

    useEffect(() => {
        let isMounted = true
        map.locate().on("click", (e) => {
            if(isMounted) {
                props.setPosition([e.latlng.lat, e.latlng.lng]);
            }
        })
        return () => isMounted = true
    }, [])

    useEffect(() => {
        map.flyTo(props.flyTo)
    }, [props.flyTo])

    return false
}

const validateCoordinates = (coordinates) => {
    if(coordinates.match(/\d{1,}\.\d{1,}, \d{1,}\.\d{1,}|\d{1,}, \d{1,}\.\d{1,}|\d{1,}\.\d{1,}, \d{1,}|\d{1,}, \d{1,}/) !== null) {
        return true
    }
    return false
}

const CoordinatesInput = (props) => {
    const [position, setPosition] = 
        useState( (props.coordinates !== undefined && validateCoordinates(props.coordinates) ) ? props.coordinates.split(", ").map(val => Number.parseFloat(val)) : [48.160435, 17.137196])


    useEffect(() => {
        props.setCoordinatesCallback(position.map(val => val + "").join(", "))
    }, [position])

    useEffect(() => {
        setPosition((props.coordinates !== undefined && validateCoordinates(props.coordinates) ) ? props.coordinates.split(", ").map(val => Number.parseFloat(val)) : position)
    }, [props.coordinates])

    return (
        <MapContainer
            className="markercluster-map"
            center={position}
            zoom={11}
            maxZoom={26}
        >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker icon={Icon} position={position}>
            </Marker>
            <MapEvents
                setPosition={setPosition}
                flyTo={position}
            />
        </MapContainer>
    );
      
}

export default CoordinatesInput