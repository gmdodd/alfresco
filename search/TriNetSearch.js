'use strict';
const DEFAULT_MAX_RESULTS = 500;
const SITES_SPACE_QNAME_PATH = '/app:company_home/st:sites/';
const PUBLISHED_TAG = 'PUBLISHED';

/**
 *
 *
 
    PATH:"/app:company_home/st:sites//cm:important-notices/cm:documentLibrary//*"
    AND
    ASPECT:"tn:document"
    AND
    @tn\:role:"HRADMIN"
    AND
    @tn\:role:"PAYROLL_ADM"
    AND
    @tn\:role:"TEST"
    AND NOT @tn\:vertical:"FIN"

 * 
 * @param  {[string]} query               [current query string]
 * @param  {[array of string]} criteriaValueArray  [e.g. ['HRADMIN', 'PAYROLL_ADM'] ]
 * @param  {[string]} type                [e.g. ASPECT, or tn\\:role]
 * @param  {[type]} operand             [AND OR NOT]
 * @return {[query]}                     [return the query object]
 */
function buildQuery (query, criteriaValueArray, type, operand) {
    for (var criteriaIdx in criteriaArray) {
        query += ' ' + operand + ' ' + type + ':' + criteriaValueArray[criteriaIdx];
    }
    return query;
}

/**
 * Adds a property to the query of the form
 * @<propertytype>:
 * @param {[type]} query        [description]
 * @param {[type]} propertyType [description]
 * @param {[type]} operand      [description]
 */
function addPropertyQuery(query, propertyType, operand, propertyValue) {
    if (query.length > 0) {
        query += ' ' + operand + ' ';
    }

    query += '@' + propertyType + ':' + propertyValue;
    return query;
}

/**
 * Add Standard Alfreco/Lucene query criteria
 * @param {[type]} query        [description]
 * @param {[type]} criteria     [description]
 * @param {[type]} alfrescoType e.g. PATH, ASPECT, etc
 * @param {[type]} operand      [description]
 */
function addAlfrescoSearchCriteria(query, alfrescoType, operand, criteriaValue) {
    if (query.length > 0) {
        query += ' ' + operand + ' ';
    }

    query += alfrescoType + ':' + criteriaValue;
    return query;
}

/**
 * Adds TriNet Custom search criteria custom property is the name of the property, 
 * currently one of 
 *     role, 
 *     permission,
 *     hrevent,
 *     location,
 *     country,
 *     employmentstatus,
 *     product,
 *     vertical,
 *     acknowledgable,
 *     priority
 * @param {[type]} query          [description]
 * @param {[type]} customProperty [description]
 * @param {[type]} operand        [description]
 * @param {[type]} value          [description]
 */
function addCustomPropertySearchCriteria(query, customDocumentProperty, operand, value) {
    return addPropertyQuery(query, 'tn:' + customProperty, operand, value);
}

/**
 * [addTagsQuery description]
 * @param {[type]} query [description]
 * @param {[type]} tags  [description]
 */
function addTagsQuery (query, tags) {
    if (tags) {
        tagsArray = tags.split(',');
        for (var tag in tagsArray) {
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
        for (var aspect in aspectsArray) {
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
    /*
    
    Search for Aspects and custom properties (multi value)
    PATH:"/app:company_home/st:sites//cm:important-notices/cm:documentLibrary//*"
    AND
    ASPECT:"tn:document"
    AND
    @tn\:role:"HRADMIN"
    AND
    @tn\:role:"PAYROLL_ADM"
    AND
    @tn\:role:"TEST"
    AND NOT @tn\:vertical:"FIN"

     */

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
    var employeeData;  
    employeeData = jsonUtils.toObject(rawData);
    try {
        if (employeeData) {
            // Set the employee data args
            employeeData.templateArgs = Object.keys(employeeData);
        }
    } catch (ex) {
        return null;
    }

    return employeeData;
