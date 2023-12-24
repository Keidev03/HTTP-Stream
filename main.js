const express = require('express');
const fs = require('fs');


const app = express();
const port = process.env.PORT || 3000;
const url = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';

// Stream video on Safari and Chrome
app.get('/video/:videoID', (req, res) => {
    const videoID = req.params.videoID;
    // Listing 3.
    const options = {};
    let start;
    let end;

    const range = req.headers.range;
    if (range) {
        const bytesPrefix = "bytes=";
        if (range.startsWith(bytesPrefix)) {
            const bytesRange = range.substring(bytesPrefix.length);
            const parts = bytesRange.split("-");
            if (parts.length === 2) {
                const rangeStart = parts[0] && parts[0].trim();
                if (rangeStart && rangeStart.length > 0) {
                    options.start = start = parseInt(rangeStart);
                }
                const rangeEnd = parts[1] && parts[1].trim();
                if (rangeEnd && rangeEnd.length > 0) {
                    options.end = end = parseInt(rangeEnd);
                }
            }
        }
    }

    res.setHeader("content-type", "video/mp4");

    const filePath = `videos/${videoID}.mp4`;
    let contentLength = fs.statSync(filePath).size;

    // Listing 4.
    if (req.method === "HEAD") {
        res.statusCode = 200;
        res.setHeader("accept-ranges", "bytes");
        res.setHeader("content-length", contentLength);
        res.end();
    }
    else {
        // Listing 5.
        let retrievedLength;
        if (start !== undefined && end !== undefined) {
            retrievedLength = (end + 1) - start;
        }
        else if (start !== undefined) {
            retrievedLength = contentLength - start;
        }
        else if (end !== undefined) {
            retrievedLength = (end + 1);
        }
        else {
            retrievedLength = contentLength;
        }

        // Listing 6.
        res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

        res.setHeader("content-length", retrievedLength);

        if (range !== undefined) {
            res.setHeader("content-range", `bytes ${start || 0}-${end || (contentLength - 1)}/${contentLength}`);
            res.setHeader("accept-ranges", "bytes");
        }

        // Listing 7.
        const fileStream = fs.createReadStream(filePath, options);
        fileStream.pipe(res);
    }
});

try {
    app.listen(port, () => {
        console.log(`App listen on\n URL: ${url}\n PORT: ${port}`);
    });
} catch (error) {
    throw error;
};