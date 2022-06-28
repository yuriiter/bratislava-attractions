import { createContext, useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Home"
import Favourite from "./Favourite"
import Page404 from "./Page404"
import DashBoardContainer from "./DashBoardContainer"
import ArticlesByTag from "./ArticlesByTag"
import SearchResults from "./SearchResults"
import DashBoardEditorWrapper from "./DashBoardEditorWrapper"
import { Article } from "./containers"
import "./App.scss"
import axios from "axios"


axios.defaults.withCredentials = true

const globalInitialValue = {
  sessionExpires: 0,
  coordinates: "48.148464, 17.107568",
  fromLocation: "(od centru Bratislavy)"
}

function App() {
  const [global, setGlobal] = useState(globalInitialValue)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        global.coordinates = [position.coords.latitude, position.coords.longitude].join(", ")
        global.fromLocation = "(od vášej polohy)"
        setGlobal({...global})
      }
    )
  }, [])


  return (
    <GlobalContext.Provider value={{global, setGlobal}}>
      <BrowserRouter forceRefresh={true}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/favourites" element={<Favourite />} />
          <Route path="/articles/:id" element={<Article />} />
          <Route path="/tags/:tag" element={<ArticlesByTag />} />
          <Route path="/search/:searchQueryParam" element={<SearchResults />} />
          <Route path="/dashboard" element={<DashBoardContainer />} />
          <Route path="/dashboard/editor" element={<DashBoardEditorWrapper />}>
            <Route path=":postId" element={<DashBoardEditorWrapper />} />
          </Route>
          <Route path="/*" element={<Page404 />} />
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  )
}

export const GlobalContext = createContext(null);
export default App
