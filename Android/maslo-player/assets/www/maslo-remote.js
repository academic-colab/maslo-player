/******************************************************************************
 * maslo-remote.js
 *
 * Copyright (c) 2011-2012, Academic ADL Co-Lab, University of Wisconsin-Extension
 * http://www.academiccolab.org/
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 *****************************************************************************/


//===========================================================================
//  Content install/delete functions
//===========================================================================

function checkNetwork(){
	var networkState = navigator.network.connection.type;
	if (networkState == Connection.NONE)
		return -1;
	if (networkState == Connection.ETHERNET || networkState == Connection.WIFI)
		return 0;
	return 1;
}

function updateItem(title, origin, which, link, version, reply){
    if (which.html() == "Installed" || which.html() == "Install")
        return false;
    if (reply == null) {
        var conn = checkNetwork();
        if (conn < 0) {
            myAlert("No network connection available! Cannot update content pack at this time.");
            return false;
        }   
        var msg = "";
        if (conn > 0){
            msg = "You are on a mobile network connection. Are you sure you want to download and install updated content pack "+title+" at this time?";
        } else { 	
            msg = "This will update content pack "+title+
            ". Do you want to proceed?";                        
        }
        var funOk = function(){
            updateItem(title, origin, which, link, version, true); 
            return false;
        }
        myConfirm(msg, funOk);
        return false;
    }
    if (reply) {
    	if (inDownload){
    		myAlert("You currently have another download in progress. Please wait for the current one to complete before you start another.");
    		return false;
    	}
    	inDownload = true;
        fileDownloadMgr.updateContent(function(data) {
                                        installSucceeded(data, which, title, link, true);
                                        },
                                        function(error) { 
                                        inDownload = false;
                                        myAlert("Update failed: <br/>"+error);
                                        },
                                        origin,"download.zip", title, version);
    }
    return false;
}

function installItem(title, origin, which, link, version, reply) {
    if (which.html() == "Installed")
        return false;
    if (reply == null) {
        var conn = checkNetwork();
        if (conn < 0) {
            myAlert("No network connection available! Cannot install content pack at this time.");
            return false;
        }   
        var msg = "";
        if (conn > 0){
            msg = "You are on a mobile network connection. Are you sure you want to download and install content pack "+title+" at this time?";
        } else { 	
            msg = "This will install content pack "+title+
            ". Do you want to proceed?";                        
        }
        var funOk = function(){
            installItem(title, origin, which, link, version, true); 
            return false;
        }
        myConfirm(msg, funOk);
        return false;
    }
    if (reply) {
    	if (inDownload){
    		myAlert("You have currently a different download running. Please wait for your next download until the\
    		current one is completed.");
    		return false;
    	}
    	inDownload = true;
        fileDownloadMgr.downloadContent(function(data) {
                                        installSucceeded(data, which, title, link);
                                        },
                                        function(error) { 
                                        inDownload = false;
                                        myAlert("Download failed: <br/>"+error);
                                        },
                                        origin,"download.zip", title, version, true);
    }
    return false;
}


// retrieve content from remote
function processAjax(data, existingContent, header) {
    trClass = "dark";
    if (existingContent == null) {
        fileDownloadMgr.getContentList(
                                       function(input) {
                                       var existingContent = {};
                                       if (input != null && input != "") {
                                       var json =  jQuery.parseJSON(input);
                                       json = json["rows"];                                                                              
                                       for (var i = 0 ; i < json.length; i++){
                                       // for now it is the title and path
                                       // eventually it will be hash ID
                                       existingContent[json[i][0]] = [json[i][1],json[i][4]];  
                                       
                                       }
                                       }                                       
                                       processAjax(data, existingContent);                                      
                                       return false;
                                       }, function(data){myAlert("ERROR");});
    } else {
        var response = jQuery.parseJSON(data);
        var content = response["data"];
        if (content.length == 0 ){
            if (header != null) {
                myAlert("No global search results found for your query.");  
                return false;
            } else {
                myAlert("No content packs available for download.");
            }
        }
        
        clearAll();
        globalPackLinks = null;
        globalPack = "";
        if (header != null)
                $("#title").html(header);
        else
            $("#title").html("Store");        
        
        for (var i = 0 ; i < content.length; i++) {
            content[i].filename = content[i].filename.replace("\\/","/")
            .replace("/./","/").replace(/ /g, "\\ ");
        }
        imageMenuClick('#storeImg');
        $("#sortButton").hide();
        for (var i = 0 ; i < content.length; i++) {
        try { 
         var title = content[i].title;
         var path = content[i].filename;
         var version = content[i].version
         var previewMsg = null;
         if ("preview" in content[i])
             previewMsg = content[i].preview;
         var sections = null;
         if ("sections" in content[i])
             sections = content[i].sections;
         var row = $("<tr>",{ 
         'class': trClass
         });
         var td1 = $("<td>", {'class': "left"}); 
         var aTag = $("<a>", {'href': "#", 'html': title});
         if (!(title in existingContent)) {
         aTag.click( ( function(t, s) { 
         return function(e) {
         if (s != null) {
            var allSections = "";
            for (var j = 0 ; j < s.length; j++){
              allSections += "<b>"+s[j]+"</b><br/>";
            }
            myAlert("Sections relevant to search query:<br/><p/>"+allSections);
        } else {
         if (previewMsg == null)
            myAlert("Clicking the 'Install' button will install content pack <p/><b>"+t+"</b>");
         else 
            myAlert(previewMsg);          
        }
         return false; 
         }  
         })(title, sections, previewMsg)
         );
         } else {
         var localPath = existingContent[title][0];
         aTag.click(  (function(l, t, s) {
         return function(e) {
         $("#goBack").unbind("click");
         $("#goBack").click(function(){ createContentSelection(l,t,s); return false;});
         createContentSelection(l,t,s); 
         return false;
         }
         })(localPath, title, sections)
         );
         }
         aTag.appendTo(td1);
         td1.appendTo(row);
         var td2 = $("<td>", {'class': "delete"});
         var installDiv = $("<div>",{'class':"installRight"});
         var installButton = ""; 
         if (!(title in existingContent)) {
         installButton = $("<button>",{
         'class':"installButton", 
         'html':"Install"
         });
         installButton.click( (function(t,p,what, link, v) {
         return function(e) {
         installItem(t, p, $(what), $(link), v); 
         return false;
         }
         })(title, path, installButton, aTag, version)
         );
         } else if (existingContent[title][1] != version){
             installButton = $("<button>",{
                               'class':"updateButton", 
                               'html':"Update"
                               });
             installButton.click( (function(t,p,what, link, v) {
                                   return function(e) {
                                   updateItem(t, p, $(what), $(link), v); 
                                   return false;
                                   }
                                   })(title, path, installButton, aTag, version)
                                 );

         } else {
         installButton = $("<button>",{
         'class':"installedButton", 
         'html':"Installed"
         });  
         }
         
         installButton.appendTo(installDiv);
         installDiv.appendTo(td2);
         td2.appendTo(row);
         
         $('#contentList').append(row);
         if (trClass == "light")
         trClass = "dark";
         else 
         trClass = "light";
        } catch(err) {
            myAlert(err);
        }
      }
        
    }
    
    return false;
}

function showAvailableContent(remote, successFunction, sendData) {
    $("#editButton").hide();
    $("#sortButton").hide();
    var conn = checkNetwork();
    if (conn < 0) {
    	myAlert("No network connection available!");
    	return false;
    }
    var remServer = remoteHost + "index.php";
    var successFun = processAjax;
    
    if (remote != null)
        remServer = remote;
    if (successFunction != null) 
        successFun = successFunction; 
    if (sendData != null)
        sendData = sendData.replace(/ /g, ":::");
    $.ajax({
           async: false,
           global: false,
           url: remServer,
           dataType: "text",
           data: sendData,
           success: function (data) {
            successFun(data);                     
            return false;
           },
           error:function (xhr, ajaxOptions, thrownError){
           myAlert("Network connection currently unavailable!");
           return false;
           }
           
           });
    
    return false;
}


function doSearchGlobally(remoteData, localData){ 
    $("#search").hide();
    $("#spacerDiv").hide();
    var con = checkNetwork();
    if (con < 0) {
    	myAlert("Network connection currently unavailable! Cannot perform global search at this time.");
    	return false;
    }
    if (remoteData == null && localData == null) {
        var value = $("#searchField").val();
        if (value == "")
            return false;
        var sendTo = remoteHost + "search.php";
        var successFun = function(data){
            fileDownloadMgr.getContentList(function(input) {
                               var existingContent = {};
                                           
                               if (input != null && input != "") {
                                           var json =  jQuery.parseJSON(input);
                                           json = json["rows"];
                                           for (var i = 0 ; i < json.length; i++){
                                           // for now it is the title and path
                                           // eventually it will be hash ID
                                             existingContent[json[i][0]] = [json[i][1], json[i][4]];  
                                           
                                           }
                                           }          
                                           processAjax(data, existingContent, "Global Search Results");
                                           return false;
                                           
                                           }
                                           , error);
        }
        showAvailableContent(sendTo, successFun, value);
    }
    return false;
}




