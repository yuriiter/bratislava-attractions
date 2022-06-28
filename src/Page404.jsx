import { MainSlider, NavBar } from "./components"
import { Footer } from "./containers"

const Page404 = () => {
    return (
        <>
            <NavBar />
            <div className="error-page">
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <h3 className="error-page__title">Nenášli sme tuto stránku. <br /> Možno vás zaujímajú tieto recenzie:</h3>
                        </div>
                    </div>
                </div>
                <MainSlider />
            </div>
            <Footer />
        </>
    )
}

export default Page404
