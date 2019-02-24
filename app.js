const httpIncoming = require('http');
const { URL } = require('url');

const firstArg = process.argv.slice(2)[0];
const secondArg = process.argv.slice(2)[1];
const thirdArg = process.argv.slice(2)[2];
const fourthArg = process.argv.slice(2)[3];
const fifthArg = process.argv.slice(2)[4];
const externalUrlEntry = process.env.EXTERNAL_URL || firstArg || 'http://www.example.com';
const internalUrlEntry = process.env.INTERNAL_URL || secondArg || 'http://localhost';
const networkTestUrlEntry = process.env.NETWORK_TEST_URL || thirdArg || 'http://localhost/test.gif';
const port = process.env.port || process.env.PORT || fourthArg || 80;
const appendSource = fifthArg || false;

// Not try catch in place, if send invalid URL will terminate with error
const externalUrl = new URL(externalUrlEntry);
const internalUrl = new URL(internalUrlEntry);
const networkTestUrl = new URL(networkTestUrlEntry);

console.log(`When on internal network, forwarding requests to: ${internalUrl}`);
console.log(`When on internet, forwarding requests to: ${externalUrl}`);
console.log(`Using this image endpoint to check the internal network: ${networkTestUrl}`);
console.log(`Serving on port: ${port}`);
if (appendSource) console.log(`Appending source={source} at the end of the request`);

httpIncoming.createServer((request, response) => {
    const { url } = request;
    let body = [];
    request.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();

        // console.log('*** url: ' + url);
        // console.log('----------------'); 
    
      response.on('error', (err) => {
        console.error(err);
      });
  
      // Build Urls
      const externalRedirectUrl = new URL(url, externalUrl);
      if (appendSource) externalRedirectUrl.searchParams.append('source','external');

      const internalRedirectUrl = new URL(url, internalUrl);
      if (appendSource) internalRedirectUrl.searchParams.append('source','internal');

      // Response
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(`<!DOCTYPE html>`);
      response.write(`<html><head><meta charset="UTF-8">`);
      response.write(`<title>Network Detection Redirector</title>`);
      response.write(`<script type="text/javascript">`);
      response.write(`var detectionCounter = 0;`);
      response.write(`var detectionTimeOut = 5;`);
      response.write(`var detectionImage = "${networkTestUrl}?" + (new Date()).getTime();`);
      response.write(`var detectionElement = document.createElement("img");`);
      response.write(`detectionElement.src = detectionImage;`);
      response.write(`function detectIntranet() {`);
      response.write(`    detectionCounter = detectionCounter + 1;`);
      response.write(`    if (detectionElement.complete) {`);
      response.write(`        if (detectionElement.width > 0 && detectionElement.height > 0) {`);
      response.write(`            window.location = "${internalRedirectUrl}";`);
      response.write(`        } else {`);
      response.write(`            window.location = "${externalRedirectUrl}";`);
      response.write(`        }`);
      response.write(`    } else {`);
      response.write(`        if (detectionCounter < detectionTimeOut) {`);
      response.write(`            setTimeout("detectIntranet()", 1000);`);
      response.write(`        } else {`);
      response.write(`            alert("Attempt " + detectionCounter + ": Gave up trying to load: " + detectionImage);`);
      response.write(`        }`);
      response.write(`    }`);
      response.write(`}`);
      response.write(`window.onload = function () {detectIntranet();}`);
      response.write(`</script>`);
      response.write(`</head><body></body></html>`);

      response.end();
      // END OF Response

  
    });
  }).listen(port);