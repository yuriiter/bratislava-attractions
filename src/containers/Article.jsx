import { useState, useEffect, useContext } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "../App"
import { NavBar, CardArticle } from "../components"
import { Footer } from "../containers"
import axios from "axios"

axios.defaults.withCredentials = true

const Article = () => {
    const [card, setCard] = useState(null);
    const { id } = useParams()
    const {global, setGlobal} = useContext(GlobalContext)

    const navigate = useNavigate()
    if(isNaN(Number.parseInt(id))) {
        navigate("/404")
    }

    useEffect(() => {
        if(isNaN(Number.parseInt(id))) {
            navigate("/404")
        }
        let isMounted = true
        window.scrollTo(0, 0)
        axios.post(process.env.REACT_APP_API_URL + `/article_by_id`, {
            id: Number.parseInt(id),
            coordinates: global.coordinates
        })
        .then(response => {
            let data = response.data
            if(isMounted) {
                setCard(data.card)
            }
        })
        return () => { isMounted = false }
    }, [id, global.coordinates, global.userData])


    return (
        <>
            <NavBar />
            <CardArticle card={card} />
            <Footer />
        </>
    )
}

export default Article