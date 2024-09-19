import express from 'express';
import mongoose from 'mongoose';
import bodyparser from 'body-parser';
import ejs from 'ejs';
import _ from 'lodash';

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/wikiDB');

const {Schema} = mongoose;

const articleSchema = new Schema ({
    title: 'String',
    content: 'String'
});

const Article = mongoose.model('Article', articleSchema);


///////////////////////////////////////////////////////Requests targeting all articles//////////////////////////////////////////
app.route('/articles')

.get((req, res) => {
    Article.find({}).then( (foundArticles) => {
        if (foundArticles) {
            res.send(foundArticles);
        } else {
            res.send('ERROR: There was an error fetching the articles.');
        }
    }); 
})

.post((req, res) => {
    const userTitle = _.startCase(req.body.title);
    const userContent = req.body.content;
    const userArticle = new Article ({
        title: userTitle,
        content: userContent,
    });
    userArticle.save().then((article) => {
        if (article.title === userTitle) {
            res.send(`New article titled, ${userTitle}, has been saved successfully!`);
        } else {
            res.send('error');
        }
    });
})

.delete((req, res) => {
    Article.deleteMany({}).then((article) => {
        if (article.deletedCount > 0) {
            res.send(`Successfully deleted all the articles!`);
        } else {
            res.send('The delete operation FAILED: There are zero articles to delete!');
        }
    });
});


///////////////////////////////////////////////////Requests targeting a specific article//////////////////////////////////////

app.route("/articles/:articleTitle")
.get((req, res) => {
    const articleTitle = _.startCase(req.params.articleTitle);
    Article.findOne({ title: articleTitle }).then((foundArticle) => {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send(`No article matching the title, '${articleTitle}', was found!`);
      }
    });
})
  
.put((req, res) => {
    const articleTitle = _.startCase(req.params.articleTitle);
    Article.replaceOne(
        { title: articleTitle },
        { title: _.startCase(req.body.title), content: req.body.content },
    ).then((article) => {
        if (article.modifiedCount === 1) {
            res.send("PUT Update: Successfully executed!");
        } else {
            res.send(`No article matching the title, '${articleTitle}', was found!`);
        }
    });
})

.patch((req, res) => {
    const articleTitle = _.startCase(req.params.articleTitle);
    Article.updateOne(
        { title: articleTitle }, 
        { title: req.body.title, content: req.body.content }
    ).then((article) => {
        if (article.modifiedCount === 1) {
            res.send('PATCH Update: Successfully executed!');
        } else {
            res.send(`No article matching the title, '${articleTitle}', was found!`);
        }
    });
})

.delete((req, res) => {
    const articleTitle = _.startCase(req.params.articleTitle);
    Article.deleteOne({title: articleTitle}).then( (article) => {
        if (article.deletedCount === 1) {
            res.send("The DELETE operation completed successfully");
        } else {
            res.send(`DELETE Failed: The article, ${articleTitle}, wasn't found.`);
        }
    });
});

app.listen(port, () => {
  console.log(`Listening on => 127.0.0.1:${port}/`);
});

// articles.forEach((article) => {   

// });


