import { useState, useEffect, useRef } from "react"
import closeIcon from "../assets/close.svg"

import { validateInput } from "../utils"


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
const TagInput = (props) => {
    const [tags, setTags] = useState(props.tags?.map((val, idx) => {
        return {
            val: val,
            idx: idx,
            isHovered: false
        }
    }) ?? [])
    const [chosenTags, setChosenTags] = useState([])
    const [postTags, setPostTags] = useState(props.postTags)
    const [isFocused, setIsFocused] = useState(false)
    const [inputVal, setInputVal] = useState("")

    const inputElement = useRef()
    const [dropDownVisible, setDropDownVisible] = useState(false)


    useEffect(() => {
        setPostTags(props.postTags)
        if(props.tags === undefined) {
            return
        }
        let loadedTags = props.tags.map((val, idx) => {
            return {
                idx: idx,
                val: val,
                isHovered: false,
                displaying: true
            }
        })
        const newChosenTags = []
        props.postTags.forEach(postTag => {
            const tag = loadedTags.find(val => val.val === postTag)
            if(tag === undefined) {
                return
            }
            tag.displaying = false
            newChosenTags.push(tag)
        })
        setChosenTags([...newChosenTags])
        setTags(loadedTags.map(val => { return {...val}}))
    }, [props.postTags, props.tags])


    useEffect(() => {
        props?.setPostTags(chosenTags.map(val => val.val))
    }, [chosenTags])

    useEffect(() => {
        if(inputVal.length !== 0 || chosenTags.length !== 0) {
            setIsFocused(true)
        }
        
    }, [inputVal, chosenTags])

    useEffect(() => {
        const regexp = new RegExp(inputVal, "i")
        let newTags = tags?.map(val => {
            let newTagObj = {...val}
            newTagObj.isHovered = false
            newTagObj.displaying = regexp.test(val.val) && chosenTags.find(ct => ct.idx === val.idx) === undefined ? true : false
            return newTagObj 
        })

        if(inputVal.length > 0 && tagRegex.test(inputVal)) {
            const hasExactMatch = [...tags, ...chosenTags].find(val => val.val === inputVal) !== undefined

            if(hasExactMatch) {
                if(newTags[0]?.idx === -1) {
                    newTags.unshift()
                    let exactMatchWVariants = newTags.find(val => val.val === inputVal)
                    if(exactMatchWVariants !== undefined) {
                        exactMatchWVariants.isHovered = false;
                    }
                    setTags(newTags)
                    return
                }
            }
            if(newTags[0]?.createButton === undefined) {
                let createTag = {
                    val: inputVal,
                    idx: -1,
                    isHovered: false,
                    displaying: true,
                    createButton: true
                }
                newTags.unshift(createTag)
            }
            else {
                newTags[0].val = inputVal
                newTags[0].displaying = true
            }
        }
        else {
            if(newTags[0]?.createButton !== undefined) {
                newTags.shift()
            }
        }
        setTags(newTags)

        
    }, [inputVal, chosenTags])


    if(props.postTags === undefined || tags === undefined) {
        return (<></>)
    }

    const hover = (idx) => {
        let newTags = tags.map(val => {
            let newTag = {...val}
            newTag.isHovered = val.idx === idx ? true : false
            return newTag
        })
        setTags(newTags)
    }

    const unhover = (idx) => {
        let newTags = tags.map(val => {
            let newTag = {...val}
            newTag.isHovered = false
            return newTag
        })
        setTags(newTags)
    }

    const choose = (idx) => {
        let chosenTag = tags.find(val => val.idx === idx)
        if(chosenTags.find(val => val.val === chosenTag.val) !== undefined) {
            return
        }
        if(idx === -1) {
            if(!tagRegex.test(chosenTag.val)) {
                return
            }
            let leastIdx = Math.min(0, ...chosenTags.map(val => val.idx))
            chosenTag.idx = --leastIdx
        }
        setChosenTags([...chosenTags, chosenTag])
        setInputVal("")
        inputElement.current.textContent = ""
        
        let newTags = tags.map(val => {
            let newTag = {...val}
            newTag.isHovered = false
            newTag.displaying = val.idx === idx ? false : val.displaying
            return newTag
        })
        setTags(newTags)
    }

    const unchoose = (idx) => {
        setChosenTags(chosenTags.filter(val => val.idx !== idx))
        if(idx === -1) {
            return
        }
        let newTags = tags.map(val => {
            let newTag = {...val}
            val.isHovered = false
            val.displaying = val.idx === idx ? true : val.displaying
            return newTag
        })
        setTags(newTags)
    }

    const handleKey = (e) => {
        let tag = tags.find(val => val.isHovered === true)
        let displayedTags = tags.filter(val => val.displaying === true)

        const keyCode = e.keyCode
        let idx

        if(32 === keyCode) {
            e.preventDefault()
        }
        if(keyCode === 8 && chosenTags.length > 0 && inputVal.length === 0) {
            unchoose(chosenTags[chosenTags.length - 1].idx)
            setTags([...tags])
        }
        if(keyCode === 38 || keyCode === 32 || keyCode === 40 || keyCode === 13) {
            e.preventDefault()
        }
        if(tag === undefined) {
            if(keyCode === 38) {
                hover(displayedTags[displayedTags.length - 1].idx)
            }
            else if(keyCode === 40) {
                hover(displayedTags[0].idx)
            }
            return
        }
        else {
            idx = tag.idx
        }
        
        if([13, 38, 40].find(val => val === keyCode) === undefined) {
            return
        }
        if(keyCode === 13 || keyCode === 32) {
            choose(idx)
            return
        }
        let idxInArray = displayedTags.indexOf(tag)
        if(idxInArray === -1) {
            return
        }
    
        if(keyCode === 38) {
            if(idxInArray > 0) {
                idxInArray--
            }
            else {
                idxInArray = displayedTags.length - 1
            }
        }
        else {
            if(idxInArray < displayedTags.length - 1) {
                idxInArray++
            }
            else {
                idxInArray = 0
            }
        }

        hover(displayedTags[idxInArray].idx)
    }

    let validTags = validateInput(chosenTags.map(val => val.val), 1, 12, 1, 6, validateTags)

    
    return (
        <>
            <div className="dashboard__editor-unit tag-unit" onClick={(e) => {
                inputElement.current.focus()
                setIsFocused(true)
            }}>
                <div className="dashboard__editor-tag-area">
                    {chosenTags.map(val => {
                        return (
                            <span key={val.idx} className="chosen-tag">
                                {val.val}
                                <img src={closeIcon} alt=""
                                    onClick={() => unchoose(val.idx)}
                                />
                            </span>
                        )
                    })}

                    <span
                        type="text"
                        ref={inputElement}
                        className="tag-input"
                        value={inputVal}
                        onInput={e => setInputVal(e.currentTarget.textContent)}
                        onKeyDown={(e) => handleKey(e)}
                        onBlur={() => {unhover(-1)}} 
                        contentEditable="true"
                    >
                    </span>
                </div>
                <div
                    className={"dashboard__editor-placeholder" + (!validTags || (!tagRegex.test(inputVal) && inputVal.length !== 0) ? " alert" : "")}
                    style={inputVal.length !== 0 || chosenTags.length !== 0 || isFocused ? {
                        zIndex: "3",
                        top: "0px",
                        transform: "translateY(-50%)",
                        fontSize: "12px"
                    } : {}}
                >
                    Tagy (1 až 6, bez znakov a diakritiky) *
                </div>
                <div className="dashboard__editor-creatable__dropdown" style={dropDownVisible ? {display: "block"} : {}}>
                    {tags.filter(val => val.displaying === true).map(val => {
                        return (
                            <div
                                key={val.idx}
                                className={"dashboard__editor-creatable__dropdown-item" + (val.isHovered ? " dashboard__editor-creatable__dropdown-item--hovered" : "")}
                                onMouseOver={() => hover(val.idx)}
                                onMouseMove={() => hover(val.idx)}
                                onMouseOut={() => unhover(val.idx)}
                                onClick={() => choose(val.idx)}
                               
                            >
                                <span>
                                    {val?.createButton === true ? `Výtvoriť tag '${val.val}'` : val.val}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default TagInput
