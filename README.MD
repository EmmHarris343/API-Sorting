This is ... really not great code. It's mostly just thrown together as a proof of concenpt for an example on one would do this. 

API Function: 
- Retreve, organize, sort, based on Tag(s) submitted. With optional values of sortby and direction


Required software to run:
* NodeJS, node-fetch, express
* Version node >= 16 *
* Version node-fetch >= 3.0 * -- Older verisions of node and node-fetch may support work fine with this code. I updated to node 16, to solve a problem I was facing with node-fetch

Howto install packages and run:
* npm install express node-fetch

To Launch run:
* node app.json

All notices, and errors will be logged to console, will also notify of any duplicate id's in the console log.

To access API:
* navgate to <localhost / currentip>:8000/api/posts or /api/ping (the port can be changed in app.js under port number)

Simple tests:
* /api/posts?tags=tech,design,science&sortBy=likes&direction=asc => Will return the 3 tags together, organized by likes in ascending order (Tags without results will not show errors)

* /api/posts?tags=tech,design,science => Will return the 3 tags together, organized by id in ascending order (By default)

* /api/posts => Will return an error in json format "error: "Tags parameter is required"

* /api/posts?tags=tech,design,science&sortBy=author => Will return an error in json format "error": "sortBy parameter is invalid"
    - If direction isn't asc, or desc => Will return an error in json format "error": "sortBy parameter is invalid" (If no direction provided, defautls to asc)
    - Any sortBy that isn't likes, id, popularity, reads => Will return an error in json format "error": "sortBy parameter is invalid" (If no sortBy provided, defaults to ID)

* /api/ping => Will return in json format "success": "true"
