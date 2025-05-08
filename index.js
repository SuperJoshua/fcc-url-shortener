"use strict"

const body_parser = require("body-parser")
const cors = require("cors")
const dns = require("node:dns")
const express = require("express")
const fs = require("node:fs")

const app = express()

// Basic Configuration
const port = 3000
app.use(body_parser.urlencoded({extended: false}))
app.use(cors())
app.use("/public", express.static(`${process.cwd()}/public`))
app.get("/", function(req, res) {
   res.sendFile(`${process.cwd()}/views/index.html`)
})

// solution

// The previous tutorials gave the idea that MongoDB and Mongoose were critical to the completion of this project. Even the old Glitch boilerplate had these files (libraries? frameworks?) in them. This boilerplate, however, does not. I decided to use JSON. Maybe not best practice. Maybe not secure. Maybe a waste of time, seeing that these projects have already been archived on FCC. So many maybes.

app.get("/api/shorturl/:n", (req, res) => {
   // The FCC instructions here are pretty spotty. In testing values for this feature on the example site, a non-integer -- like "2b" -- caused it to never resolve. So, I'm using the same error I got for both "invalid" input and for the input not being found in the database.

   if (/^\d+$/.test(req.params.n)) {
      const short_urls = JSON.parse(fs.readFileSync("./db/short.json"))
      const long_url = short_urls[req.params.n]
      if (long_url) {res.redirect(long_url)}
      else {res.json({"error": "No short URL found for the given input"})}
   } else {
      // This actually means that the input failed the regex test.
      res.json({"error": "No short URL found for the given input"})
   }
})

app.post("/api/shorturl", (req, res) => {
   // No sanitization is done here. The user could potentially enter a well-formatted malicious URL. Security wasn't part of this exercise. This also looks really ugly.

   try {
      const posted_url = new URL(req.body.url)
      dns.lookup(posted_url.hostname, (err) => {
         if (err) {res.json({"error": "invalid url"})}
         else {
            const long_urls = JSON.parse(fs.readFileSync("./db/long.json"))
            const long_url = posted_url.href
            if (long_urls[long_url]) {res.json({"original_url": long_url, "short_url": long_urls[long_url]})}
            else {
               const short_urls = JSON.parse(fs.readFileSync("./db/short.json"))
               const short_url = Object.keys(short_urls).length.toString()
               long_urls[long_url] = short_url
               short_urls[short_url] = long_url
               console.table(long_urls)
               console.table(short_urls)
               console.log(long_url, short_url)
               fs.writeFileSync("./db/long.json", JSON.stringify(long_urls))
               fs.writeFileSync("./db/short.json", JSON.stringify(short_urls))
               res.json({"original_url": long_url, "short_url": short_url})
            }
         }
      })
   } catch (err) {res.json({"error": "invalid url"})}
})

app.listen(port, () => {
   console.log(`Listening on port ${port}`)
})
