/******************************************************************************
 * maslo.js
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
//  Content generation functions
//===========================================================================

/***
 * Recursively traverse a json object (the one describing a content pack) and
 * generate its view
 * jsonObj : the json object to traverse
 * argPath : the path to the currently active content pack
 * return: void
 */
function traverse(jsonObj, argPath, appendWhere, limitList) {
    globalPack = argPath;
    if( typeof jsonObj == "object" ) {
        var displayItems = ["text", "image", "video", "audio", "quiz"];
        if (itemInList(jsonObj.type, displayItems) && (limitList == null || itemInList(jsonObj.title, limitList))) {
            var dataPath = documentsDirPrefix+jsonObj.path;
            var aLink = $("<a/>", {
                          'href' : "#",
                          'html': jsonObj.title
                          });

            if (jsonObj.type == "quiz") {
                aLink.click(
                            function(e) {
                                if (settingsFeedback != null){
                                    globalWantFeedback = settingsFeedback;
                                    createQuiz(dataPath,  jsonObj.title);
                                    return false;
                                    
                                } else { 
                                    queryQuizFeedbackPrefs(dataPath, jsonObj.title)
                                    return false;
                                }
                            }

                );
                
            } else {
                aLink.click(
                            function(e) {
                                displayContent(dataPath, jsonObj.type, 
                                               jsonObj.title, argPath);
                                return false;
                            }
                );
            }
            var row = $("<tr/>", {
                        'class': trClass
                        });
            var column = $("<td/>", {
                           'class': "left"
                           });
            aLink.appendTo(column);
            column.appendTo(row);

            if (trClass == "dark")
                trClass = "light";
            else 
                trClass = "dark";

            $(appendWhere).append(row);
        } else {
            for (var k in jsonObj)
                traverse(jsonObj[k], argPath, appendWhere, limitList);
        }
    }
}

/***
 * Iteratively traverse a json object (the one describing a content pack) and
 * generate a list of content view links
 * jsonObj : the json object to traverse
 * argPath : the path to the currently active content pack
 * return: list of action links
 */
function traverseIterative(jsonObj, argPath, relevant){
    var itemList = [];
    for (i = 0 ; i < jsonObj.length; i++){
        
        var cur = jsonObj[i];
        var dataPath = documentsDirPrefix+cur.path;
        var aLink = $("<a/>", {
                      'href': "#",
                      'html': cur.title
                      });
        if (cur.type == "quiz") {
            aLink.click(function(path, title, currId) {
                        return function(e) {
                        if (settingsFeedback != null){
                            globalWantFeedback = settingsFeedback;
                            createQuiz(path, title);
                        } else {
                            queryQuizFeedbackPrefs(path, title, currId);
                        }
                        return false;
                        }
                        }(dataPath, cur.title, i));

        } else {
            aLink.click(function(path, type, title, aPath){
                        return function(e){
                        displayContent(path, type, title, aPath);
                        return false;
                        }
                        }(dataPath, cur.type, cur.title, argPath));
   
        }
        if (relevant == null || itemInList(cur.title, relevant)) {
            itemList.push(aLink);
        }
    }
    return itemList;
}

function evalSettings(){
    var value = $("#feedbackSelect").val();
    
    if (value == "true"){
        settingsFeedback = true;
    } else  if (value == "false") {
        settingsFeedback = false;
    } else {
        settingsFeedback = null;
    }
    value = $("#serverSelect").val();
    remoteHost = value;
    myAlert("Settings saved.");
}

function settingsScreen(){
    clearAll();
    adjustViewport(true);
    $("#title").empty();
    var titleDiv = $("<div id='headTitle'></div>");
    $("#title").append(titleDiv);
    moveTitle("#headTitle", "Settings", 0, 500, 20);
    var content = "<b>Default setting for quiz feedback:</b><p/>";
    content += "<form>";
    content += "<select id='feedbackSelect'>";
    content += "<option value='true'>feedback on</option>";
    content += "<option value='false'>feedback off</option>";
    content += "<option value='null'>check for every quiz</option>";
    content += "</select>";
    var url = remoteStartUrl + "servers.php";
    var serverData = readJSON(url);
    var options = [{"name": remoteStartName, "url": remoteStartUrl}];
    if (serverData != null){
        var json = serverData["servers"];
        for (var i in json) {
            var item = json[i];        
            options.push(item);
        }
    }
    content += "<hr/><p/>";
    content += "<b>Download server selection:</b><p/>";
    content += "<select id='serverSelect'>";
    for (var item in options){
        content += "<option value='"+options[item].url+"'>"+options[item].name+"</option>";
    }    
    content += "</select>";
    content += "<p/>";
    content += "<button class='otherButton' onClick='evalSettings();return false;'>Save</button>";
    content += "</form>";
    $("#content").append(content);
    $("#feedbackSelect").val(""+settingsFeedback);
    $("#serverSelect").val(""+remoteHost);
    
}


function searchLocally(packTitle){
    $("#spacerDiv").hide();
    var value = $("#searchField").val();
    fileDownloadMgr.searchLocally(
            function(data){
                var jData = jQuery.parseJSON(data); 
                jData = jData["rows"];                
                if (packTitle != null){
                if (jData.length == 0){
                    $("#search").hide();
                    myAlert("No local search results found for your query.");
                    return false;
                }                
                var title = jData[0][0];
                var path = jData[0][1];
                var limitList = jData[0][2];                
                createContentSelection(path, title, limitList);
                return false;
                }
                showLibrary(jData, "Local Search Results");
                return false;
            }, function(err) {
                    myAlert("err:"+err);
                    return false;
                }, value, packTitle);
    return false;
}

/***
 * Show library of installed content packs 
 * return: void
 */
function showLibrary(jsObj, headline) {
    globalPackLinks = null;
    clearAll();
    $("#editButton").show();
    $("#sortButton").show();
    trClass = "dark";
    if (jsObj == null ){    		
            fileDownloadMgr.getContentList(retrieveContentJSON, error);
    } else {      
        $("#searchButton").unbind('click');
        $("#searchButton").click(function(e) {searchLocally(); 
                                 adjustViewport(false); 
                                 return false;});
                                 
        globalPack = "";
        
        $("#title").html("Home");
        if (headline != null)
            $("#title").html(headline);
        if (jsObj.length == 0){
            if (headline != null){
                showLibrary();
                myAlert("No local search results found for your query.");                
                return false;
            }
            setTimeout(function(e){myAlert("No content packs installed at this time. Please check the 'Shop' for available content.");showHelp();return false;},  1000);
            return false;
        }                
        for (var i = 0 ; i < jsObj.length; i++) {
            var limitList = null;
            if (inBrowser) {
                var title = jsObj[i].path;
                var path = title;
            } else {
                var title = jsObj[i][0];
                var path = jsObj[i][1];
                if (jsObj[i].length > 2) {
                    limitList = jsObj[i][2];
                    if (limitList == "")
                        limitList = null;
                }
            }

            var row = $("<tr class='"+trClass+"'/>");
            var col = $("<td class='delete' onClick='showContent(this);return false;'/>");
            var div = $("<div class='delLeft'/>");
            div.append($("<img src='img/delete.png' height='25px'/>"));
            col.append(div);
            div = $("<div class='delLeft2'/>");
            div.append($("<img src='img/deleteActive.png' height='25px'/>"));
            col.append(div);
            row.append(col);
            
            var actionCol = $('<td class="left"/>');
            //var clickLink = $("<a>", {'href': "#", 'html': title});            
            var lList = "[";
            for (var j in limitList){
                    lList += "'"+limitList[j]+"',";
            }
            if (limitList != null){
                lList[lList.length-1] = "";
            }
            lList += "]";            
            if (limitList == null){
                lList = "null";
            }
            var clickLink = '<a href="#" onclick="javascript:createContentSelection(\''+path+'\',\''+title+'\', '+lList+');return false;">'+title+'</a>';
            /*clickLink.click((function(l, t, s) {
                             return function(e) {
                             $("#goBack").unbind("click");
                             $("#goBack").click(function(){ createContentSelection(l,t,s); return false;});
                             createContentSelection(l,t,s); 
                             return false;
                             }
                             })(path, title, limitList)
            );*/
            actionCol.append(clickLink);
            row.append(actionCol);

            content = "<td class='delete'>\
            <div class='delRight'>\
            <button class='deleteButton' \
            onClick='deleteItem(\""+title+"\", this);');'>Delete</button>\
            </div></td>";
            row.append(content);
            $('#contentList').append(row);
          if (trClass == "light")
              trClass = "dark";
          else 
              trClass = "light";
        }
    }
    showEdit = true;
}



/***
 * Generate content pack overview
 * return: void
 */
function createContentSelection(argPath, title, limitList){		
        clearAll();
        //$("#mini").empty();
        globalPackLinks = null;
        trClass = "dark";
        var fPath = argPath;
        if (argPath == null || argPath == "") {
            fPath = globalPack;
        }
        var jsObj= readJSON(fPath+'/manifest');        
        var result = traverse(jsObj, fPath, "#contentList", limitList);
        $("#searchButton").unbind('click');
        $("#searchButton").click(function(e) {searchLocally(title); 
                             adjustViewport(false); 
                             return false;});
        $("#title").empty();
        var titleDiv = $("<div id='headTitle'></div>");
        $("#title").append(titleDiv);
        moveTitle("#headTitle", title, 0, 500, 20);
        titleDiv.unbind("click");
        titleDiv.click(function(e) {moveTitle("#headTitle", title, 0, 500, 20);});
        //("#title").html(title);
        $("#editButton").hide();
        $("#sortButton").hide();
        globalPackLinks = traverseIterative(jsObj, argPath);
        $("#goBack").unbind("click");
        $("#goBack").click(function(){ createContentSelection(argPath,title,limitList); return false;});

}



//===========================================================================

function collectTextNodes(element, lst) {
    for (var child= element.firstChild; child!==null; child= child.nextSibling) {
        if (child.nodeType===3)
            lst.push(child);
        else if (child.nodeType===1)
            collectTextNodes(child, lst);
    }
}


function searchForText(){    
    var value = $("#searchField").val();
    if (value == ""){
        myAlert("Empty search string.");
        return true;
    }
    var data = $("#content").html();
    var tempData = data.replace(/\<span id="foundSpan"\>(.*?)\<\/span\>/g, '$1');    
    $("#content").html(tempData);
    
    var re = new RegExp(value, "gi");
    var where = document.getElementById('content');
    var texts = [];
    collectTextNodes(where, texts);
    var isModified = false;
    for (var i = 0 ; i < texts.length; i++){
        var tData = texts[i].data;
        var newData = tData.replace(re, "<span id='foundSpan'>$&</span>");        
        if (tData != newData) {
            isModified = true;
            tempData = tempData.replace(tData, newData);        
        }
    }
    $("#content").html(tempData);
    $("#search").hide();
    $("#spacerDiv").hide();
      
    if (isModified) {
        var newOffset = $("#foundSpan").offset().top;
        $('html, body').animate({
                                scrollTop: newOffset-40
                                }, 2000);
         
        return true;
        
    } else {
        myAlert("No search term occurrences found.");
        return true;
    }  
    return false;
}

function setWipe(currIndex){
    $("#goRight").unbind("click");
    $("#goRight").click(function(){
                       if (globalPackLinks == null)
                           return false;
                       if (currIndex+1 < globalPackLinks.length){
                           $('html, body').animate({ scrollTop: 0}, 0);
                           globalPackLinks[currIndex+1].click();
                       } else {
                           $('html, body').animate({ scrollTop: 0}, 0);
                           globalPackLinks[0].click();
                       }
                       return false;
                       });
    $("#goLeft").unbind("click");
    $("#goLeft").click(function(){
                        if (globalPackLinks == null)
                            return false;
                        if (currIndex-1 >= 0){
                           $('html, body').animate({ scrollTop: 0}, 0);
                           globalPackLinks[currIndex-1].click();
                        } else {
                           $('html, body').animate({ scrollTop: 0}, 0);
                           globalPackLinks[globalPackLinks.length-1].click();
                        }
                        
                        });
    $("#allDiv").unbindSwipe();
    $("#allDiv").touchSwipeRight(function(e){
                                 if (globalPackLinks == null)
                                     return false;
                                 if (currIndex-1 >= 0){
                                     $('html, body').animate({ scrollTop: 0}, 0);
                                     globalPackLinks[currIndex-1].click();
                                 } else {
                                     $('html, body').animate({ scrollTop: 0}, 0);
                                     globalPackLinks[globalPackLinks.length-1].click();
                                 }
                                 return false;
                                 });
    
    $("#allDiv").touchSwipeLeft(function(e){
                                if (globalPackLinks == null)
                                    return false;
                                if (currIndex+1 < globalPackLinks.length){
                                    $('html, body').animate({ scrollTop: 0}, 0);
                                    globalPackLinks[currIndex+1].click();
                                } else {
                                    $('html, body').animate({ scrollTop: 0}, 0);
                                    globalPackLinks[0].click();
                                }
                                return false;
                                });

}

function displayContentCore(argPath, type, jsObj, descWhere){
    
    var desc = getDescription(jsObj, type, argPath);

    
    if (type == "text") {
        var txt = readText(argPath);
        if (txt)
            txt = txt.replace(/\<a (.*?)\>(.*?)\<\/a\>/g, '$2'); 
        else 
            txt = "";
        $("#content").append(txt);
    } else if (type == "image") {
        
        
        if (globalDescLen > 256) {
            var img = $('<img src="'+argPath+'" align="right"/>');
            img.load(function(){
                     if ($(window).width() < img.width())  
                     img.width("40%");                 
                     });
            var aTag = $('<a href="#" onclick="showLargeImage(\''+argPath+'\');"></a>');
            aTag.append(img);
            $('#content').append("<p/>")
            $('#content').append(aTag);
        } else {
            var img = $('<img src="'+argPath+'"/>');
            img.load(function(){
                     if ($(window).width() < img.width())  
                     img.width("80%");                 
                     });
            var aTag = $('<a href="#" onclick="showLargeImage(\''+argPath+'\');"></a>');
            aTag.append(img);
            $('#content').append('<p/>')
            $('#content').append($('<center></center>').append(aTag));
        }
    } else if (type == "video" ){ 
		var newContent = '<video controls="controls">\
        <source src="'+documentsDirPrefix+argPath+'" type="video/mp4" /> \
        </video><p/>';
		if (device.platform == "Android") {   
        	newContent = '<p/><p/><center><button id="audioPlay" class="playButton"onClick="videoPlayer.play(\''+argPath+'\');">\u25b6</button> \
        	<br/>(click button to play video)</center><p/>';        
		}
        var result = $('#content').append(newContent);
    } else if (type == "audio") {
		var newContent = '<p/><p/><center>\
        <input id="slider" type="range" min="0" max="100" step="1" value="0"/><p/>\
        <button id="audioPlay" class="playButton" onClick="togglePlay(\''+argPath+'\');">\u25b6</button>\
        </center><p/><p/>';
		if (device.platform == "Android") {
        	newContent = '<p/><p/><center>\
        	<button id="audioPlay" class="playButton"onClick="videoPlayer.play(\''+argPath+'\');">\u25b6</button>\
        	</center><p/><p/>';
		}      
		var result = $('#content').append(newContent);

    }  
    if (desc != null){
        if (desc.length <= 256)
            desc = "<center>"+desc+"</center>";
        $("#content").append(desc);
    }
    $("#content").append("<br/><br/>");
    return false;
}

/***
 * Display non-quiz content
 * argPath : the path to the content to displayed, i.e. text/image/.. file
 * type : content type
 * pack : the current content pack
 * return: void
 */

function displayContent(argPath, type, title, pack) {
    clearAll();
    var currIndex = 0;
    var jsObject = readJSON(pack+'/manifest');
    var jsObj = null;
    for (var i = 0 ; i < jsObject.length; i++){
        if (jsObject[i].title == title){
            jsObj = jsObject[i];
            currIndex = i;
        }
        
    }
    argPath = argPath.replace(/ /g, "%20");
    if (type == "image"){
        adjustViewport(false);
    }
    setWipe(currIndex);
    displayContentCore(argPath, type, jsObj);
    $("#searchButton").unbind('click');
    $("#searchButton").click(function(e) {
                             var result = searchForText("#content");
                             adjustViewport(false);
                             return false;
                             });
    
    
    var tDiv = "titleDiv"+currIndex;
    $("#title").empty();
    var titleDiv = $("<div id='"+tDiv+"'></div>");
    $("#title").append(titleDiv);
    moveTitle("#"+tDiv, title, 0, 500, 18);
    titleDiv.unbind("click");
    titleDiv.click(function(e) {moveTitle("#"+tDiv, title, 0, 500, 18);});        
    $(".dirButton").show();
    $(".backButton").show();
    
}

/***
 * Display description of an object from root/object/description
 * jsonObj : the root json object  
 * argType : content type of the current object
 * argPath : the current object's path
 * return: void
 */
function getDescription(jsonObj, argType, argPath, location) {
    var descFile = argPath + ".dsc";
    var desc = readText(descFile);
    globalDescLen = 0;
    if (desc != null)
        globalDescLen = desc.length;
    return desc;

}


//===========================================================================
//  Audio file handling
//===========================================================================

/***
 * Toggle play/pause button
 * argPath: path to the video source
 */
function togglePlay(argPath){
    if ($("#audioPlay").html() == "\u25b6"){
        $("#audioPlay").html("❚❚");
        playStream(argPath);
    } else {
        $("#audioPlay").html("\u25b6");
        pauseStream();
    }
}

/***
 * Play audio
 * where :  path to the audio file
 * return: void
 */
function playStream(where) {
    
    $("#slider").unbind("change");
    $("#slider").change(function(){
                        var val = $("#slider").val();
                        if (globalAudio.duration){
                            var dur = Math.round(globalAudio.duration);
                            var pos = (dur/100.0) * val;
                            globalAudio.currentTime = pos;
                        }
                });

    var hasProgressed = function() {
        if (!globalAudio || !globalAudio.currentTime)
            return false;
        var cur = Math.round(globalAudio.currentTime);
        if (globalAudio.duration){
            var dur = Math.round(globalAudio.duration);
            var perc = (100.0/dur)*cur;
            $("#slider").val(perc);
        }
        return false;
    }
    var hasEnded = function(){
        togglePlay(where);
        $("#slider").val(0);
        return false;
    }
    
    try {
        if (globalAudio == null) {            
            globalAudio = new Audio(where);            
            globalAudio.id = 'masloAudioPlayer';
            globalAudio.addEventListener("ended", hasEnded); 
            globalAudio.addEventListener("timeupdate", hasProgressed);
        }
        globalAudio.play();
    } catch (e) {
        myAlert('No audio support!');
    } 
}

/***
 * Pause current audio
 * return: void
 */
function pauseStream() {
    if (globalAudio != null){
        globalAudio.pause();
    }
}

//===========================================================================
//  Quiz processing
//===========================================================================

/**
 * Create form for feedback choice (per-question feedback on/off
 * argPath: Path to quiz folder
 * argTitle: Quiz title
 * return: void
 */
function queryQuizFeedbackPrefs(argPath, argTitle, currId){
    clearAll();
    globalQuizId = 0;
    globalQuizAnswers = {};
    globalQuizCount = 0;
    globalCorrectAnswerSet = {};
    globalQuiz = null;
    globalCurrId = currId;
    resetValues();
    setWipe(globalCurrId);
    $(".dirButton").show();
    $(".backButton").show();
    
    var tDiv = "titleDiv"+globalCurrId;
    $("#title").empty();
    var titleDiv = $("<div id='"+tDiv+"'></div>");
    $("#title").append(titleDiv);
    moveTitle("#"+tDiv, argTitle, 0, 500, 22);
    titleDiv.unbind("click");
    titleDiv.click(function(e) {moveTitle("#"+tDiv, argTitle, 0, 500, 22);});
    
    var q = "Do you want feedback after every question?";
    $("<h3/>", {  html: q }).appendTo("#content");
    var inp = "<input type='radio' name='wantFeedback' value='yes'>yes</input>"; 
    inp += "&nbsp;&nbsp;&nbsp;&nbsp;<input type='radio' name='wantFeedback' value='no' \
        checked='checked'>no</input>"
    $('#answers').append(inp);

    button = $('<button class="otherButton" name="submit">start quiz</button>');
    button.click(function(e){
            checkFeedbackValues();
            createQuiz(argPath, argTitle);
            return false;
        });

    $('#answers').append('<p/>');
    $('#answers').append(button);
}

/**
 * Check selected feedback value 
 * return: boolean 
 */
function checkFeedbackValues(){
    var value = $("input[@name=wantFeedback]:checked").val();
    if (value == "yes")
        globalWantFeedback = true;
    else
        globalWantFeedback = false;
}

/***
 * Generate quiz content from current question id
 * argPath : the location of quiz content
 * return: void
 */
function createQuiz(argPath, argTitle){
    clearAll();
    if (argTitle != null) {
        var tDiv = "titleDiv"+globalCurrId;
        $("#title").empty();
        var titleDiv = $("<div id='"+tDiv+"'></div>");
        $("#title").append(titleDiv);
        moveTitle("#"+tDiv, argTitle, 0, 500, 22);
        titleDiv.unbind("click");
        titleDiv.click(function(e) {moveTitle("#"+tDiv, argTitle, 0, 500, 22);});
        
    }

    var jsonObj = readJSON(argPath+'/manifest');
    globalQuiz = jsonObj;
    globalQuizCount = jsonObj.length;
    retrieveQuestions(jsonObj, argPath);
}


/***
 * Generate quiz question for current question id
 * jsonObj : the json object for quiz description
 * argPath : the location of quiz content
 * return: void
 */
function retrieveQuestions(jsonObj, argPath) {
    document.getElementById("answers").innerHTML ='';
    document.getElementById("content").innerHTML ='';
    $("#searchButton").unbind('click');
    $("#searchButton").click(function(e) {
                             var result = searchForText("#content");
                             adjustViewport(false);
                             return false;
                             });
    var currentId = globalQuizId;
    $(".backButton").show();
    $(".dirButton").show();
    if (currentId >= globalQuizCount){
        setWipe(globalCurrId);
        $(".dirButton").show();
        $("<h3/>", {  'html': "Quiz completed." }).appendTo("#content");
        computeQuizResults(jsonObj);
        
        
    } else {
        
        var cur = jsonObj[currentId];
        globalQuiz = cur;
        var descFile = documentsDirPrefix + cur.path + ".dsc";

        var desc = readText(descFile);
        var questionText = (desc && desc != "") ? desc : cur.title;
        $("<h3/>", {'id': "headInfo" , 'html': questionText }).appendTo("#content");
        var moreInfo = "Question "+(currentId+1)+"/"+jsonObj.length+":<p/>";
        $("<div/>", {'class': "italic",  'html': moreInfo }).prependTo("#content");
        var answerPath = documentsDirPrefix + cur.path
        if (cur.attachments != null) {
            $("#content").append("<p/>");
            for (var att in cur.attachments){
                att = cur.attachments[att];
                var sourcePath = documentsDirPrefix +att.path;
                sourcePath = sourcePath.replace(/ /g, "%20");
                var ret = displayContentCore(sourcePath , att.type, att);
            }
        }
        $("#content").append("<p/>");
        retrieveAnswers( argPath, answerPath );
    }
}



/***
 * Generate quiz answers for current question id
 * jsonObj : the json object for quiz description
 * argPath : the location of quiz content
 * return: void
 */
function retrieveAnswers(globalPath, argPath){
    var answers = readJSON(argPath);
    globalQuiz.answers = answers;
    //var answers = jsonObj.answers;
    globalNumAnswers = answers.length;
    for (i = 0 ; i < globalNumAnswers; ++i){        
        var cb = "&nbsp;<input type='checkbox' id='a"+i+"' name='"+i+ 
            "' value='"+i+"'/> &nbsp; "+answers[i].text+"<p/>";
        $('#answers').append(cb);        
    }
    var cb = '<p/><p/><button class="otherButton" name="next" onClick="javascript:\
        updateQuizResults(\''+globalPath+'\');">submit</button><br/><br/>';
    $('#answers').append(cb);                
}

/***
 * Evaluate the selected answer
 * return: BOOL (correct/incorrect)
 */
function checkAnswers() {
    var result = true;
    var correctAnswers = globalQuiz.answers;
    var givenAnswers = globalQuizAnswers[globalQuizId];
    for (i = 0 ; i < correctAnswers.length; i++) {
        if (correctAnswers[i].correct == "checked") {
            if (!itemInList(i, givenAnswers)) {
                result = false;
            }
        } else  {
            if (itemInList(i, givenAnswers)) {
                result = false;
            }
        }
    }
    return result;
}

/***
 * Process last submitted answers and update global quiz variables
 * return: void
 */
function updateQuizResults(argPath) {
    $('html, body').animate({
                            scrollTop: 10
                            }, 1);
    globalQuizAnswers[globalQuizId] = [];
    $("input:checked").each(function() {
      var answerId = eval($(this).val());
      globalQuizAnswers[globalQuizId].push(answerId);
    });
    
    if (globalWantFeedback) {
        createQuiz(argPath);
        var result = checkAnswers();
        var triggered = false;
        var writeFeedback = function(which){
            $(which).empty();
            $(globalQuizAnswers[globalQuizId]).each(function() {
                if (globalQuiz.answers[this].feedback) {
                    $(which).append(globalQuiz.answers[this].feedback+"<br/>");
                }
            });
        };
        
        if (result == true) {
            writeFeedback("#feedbackCorrect");
            $("#nextCorrect").attr('onclick', '').click(function(){
                if (!triggered) {
                    triggered = true;
                    hidePopup("popupCorrect");
                    globalQuizId++;
                    createQuiz(argPath);
                }
            });
            showPopup("popupCorrect");
        } else {
            writeFeedback("#feedbackFalse");
            $("#nextFalse").attr('onclick', '').click(function(){
                if (!triggered) {
                    triggered = true;
                    hidePopup("popupFalse");
                    globalQuizId++;
                    createQuiz(argPath);
                }
            });
            showPopup("popupFalse");
        }
    } else {
        globalQuizId++;
        createQuiz(argPath);
    }
    return true;
}

/***
 * Show quiz feedback popup
 * which: positive or negative feedback popup
 */
function showPopup(which) {
    var popupStatus = 0;
    
    var divContainer = "#"+which;
    if(popupStatus==0){  
        $("#popupBackground").css({  
            "opacity": "0.7" 
        });  
        $("#popupBackground").fadeIn("slow");  
        $(divContainer).fadeIn("slow");  
        popupStatus = 1;  
    }  
}

/***
 * Hide quiz feedback popup
 * which: positive or negative feedback popup
 */
function hidePopup(which){
    var popupStatus = 1;
    if(popupStatus==1){  
        $("#popupBackground").fadeOut("slow");  
        $("#"+which).fadeOut("slow");  
        popupStatus = 0;  
    }
    return true;
}



//===========================================================================

/***
 * Compute results for just completed quiz
 * jsonObj : the json object for quiz description
 * return: void
 */
function computeQuizResults(jsonObj){ 
    var correct = 0;
    var wrong = 0; 
    var answerMap = {}
    var qmap = globalQuizAnswers;
    var summary = "<ul>";
    for (key in qmap) {
        var question = jsonObj[key];        
        var listItem = "<li><b>Question "+(eval(key)+1)+": </b> ";
        var res = qmap[key];
        var answers = readJSON(documentsDirPrefix + question.path);
        var allGood = true;
        var feedback = ""
        for (i = 0 ; i < answers.length; i++){
            var a = answers[i];
            if (a.correct == "checked" && (! itemInList(i, res))) {
                allGood = false;
            } else if (a.correct != "checked" && (itemInList(i,res))){
                allGood = false;
            }
            if (itemInList(i,res) && a.feedback) {
                feedback += a.feedback + "<br/>";
            }
        }
        if (allGood) {
            ++correct;
            answerMap[key] = 1;
            listItem += '<img src="img/check.png" \
                alt="correct answer" height="15px"/><br/>';
        } else {
            ++wrong;
            answerMap[key] = 0;
            listItem += '<img src="img/nosync.png" \
                alt="correct answer" height="15px"/><br/>';
        }   
        if (feedback != ''){
            listItem += feedback;
        }
        summary += listItem + "</li>";
    }
    summary += "</ul>";

    percent = Math.round(100 * correct / (correct + wrong));
    var results = "<p/>You scored " + percent + "%."

    var numerus1 = "question";
    if (correct != 1)
        numerus1 += "s";
    var numerus2 = "question";
    if (wrong != 1)
        numerus2 += "s";
    results += "<p/>You answered "+correct+" "+numerus1+" correct and "+wrong+" "
        +numerus2+" wrong.";
    $("#content").append(results);
    $("#content").append(summary);
    window.setTimeout('resetValues();',700);
    
}



//==============================================================================
//
//==============================================================================


