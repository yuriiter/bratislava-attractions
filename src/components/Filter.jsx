import { useState, useEffect } from "react"
import { compareStringArrays } from "../utils"
import {
    SORT_BY_TIME,
    SORT_BY_DISTANCE,
    SORT_BY_RATING,
    SORT_DESC,
    SORT_ASC
} from "../constants"

import resetIcon from "../assets/reset.svg"
import axios from "axios"

axios.defaults.withCredentials = true

const Filter = (props) => {
    const [currentFilterDistance, setCurrentFilterDistance] = useState(Math.ceil(props.maxDistance))
    const [currentFilterSortBy, setCurrentFilterSortBy] = useState(SORT_BY_TIME)
    const [currentFilterSortOrder, setCurrentFilterSortOrder] = useState(SORT_DESC)
    const [currentFilterTags, setCurrentFilterTags] = useState([])

    const [prevFilterDistance, setPrevFilterDistance] = useState(Math.ceil(props.maxDistance))
    const [prevFilterSortBy, setPrevFilterSortBy] = useState(currentFilterSortBy)
    const [prevFilterSortOrder, setPrevFilterSortOrder] = useState(currentFilterSortOrder)
    const [prevFilterTags, setPrevFilterTags] = useState([])

    const [maxDistance, setMaxDistance] = useState(currentFilterDistance)
    const [filterTagObjects, setFilterTagObjects] = useState([])


    const haveFiltersChanged = () => {
        if(prevFilterDistance !== currentFilterDistance) {
            return true
        }
        if(prevFilterSortBy !== currentFilterSortBy) {
            return true
        }
        if(prevFilterSortOrder !== currentFilterSortOrder) {
            return true
        }
        if(compareStringArrays(prevFilterTags, currentFilterTags) !== false) {
            return true
        }
        return false
    }

    const loadTags = (setFilterTagObjectsCallBack) => {
        axios.get(process.env.REACT_APP_API_URL + "/tags?count=10")
        .then(response => {
            let data = response.data
            let filterTags = []
            filterTags = data.tags.map((val, idx) => {
                return {
                    idx: idx,
                    val: val,
                    isActive: false
                }
            })
            setFilterTagObjectsCallBack(filterTags)
        })
    }

    let isApplyButtonActive = haveFiltersChanged()

    useEffect(() => {
        loadTags(setFilterTagObjects)
    }, [])
    

    useEffect(() => {
        setMaxDistance(Math.ceil(props.maxDistance))
        setCurrentFilterDistance(Math.ceil(props.maxDistance))
        setPrevFilterDistance(Math.ceil(props.maxDistance))
        applyChanges()
    }, [props.maxDistance])

    useEffect(() => {
        setPrevFilterDistance(Math.ceil(props.maxDistance))
        applyChanges()
    }, [maxDistance])

    const applyChanges = () => {
        setPrevFilterDistance(currentFilterDistance)
        setPrevFilterSortBy(currentFilterSortBy)
        setPrevFilterSortOrder(currentFilterSortOrder)
        setPrevFilterTags([...currentFilterTags])

        props.loadCardsWithFilters({
            filterDistance: currentFilterDistance,
            filterSortBy: currentFilterSortBy,
            filterSortOrder: currentFilterSortOrder,
            filterTags: currentFilterTags,
        })
    }


    // Functions to toggle filter tags
    const toggleTag = (tagKey) => {
        let tagIdx = filterTagObjects.findIndex(val => {
            return val.idx === tagKey
        })
        filterTagObjects[tagIdx].isActive = !filterTagObjects[tagIdx].isActive
        setFilterTagObjects([...filterTagObjects])
        let tagArray = filterTagObjects.filter(val => val.isActive === true).map(val => val.val)
        setCurrentFilterTags(tagArray)
    }

    const resetTags = () => {
        filterTagObjects.forEach(val => {
            val.isActive = false;
        })
        setFilterTagObjects([...filterTagObjects])
        setCurrentFilterTags([])
    }


    return (
        <div className="filter">
            <div className="row justify-content-between">
                <div className="col-xl-2 col-lg-3 col-12">
                    <h4 className="filter__filter-name">Druh atrakcii</h4>
                </div>
                <div className="col-lg-9 col-12 flex-wrap filter__inputs filter__inputs-tags">
                    {filterTagObjects.length > 0 ? filterTagObjects.map(tag => {
                        return (<span key={tag.idx}
                                className={tag.isActive ? "active" : ""}
                                onClick={() => toggleTag(tag.idx)}
                        >
                            #{tag.val}
                        </span>)
                        }) : (<></>)
                    }
                    {filterTagObjects.length > 0 ? (
                        <span className="reset-tags" onClick={resetTags}>
                            <img src={resetIcon} alt="Reset tags" style={{width: "14px", height: "14px"}} />
                        </span>
                    ) : (<></>)}

                    <span
                        className={"apply-changes" + (isApplyButtonActive ? " apply-changes--active" : "")}
                        onClick={isApplyButtonActive ? applyChanges : null}
                    >
                        Použiť zmeny
                    </span>
                </div>
            </div>

            <div className="row justify-content-between">
                <div className="col-xl-2 col-lg-3 col-12">
                    <h4 className="filter__filter-name">Vzdialenosť</h4>
                </div>
                <div className="col-lg-9 col-12 flex-wrap filter__inputs filter__inputs-distance">
                    <input 
                        type="range"
                        className="range"
                        min="0"
                        max={maxDistance}
                        step="1"
                        onChange={e => {
                            setCurrentFilterDistance(Number.parseFloat(e.target.value))
                        }}
                        value={currentFilterDistance}
                    />
                    <p className="distance">{currentFilterDistance}</p>
                    <span>km</span>
                </div>
            </div>

            <div className="row justify-content-between">
                <div className="col-xl-2 col-lg-3 col-12">
                    <h4 className="filter__filter-name">Zoradiť podľa</h4>
                </div>
                <div className="col-lg-9 col-12 flex-wrap filter__inputs filter__inputs-sort">
                    <div className="d-flex flex-wrap">
                        <div className="select-wrapper select-by">
                                <select name="sort_by" id="" onChange={e => setCurrentFilterSortBy(e.target.value)}>
                                    <option value={SORT_BY_TIME} defaultValue>času pridania</option>
                                    <option value={SORT_BY_DISTANCE}>vzdialenosti</option>
                                    <option value={SORT_BY_RATING}>obľúbenosti�</option>
                                </select>
                                <div className="select-arrow"></div>
                        </div>
                        <div className="select-wrapper select-direction">
                                <select name="sort_direction" id="" onChange={e => setCurrentFilterSortOrder(e.target.value)}>
                                    <option value={SORT_DESC} defaultValue>vzostupne</option>
                                    <option value={SORT_ASC}>zostupne</option>
                                </select>
                                <div className="select-arrow"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Filter
