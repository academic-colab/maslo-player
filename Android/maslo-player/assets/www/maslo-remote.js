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
/*
 *  @author Cathrin Weiss (cathrin.weiss@uwex.edu)
 */

//===========================================================================
//  Content install/delete functions
//===========================================================================

/***
 * Check network status
 * return: -1: No network
 *         0 : WIFI
 *         1 : Mobile network
 */
function checkNetwork(){
	var networkState = navigator.connection.type;
	if (networkState == Connection.NONE)
		return -1;
	if (networkState == Connection.ETHERNET || networkState == Connection.WIFI)
		return 0;
	return 1;
}

/***
 * Update installed content pack to most recent version
 */
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
			$("#popupBackground").css({
				"opacity": "0.7"
			});
			$("#popupBackground").show();
			$( ".ui-loader" ).loader( "option", "textVisible", "true" );
			$.mobile.loading( "show", {
				text: "Downloading and updating content pack ...",
				textVisible: true
			});
            updateItem(title, origin, which, link, version, true); 
            return false;
        }
        myConfirm(msg, funOk);
        return false;
    }
    if (reply) {
		if (inDownload) {
			myAlert("You currently have another download in progress. Please wait for the current one to complete before you start another.");
			return false;
		}
		inDownload = true;
        fileDownloadMgr.updateContent(function(data) {
										$("#popupBackground").hide();
										$.mobile.loading( "hide");
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

/***
 * Install content pack
 */
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
			$("#popupBackground").css({
				"opacity": "0.7"
			});
			$("#popupBackground").show();
			$( ".ui-loader" ).loader( "option", "textVisible", "true" );
			$.mobile.loading( "show", {
				text: "Downloading and installing content pack ...",
				textVisible: true
			});
            installItem(title, origin, which, link, version, true); 
            return false;
        }
        myConfirm(msg, funOk);
        return false;
    }
    if (reply) {
		if (inDownload) {
			myAlert("You currently have another download in progress. Please wait for the current one to complete before you start another.");
			return false;
		}
		inDownload = true;
        fileDownloadMgr.downloadContent(function(data) {
										$("#popupBackground").hide();
										$.mobile.loading( "hide");
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
            $("#title").html("All Content");
        
		var instances = null;
		if (content.length > 0) {
			if ("content" in content[0]){
				instances = content;
			} else {
				instances = [{"name": "Store", "content":content}];
			}
		}
		
		for (var inum = 0 ; inum < instances.length; inum++) {
			var nDiv = $("<div/>");
			$("#contentListCat").append(nDiv);
			content = instances[inum].content;
			var heading = "<h4>"+instances[inum].name+"</h4>";		
			var ul = $("<ul>", {'data-role':"listview"});
			var uldiv = $("<div>", {'data-role':'collapsible','data-collapsed':'false', 'data-theme':'a', 'data-content-theme':'c','data-inset':'false' });
			uldiv.append(heading);	
			uldiv.append(ul);
			nDiv.append(uldiv);
			nDiv.trigger('create');	
	        for (var i = 0 ; i < content.length; i++) {
	            content[i].filename = content[i].filename.replace("\\/","/")
	            .replace("/./","/").replace(/ /g, "\\ ");
	        }
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
	         var row = $("<li>",{'data-icon':"false"});
	         var aTag = $("<a>", {'href': "#"});
	         var aText = $("<div>", {'class':"listViewText", 'html':title});
	            aTag.append(aText);
	         if (!(title in existingContent)) {
	         aTag.click( ( function(t, s,p) { 
	         return function(e) {
	         if (s != null) {
	            var allSections = "";
	            for (var j = 0 ; j < s.length; j++){
	              allSections += "<b>"+s[j]+"</b><br/>";
	            }
	            myAlert("Sections relevant to search query:<br/><p/>"+allSections);
	        } else {
	         if (p == null)
	            myAlert("Clicking the 'Install' button will install content pack <p/><b>"+t+"</b>");
	         else 
	            myAlert(p);          
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
	         aTag.appendTo(row);
	         var td2 = $("<td>", {'class': "delete"});
	         var installDiv = $("<div>",{'class':"listViewCell"});
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
	         } else if (version && existingContent[title][1] != version){
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
	         var fSet = $("<fieldset>", {"data-role":"fieldcontain"});
	         installButton.appendTo(fSet);
	         fSet.appendTo(installDiv);
	         installDiv.appendTo(row);
			 ul.append(row);		

	         if (trClass == "light")
	         trClass = "dark";
	         else 
	         trClass = "light";
	        } catch(err) {
	            myAlert(err);
	        }
	        }
			ul.listview('refresh');
			}
     }
	$("#bodyDiv").css({'top':'25px'});
	$("#contentListCat").show();
    return false;
}

/***
 * Retrieve and show all available content from remote
 */
function showAvailableContent(remote, successFunction, sendData) {
    $("#editButton").hide();
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
           },
           error:function (xhr, ajaxOptions, thrownError){
           myAlert("Network connection currently unavailable!");
           return false;
           }
           
           });
    return false;
}

/***
 * Perform global search
 */ 
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




