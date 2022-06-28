import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { NavBar, DashBoardEditor, Page401 } from "./components"
import { Footer } from "./containers"
import { compareStringArrays } from "./utils"
import { GlobalContext } from "./App"
import axios from "axios"

axios.defaults.withCredentials = true

const DashBoardEditorWrapper = (props) => {
    const [isLoading, setIsLoading] = useState(false)
    const {postId} = useParams()
    const {global, setGlobal} = useContext(GlobalContext)
    const navigate = useNavigate()
    const [post, setPost] = useState()
    const [tags, setTags] = useState()

    const createPost = (articleData) => {
        setIsLoading(true)
        axios.post(process.env.REACT_APP_API_URL + "/new_post", {articleData: articleData})
        .then(response => {
            let data = response.data
            setIsLoading(false)
            navigate("/dashboard/editor/" + data.newCardId)
        })
        .catch(err => {
            if(err.response.status === 401) {
                global.sessionExpires = 0
                setGlobal({...global})
            }
            setIsLoading(false)
        })
    }

    const editPost = (articleData) => {
        setIsLoading(true)
        let newData = articleData
        if(post.name === articleData.name) {
            newData.name = undefined
        }
        if(post.description === articleData.description) {
            newData.description = undefined
        }

        if(post.coordinates === articleData.coordinates) {
            newData.coordinates = undefined
        }
        if(post.websiteLink === articleData.websiteLink) {
            newData.websiteLink = undefined
        }
        if(post.openTimesInfo === articleData.openTimesInfo) {
            newData.openTimesInfo = undefined
        }
        if(post.phone === articleData.phone) {
            newData.phone = undefined
        }
        if(post.locationName === articleData.locationName) {
            newData.locationName = undefined
        }

        if(compareStringArrays(post.tags, articleData.tags) === false) {
            newData.tags = undefined
        }
        const containsAll = (arr1, arr2) => arr2?.every(arr2Item => arr1?.includes(arr2Item))
        const prevPostRelated = post.relatedArticles?.map(val => val.id)
        if(containsAll(prevPostRelated, articleData.relatedArticles) && 
        containsAll(articleData.relatedArticles, prevPostRelated)) {
            newData.relatedArticles = undefined
        }

        axios.put(process.env.REACT_APP_API_URL + "/update_post", {postId: postId, articleData: newData})
        .then(() => {
            setIsLoading(false)
        })
    }

    const removePost = () => {
        setIsLoading(true)
        axios.delete(process.env.REACT_APP_API_URL + "/remove_post", {data: {postId: postId}})
        .catch(err => {
            if(err.response.status === 401) {
                global.sessionExpires = 0
                setGlobal({...global})
            }
        })
        .finally(() => {
            setIsLoading(false)
        })
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_URL + "/tags")
        .then(response => {
            let data = response.data
            setTags(data.tags)
        })
        if(postId === undefined) {
            return
        }
        let isMounted = true
        window.scrollTo(0, 0)
        setIsLoading(true)
        axios.post(process.env.REACT_APP_API_URL + "/article_by_id", {
            id: postId,
            coordinates: global.coordinates
        })
        .then(response => {
            if(isMounted) {
                let data = response.data
                setPost(data.card)
                setIsLoading(false)
            }
        })
        .catch(err => {
            if(err.response.status === 401) {
                global.sessionExpires = 0
                setGlobal({...global})
            }
            setIsLoading(false)
        })
        return () => { isMounted = false }
    }, [postId])

    return (
        <>
            <NavBar />

            {global.sessionExpires > Date.now() ? (
                <>
                    <DashBoardEditor
                        heading={postId ? "Editovať recenziu" : "Vytvoriť novú� recenziu"}
                        postCardCallBack={postId ? undefined : createPost}
                        removePostCallBack={postId ? removePost : undefined}
                        editPostCallBack={postId ? editPost : undefined}
                        post={post}
                        tags={tags}
                    />
                    {isLoading ? (<div className="loader-animation"></div>) : null}
                </>
            ) : <Page401 />}
            <Footer />
        </>
    )
}

export default DashBoardEditorWrapper
