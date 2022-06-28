import dummyImage from "./assets/cardimg.png"
import dummyArticlePic from "./assets/article_main_pic.png"

let dummyArticleSliderPics = [0, 1, 2, 3, 4].map(() => dummyArticlePic)

const cardSample = [
    {
        id: 1,
        name: "Výlet na lodi do Devína",
        img: dummyImage,
        articleMainPic: dummyArticlePic,
        articleSliderPics: [
            ...dummyArticleSliderPics
        ],
        url: "#",
        shareUrl: "#",
        rating: 4.5,
        countOfRated: 2586,
        tags: ["#loď", "#Devín", "#hrad", "#Dunaj", "#0.1km"],
        isInFavourites: false,
        description: 
            `Lorem Ipsum je pseudo-latinský text, ktorý
            sa používa pri testovaní layoutu (teda
            rozvrhnutia) stránok, časopisov,
            letákov. Používa sa už od 16. storočia.
            Text pripomína obyčajnú latinčinu, v skutočnosti
            je to nezmyselná skomolenina. Jeho začiatok je
            ale z Cicerovej tvorby, kde sa objavuje veta
            Neque porro quisquam est qui dolorem ipsum quia
            dolor sit amet, consectetur, adipisci velit.
            Aenean et est a dui semper facilisis...`,
        idx: 0,
        coordinates: "48.121946, 17.116597",
        locationName: "Staré Mesto, Bratislava",
        websiteLink: "http://www.bratislava-hrad.sk/",
        phone: "+421 2/204 831 10",
        openTimesInfo: "http://www.bratislava-hrad.sk/kontakt",
        relatedCards: [

        ]
    }
]

let dummyCards = [0, 1, 2, 3, 4, 5, 6, 7]
dummyCards = dummyCards.map(val => {
    let card = {...cardSample[0]}
    card.id = val
    return card
})

export default dummyCards