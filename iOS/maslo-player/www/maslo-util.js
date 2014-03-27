/******************************************************************************
 * maslo-util.js
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
//  Utility functions
//===========================================================================

/***
 * Read a json file, return the resulting object
 * argPath: the path
 * return: object
 */
function readJSON(argPath) {
    var fPath = argPath;
    if (argPath == null) {
        fPath = globalPack+"/manifest"; 
    }
    var json = null;
    $.ajax({
           'async': false,
           'global': false,
           'url': fPath,
           'dataType': "json",
           'timeout':2000,
           'success': function (data) {
           json = data;
           },
           error: function (data) {
           json = null;
           }
           });
    return json;
    
}

/***
 * Read a text file, return the resulting object
 * argPath: the 
 * return: object
 */
function readText(argPath) {
    var fPath = argPath;
    var json = null;
    $.ajax({
           'async': false,
           'global': false,
           'url': fPath,
           'dataType': "text",           
           'success': function (data) {
           json = data;
           },
           error: function (data) {
           json = null;
           }
           });
    return json;
    
}

/** Show help content
 */
function showHelp(){
    clearAll();
    $("#searchButton").unbind('click');
    $("#searchButton").click(function(e) {
                             var result = searchForText("#content");
                             adjustViewport(false);
                             return false;
                             });
    var data = readText("help.html");
    $("#title").html("Help");
    $("#content").html(data);
    return false;
}

/***
 * Make a container visible by fading it in slowly
 * what: container id
 */
function makeVisible(what) {
    if (!$(what).is(":visible"))
        $(what).fadeIn("slow");
    else
        $(what).fadeOut("slow");
}


/***
 * Check whether an item occurs in a list, returns boolean
 * item : the item to check for
 * l : the list
 * return: boolean
 */
function itemInList(item, l) {
    for (cnt = 0; cnt < l.length; cnt++) {
        if (l[cnt] == item) {
            return true;
        }
    }
    return false;
}


/**
 *  Adjust app viewport
 *  wantLock: bool, if true, user scaling will be disabled.
 */
function adjustViewport(wantLock){
    var viewportmeta = document.querySelector('meta[name="viewport"]');
    if (viewportmeta) {
        if (!wantLock)
           viewportmeta.content =  "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=1";
        else
            viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
        
    }

}

/***
 * Move the title in the title bar if title is too large
 * target: the target id
 * message: the actual title
 * start: character in which position is the first displayed
 * interval: how quick should title move
 * numChar: number of characters displayed
 */
function moveTitle(target, message, start, interval, numChar) {
    if ($(target).length <= 0)
        return false;
                     
    if (start <= message.length-numChar) {
        if (start == 0)
            message = message + "   ";
        $(target).html(message.substr(start, numChar));
        setTimeout(function () { moveTitle(target, message, start+1, interval, numChar); }, interval);
    } else {
        if (numChar >= message.length)
            $(target).html(message);  
        else
            $(target).html(message.substr(0, numChar-3)+"...");                   
    }
    return false;
}

/***
 * Display full-screen image
 * imgPath: the path to the image file
 */
function showLargeImage(imgPath){
	var tag = '<center><img src="'+imgPath+'" width="90%"/></center>';
	$("#imageContainer").empty();
	$("#imageContainer").append(tag);
	$("#imageContainer").unbind("click");
	$("#imageContainer").click(function(){hidePopup("imageContainer");});
	
	showPopup("imageContainer");
}

/***
 * Clear all generated HTML content
 * return: void
 */
function clearAll(){
    showEdit = false;
	$("#contentListCat").empty();
	$("#contentListCat").hide();
    $("#contentList").empty();
    $("#content").empty();
    $("#answers").empty();
    adjustViewport(false);
    if (globalAudio != null)
        globalAudio.pause();
    globalAudio = null;
    globalDescLen = 0;
    $("#search").hide();
    $("#sortButton").html("Sort");
    $("#allDiv").unbind('click');
    adjustHeaderAndFooter(0);
    $("#searchField").unbind('click');
    $("#editBar").hide();
    $("#editButton").html("Edit");
    $("#editButton").hide();
    $("#sortButton").hide();

    $("#spacerDiv").hide();
    $("#allDiv").unbindSwipe();

    $(".dirButton").hide();
    $(".backButton").hide();
    
    $("#navbar").hide();
	$("#bodyDiv").css({'top':'45px'});
	$("#editBar").hide();
    $('html, body').animate({ scrollTop: 0}, 0);
}

/**
 * Reset global quiz variables
 * return: void
 */
function resetValues(){
    globalQuizId = 0;
    globalQuizCount = 0;
    globalQuizAnswers = {};
}

/***
 * As the name indicates - this calls everything necessary to initialize
 * the app
 */
function init() {
    clearAll();
    if (typeof(Cordova) != 'undefined') {
        $('body > *').css({minHeight: '460px !important'});
    }
    $("#sortButton").click(function(e) {sort(true, this, "A-Z"); return false;});
    $("#searchButton").click(function(e) {
                             var value = $("#searchField").val();
                             fileDownloadMgr.searchLocally(
                                function(data){
                                    var jData = jQuery.parseJSON(data); 
                                    jData = jData["rows"];
                                    showLibrary(jData, "Local Search Results");
                                    $(".left").each(function(index){
                                        $(this).click(function(e){
                                          showResultMenu(e, $(this), false, 
                                            jData[index][1], jData[index][2]);
                                          return false;
                                         });          
                                    });
                                    return false;
                                }, function(err) {
                                    alert("err:"+err);
                                    return false;
                                }, value);
                                return false;
                             });
    
}

/***
 * Display an error message
 * err: the error
 */
function error(err) {
    alert("An unspecified error occurred: "+err);
    alert(err.error());
}

/***
 * Retrieve and show library content 
 * input: text data resembling JSON
 */
function retrieveContentJSON(input) {
    var data = jQuery.parseJSON(input);
    rows = data["rows"];
    showLibrary(rows);
}

/***
 * Display a message in popup window
 * msg: the message to display
 */
function myAlert(msg){    
    $("#messageContent").html(msg);
	$("#triggerAlert").click();
    return false;
}

/***
 * Display a confirmation in popup window
 * msg: the message to display
 * funOk: the function to execute if user clicks OK.
 */
function myConfirm(msg, funOk){
    $("#confMessage").html(msg);
    $("#confirmDialog").show();
    $("#confirmOk").unbind('click');
    $("#confirmOk").click(function(e) {
                          $("#confirmDialog").hide();
                          funOk();
                          return false;
                          });
	$("#triggerConfirm").click();
    return false;
}

/***
 * Set search function to "global"
 */
function setSearch(){
    var searchFunction = function(e) {
        doSearchGlobally(); 
        return false;
    }
    $("#searchButton").unbind('click');
    $("#searchForm").unbind('submit');
    $("#searchButton").click(searchFunction);
    $("#searchForm").bind('submit', searchFunction);
    return false;
}

/***
 * Change footer menu to main menu
 */
function showMainMenu(){
    if (!footerIsAlt){
        return false;
    }
    if (device.platform == "Android"){
        $("#footerAlt").hide();
        $("#footer").fadeIn("slow");
        footerIsAlt = false;
        return false;
    }
    var iw = "+="+window.innerWidth+"px";
    $("#footer").offset({left:-window.innerWidth});
    $("#footerAlt").animate({"left":iw},750);
    $("#footer").animate({"left":iw},750);
    $("#footer").show();
    $("#footerAlt").css({"z-index":1});
    $("#footer").css({"z-index":2});
    footerIsAlt = false;
    return false;
}

/***
 * Change footer menu to alternate menu
 */
function showAltMenu(){
    if (footerIsAlt){
        return false;
    }
    if (device.platform == "Android"){
        $("#footer").hide();
        $("#footerAlt").fadeIn("slow");
        footerIsAlt = true;
        return false;
    }
    var iw = "-="+window.innerWidth+"px";
    $("#footer").animate({"left":iw},750);
    $("#footerAlt").offset({ left: window.innerWidth});    
    $("#footerAlt").animate({"left":iw},750);
    $("#footerAlt").show();
    $("#footer").css({"z-index":1});
    $("#footerAlt").css({"z-index":2});
    footerIsAlt = true;
    return false;
}

function makeSane(arg){
    var result = arg.replace(/"/g, '\"');
    result = result.replace(/'/g, "\'");
    return result;
}

function makeURLSane(arg){
    var result = arg.replace(/\?/g, "%3F");
    result = result.replace(/"/g, '%22');
    result = result.replace(/'/g, '%27');
    return result;
}


/* A really basic email address validator.  It is not meant to check for RFC22 compliant emails,
   just to check for the most basic of errors.  It's a bad idea to be overly aggressive validating
   emails because we might accidently exclude valid ones.
*/
function validateEmailAddress(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

////////////////////////////////
// TinCan related functions
////////////////////////////////
// Create a JSON object in Tin Can format
function makeTinCanEvent(actor, verb, object) {
    timestamp = Math.round(+new Date()/1000);
    var event = {
        "actor":  {
            "objectType": "Agent",
            "name": "Agent at instance "+actor,
            "mbox": actor
        },
        "verb":   verb,
        "object": object,
        "timestamp": timestamp
    };
    return event;
}

function getURLParameter(name) {
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(document.location.search)||[,null])[1]);
}
                            

function setServer(s){
    remoteHost = s;
    return false;
}                            

                            
