import { useEffect, useState, useContext } from "react"
import { GlobalContext } from "./App"
import { NavBar, DashBoard, Page401 } from "./components"
import { Footer } from "./containers"
import axios from "axios"

axios.defaults.withCredentials = true

const DashBoardContainer = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [posts, setPosts] = useState([])
    const [loaded, setLoaded] = useState(0)
    const [hasMorePosts, setHasMorePosts] = useState(0)
    const {global, setGlobal} = useContext(GlobalContext)


    const loadPosts = () => {
        setIsLoading(true)
        let loaded_ = loaded

        axios.post(process.env.REACT_APP_API_URL + "/posts", {
            loaded: loaded_
        })
        .then(response => {
            let data = response.data
            setPosts([...posts, ...data.posts])
            setLoaded(loaded_ + data.posts.length)
            setHasMorePosts(data.hasMorePosts)
            setIsLoading(false)
        })
        .catch(err => {
            if(err.response.status === 401) {
                global.sessionExpires = 0
                setGlobal({...global})
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        loadPosts()
    }, [global.sessionExpires])

    const removePost = (postId) => {
        setIsLoading(true)
        axios.delete(process.env.REACT_APP_API_URL + "/remove_post", {
            data: {postId: postId}
        })
        .then(response => {
            let data = response.data
            setLoaded(loaded - 1)
            setPosts(posts.filter(val => val.id !== postId))
            setIsLoading(false)
        })
        .catch(err => {
            if(err.response.status === 401) {
                global.sessionExpires = 0
                setGlobal({...global})
            }
            setIsLoading(false)
        })
    }
    

    return (
        <>
            <NavBar />
            {global.sessionExpires > Date.now() ? (
                <>
                    <DashBoard
                        style={{paddingTop: "120px"}}
                        posts={posts}
                        loadPostsCallBack={loadPosts}
                        hasMorePosts={hasMorePosts}
                        removePostCallBack={removePost}
                    />
                    {isLoading ? (<div className="loader-animation"></div>) : null}
                </>
            ) : <Page401 />}
            <Footer />
        </>
    )
}

export default DashBoardContainer