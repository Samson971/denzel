var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('../src/imdb');
const actor = 'nm0000243';

const CONNECTION_URL = "mongodb+srv://Samson971:mongodenzel@cluster0-jfjru.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "db_denzel";

var app = express();

// Setup server port
var port = process.env.PORT || 9292;

var database;
var collection;

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  
  type Query {
    populate: String
    movies(limit:Int, metascore: Int): [Movie]
    movie(id:String): Movie
    random: Movie
    post_date_review(id:String,date:String,review:String): Movie
  }
  
  type Movie {
    id: String
    link: String
    metascore: Int
    synopsis: String
    title: String
    year: Int
    review: String
    date: String
  }
`);




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

// The root provides a resolver function for each API endpoint
var root = {
  populate: async() => {
    var movies = await imdb(actor);
    var insert = collection.insert(movies,(error,result) =>{
      if(error)
      {
        return error;
      }
      return "movies inserted";
    });
  },
  movies :(args)=>{
    var limit = args.limit;
    var meta = args.metascore;

    collection.find({"metascore": {$gte: args.metascore}},
    {"limit": args.limit,"sort": [['metascore', 'desc']]
        }).toArray((error ,result)=>{
        if(error)
        {
          return error;
        }
        return result;
        });
  },
  movie : ()=>{
    //var id = args.id;
    collection.findOne({"id":id},(error,result)=>{
      if(error)
      {
        return error;
      }
      return result;
      });
  }
};





//var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');