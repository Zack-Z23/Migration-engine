const express = require('express');
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    try {
        const xmlPath = path.join(__dirname, 'config.xml');
        if (!fs.existsSync(xmlPath)) {
            return res.status(404).send('Error: config.xml file missing on server.');
        }

        const xmlData = fs.readFileSync(xmlPath, 'utf-8');
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
            textNodeName: "text"
        });
        
        const jsonObj = parser.parse(xmlData);
        
        let subdomainsBlock = jsonObj?.config?.subdomains?.subdomain || [];
        if (!Array.isArray(subdomainsBlock)) subdomainsBlock = [subdomainsBlock];
        const subdomains = subdomainsBlock
            .map(s => (typeof s === 'object' ? s.text : s))
            .filter(s => s && String(s).trim().length > 0);
        
        let cookiesBlock = jsonObj?.config?.cookies?.cookie || [];
        if (!Array.isArray(cookiesBlock)) cookiesBlock = [cookiesBlock];

        const client = createClient({ url: process.env.REDIS_URL });
        await client.connect();

        const loggedKeys = [];
        await client.set('subdomains', JSON.stringify(subdomains));
        loggedKeys.push(`subdomains -> [${subdomains.length} elements mapped]`);

        for (const cookie of cookiesBlock) {
            const name = cookie.name;
            const host = cookie.host;
            const value = cookie.text || cookie["#text"] || "";

            if (name && host) {
                const redisKey = `cookie:${name}:${host}`;
                await client.set(redisKey, String(value).trim());
                loggedKeys.push(`${redisKey} -> ${String(value).trim()}`);
            }
        }

        await client.disconnect();

        let htmlOutput = `<h1>XML to Redis Migration Engine</h1>`;
        htmlOutput += `<p><strong>Developer:</strong> Zack Z. (Proprietary Evaluation Copy)</p>`;
        htmlOutput += `<h3>Exported Keys saved to Redis Successfully:</h3><ul>`;
        loggedKeys.forEach(k => { htmlOutput += `<li><code>${k}</code></li>`; });
        htmlOutput += `</ul>`;
        
        res.send(htmlOutput);

    } catch (err) {
        res.status(500).send(`Migration failed: ${err.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
