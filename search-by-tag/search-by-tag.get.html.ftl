<p>List of photos in site: ${site}</p>
<table border="3">
  <tr><th>File name</th><th>Properties</th><th>Manufacturer</th><th>dateTimeOriginal</th><th>focalLength</th></tr>

  <#assign manufacturer = "{http://www.alfresco.org/model/exif/1.0}manufacturer"/>  
  <#assign dateTimeOriginal = "{http://www.alfresco.org/model/exif/1.0}dateTimeOriginal"/>  
  <#assign focalLength = "{http://www.alfresco.org/model/exif/1.0}focalLength"/>  

  <#list nodes as node>
    <tr>
      <td>${node.name}</td>
      <td>
        <#assign keys = node.properties?keys/>
        <#list keys as k>
          ${k}
        </#list>
     </td>
      <td>
        <#if node.properties[manufacturer]?exists>
          ${node.properties[manufacturer]}
        </#if>
      </td>
      <td>
        <#if node.properties[dateTimeOriginal]?exists>
          ${node.properties[dateTimeOriginal]?date}
        </#if>
      </td>
      <td>
        <#if node.properties[focalLength]?exists>
          ${node.properties[focalLength]}
        </#if>
      </td>
    </tr>
  </#list>
</table>