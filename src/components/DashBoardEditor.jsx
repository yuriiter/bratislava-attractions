import { useState, useEffect, useContext, useRef } from "react"
import { CoordinatesInput, TagInput, Button } from "./"
import { NavLink } from "react-router-dom"
import { GlobalContext } from "../App"
import { validateInput } from "../utils"

import closeIcon from "../assets/close.svg"
import chevronLeft from "../assets/chevron_left.svg"

import Page401 from "./Page401"


const tagRegex = new RegExp(/^[a-zA-Z0-9]{1,}$/)
const validateTags = (tags) => {
    if (tags === undefined || tags?.length === 0) {
        return false
    }
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i]
        if (tagRegex.test(tag) === false || tag.length > 12) {
            return false
        }
    }
    return true
}

const validateCoordinates = (coordinates) => {
    if(coordinates.match(/\d{1,}\.\d{1,}, \d{1,}\.\d{1,}|\d{1,}, \d{1,}\.\d{1,}|\d{1,}\.\d{1,}, \d{1,}|\d{1,}, \d{1,}/) !== null) {
        return true
    }
    return false
}

const idToUrl = (id) => {
    if(id === undefined) {
        return undefined
    }
    return window.location.origin + `/articles/${id}`
}

const validateUrl = (url) => {
    if(url.length === 0) {
      return true
    }
    if(url === undefined) {
      return false
    }
    let testingString = window.location.origin + "/articles/"
    let replaceResult = url.replace(testingString, "")
    if(replaceResult === url || url.indexOf(testingString) !== 0) {
        return false
    }
    let id = Number.parseInt(replaceResult)
    if(isNaN(id) || id < 0) {
        return false
    }
    return true
}

const urlToId = (url) => {
    let testingString = window.location.origin + "/articles/"
    let replaceResult = url.replace(testingString, "")
    if(replaceResult === url || url.indexOf(testingString) !== 0) {
        return undefined
    }
    let id = Number.parseInt(replaceResult)
    if(isNaN(id) || id < 0) {
        return undefined
    }
    return id
}


const DashBoardEditor = (props) => {
    const [post, setPost] = useState(props.post)
    const [tags, setTags] = useState(props.tags)

    const [postTitle, setPostTitle] = useState(post?.name ?? "")
    const [postDescription, setPostDescription] = useState(post?.description ?? "")
    const [postLocation, setPostLocation] = useState(post?.locationName ?? "")
    const [postWebsite, setPostWebsite] = useState(post?.websiteLink ?? "")
    const [postPhone, setPostPhone] = useState(post?.phone ?? "")
    const [postOpenTime, setPostOpenTime] = useState(post?.openTimesInfo ?? "")
    const [postCoordinates, setPostCoordinates] = useState(post?.coordinates ?? "48.160435, 17.137196")
    const [postTags, setPostTags] = useState(post?.tags ?? [])


    const [postRelatedInput1, setPostRelatedInput1] = useState(idToUrl(post?.relatedCards[0]?.id) ?? "")
    const [postRelatedInput2, setPostRelatedInput2] = useState(idToUrl(post?.relatedCards[1]?.id) ?? "")
    const [postRelatedInput3, setPostRelatedInput3] = useState(idToUrl(post?.relatedCards[2]?.id) ?? "")

    const [postMainSliderImg, setPostMainSliderImg] = useState()
    const [postCatalogImg, setPostCatalogImg] = useState()

    const [postSliderImgs, setPostSliderImgs] = useState([])

    const [newPostTags, setNewPostTags] = useState([])

    const postMainSliderImgInput = useRef()
    const catalogImgInput = useRef()
    const sliderImgInput = useRef()
    const formElement = useRef()



    let validTitle = validateInput(postTitle, 1, 100, undefined, undefined, undefined)
    let validLocation = validateInput(postLocation, 1, 100, undefined, undefined, undefined)
    let validDescription = validateInput(postDescription, 1, 3000, undefined, undefined, undefined)
    let validCoordinates = validateInput(postCoordinates, 4, 50, undefined, undefined, validateCoordinates)
    let validRelatedInput1 = validateInput(postRelatedInput1, 0, 150, undefined, undefined, validateUrl)
    let validRelatedInput2 = validateInput(postRelatedInput2, 0, 150, undefined, undefined, validateUrl)
    let validRelatedInput3 = validateInput(postRelatedInput3, 0, 150, undefined, undefined, validateUrl)
    let validMainSliderImg = post ? true : validateInput(postMainSliderImg, undefined, undefined, undefined, undefined, undefined)
    let validCatalogImg = post ? true : validateInput(postCatalogImg, undefined, undefined, undefined, undefined, undefined)
    let validSliderImgs = post ? true : validateInput(postSliderImgs, undefined, undefined, 1, 6, undefined)
    let validTags = validateInput(newPostTags, 1, 12, 1, 6, validateTags)

    let validForSubmit = (
        validTitle &&
        validLocation &&
        validDescription &&
        validCoordinates &&
        validRelatedInput1 &&
        validRelatedInput2 &&
        validRelatedInput3 &&
        validMainSliderImg &&
        validCatalogImg &&
        validTags &&
        validSliderImgs)

    useEffect(() => {
        setPost(props.post)
        setPostTitle(props.post?.name ?? "")
        setPostDescription(props.post?.description ?? "")
        setPostLocation(props.post?.locationName ?? "")
        setPostWebsite(props.post?.websiteLink ?? "")
        setPostPhone(props.post?.phone ?? "")
        setPostOpenTime(props.post?.openTimesInfo ?? "")
        setPostCoordinates(props.post?.coordinates ?? "")
        setPostTags(props.post?.tags ?? [])
        setPostRelatedInput1(idToUrl(props.post?.relatedCards[0]?.id) ?? "")
        setPostRelatedInput2(idToUrl(props.post?.relatedCards[1]?.id) ?? "")
        setPostRelatedInput3(idToUrl(props.post?.relatedCards[2]?.id) ?? "")
    }, [props.post])

    useEffect(() => {
        setTags(props.tags)
    }, [props.tags])

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (err) => reject(err)
        })
     }

    const submit = () => {
        const article = {
            name: postTitle,
            description: postDescription,
            coordinates: postCoordinates,
            locationName: postLocation,
            websiteLink: postWebsite,
            openTimesInfo: postOpenTime,
            phone: postPhone,
            tags: newPostTags,
            relatedArticles: [urlToId(postRelatedInput1), urlToId(postRelatedInput2), urlToId(postRelatedInput3)],
            sliderImgs: []
        }

        if(!validForSubmit) {
            alert("Zle uvedené polia, skontrolujte si prosím")
            return
        }

        article.relatedArticles = article.relatedArticles.filter(val => val !== undefined && val !== null)


        getBase64(postMainSliderImg)
        .then(mainSliderImgResult => {
            article.mainSliderImg = mainSliderImgResult
            getBase64(postCatalogImg)
            .then(catalogCardImgResult => {
                article.catalogCardImg = catalogCardImgResult
                const promises = []
                postSliderImgs.forEach(val => {
                    promises.push(getBase64(val).then(sliderImgResult => article.sliderImgs.push(sliderImgResult)))
                })
                Promise.all(promises)
                .then(() => {
                    if(post === undefined) {
                        setPostMainSliderImg()
                        setPostCatalogImg()
                        setPostSliderImgs([])
                        props.postCardCallBack(article)                        
                    }
                })
            })
        })
    }

    const update = () => {
        const article = {
            name: postTitle,
            description: postDescription,
            coordinates: postCoordinates,
            locationName: postLocation,
            websiteLink: postWebsite,
            openTimesInfo: postOpenTime,
            phone: postPhone,
            tags: newPostTags,
            relatedArticles: [urlToId(postRelatedInput1), urlToId(postRelatedInput2), urlToId(postRelatedInput3)]
        }
        if(!validForSubmit) {
            alert("Zle uvedené polia, skontrolujte si prosím")
            return
        }

        article.relatedArticles = article.relatedArticles.filter(val => val !== undefined && val !== null)

        let promises = []
        if(postSliderImgs.length !== 0) {
            article.sliderImgs = []
            postSliderImgs.forEach(val => promises.push(getBase64(val).then(sliderImgResult => article.sliderImgs.push(sliderImgResult))))
        }
        if(postMainSliderImg !== undefined) {
            promises.push(getBase64(postMainSliderImg).then(result => article.mainSliderImg = result))
        }
        if(postCatalogImg !== undefined) {
            promises.push(getBase64(postCatalogImg).then(result => article.catalogCardImg = result))
        }
        Promise.all(promises)
        .then(() => {
            props.editPostCallBack(article)  
        })
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        const callBackSubmit = post ? update : submit
        if(validForSubmit) {
            callBackSubmit()
        }
        else {
            alert("Zle uvedené polia, skontrolujte si prosím")
        }
    }

    if(global.sessionExpires < Date.now()) {
        return (
            <Page401 />
        )
    }

    return (
        <div className="dashboard__editor">
            <div className="container">
                <div className="dashboard__editor-shadow_wrapper">
                    <div className="row">
                        <div className="mx-auto col-md-9 col-12">
                            <div className="dashboard__editor-header">
                                <h3>{props.heading}</h3>
                                <NavLink to="/dashboard" className="link_back"><img src={chevronLeft} alt="" /> Panel recenzií</NavLink>
                            </div>
                            <form className="dashboard__editor-units" onSubmit={handleFormSubmit} ref={formElement}>
                                <div className="dashboard__editor-unit">
                                    <input required maxLength="100" type="text" value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder=" " />
                                    <div className={"dashboard__editor-placeholder" + (!validTitle ? " alert" :"")}>Nazov recenzie *</div>
                                </div>
                                <div className="dashboard__editor-unit">
                                    <input required maxLength="100" type="text" value={postLocation} onChange={e => setPostLocation(e.target.value)} placeholder=" " />
                                    <div className={"dashboard__editor-placeholder" + (!validLocation ? " alert" :"")}>Kde sa nachádza (mesto, obec) *</div>
                                </div>
                                <div className="dashboard__editor-unit">
                                    <input maxLength="150" type="text" value={postWebsite} onChange={e => setPostWebsite(e.target.value)} placeholder=" " />
                                    <div className="dashboard__editor-placeholder">Odkaz na webstránku</div>
                                </div>
                                <div className="dashboard__editor-unit">
                                    <input maxLength="25" type="text" value={postPhone} onChange={e => setPostPhone(e.target.value)} placeholder=" " />
                                    <div className="dashboard__editor-placeholder">Telefónne číslo</div>
                                </div>
                                <div className="dashboard__editor-unit">
                                    <input maxLength="150" type="text" value={postOpenTime} onChange={e => setPostOpenTime(e.target.value)} placeholder=" " />
                                    <div className="dashboard__editor-placeholder">Otváracie hodiny</div>
                                </div>

                                <div className="dashboard__editor-unit">
                                    <input required maxLength="50" type="text" value={postCoordinates} onChange={e => setPostCoordinates(e.target.value)} placeholder=" " />
                                    <div className={"dashboard__editor-placeholder" + (!validCoordinates ? " alert" :"")}>Súradnice (kliknite na mape alebo uveďte vo formate "lat, long") *</div>
                                    <CoordinatesInput
                                        setCoordinatesCallback={setPostCoordinates}
                                        coordinates={postCoordinates.split(", ").map(val => Number.parseFloat(val)).join(", ")}
                                    />
                                </div>

                                <TagInput
                                    tags={tags}
                                    postTags={postTags}
                                    setPostTags={setNewPostTags}
                                />

                                <div className="dashboard__editor-unit">
                                    <textarea maxLength="3000" name="" id="" cols="30" rows="10" value={postDescription} onChange={e => setPostDescription(e.target.value)}></textarea>
                                    <div className={"dashboard__editor-placeholder" + (!validDescription ? " alert" :"")}>Opis *</div>
                                </div>

                                <div style={{backgroundColor: "#ddd", borderRadius: "3px", padding: "20px", display: "flex", flexDirection: "column", rowGap: "15px"}} className="dashboard__editor-unit">
                                    <div className="dashboard__editor-unit input-images">
                                        <p className={(!validMainSliderImg ? "alert" :"")}>{"Zvoľte obrázok pre banner" + (post ? ", ak chcete zmeniť existujúci" : " *")}</p>
                                        <input type="file" ref={postMainSliderImgInput} disabled={postMainSliderImg !== undefined} accept="image/png, image/jpeg" onChange={e => {setPostMainSliderImg(e.target.files[0]); e.target.value = null}} />
                                        <div className="input-result-wrapper">
                                            {postMainSliderImg ? (<div className="img-container">
                                                <span onClick={() => {setPostMainSliderImg()}} className="clear-files">
                                                    Výmazať prílohu
                                                    <img src={closeIcon} />
                                                </span>
                                                <img src={postMainSliderImg ? URL.createObjectURL(postMainSliderImg) : ""} alt="" />
                                            </div>) : <></>}
                                        </div>
                                    </div>

                                    <div className="dashboard__editor-unit input-images">
                                        <p className={(!validCatalogImg ? "alert" :"")}>{"Zvoľte obrázok pre kartu v katalógu" + (post ? ", ak chcete zmeniť existujúci" : " *")}</p>
                                        <input type="file" ref={catalogImgInput} disabled={postCatalogImg !== undefined} accept="image/png, image/jpeg" onChange={e => {setPostCatalogImg(e.target.files[0]); e.target.value = null}} />
                                        <div className="input-result-wrapper">
                                            {postCatalogImg ? (<div className="img-container">
                                                <span onClick={() => {setPostCatalogImg()}} className="clear-files">
                                                    Výmazať prílohu
                                                    <img src={closeIcon} />
                                                </span>
                                                <img src={postCatalogImg ? URL.createObjectURL(postCatalogImg) : ""} alt="" />
                                            </div>) : <></>}
                                        </div>
                                    </div>
                                    
                                    <div className="dashboard__editor-unit input-images">
                                        <p className={(!validSliderImgs ? " alert" :"")}>{"Zvoľte maximálne 6 obrázkov pre článok" + (post ? ", ak chcete zmeniť existujúci" : " *")}</p>
                                        <input type="file" ref={sliderImgInput} disabled={postSliderImgs.length >= 6} accept="image/png, image/jpeg" onChange={e => {setPostSliderImgs([...postSliderImgs, ...Array.from(e.target.files)]); e.target.value = null}} />
                                        <div className="input-result-wrapper">
                                            {postSliderImgs.map((img, idx) => {
                                                return (
                                                    <div className="img-container" key={idx}>
                                                        <span onClick={() => {
                                                            postSliderImgs.splice(idx, 1)
                                                                setPostSliderImgs([...postSliderImgs])
                                                            }}
                                                            className="clear-files"
                                                        >
                                                            Výmazať prílohu
                                                            <img src={closeIcon} />
                                                        </span>
                                                        <img src={img ? URL.createObjectURL(img) : ""} alt="Your post image" />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard__editor-unit dashboard__editor-related">
                                    <h4 className="dashboard__editor-related__header">Podobné atrakcei (vložte linky potrebných článkov)</h4>
                                    <div className="dashboard__editor-unit">
                                        <input maxLength="150" type="text" value={postRelatedInput1} onChange={e => setPostRelatedInput1(e.target.value)} placeholder=" " />
                                        <div className={"dashboard__editor-placeholder" + (!validRelatedInput1 ? " alert" :"")}>Link</div>
                                    </div>
                                    <div className="dashboard__editor-unit">
                                        <input maxLength="150" type="text" value={postRelatedInput2} onChange={e => setPostRelatedInput2(e.target.value)} placeholder=" " />
                                        <div className={"dashboard__editor-placeholder" + (!validRelatedInput2 ? " alert" :"")}>Link</div>
                                    </div>
                                    <div className="dashboard__editor-unit">
                                        <input maxLength="150" type="text" value={postRelatedInput3} onChange={e => setPostRelatedInput3(e.target.value)} placeholder=" " />
                                        <div className={"dashboard__editor-placeholder" + (!validRelatedInput3 ? " alert" :"")}>Link</div>
                                    </div>
                                </div>
                            
                                <div className="dashboard__editor-unit">
                                    <Button 
                                        text={post ? "Uložiť zmeny" : "Vytvoriť článok"}
                                        className="catalog__load"
                                        textFirst="true"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashBoardEditor
