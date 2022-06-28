import { useState, useContext, useEffect } from "react"
import { Button, DashBoardPost } from "./"
import { useNavigate } from "react-router-dom"
import { GlobalContext } from "../App"

import arrowIcon from "../assets/arrow_load.svg"
import logoutIcon from "../assets/logout.svg"
import axios from "axios"



const DashBoard = (props) => {
    const [posts, setPosts] = useState(props.posts)
    const [hasMorePosts, setHasMorePosts] = useState(props.hasMorePosts)
    const {global, setGlobal} = useContext(GlobalContext)

    const navigate = useNavigate()

    const loadMore = () => {
        props.loadPostsCallBack()
    }

    const removePost = (postId) => {
        props.removePostCallBack(postId)
    }

    useEffect(() => {
        setPosts(props.posts)
    }, [props.posts])

    useEffect(() => {
        setHasMorePosts(props.hasMorePosts)
    }, [props.hasMorePosts])


    const logout = () => {
        axios.delete(process.env.REACT_APP_API_URL + "/logout")
        .then(() => {
            global.sessionExpires = 0
            setGlobal({...global})
            navigate("/")
        })
    }

    return (
        <div style={props.style} className={"dashboard " + props.className}>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h3 className="dashboard__heading">
	    		   Spravovanie Vašich recenzií
                        </h3>
                        <div className="dashboard__buttons">
                            <Button
                                text={"+ Pridať recenziu"}
                                className="dashboard__add-button"
                                onClick={() => navigate("/dashboard/editor/")}
                            />
                            <Button
                                text={"Odhlásiť sa"}
                                className="dashboard__logout-button"
                                onClick={logout}
                                src={logoutIcon}
                            />
                        </div>
                    </div>
                </div>
                <div className="row dashboard__posts">
                    {posts.map(val => {
                        return (<DashBoardPost
                            key={val.id}
                            post={val}
                            removePostCallBack={removePost}
                        />)
                    })}
                </div>

                <div className="row">
                    <div className="col">
                        {hasMorePosts ? (
                            <Button 
                                href=""
                                text="Viac recenzií"
                                className="catalog__load"
                                textFirst="true"
                                src={arrowIcon}
                                onClick={loadMore}
                            />
                        ) : (<></>)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashBoard
