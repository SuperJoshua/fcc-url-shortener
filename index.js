const body_parser = require("body-parser")
const cors = require("cors")
const dns = require("node:dns")
const express = require("express")
const fs = require('node:fs')
require("node:url")

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

/* The previous tutorials gave the idea that MongoDB and Mongoose were critical to the completion of this project. Even the old Glitch boilerplate had these files (libraries? frameworks?) in them. This Gitpod boilerplate, however, does not. I think Node is already a mess, and I'd rather not install more dependencies, so I'm using JSON. Maybe not a best practice. Maybe not secure. Maybe these tutorials could use better instruction, rather than osillating between hand-holding and butt-kicking. So many maybes. */

app.post("/api/shorturl", (req, res) => {
   /* URL apparently needs a full URL, but dns doesn't like having the origin tag along. I suppose this is because the hostname is the only part that has anything to do with an IP database. But it seems reasonable for a user to enter a URL without the origin, but doing so would fail the URL test. ... I'm going to try to limit my assumptions and just get the FCC tests to pass. */
   console.log("in app.post, /api/shorturl")
   try {
      const posted_url = new URL(req.body.url)
      dns.lookup(posted_url.hostname, (err, address, family) => {
         /* I was having some difficulty working out the logic, here. Couldn't figure out whether an error occured from the object returned from dns.lookup. Maybe I can't -- I don't know. This works, but feels wrong. */
         
         if (err) {
            console.log('bad hostname')
            //throw new Error("Something went wrong during DNS lookup.")
         }
      })
   
      /* Why this way? It's just what came to my skill level. I thought it'd be "faster" having the objects mirrored. Maybe it would be faster for lookup. Clearly, two files takes twice as long to load. Also, loading both files into memory, rather than querying a database, would add that much more load. This might be the worst way to solve this problem. */ 
      
      console.log('work in progress')

      /*
      long_urls = JSON.parse(fs.readFileSync("long.json"))
      if (long_urls[posted_url.href]) {
         res.json({"original_url": posted_url.href, "short_url": long_urls[posted_url.href]})
      } else {
         short_urls = JSON.parse(fs.readFileSync("short.json"))
         new_index = Object.keys(short_urls).length.toString()
         long_urls[posted_url.href] = new_index
         short_urls[new_index] = posted_url.href
         fs.writeFileSync("long.json", JSON.stringify(long_urls))
         fs.writeFileSync("short.json", JSON.stringify(short_urls))
         res.json({"original_url": posted_url.href, "short_url": new_index})
      }
      */
   } catch (error) {
      res.json({"error": "invalid url"})
   }
})

app.get("/api/shorturl/:n", (req, res) => {
   /* The FCC instructions here are pretty spotty. In testing values for this feature on the example site, a non-integer -- like "2b" -- caused it to never resolve. So, I'm using the same error I got for both "invalid" input and for the input not being found in the database. */
   console.log("in app.post, /api/shorturl/:n")
   console.log(`n: ${req.params.n} ${typeof req.params.n}`)
   if (/^\d+$/.test(req.params.n)) {
      console.log("n is positive integer")
      short_urls = JSON.parse(fs.readFileSync("short.json"))
      if (short_urls[req.params.n]) {
         console.log("short url found")
         const {url: redirect} = short_urls[req.params.n]
         res.redirect(redirect)
      } else {
         console.log("short url NOT found")
         res.json({"error": "No short URL found for the given input"})
      }
   } else {
      console.log("n is NOT positive integer")
      res.json({"error": "No short URL found for the given input"})
   }
})

app.listen(port, () => {
   console.log("Listening on port ${port}")
})
