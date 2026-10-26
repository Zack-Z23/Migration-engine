const { XMLParser } = require('fast-xml-parser');

describe("XML Parsing Assertions", () => {
    let parser;

    beforeEach(() => {
        parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
            textNodeName: "text"
        });
    });

    test("should correctly translate subdomains collections to iterable arrays", () => {
        const sampleXml = `
        <config>
            <subdomains>
                <subdomain>http://avast.com</subdomain>
            </subdomains>
        </config>`;

        const parsed = parser.parse(sampleXml);
        const subdomainsBlock = parsed.config.subdomains.subdomain;
        const subdomains = Array.isArray(subdomainsBlock) ? subdomainsBlock : [subdomainsBlock];
        
        expect(Array.isArray(subdomains)).toBe(true);
        expect(subdomains[0]).toBe("http://avast.com");
    });

    test("should correctly identify attributes on cookie elements mapping configurations", () => {
        const sampleXml = `
        <config>
            <cookies>
                <cookie name="dlp-avast" host="amazon">mmm_amz_dlp_777_ppc_m</cookie>
            </cookies>
        </config>`;

        const parsed = parser.parse(sampleXml);
        const cookieNode = parsed.config.cookies.cookie;

        expect(cookieNode.name).toBe('dlp-avast');
        expect(cookieNode.host).toBe('amazon');
        expect(cookieNode.text).toBe('mmm_amz_dlp_777_ppc_m');
    });
});
