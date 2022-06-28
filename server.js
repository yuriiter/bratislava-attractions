const express = require('express')
const cors = require('cors')
const fs = require("fs")
const bodyParser = require('body-parser')
const helmet = require("helmet")
const session = require('express-session')
const mysqlStore = require('express-mysql-session')(session);
const path = require("path")
const sharp = require('sharp')
const https = require('https')


const privateKey = fs.readFileSync('sslcert/private.key', 'utf8')
const certificate = fs.readFileSync('sslcert/certificate.crt', 'utf8')
const credentials = {key: privateKey, cert: certificate}

const { validateCoordinates, validateToken, validateTags, validateImg, distance } = require("./utils/utils")
const config = require("./db/config").config
const query = require("./db/query")


const SORT_BY_TIME      = "sort_by_time"
const SORT_BY_DISTANCE  = "sort_by_distance"
const SORT_BY_RATING    = "sort_by_rating"
const SORT_DESC         = "sort_descending"
const SORT_ASC          = "sort_by_ascending"

const mediaPath = path.resolve(__dirname, "media", "img")

const sessionStore = new mysqlStore({...config.database, createDatabaseTable: true, ttl: 1000 * 60 * 60 * 24 * 2})

const app = express()
app.use(cors({
  origin: ["https://tereshchenkoy.com", "http://localhost:3000"],
  methods: ["POST", "PUT", "GET", "DELETE"],
  credentials: true,
}))
app.use(bodyParser.urlencoded({
  limit: "60mb",
  parameterLimit: 1000000000000000,
  extended: false 
}))
app.use(express.json({limit: "60mb"}))
app.use(session({
  name: "session",
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  saveUninitialized: false,
  resave: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 14,
    httpOnly: true,
    secure: true
  }
}))


app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://apis.google.com'],
    styleSrcElem: ["'self'", 'https://fonts.googleapis.com'],
    frameSrc: ['https://accounts.google.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: [
      "'self'",
      'https://b.tile.openstreetmap.org',
      'https://a.tile.openstreetmap.org',
      'https://c.tile.openstreetmap.org',
      'blob:',
      'data:'
    ]
  }
}))
app.use(helmet.crossOriginOpenerPolicy({ policy: "same-origin-allow-popups" }));
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());




app.post('/main_slider_cards', async (req, res) => {
  try {
    const { userId } = req.session
    const coordinates = req.body.coordinates

    if(validateCoordinates(coordinates) === false) {
      return res.sendStatus(400)
    }

    let cards = []

    let results
    try {
      results = await query(
        `SELECT article.article_id,
        article_name, article_description,
        coordinates, main_slider_card_img,
        concat_tags.tags AS tags,
        rating.rating AS rating, rating.count_of_rates AS count_of_rates,
        IF(favourites.relation_id is NULL, 0, 1)  AS is_in_favourites

        FROM article

        LEFT JOIN
        (
          SELECT article_to_tag.article_id as article_id, GROUP_CONCAT(tag_value SEPARATOR ';') AS tags
          FROM article_to_tag
          GROUP BY article_to_tag.article_id
        ) AS concat_tags
        ON concat_tags.article_id = article.article_id

        LEFT JOIN
        (
          SELECT user_rating.article_id as article_id, AVG(rating) as rating, COUNT(user_rating.relation_id) AS count_of_rates
          FROM user_rating
          GROUP BY user_rating.article_id
        ) AS rating
        ON rating.article_id = article.article_id

        LEFT JOIN
        (
          SELECT article_id, relation_id FROM favourite_articles
          WHERE favourite_articles.user_gmail_address = ?
          GROUP BY favourite_articles.article_id
        ) AS favourites
        ON favourites.article_id = article.article_id
        ORDER BY create_time LIMIT 5`, [userId]
      )
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }

    cards = results.map(val => {

      return {
        id: val.article_id,
        name: val.article_name,
        rating: val.rating ?? 0,
        countOfRated: val.count_of_rates ?? 0,
        description: val.article_description?.slice(0, 320),
        img: val.main_slider_card_img,
        distance: distance(coordinates, val.coordinates),
        tags: val.tags ? val.tags.split(";") : [],
        isInFavourites: val.is_in_favourites === 0 ? false : true
      }
    })
    return res.status(200).json({cards: cards})

  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})


app.get('/tags', async (req, res) => {
  try {
    let results
    let countOfTags = req.query.count ?? 10000
    countOfTags = Number.parseInt(countOfTags)

    if(isNaN(countOfTags) || countOfTags < 1) {
      return res.sendStatus(400)
    }

    try {
      results = await query(
        `SELECT tag_value, COUNT(tag_value) as "value_occurence"
        FROM article_to_tag
        GROUP BY tag_value
        ORDER BY "value_occurence" DESC`, undefined
      )
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }

    if(results.length === 0) {
      return res.sendStatus(404)
    }
    const tags = results.map(val => val.tag_value)
    return res.status(200).json({tags: tags?.slice(0, countOfTags)})
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

app.post('/catalog', async (req, res) => {
  try {
    const { userId } = req.session
    const filterSortBy = req.body.filter_sort_by
    const filterSortOrder = req.body.filter_sort_order
    const loaded = req.body.loaded
    const coordinates = req.body.coordinates
    let filterTags = req.body.filter_tags
    let filterDistance = req.body.filter_distance

    if(
      filterTags === undefined
      || !(filterTags instanceof Array)
      || !validateCoordinates(coordinates)
      || loaded === undefined
      || typeof loaded !== "number"
      || loaded < 0
      || filterDistance === undefined) {
      return res.sendStatus(400)
    }

    let results
    try {
      results = await query(
        `SELECT article.article_id,
        article_name, article_description,
        coordinates, create_time, catalog_card_img,
        concat_tags.tags AS tags,
        rating.rating AS rating, rating.count_of_rates AS count_of_rates,
        if(has_user_rated.relation_id is NULL, 0, 1) AS has_user_rated,
        IF(favourites.relation_id is NULL, 0, 1)  AS is_in_favourites

        FROM article

        LEFT JOIN
        (
          SELECT article_to_tag.article_id as article_id, GROUP_CONCAT(tag_value SEPARATOR ';') AS tags
          FROM article_to_tag
          GROUP BY article_to_tag.article_id
        ) AS concat_tags
        ON concat_tags.article_id = article.article_id


        LEFT JOIN
        (
          SELECT user_rating.article_id as article_id, AVG(rating) as rating, COUNT(user_rating.relation_id) AS count_of_rates
          FROM user_rating
          GROUP BY user_rating.article_id
        ) AS rating
        ON rating.article_id = article.article_id

        LEFT JOIN
        (
          SELECT article_id, relation_id FROM favourite_articles
          WHERE favourite_articles.user_gmail_address = ?
          GROUP BY favourite_articles.article_id
        ) AS favourites
        ON favourites.article_id = article.article_id

        LEFT JOIN
        (
          SELECT relation_id, article_id FROM user_rating
          WHERE user_gmail_address = ?
          GROUP BY user_rating.article_id
        ) AS has_user_rated
        ON article.article_id = has_user_rated.article_id
        `, [userId, userId]
      )

      let maxDistance = 0
      let cards = results.map(val => {
        let distance_ = distance(coordinates, val.coordinates)
        if(maxDistance < distance_) {
          maxDistance = distance_
        }
        return {
          id: val.article_id,
          name: val.article_name,
          description: val.article_description?.slice(0, 320),
          rating: val.rating ?? 0,
          countOfRated: val.count_of_rates ?? 0,
          img: val.catalog_card_img,
          coordinates: val.coordinates,
          createTime: val.create_time.getTime(),
          authorGmail: val.author_gmail,
          tags: val.tags ? val.tags.split(";") : [],
          isInFavourites: val.is_in_favourites === 0 ? false : true,
          distance: distance_
        }
      })

      cards = cards.filter(val => val.distance <= filterDistance)

      if(filterTags.length !== 0) {
        const filterTagArr = filterTags
        cards = cards.filter(val => val.tags.some(t => filterTagArr.indexOf(t) >= 0))
      }


      if(filterSortOrder === SORT_DESC) {
        if(filterSortBy === SORT_BY_TIME) {
          cards = cards.sort((a, b) => a.createTime - b.createTime)
        }
        else if(filterSortBy === SORT_BY_RATING) {
          cards = cards.sort((a, b) => a.rating - b.rating)
        }
        else if(filterSortBy === SORT_BY_DISTANCE) {
          cards = cards.sort((a, b) => a.distance - b.distance)
        }
      }
      else if(filterSortOrder === SORT_ASC) {
        if(filterSortBy === SORT_BY_TIME) {
          cards = cards.sort((a, b) => b.createTime - a.createTime)
        }
        else if(filterSortBy === SORT_BY_RATING) {
          cards = cards.sort((a, b) => b.rating - a.rating)
        }
        else if(filterSortBy === SORT_BY_DISTANCE) {
          cards = cards.sort((a, b) => b.distance - a.distance)
        }
      }

      let initialLength = cards.length

      cards = cards?.slice(loaded, loaded + 8)
      return res.status(200).json({cards: cards, hasMoreCards: loaded + 8 < initialLength})

    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})



app.post('/article_by_id', async (req, res) => {
  try {
    const { userId } = req.session
    const id = req.body.id
    const coordinates = req.body.coordinates

    if(id === undefined || isNaN(Number.parseInt(id)) || !validateCoordinates(coordinates)) {
      return res.sendStatus(400)
    }

    let result
    try {
      result = (await query(
        `SELECT article.article_id, article_name, article_description,
        coordinates, position_name, website_link, phone, open_times_info,
        concat_tags.tags AS tags,
        concat_article_slider_images.img_srcs,
        rating.rating AS rating, rating.count_of_rates AS count_of_rates,
        If(has_user_rated.relation_id is NULL, 0, 1) AS has_user_rated,
        IF(favourites.relation_id is NULL, 0, 1)  AS is_in_favourites,
        concat_related_id.related_arr

        FROM article

        LEFT JOIN
        (
          SELECT article_to_tag.article_id as article_id, GROUP_CONCAT(tag_value SEPARATOR ';') AS tags
          FROM article_to_tag
          GROUP BY article_to_tag.article_id
        ) AS concat_tags
        ON concat_tags.article_id = article.article_id

        LEFT JOIN
        (
          SELECT article_slider_imgs.article_id as article_id, GROUP_CONCAT(img_src SEPARATOR ';') AS img_srcs
          FROM article_slider_imgs
          GROUP BY article_slider_imgs.article_id
        ) AS concat_article_slider_images
        ON concat_article_slider_images.article_id = article.article_id

        LEFT JOIN
        (
          SELECT user_rating.article_id as article_id, AVG(rating) as rating, COUNT(user_rating.relation_id) AS count_of_rates
          FROM user_rating
          GROUP BY user_rating.article_id
        ) AS rating
        ON rating.article_id = article.article_id

        LEFT JOIN
        (
          SELECT article_id, relation_id FROM favourite_articles
          WHERE favourite_articles.user_gmail_address = ?
          GROUP BY favourite_articles.article_id
        ) AS favourites
        ON favourites.article_id = article.article_id

        LEFT JOIN
        (
          SELECT relation_id, article_id FROM user_rating
          WHERE user_gmail_address = ?
          GROUP BY user_rating.article_id
        ) AS has_user_rated
        ON article.article_id = has_user_rated.article_id

        LEFT JOIN
        (
          SELECT related_articles.article_id,
          GROUP_CONCAT(CAST(related_articles.related_article_id AS CHAR) SEPARATOR ";") AS related_arr
          FROM related_articles
          GROUP BY related_articles.article_id
        ) AS concat_related_id
        ON concat_related_id.article_id = article.article_id

        WHERE article.article_id = ?`, [userId, userId, id]
      ))[0]
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
    if(result === undefined) {
      return res.sendStatus(404)
    }


    let card = {
      id: result.article_id,
      name: result.article_name,
      rating: result.rating ?? 0,
      countOfRated: result.count_of_rates ?? 0,
      description: result.article_description,
      coordinates: result.coordinates,
      locationName: result.position_name,
      websiteLink: result.website_link,
      phone: result.phone,
      openTimesInfo: result.open_times_info,
      isInFavourites: result.is_in_favourites === 0 ? false : true,
      hasUserRated: result.has_user_rated === 0 ? false : true,
      tags: result.tags ? result.tags.split(";") : [],
      articleSliderPics: result.img_srcs === null ? [] : result.img_srcs.split(";"),
      distance: coordinates ? distance(coordinates, result.coordinates) : undefined,
      relatedCards: []
    }

    let relatedCardsId = result.related_arr === null ? [] : result.related_arr.split(";").map(val => Number.parseInt(val))

    if(relatedCardsId.length > 0) {
      relatedCardsId = relatedCardsId.sort(() => Math.random() - 0.5)
      relatedCardsId = relatedCardsId?.slice(0, 3)      
      let queryIdsPlaceholder = []
      let queryOnIds = relatedCardsId.map(val => {
        queryIdsPlaceholder.push(val)
        return "article.article_id = ?"
      }).join(" OR ")

      let results
      try {
        results = await query(
          `SELECT article.article_id,
          article_name, article_description,
          coordinates, catalog_card_img,
          concat_tags.tags AS tags,
          rating.rating AS rating, rating.count_of_rates AS count_of_rates,
          IF(favourites.relation_id is NULL, 0, 1)  AS is_in_favourites

          FROM article

          LEFT JOIN
          (
            SELECT article_to_tag.article_id as article_id, GROUP_CONCAT(tag_value SEPARATOR ';') AS tags
            FROM article_to_tag
            GROUP BY article_to_tag.article_id
          ) AS concat_tags
          ON concat_tags.article_id = article.article_id


          LEFT JOIN
          (
            SELECT user_rating.article_id as article_id, AVG(rating) as rating, COUNT(user_rating.relation_id) AS count_of_rates
            FROM user_rating
            GROUP BY user_rating.article_id
          ) AS rating
          ON rating.article_id = article.article_id

          LEFT JOIN
          (
            SELECT article_id, relation_id FROM favourite_articles
            WHERE favourite_articles.user_gmail_address = ?
            GROUP BY favourite_articles.article_id
          ) AS favourites
          ON favourites.article_id = article.article_id

          WHERE ${queryOnIds}`, [userId, ...queryIdsPlaceholder]
        )
      }
      catch(err) {
        console.log(err)
        return res.sendStatus(500)
      }
      let relatedCards = results.map(val => {
        return {
          id: val.article_id,
          name: val.article_name,
          description: val.article_description?.slice(0, 320),
          rating: val.rating ?? 0,
          countOfRated: val.count_of_rates ?? 0,
          img: val.catalog_card_img,
          coordinates: val.coordinates,
          tags: val.tags ? val.tags.split(";") : [],
          isInFavourites: val.is_in_favourites === 0 ? false : true,
          distance: distance(coordinates, val.coordinates)
        }
      })
      card.relatedCards = relatedCards
    }
    return res.status(200).json({card: card})
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})


app.post("/favourite_articles", async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(401)
    }
    const coordinates = req.body.coordinates
    const loaded = req.body.loaded

    if(
      !validateCoordinates(coordinates)
      || loaded === undefined
      || isNaN(parseInt(loaded))
      || loaded < 0) {
      return res.sendStatus(400)
    }

    let results
    try {
      results = await query(
        `SELECT article.article_id,
        article_name, article_description,
        coordinates, create_time, catalog_card_img,
        concat_tags.tags AS tags,
        rating.rating AS rating, rating.count_of_rates AS count_of_rates

        FROM article

        LEFT JOIN
        (
          SELECT article_to_tag.article_id as article_id, GROUP_CONCAT(tag_value SEPARATOR ';') AS tags
          FROM article_to_tag
          GROUP BY article_to_tag.article_id
        ) AS concat_tags
        ON concat_tags.article_id = article.article_id


        LEFT JOIN
        (
          SELECT user_rating.article_id as article_id, AVG(rating) as rating, COUNT(user_rating.relation_id) AS count_of_rates
          FROM user_rating
          GROUP BY user_rating.article_id
        ) AS rating
        ON rating.article_id = article.article_id

        RIGHT JOIN
        (
          SELECT article_id, relation_id FROM favourite_articles
          WHERE favourite_articles.user_gmail_address = ?
          GROUP BY favourite_articles.article_id
        ) AS favourites
        ON favourites.article_id = article.article_id

        ORDER BY article.create_time
        `, [userId]
      )

      let cards = results.filter(result => result.article_id !== null).map((result) => {
        return {
          id: result.article_id,
          name: result.article_name,
          description: result.article_description?.slice(0, 320),
          rating: result.rating ?? 0,
          countOfRated: result.count_of_rates ?? 0,
          img: result.catalog_card_img,
          coordinates: result.coordinates,
          distance: distance(coordinates, result.coordinates),
          tags: result.tags ? result.tags.split(";") : [],
          isInFavourites: true
        }
      })

      return res.status(200).json({cards: cards?.slice(loaded, loaded + 8), hasMoreCards: loaded + 8 < cards.length})
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

app.get("/article_count", async (req, res) => {
  try {
    let result
    try {
      result = await query("SELECT COUNT(article_id) AS count FROM article", undefined)
      return res.status(200).json({articleTotal: result[0].count})
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

app.post("/has_user_rated", async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(401)
    }
    const articleId = req.post.articleId

    if(articleId === undefined || typeof articleId !== "number") {
      return res.sendStatus(400)
    }

    let returnFlag = false
    query(
      `SELECT relation_id FROM user_rating
      WHERE article_id = ? AND user_gmail_address = ?`, [articleId, userId]
    )
      .then(result => {
        let hasUserRated
        if(result.length !== 0) {
          hasUserRated = true
        }
        else {
          hasUserRated = false
        }
        returnFlag = true
        return res.status(200).json({hasUserRated: hasUserRated})
      })
      .catch(err => {
        console.log(err)
        if(returnFlag) {
          return
        }
        return res.sendStatus(500)
      })
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

app.post("/rate", async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(401)
    }
    const articleId = req.body.articleId
    const rating = req.body.rating

    if(
      articleId === undefined
      || typeof articleId !== "number"
      || rating === undefined
      || typeof rating !== "number"
      || rating > 5 || rating < 1) {
      return res.sendStatus(400)
    }

    let returnFlag = false
    query(
      `SELECT relation_id FROM user_rating
      WHERE article_id = ? AND user_gmail_address = ?`, [articleId, userId]
    )
      .then(checkResult => {
        if(checkResult.length !== 0) {
          returnFlag = true
          return res.sendStatus(400)
        }
        else {
          query(
            `INSERT INTO user_rating (relation_id, user_gmail_address, article_id, rating)
            VALUES (0, ?, ?, ?)`, [userId, articleId, rating]
          )
            .then(() => {
              if(returnFlag) {
                return
              }
              returnFlag = true
              return res.sendStatus(200)
            })
            .catch(err => {
              console.log(err)
              if(returnFlag) {
                return
              }
              returnFlag = true
              return res.sendStatus(500)
            })
        }
      })
      .catch(err => {
        console.log(err)
        if(returnFlag) {
          return
        }
        return res.sendStatus(500)
      })
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})


app.post("/favourites", async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(401)
    }
    const articleId = req.body.articleId

    if(
      articleId === undefined
      || typeof articleId !== "number") {
      return res.sendStatus(400)
    }

    let returnFlag = false
    query(
      `INSERT INTO favourite_articles (relation_id, user_gmail_address, article_id)
      VALUES (0, ?, ?)`, [userId, articleId]
    )
      .then(() => {
        returnFlag = true
        return res.sendStatus(200)
      })
      .catch(err => {
        console.log(err)
        if(returnFlag) {
          return
        }
        return res.sendStatus(500)
      })
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

app.delete("/favourites", async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(401)
    }
    const articleId = req.body.articleId

    if(
      articleId === undefined
      || isNaN(parseInt(articleId))) {
      return res.sendStatus(400)
    }

    let returnFlag = false
    query(
      `DELETE FROM favourite_articles
      WHERE article_id = ? AND user_gmail_address = ?`, [articleId, userId]
    )
      .then(() => {
        returnFlag = true
        res.sendStatus(200)
      })
      .catch(err => {
        console.log(err)
        if(returnFlag) {
          return
        }
        return res.sendStatus(500)
      })
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})


app.post("/max_distance", async (req, res) => {
  try {
    let coordinates = req.body.coordinates
    if(!validateCoordinates(coordinates)) {
      return res.sendStatus(400)
    }

    let returnFlag = false

    query(
      `SELECT coordinates FROM article`, undefined
    )
      .then((results) => {
        let maxDistance = 0
        results.forEach(element => {
          let distance_ = distance(element.coordinates, coordinates)
          if(maxDistance < distance_) {
            maxDistance = distance_
          }
        })
        returnFlag = true
        return res.status(200).json({maxDistance: maxDistance})
      })
      .catch(err => {
        console.log(err)
        if(returnFlag) {
          return
        }
        return res.sendStatus(500)
      })
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})



app.post("/search", async (req, res) => {
  try {
    const { userId } = req.session

    const coordinates = req.body.coordinates
    const searchQuery = req.body.searchQuery
    const loaded = req.body.loaded

    if(
      loaded === undefined
      || typeof loaded !== "number"
      || loaded < 0
      || searchQuery === undefined
      || typeof searchQuery !== "string"
      || !validateCoordinates(coordinates)) {
      return res.sendStatus(400)
    }


    results = await query(
      `SELECT article.article_id,
      article_name, article_description,
      coordinates, create_time, catalog_card_img,
      concat_tags.tags AS tags,
      rating.rating AS rating, rating.count_of_rates AS count_of_rates,
      IF(favourites.relation_id is NULL, 0, 1)  AS is_in_favourites

      FROM article

      LEFT JOIN
      (
        SELECT article_to_tag.article_id as article_id, GROUP_CONCAT(tag_value SEPARATOR ';') AS tags
        FROM article_to_tag
        GROUP BY article_to_tag.article_id
      ) AS concat_tags
      ON concat_tags.article_id = article.article_id


      LEFT JOIN
      (
        SELECT user_rating.article_id as article_id, AVG(rating) as rating, COUNT(user_rating.relation_id) AS count_of_rates
        FROM user_rating
        GROUP BY user_rating.article_id
      ) AS rating
      ON rating.article_id = article.article_id

      LEFT JOIN
      (
        SELECT article_id, relation_id FROM favourite_articles
        WHERE favourite_articles.user_gmail_address = ?
        GROUP BY favourite_articles.article_id
      ) AS favourites
      ON favourites.article_id = article.article_id

      WHERE MATCH(article.article_name, article.article_description) AGAINST(? IN BOOLEAN MODE)
      ORDER BY MATCH(article.article_name, article.article_description) AGAINST(? IN BOOLEAN MODE)

      `, [userId, searchQuery, searchQuery]
    )

    let cards = results.map(val => {
      return {
        id: val.article_id,
        name: val.article_name,
        description: val.article_description?.slice(0, 320),
        rating: val.rating ?? 0,
        countOfRated: val.count_of_rates ?? 0,
        img: val.catalog_card_img,
        coordinates: val.coordinates,
        createTime: val.create_time.getTime(),
        authorGmail: val.author_gmail,
        tags: val.tags ? val.tags.split(";") : [],
        isInFavourites: val.is_in_favourites === 0 ? false : true,
        distance: distance(coordinates, val.coordinates)
      }
    })
    return res.status(200).json({cards: cards?.slice(loaded, loaded + 8), hasMoreCards: loaded + 8 < cards.length})
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})



app.post('/articles_by_tag', async (req, res) => {
  try {
    const { userId } = req.session

    const loaded = req.body.loaded
    const coordinates = req.body.coordinates
    const tag = req.body.tag

    if(
      loaded === undefined
      || typeof loaded !== "number"
      || loaded < 0
      || tag === undefined
      || typeof tag !== "string"
      || !validateCoordinates(coordinates)) {
      return res.sendStatus(400)
    }

    let filterDistance
    if(tag.match(/^\d+\.\d+km$/) !== null) {

      filterDistance = Number.parseFloat(tag.replace("km", "")) + 0.1
    }

    let tagPart = !filterDistance ? `
    RIGHT JOIN
    (
      SELECT article_to_tag.article_id, article_to_tag.tag_value
      FROM article_to_tag
      WHERE article_to_tag.tag_value = ?
    ) AS tag
    ON tag.article_id = article.article_id
    ` : ""
    let placeholder = !filterDistance ? [tag] : []

    let results
    try {
      results = await query(
        `SELECT article.article_id,
        article_name, article_description,
        coordinates, create_time, catalog_card_img,
        concat_tags.tags AS tags,
        rating.rating AS rating, rating.count_of_rates AS count_of_rates,
        if(has_user_rated.relation_id is NULL, 0, 1) AS has_user_rated,
        IF(favourites.relation_id is NULL, 0, 1)  AS is_in_favourites

        FROM article

        LEFT JOIN
        (
          SELECT article_to_tag.article_id as article_id, GROUP_CONCAT(tag_value SEPARATOR ';') AS tags
          FROM article_to_tag
          GROUP BY article_to_tag.article_id
        ) AS concat_tags
        ON concat_tags.article_id = article.article_id


        LEFT JOIN
        (
          SELECT user_rating.article_id as article_id, AVG(rating) as rating, COUNT(user_rating.relation_id) AS count_of_rates
          FROM user_rating
          GROUP BY user_rating.article_id
        ) AS rating
        ON rating.article_id = article.article_id

        LEFT JOIN
        (
          SELECT article_id, relation_id FROM favourite_articles
          WHERE favourite_articles.user_gmail_address = ?
          GROUP BY favourite_articles.article_id
        ) AS favourites
        ON favourites.article_id = article.article_id

        LEFT JOIN
        (
          SELECT relation_id, article_id FROM user_rating
          WHERE user_gmail_address = ?
          GROUP BY user_rating.article_id
        ) AS has_user_rated
        ON article.article_id = has_user_rated.article_id

        ${tagPart}

        ORDER BY article.create_time
        `, [userId, userId, ...placeholder]
      )


      let cards = results.map(val => {
        return {
          id: val.article_id,
          name: val.article_name,
          description: val.article_description?.slice(0, 320),
          rating: val.rating ?? 0,
          countOfRated: val.count_of_rates ?? 0,
          img: val.catalog_card_img,
          coordinates: val.coordinates,
          tags: val.tags ? val.tags.split(";") : [],
          isInFavourites: val.is_in_favourites === 0 ? false : true,
          distance: distance(coordinates, val.coordinates)
        }
      })
      cards = filterDistance === undefined ? cards : cards.filter(val => val.distance <= filterDistance)

      let initialLength = cards.length

      cards = cards?.slice(loaded, loaded + 8)
      return res.status(200).json({cards: cards, hasMoreCards: loaded + 8 < initialLength})

    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})



app.post("/posts", async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(401)
    }
    const loaded = req.body.loaded

    if(loaded === undefined || typeof loaded !== "number" || loaded < 0) {
      return res.sendStatus(400)
    }

    let results
    try {
      results = await query(
        `SELECT article.article_id,
        article_name, create_time, edit_time, catalog_card_img,
        concat_tags.tags AS tags,
        IFNULL(edit_time, create_time) AS last_interaction_time

        FROM article

        LEFT JOIN
        (
          SELECT article_to_tag.article_id as article_id, GROUP_CONCAT(tag_value SEPARATOR ';') AS tags
          FROM article_to_tag
          GROUP BY article_to_tag.article_id
        ) AS concat_tags
        ON concat_tags.article_id = article.article_id

        WHERE article.author_gmail = ?
        ORDER BY last_interaction_time DESC
        `, [userId]
      )

      const posts = results.map((result) => {
        return {
          id: result.article_id,
          name: result.article_name,
          img: result.catalog_card_img,
          tags: result.tags ? result.tags.split(";") : [],
          createTime: result.create_time,
          lastEditTime: result.edit_time
        }
      })

      return res.status(200).json({posts: posts?.slice(loaded, loaded + 5), hasMorePosts: loaded + 5 < posts.length})
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})



app.post("/new_post", bodyParser.json({limit: '200mb'}), async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(401)
    }
    const articleData = req.body.articleData
    let mainSliderImgBuffer
    let catalogCardImgBuffer
    let sliderImgsBuffers

    if(articleData === undefined || typeof articleData !== "object") {
      return res.sendStatus(400)
    }

    if(
      articleData.name === undefined
      || typeof articleData.name !== "string"
      || articleData.description === undefined
      || typeof articleData.description !== "string"
      || articleData.locationName === undefined
      || typeof articleData.locationName !== "string") {
      return res.sendStatus(400)
    }

    if(articleData.name.length === 0 || articleData.name.length > 100) {
      return res.sendStatus(400)
    }
    if(articleData.description.length === 0 || articleData.description.length > 3000) {
      return res.sendStatus(400)
    }
    if(articleData.locationName.length === 0 || articleData.locationName.length > 100) {
      return res.sendStatus(400)
    }
    if(!validateCoordinates(articleData.coordinates) || articleData.coordinates.length > 50) {
      return res.sendStatus(400)
    }
    if(articleData.locationName && articleData.locationName.length > 100) {
      return res.sendStatus(400)
    }
    if(articleData.websiteLink && articleData.websiteLink.length > 150) {
      return res.sendStatus(400)
    }
    if(articleData.phone && articleData.phone.length > 25) {
      return res.sendStatus(400)
    }
    if(articleData.openTimesInfo && articleData.openTimesInfo.length > 150) {
      return res.sendStatus(400)
    }

    if(articleData.mainSliderImg === undefined || typeof articleData.mainSliderImg !== "string") {
      return res.sendStatus(400)
    }
    else {
      mainSliderImgBuffer = Buffer.from(articleData.mainSliderImg.replace(/^data:image\/[a-z]{1,5};base64,/, ""), "base64")
      if(!validateImg(mainSliderImgBuffer)) {
        return res.sendStatus(400)
      }
    }
    if(articleData.catalogCardImg === undefined || typeof articleData.catalogCardImg !== "string") {
      return res.sendStatus(400)
    }
    else {
      catalogCardImgBuffer = Buffer.from(articleData.catalogCardImg.replace(/^data:image\/[a-z]{1,5};base64,/, ""), "base64")
      if(!validateImg(mainSliderImgBuffer)) {
        return res.sendStatus(400)
      }
    }
    if(articleData.sliderImgs === undefined || !(articleData.sliderImgs instanceof Array)) {
      return res.sendStatus(400)
    }
    else {
      sliderImgsBuffers = []
      for(let i = 0; i < articleData.sliderImgs.length; i++) {
        let sliderImg = articleData.sliderImgs[i]
        if(typeof sliderImg !== "string") {
          return res.sendStatus(400)
        }
        const buffer = Buffer.from(sliderImg.replace(/^data:image\/[a-z]{1,5};base64,/, ""), "base64")
        if(!validateImg(buffer)) {
          return res.sendStatus(400)
        }
        sliderImgsBuffers.push(buffer)
      }
    }


    if(articleData.tags.length > 6 || !validateTags(articleData.tags)) {
      return res.sendStatus(400)
    }
    if(articleData.relatedArticles?.length > 3) {
      return res.sendStatus(400)
    }


    try {
      for(let i = 0; i < articleData.tags.length; i++) {
        await query(`INSERT IGNORE INTO tag (tag_value) VALUES (?)`, [articleData.tags[i]])
      }

      let mainSliderImg = await query(`INSERT INTO img (img_src) VALUES (null)`, undefined)
      mainSliderImg = mainSliderImg.insertId
      sharp(mainSliderImgBuffer)
        .resize(721, 463)
        .toFile(`${mediaPath}/${mainSliderImg}.webp`, (err, info) => {})


      let catalogCardImg = await query(
        `INSERT INTO img (img_src) VALUES (null)`, undefined
      )
      catalogCardImg = catalogCardImg.insertId

      sharp(catalogCardImgBuffer)
        .resize(551, 375)
        .toFile(`${mediaPath}/${catalogCardImg}.webp`, (err, info) => {})


      let newArticle = await query(
        `INSERT INTO article (article_id, article_name, article_description, coordinates, position_name, create_time, edit_time,
          website_link, phone, open_times_info, main_slider_card_img, author_gmail, catalog_card_img)
        VALUES (null, ?, ?, ?, ?, NOW(), null, ?, ?, ?, ?, ?, ?)`,
        [
          articleData.name, articleData.description, articleData.coordinates,
          articleData.locationName, articleData.websiteLink, articleData.phone, articleData.openTimesInfo, mainSliderImg, userId, catalogCardImg], 
      )
      let lastArticleId = newArticle.insertId

      let sliderImgs = []
      for(let i = 0; i < articleData.sliderImgs.length; i++) {
        let res = await query(`INSERT INTO img (img_src) VALUES (null)`, undefined)
        query(`INSERT INTO article_slider_imgs (relation_id, article_id, img_src) VALUES (null, ?, ?)`, [lastArticleId, res.insertId])
        sliderImgs.push(res.insertId)
      }

      sliderImgsBuffers.forEach((buf, idx) => {
        sharp(buf)
          .resize(594, 315)
          .toFile(`${mediaPath}/${sliderImgs[idx]}.webp`, (err, info) => {})
      })


      articleData.tags?.forEach(val => {
        query(`INSERT INTO article_to_tag (relation_id, article_id, tag_value) VALUES (null, ?, ?)`, [lastArticleId, val])
      })

      articleData.relatedArticles?.forEach(val => {
        query(`INSERT INTO related_articles (relation_id, article_id, related_article_id) VALUES (null, ?, ?)`, [lastArticleId, val])
      })
      return res.status(200).json({newCardId: lastArticleId})
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

app.delete("/remove_post", async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(401)
    }
    const postId = req.body.postId
    if(postId === undefined || typeof postId !== "number") {
      return res.sendStatus(400)
    }

    try {
      let sliderImgs = await query(
        `SELECT img_src FROM article_slider_imgs WHERE article_id = ?`, [postId])
      sliderImgs = sliderImgs.map(val => val.img_src)
      sliderImgs.forEach(val => {
        fs.unlink(`${mediaPath}/${val}.webp`, err => {})
        query(`DELETE FROM img WHERE img_src = ?`, [val])
      })
      let mainSliderImgAndCatalogImg = await query(
        `SELECT main_slider_card_img, catalog_card_img FROM article WHERE article_id = ?`, [postId])
      mainSliderImgAndCatalogImg = mainSliderImgAndCatalogImg[0]

      fs.unlink(`${mediaPath}/${mainSliderImgAndCatalogImg.main_slider_card_img}.webp`, err => {})
      query(`DELETE FROM img WHERE img_src = ?`, [mainSliderImgAndCatalogImg.main_slider_card_img])
      fs.unlink(`${mediaPath}/${mainSliderImgAndCatalogImg.catalog_card_img}.webp`, err => {})
      query(`DELETE FROM img WHERE img_src = ?`, [mainSliderImgAndCatalogImg.catalog_card_img])

      query(`DELETE FROM article_slider_imgs WHERE article_id = ?`, [postId])
      query(`DELETE FROM user_rating WHERE article_id = ?`, [postId])
      query(`DELETE FROM article_to_tag WHERE article_id = ?`, [postId])
      query(`DELETE FROM favourite_articles WHERE article_id = ?`, [postId])
      query(`DELETE FROM related_articles WHERE article_id = ? OR related_article_id = ?`, [postId, postId])
      query(`DELETE FROM article WHERE article_id = ?`, [postId])


      let usedTags = await query(`SELECT tag_value FROM article_to_tag GROUP BY tag_value`, undefined)
      let allTags = await query(`SELECT tag_value FROM tag`, undefined)

      usedTags = usedTags.map(val => val.tag_value)
      allTags = allTags.map(val => val.tag_value)

      let unusedTags = allTags.filter(tagFromAllTags => {
        return usedTags.find(tagFromUsedTag => tagFromUsedTag === tagFromAllTags) === undefined
      })

      unusedTags.forEach(async tag => {
        query(`DELETE FROM tag WHERE tag_value = ?`, [tag])
      })

      return res.sendStatus(200)
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})


app.put("/update_post", async (req, res) => {
  try {
    try {
      const { userId } = req.session
      if(!userId) {
        return res.sendStatus(401)
      }

      let postId = req.body.postId
      const articleData = req.body.articleData
      const updateStatements = []
      const placeholder = []

      let mainSliderImgBuffer
      let catalogCardImgBuffer
      let sliderImgsBuffers

      postId = Number.parseInt(postId)

      if(isNaN(postId) || articleData === undefined ||
        typeof articleData !== "object") {
        return res.sendStatus(400)
      }

      if(articleData.name !== undefined) {
        if(articleData.name.length === 0 || articleData.name.length > 100) {
          return res.sendStatus(400)
        }
        updateStatements.push(`article_name = ?`)
        placeholder.push(articleData.name)
      }
      if(articleData.description !== undefined) {
        if(articleData.description.length === 0 || articleData.description.length > 3000) {
          return res.sendStatus(400)
        }
        updateStatements.push(`article_description = ?`)
        placeholder.push(articleData.description)
      }
      if(articleData.coordinates !== undefined) {
        if(!validateCoordinates(articleData.coordinates || articleData.coordinates.length > 50)) {
          return res.sendStatus(400)
        }
        updateStatements.push(`coordinates = ?`)
        placeholder.push(articleData.coordinates)
      }
      if(articleData.locationName !== undefined) {
        if(articleData.locationName.length === 0 || articleData.locationName.length > 100) {
          return res.sendStatus(400)
        }
        updateStatements.push(`position_name = ?`)
        placeholder.push(articleData.locationName)
      }
      if(articleData.websiteLink !== undefined) {
        if(articleData.websiteLink.length > 150) {
          return res.sendStatus(400)
        }
        updateStatements.push(`website_link = ?`)
        placeholder.push(articleData.websiteLink)
      }
      if(articleData.phone !== undefined) {
        if(articleData.phone.length > 25) {
          return res.sendStatus(400)
        }
        updateStatements.push(`phone = ?`)
        placeholder.push(articleData.phone)
      }
      if(articleData.openTimesInfo !== undefined) {
        if(articleData.openTimesInfo.length > 150) {
          return res.sendStatus(400)
        }
        updateStatements.push(`open_times_info = ?`)
        placeholder.push(articleData.openTimesInfo)
      }

      if(articleData.tags !== undefined) {
        if(articleData.tags.length !== 0 && !validateTags(articleData.tags)) {
          return res.sendStatus(400)
        }
        if(articleData.tags.length > 6) {
          return res.sendStatus(400)
        }
      }
      if(articleData.relatedArticles?.length > 3) {
        return res.sendStatus(400)
      }


      if(articleData.mainSliderImg !== undefined) {
        if(typeof articleData.mainSliderImg !== "string") {
          return res.sendStatus(400)
        }
        mainSliderImgBuffer = Buffer.from(articleData.mainSliderImg.replace(/^data:image\/[a-z]{1,5};base64,/, ""), "base64")
        if(!validateImg(mainSliderImgBuffer)) {
          return res.sendStatus(400)
        }
      }
      if(articleData.catalogCardImg !== undefined) {
        if(typeof articleData.catalogCardImg !== "string") {
          return res.sendStatus(400)
        }
        catalogCardImgBuffer = Buffer.from(articleData.catalogCardImg.replace(/^data:image\/[a-z]{1,5};base64,/, ""), "base64")
        if(!validateImg(catalogCardImgBuffer)) {
          return res.sendStatus(400)
        }
      }
      if(articleData.sliderImgs !== undefined) {
        if(!(articleData.sliderImgs instanceof Array)) {
          return res.sendStatus(400)
        }
        sliderImgsBuffers = []
        for(let i = 0; i < articleData.sliderImgs.length; i++) {
          let sliderImg = articleData.sliderImgs[i]
          if(typeof sliderImg !== "string") {
            return res.sendStatus(400)
          }
          const buffer = Buffer.from(sliderImg.replace(/^data:image\/[a-z]{1,5};base64,/, ""), "base64")
          if(!validateImg(buffer)) {
            return res.sendStatus(400)
          }
          sliderImgsBuffers.push(buffer)
        }      
      }


      updateStatements.push(`edit_time = NOW()`)
      await query(`UPDATE article SET ${updateStatements.join(", ")} WHERE article_id = ?`, [...placeholder, postId])

      if(articleData.tags !== undefined) {
        let oldTags = await query(
          `SELECT tag_value FROM article_to_tag WHERE article_id = ?`, [postId])

        oldTags = oldTags.map(val => val.tag_value)
        oldTags.forEach(oldTag => {
          query(`DELETE FROM article_to_tag WHERE tag_value = ? AND article_id = ?`, [oldTag, postId])
        })

        let tagPromises = []
        articleData.tags.forEach(newTag => {
          let promise = query(`INSERT IGNORE INTO tag (tag_value) VALUES (?)`, [newTag])
            .then(async () => {
              await query(
                `INSERT INTO article_to_tag
                (relation_id, article_id, tag_value)
                VALUES (null, ?, ?)`, [postId, newTag])
            })
          tagPromises.push(promise)
        })
        Promise.all(tagPromises)
          .then(async () => {
            let usedTags = await query(`SELECT tag_value FROM article_to_tag GROUP BY tag_value`, undefined)
            let allTags = await query(`SELECT tag_value FROM tag`, undefined)

            usedTags = usedTags.map(val => val.tag_value)
            allTags = allTags.map(val => val.tag_value)

            let unusedTags = allTags.filter(tagFromAllTags => {
              return usedTags.find(tagFromUsedTag => tagFromUsedTag === tagFromAllTags) === undefined
            })

            unusedTags.forEach(async tag => {
              query(`DELETE FROM tag WHERE tag_value = ?`, [tag])
            })
          })
      }
      if(articleData.relatedArticles !== undefined) {
        query(`DELETE FROM related_articles WHERE article_id = ?`, [postId])
          .then(async () => {
            articleData.relatedArticles.forEach(async relatedArticleId => {
              let doesArticleExist = await query(`SELECT article_id FROM article WHERE article_id = ?`, [relatedArticleId])
              doesArticleExist = doesArticleExist.length !== 0
              if(doesArticleExist) {
                query(
                  `INSERT INTO related_articles (relation_id, article_id, related_article_id)
                  VALUES (null, ?, ?)`, [postId, relatedArticleId])
              }
            })
          })
      }


      if(mainSliderImgBuffer) {
        let currentMainSliderImg = await query(`SELECT main_slider_card_img FROM article WHERE article_id = ?`, [postId])
        currentMainSliderImg = currentMainSliderImg[0].main_slider_card_img
        fs.unlink(`${mediaPath}/${currentMainSliderImg}.webp`, err => {})
        query("DELETE FROM img WHERE img_src = ?", [currentMainSliderImg])

        let mainSliderCardImg = await query(`INSERT INTO img (img_src) VALUES (null)`, undefined)
        mainSliderCardImg = mainSliderCardImg.insertId
        sharp(mainSliderImgBuffer)
          .resize(551, 375)
          .toFile(`${mediaPath}/${mainSliderCardImg}.webp`, (err, info) => {})
        query("UPDATE article SET main_slider_card_img = ?", [mainSliderCardImg])
      }

      if(catalogCardImgBuffer) {
        let currentCatalogCardImg = await query(`SELECT catalog_card_img FROM article WHERE article_id = ?`, [postId])
        currentCatalogCardImg = currentCatalogCardImg[0].catalog_card_img
        fs.unlink(`${mediaPath}/${currentCatalogCardImg}.webp`, err => {})
        query("DELETE FROM img WHERE img_src = ?", [currentCatalogCardImg])

        let catalogCardImg = await query(`INSERT INTO img (img_src) VALUES (null)`, undefined)
        catalogCardImg = catalogCardImg.insertId
        sharp(catalogCardImgBuffer)
          .resize(551, 375)
          .toFile(`${mediaPath}/${catalogCardImg}.webp`, (err, info) => {})
        query("UPDATE article SET main_slider_card_img = ?", [catalogCardImg])
      }

      if(sliderImgsBuffers) {
        let currentSliderImgs = await query(
          `SELECT img_src FROM article_slider_imgs WHERE article_id = ?`, [postId])
        currentSliderImgs = currentSliderImgs.map(val => val.img_src)
        currentSliderImgs.forEach(val => {
          fs.unlink(`${mediaPath}/${val}.jpg`, err => {})
          query(`DELETE FROM img WHERE img_src = ?`, [val])
          query(`DELETE FROM article_slider_imgs WHERE img_src = ?`, [val])
        })
        await query(`DELETE FROM article_slider_imgs WHERE article_id = ?`, [postId])

        let sliderImgs = []
        for(let i = 0; i < articleData.sliderImgs.length; i++) {
          let res = await query(`INSERT INTO img (img_src) VALUES (null)`, undefined)
          query(`INSERT INTO article_slider_imgs (relation_id, article_id, img_src) VALUES (null, ?, ?)`, [postId, res.insertId])
          sliderImgs.push(res.insertId)
        }
        sliderImgsBuffers.forEach((buf, idx) => {
          sharp(buf)
            .resize(594, 315)
            .toFile(`${mediaPath}/${sliderImgs[idx]}.webp`, (err, info) => {})
        })
      }


      return res.sendStatus(200)
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})


app.post("/login", async (req, res) => {
  try {
    if(req.session.userId) {
      return res.sendStatus(400)
    }
    const token = req.body.token
    const payload = await validateToken(token)
    if(payload) {
      const { email } = payload
      let returnFlag = false
      query(`INSERT INTO user (gmail_address, last_time_login) VALUES(?, now()) ON DUPLICATE KEY UPDATE last_time_login = now()`, [email])
        .then(() => {
          req.session.userId = email
          req.session.save()
          returnFlag = true
          res.status(200).json({sessionExpires: new Date(req.session.cookie.expires).getTime()})
        })
        .catch(err => {
          console.log(err)
          if(returnFlag) {
            return
          }
          return res.status(200).json({sessionExpires: new Date(req.session.cookie.expires).getTime()})
        })
    }
    else {
      return res.sendStatus(401)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})


app.delete("/logout", async (req, res) => {
  try {
    const { userId } = req.session
    if(!userId) {
      return res.sendStatus(404)
    }
    else {
      req.session.destroy()
      return res.sendStatus(200)
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})


app.get("/is_logged_in", (req, res) => {
  try {
    if(req.session.userId) {
      return res.status(200).json({isLoggedIn: true, sessionExpires: new Date(req.session.cookie.expires).getTime()})
    }
    else {
      res.status(200).json({isLoggedIn: false})
    }
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})




if(!fs.existsSync(mediaPath)){
  fs.mkdirSync(mediaPath, { recursive: true });
}
app.use("/img", express.static(mediaPath))


app.use(express.static(path.resolve(__dirname, "build")))
app.get("/*", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "build", "index.html"))
  }
  catch(e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

const httpsServer = https.createServer(credentials, app)

httpsServer.listen(443, (err) => {
  if(err) {
    console.log(err)
    return
  }
  console.log('HTTPS server successfully launched')
})
