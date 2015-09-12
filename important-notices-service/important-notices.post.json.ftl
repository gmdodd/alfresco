<#escape x as jsonUtils.encodeJSONString(x)>
 {
 "Results" : [
  
   <#list data.importantNotices.notices as notice>
    {
      "title":"${notice.title}", 
      "html":"${notice.html}"
    } <#sep>, </#sep>
   </#list>
   ]
 }
</#escape>