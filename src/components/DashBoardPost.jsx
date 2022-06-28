import { useState } from "react"
import { useNavigate } from "react-router-dom"

import editIcon from "../assets/edit.svg"
import clipIcon from "../assets/link.svg"
import removeIcon from "../assets/remove.svg"


const DashBoardPost = (props) => {
    const [isHovering, setIsHovering] = useState(false)
    
    const navigate = useNavigate()

    const post = props.post

    let createTime = new Date(Date.parse(post.createTime))
    createTime = createTime.toLocaleString()
    let lastEditTime
    if(post.lastEditTime !== null) {
        lastEditTime = new Date(Date.parse(post.lastEditTime))
        lastEditTime = lastEditTime.toLocaleString()
    }

    return (
        <div className="col-xxl-6 col-lg-9 col-md-12 col-12">
            <div
                className="dashboard__post"
                onMouseOver={() => setIsHovering(true)}
                onMouseOut={() => setIsHovering(false)}
            >
                <div className="dashboard__post-img">
                    <img src={`/img/${post.img}.webp`} alt={post.name} />
                    <div className="dashboard__post-img--darken"></div>
                </div>
                <div className="dashboard__post-info">
                    <div className="dashboard__post-title" style={{display: "flex", justifyContent: "space-between"}}>
                        <h3>{post.name}</h3>
                        <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                            <div
                                className={`dashboard__post-button dashboard__post-edit${isHovering ? " dashboard__post-button--hovering" : ""}`}
                                onClick={() => navigate(`/dashboard/editor/${post.id}`)}
                            >
                                <span>Editovať</span>
                                <img src={editIcon} alt="Edit article" />
                            </div>
                            <div
                                className={`dashboard__post-button dashboard__post-remove${isHovering ? " dashboard__post-button--hovering" : ""}`}
                                onClick={() => props.removePostCallBack(post.id)}
                            >
                                <img src={removeIcon} alt="Remove article" />
                            </div>
                        </div>
                    </div>
                    <p className="dashboard__post-tags">
                        {post.tags.map((val, idx) => {
                            return (
                                <span key={idx}>
                                    #{val + " "}
                                </span>
                            )
                        })}
                    </p>

                    <div className="dashboard__post-dates">
                        <div>
                            <span>Vytvoreno: {createTime}</span>
                            {lastEditTime !== undefined ? (
                                <>
                                    <br />
                                    <span>Editovano: {lastEditTime}</span>
                                </>
                            ) : (<></>)}
                            
                        </div>
                        <div
                            className={`dashboard__post-button dashboard__post-see${isHovering ? " dashboard__post-button--hovering" : ""}`}
                            onClick={() => navigate(`/articles/${post.id}`)}
                        >
                            <span>Otvoriť publikáciu</span>
                            <img src={clipIcon} alt="See publication" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default DashBoardPost