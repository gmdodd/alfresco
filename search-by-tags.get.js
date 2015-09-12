const DEFAULT_MAX_RESULTS = 500;
const SITES_SPACE_QNAME_PATH = "/app:company_home/st:sites/";

function doSearch(siteId, tags, maxResults)
{
    var tagsArray, 
        alfQuery = //'ASPECT:"exif:exif"' +
        'PATH:"' + SITES_SPACE_QNAME_PATH + '/cm:' + siteId +
        '/cm:documentLibrary//*" '+
        ' AND NOT TYPE:"{http://www.alfresco.org/model/content/1.0}thumbnail"';
        // + ' AND NOT TYPE:"{http://www.alfresco.org/model/content/1.0}folder" ';

    if (tags) {
        tagsArray = tags.split(',');

    } else {
        tagsArray = [''];
    }
    
    for (tag in tagsArray) {
        if (tag && tag.length > 0) {
            alfQuery += ' AND TAG:' + tagsArray[tag] + ' ';
        }
    }

    var queryDef = {
        query: alfQuery,
        language: "lucene",
        page: {maxItems: maxResults},
        templates: []
    };

    model.data.query = alfQuery;

    return search.query(queryDef);
}

function main()
{
    var siteId = url.templateArgs.site,
        tags = args.searchtags;

    model.data = {};
    model.data.tags = tags || "";

    
    var maxResults = (args.maxResults !== null) ? parseInt(args.maxResults) : 
        DEFAULT_MAX_RESULTS; 

    var nodes = doSearch(siteId, tags, maxResults);

    model.data.items = nodes;
    model.nodes = nodes;
    model.site = siteId;

}

main();