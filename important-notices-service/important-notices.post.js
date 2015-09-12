const DEFAULT_MAX_RESULTS = 500;
const SITES_SPACE_QNAME_PATH = "/app:company_home/st:sites/";
const PUBLISHED_TAG = 'PUBLISHED';

function getResponse (responseData) {


	status.code = 500;
	status.message="Unexpected error";
	model.error = error.message;
	status.redirect=true;
	return;

}

function addTagsQuery (query, tags) {
	if (tags) {
        tagsArray = tags.split(',');
        for (tag in tagsArray) {
	        if (tag && tag.length > 0) {
	            query += ' AND TAG:' + tagsArray[tag] + ' ';
	        }
	    }
    } 
}

/**
 * Add to search library later with OR, NOT etc
 * @param {[type]} query   [description]
 * @param {[type]} aspects [description]
 */
function addAspectsQuery (query, aspects) {
	var aspectsArray = [];
	if (aspects) {
        aspectsArray = aspects.split(',');
        for (aspect in aspectsArray) {
        	if (aspect && aspect.length > 0) {
            	query += ' AND ASPECT:' + aspectsArray[aspect] + ' ';
        	}
    	}
    }
}

/**
 * Perform a lucene style query
 * @param  {[type]} siteId     [description]
 * @param  {[type]} tags       [description]
 * @param  {[type]} aspects    [description]
 * @param  {[type]} maxResults [description]
 * @return {[type]}            [description]
 */
function doSearch(siteId, tags, aspects, maxResults, locale)
{
    var tagsArray, 
        alfQuery = //'ASPECT:"exif:exif"' +
        'PATH:"' + SITES_SPACE_QNAME_PATH + '/cm:' + siteId + '/cm:documentLibrary//*" ' +
        ' AND NOT TYPE:"{http://www.alfresco.org/model/content/1.0}thumbnail"' +
        ' AND NOT TYPE:"{http://www.alfresco.org/model/content/1.0}folder"';
    // Append tags and aspects query strings if required.
    addTagsQuery(alfQuery, tags);
    addAspectQuery(alfQuery, aspects);
    
    var queryDef = {
        query: alfQuery,
        language: "lucene",
        page: {maxItems: maxResults},
        templates: []
    };

    //<DEBUG>model.data.query = alfQuery;

    return search.query(queryDef);
}


/**
 * [formatSearchData description]
 * @param  {[type]} data       [description]
 * @param  {[type]} prependStr [description]
 * @return {[type]}            [description]
 */
function formatSearchData (data, prependStr) {
	var tmp;
	// get each of the individual items 
	if (data) {
		var tmp = data.split(',');
		tmp.forEach( function (el, index, array) {
			array[index] = prependStr + '_' + array[index];
		});
		data = tmp.join(',');
	}
}

/**
 * Parses the request body and makes sure we have
 * all the required fields. also creates an array of
 * key-value pairs for the processTemplate method to consume
 *
 *
 * 
 * @param  {[type]} rawData [description]
 * @return {[type]}         [description]
 */
function getEmployeeData (rawData) {
	var employeeData, 
		searchRoles, 
		searchLifeStatus;  
	employeeData = jsonUtils.toObject(rawData);

	try {
		if (employeeData) {

			// Set the employee data args
			employeeData.templateArgs = Object.keys(employeeData);
			employeeData.getSearchTags = function () {
				


			}
		}
	} catch (ex) {
		return null;
	}

	return employeeData;
}


function main()
{
    
    var siteId = 'important-notices',//url.templateArgs.site,
        tags = args.searchtags,
        nodes, maxResults, employeeData;

	employeeData = getEmployeeData(requestbody.content)
	//TODO Set fail response.
	if (!employeeData) return;
	
	model.data = {
		employeeData : employeeData
	};
	
    // limit the results
    maxResults = (args.maxResults !== null) ? parseInt(args.maxResults) : 
        DEFAULT_MAX_RESULTS; 

    // Get notices nodes
    nodes = doSearch(siteId, tags, maxResults);

    for (nodeidx in nodes) {

    	// should process the ftl template passing employee data 
    	var node = nodes[nodeidx];
    	if (node && node.isDocument) {
	    	var processedNotice = node.processTemplate(node, templateargs);
	    	var importantNotice = {
	    		title : node.name,
	    		html : processedNotice
	    	}
	    	// Add the notice to the notices
	    	importantNotices.notices.push(importantNotice);
	    }
    }

    model.data.notices = importantNotices;
    model.data.contentsite = siteId;

}

main();