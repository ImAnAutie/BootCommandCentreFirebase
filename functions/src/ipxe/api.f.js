const functions = require('firebase-functions');
const admin = require('firebase-admin');
try {
        admin.initializeApp();
} catch (e) {
        //yes this is meant to be empty
}

const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')({origin: true});
const app = express();
const slashes = require("connect-slashes");
const fs = require('fs');
const handlebars = require("handlebars");

app.use(cors);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}));

// Rewrite Firebase hosting requests: /api/:path => /:path
app.use((req, res, next) => {
	console.log(req.url);
    if (req.url.indexOf(`/IpxeApi/`) === 0) {
        req.url = req.url.substring("IpxeApi".length + 1);
    }
    next();
});
app.use(slashes(false));


function renderTemplate(req,res,template,optionData) {
	fs.readFile(`templates/${template}.template`, 'utf8', (err, contents) => {
		if (err) {
			return res.status(500).send("ERROR");
		}
		data={
			config: {
				host: req.headers['x-forwarded-host'],
				IpxeApiRoot: `${req.headers['x-forwarded-host']}/IpxeApi`,
				AppName: "Boot Command Centre"
			},
			optionData: optionData
		};
		compiledTemplate=handlebars.compile(contents);
		return res.status(200).send(compiledTemplate(data));
	});
}

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/init', (req, res) => {
	return renderTemplate(req,res,"init","");
});

app.get('/init/register', (req, res) => {
	optionData={
		deviceID: "0000-0000-0000-0000"
	};
	return renderTemplate(req,res,"initRegisterNotFound",optionData);
});



//This MUST be at the bottom, just above the exports line
app.use((req, res, next) => {
	return renderTemplate(req,res.status(404),"404","");
});
exports = module.exports = functions.https.onRequest(app);
