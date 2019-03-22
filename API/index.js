const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('../src/imdb');
const actor = 'nm0000243';

const CONNECTION_URL = "mongodb+srv://Samson971:mongodenzel@cluster0-jfjru.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "db_denzel";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Setup server port
var port = process.env.PORT || 9292;

var database;
var collection;

//app.get('/', (req, res) => res.send('Hello World with Express and Nodemon'));

// Launch app to listen to specified port
/*app.listen(port, function () {
     console.log("Running APIon port " + port);
});*/

app.listen(port, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("denzel_movies");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});


app.post("/movies/populate", async (request, response) => {
    console.log("Start populate");
    const movies = await imdb(actor);
    //movies = request.body.movies;
    collection.insertMany(movies, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});

app.get("/movies", (request, response) => {
    collection.aggregate([
        { "$match": { "metascore": { "$gte": 70 } } },
        { "$sample": { "size": 1 } }
    ]).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});


app.get("/movies/:id", (request, response) => {
    var id = request.params.id;
    collection.findOne({ "id": id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});


app.get("/movies/search", (request, response) => {
    var lim = 5;
    var meta = 0;
    if (request.query.limit)
    {
        lim = request.query.limit;
    }
    if (request.query.metascore)
    {
        metascore = request.query.metascore;
    }
    collection.aggregate([
        {$match: { "metascore": { $gte: meta } }},
        { $sample: { size: lim } }]).toArray((error,result) => {
        if(error)
        {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.post("/movies/:id", (request, response) => {
    var id = request.params.id;
    var date = request.body.date;
    var review = request.body.review;
    collection.updateOne({"id" : id},{"$set":{"date":date,"review":review}},{"upsert":true},(error,result) =>{
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});