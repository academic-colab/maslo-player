/******************************************************************************
 * maslo-menu.js
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
//  Navigation menu
//===========================================================================

/***
 * Show/hide footer menu
 * hide: BOOL (hide if TRUE)
 */
function showFooter( hide) {
    if (hide) {
        $("#footer").fadeOut("slow");
        $("#editBar").fadeOut("slow");
        footerTimeout = null;
    } else {
        if (footerTimeout != null)
            clearTimeout(footerTimeout);
        $("#footer").fadeIn("slow");
        if (showEdit) {
            $("#editBar").fadeIn("slow");
        }
        footerTimeout = setTimeout("showFooter(true)", 7000);
        
    }
}

/***
 * Show mini menu
 * e: event
 * what: the element which shows/hides the menu onClick
 * hide: BOOL (hide menu if TRUE)
 */
function showMenu(e, what, hide) {
   
    if (globalPack == null || globalPack == "") {
        showLibrary();
        return false;
    }
    
    if (!hide) {
        var jsObj= readJSON(globalPack+'/manifest');
        if (jsObj == null) {
            showLibrary();
            return false;
        }
        $("#menu").remove();
        $(what).unbind('click');    
        $("#footer").append('<div id="menu"><table id="menuTable">\
                            </table></div>');
        
        var itemList = traverseIterative(jsObj, globalPack);
        for (i = 0 ; i < itemList.length; i++) {
            var data = $("<tr/>");
            data.append($("<td>/").append(itemList[i]));
            $("#menuTable").append(data);
        }
        //Set the X and Y axis of the menu
        $('#menu').css('bottom', e.pageY - 400 );
        $('#menu').css('left', e.pageX - 20 );
        $('#menu').click(function() {
                         $("#menu").remove();
                         menuShown  = false;
                         } );
        //Show the menu with fadeIn effect
        $('#menu').fadeIn('500');
        $('#menu').fadeTo('10',0.8);
        menuShown = true;
        $("#menu").click(function() {
                         showMenu(e, what, true); 
                         //footerTimeout = setTimeout("showFooter(true)", 5000);
                         return false;
                         });
        $(what).click(function() {
                      showMenu(e, what, true); 
                      showLibrary(); 
                      return false;});
    } else {
        $("#menu").remove();
        $(what).unbind('click');
        menuShown = false;
        $(what).click(function() {
                      showMenu(e, what, false); 
                      return false;
                      });
    }
    return false;
}

/***
 * Show mini menu
 * e: event
 * what: the element which shows/hides the menu onClick
 * hide: BOOL (hide menu if TRUE)
 */
function showResultMenu(e, what, hide, pack, relevant) {
    if (pack != null) {
        globalPack = pack;
    }
    if (globalPack == null || globalPack == "") {
        showLibrary();
        return false;
    }
    
    if (!hide) {
        var jsObj= readJSON(globalPack+'/manifest');
        if (jsObj == null) {
            showLibrary();
            return false;
        }
        $("#menu").remove();
        $(what).unbind('click');    
        $("#content").append('<div id="menu"><table id="menuTable">\
                            </table></div>');
        
        var itemList = traverseIterative(jsObj, globalPack, relevant);
        for (i = 0 ; i < itemList.length; i++) {
            var data = $("<tr/>");
            data.append($("<td>/").append(itemList[i]));
            $("#menuTable").append(data);
        }
        //Set the X and Y axis of the menu
        alert("coords: " + e.pageX + "," + e.pageY);

        $('#menu').css('top', e.pageY - 80 );
        $('#menu').css('left', e.pageX - 60 );
        $('#menu').click(function() {
                         $("#menu").remove();
                         
                         } );
        //Show the menu with fadeIn effect
        $('#menu').fadeIn('500');
        $('#menu').fadeTo('10',0.8);
        $("#menu").click(function() {
                         showResultMenu(e, what, true, pack); 
                         return false;
                         });
        $(what).click(function() {
                      showResultMenu(e, what, true, pack); 
                      return false;});
    } else {
        $("#menu").remove();
        $(what).unbind('click');
        $(what).click(function() {
                      showResultMenu(e, what, false, pack); 
                      return false;
                      });
    }
    return false;
}

/***
 * Sort content table - currently alphabetically only
 * up: boolean, if set to true, sort is in ascending order
 * label: label of object invoking the onClick event
 * content: text of the sort button
 */
function sort(up, label, content) {  
    var which = $(label); 
    var rows = $("tr", $("#contentList"));
    var collection = {};
    var titles = [];
    var clickEvents = {};
    if (rows.length == 0)
        return false;
    
    for (var i = 0 ; i < rows.length; i++){
        var title = $("a", $(rows[i])).html();
        titles.push(title.toLowerCase());
        collection[title.toLowerCase()] = $(rows[i]).html();
    }
    for (var i = 0 ; i < titles.length-1; i++) {
        var cur = titles[i];
        var smallest = i;
        for (var j = i+1 ; j < titles.length; j++){
            if (up) {
                if (titles[j] < titles[smallest])
                    smallest = j;  
            } else {
                if (titles[j] > titles[smallest])
                    smallest = j; 
            }
        }
        titles[i] = titles[smallest];
        titles[smallest] = cur;
    }
    
    for (var i = 0 ; i < rows.length; i++){ 
        $(rows[i]).html(collection[titles[i]]);
    }
    if (up)
        which.html(content+" &uarr;");
    else
        which.html(content+" &darr;");
    which.unbind('click');
    
    which.click(function(e) {sort(!up,label,content); return false;});
    return false;
    
}

/***
 * Show library of installed content packs 
 * return: void
 */
function showLibrary(jsObj) {
    
    trClass = "dark";
    if (jsObj == null && !inBrowser){
        return false;
    } else {
        clearAll();
        globalPack = "";
        
        if (inBrowser) {
            jsObj= readJSON('index.json');
        }
        $("#title").html("Home");
        for (var i = 0 ; i < jsObj.length; i++) {
            if (inBrowser) {
                var title = jsObj[i].path;
                var path = title;
            } else {
                var title = jsObj[i][0];
                var path = jsObj[i][1];
            }
            var content = "<tr class='"+trClass+"'><td class='delete' \
            onClick='showContent(this);'> \
            <div class='delLeft'>\
            <img src='img/delete.png' height='15%'/></div>\
            <div class='delLeft2'>\
            <img src='img/deleteActive.png' height='15%'/></div>\
            </td>\
            <td class='left'><a href='#' \
            onClick='javascript:createContentSelection(\""+
            path+"\",\""+
            title+"\");'>"+title+"</a></td>\
            <td class='delete'>\
            <div class='delRight'>\
            <button class='deleteButton' \
            onClick='deleteItem(\""+title+"\", this);');'>Delete</button>\
            </div></td></tr>";
            $('#contentList').append(content);
            if (trClass == "light")
                trClass = "dark";
            else 
                trClass = "light";
        }
    }
    showEdit = true;
}

/***
 * Toggle delete button appearance 
 * caller: the clicked object to trigger event
 */
function showContent(caller){
    var object = $(".delRight", $(caller).parent());
    var idle = $(".delLeft", $(caller).parent());
    var active = $(".delLeft2", $(caller).parent());
    if (!$(idle).is(":visible") && !$(active).is(":visible"))
        return false;
    if ($(idle).is(":visible")) {
        idle.hide();
        active.show();
        object.fadeIn("slow");
    } else {
        active.hide();
        idle.show();
        object.fadeOut("slow");
    }
    return false;
}

/***
 * Swap table row colors of following  if a content pack gets deleted
 *
 */
function swapTRClass(which){
    var curTr = $(which).closest('td').parent();
    var idx = curTr[0].sectionRowIndex;
    var numRows = curTr.parent().children().length;
    for (var i = idx+1; i < numRows; i++){
        var tr = curTr.parent().children()[i];
        if ($(tr).attr('class') == "light"){
            $(tr).attr('class', 'dark');
        } else {
            $(tr).attr('class', 'light');
        }
    }
    return false;
}


/***
 * Delete content pack
 * title: Title of content pack
 * which: the table row object containing the deleted pack
 */
function deleteItem(title, which, reply){
    if (reply == null){
        
        var msg = 'Are you sure you want to delete '+title+'?';
        var okFun = function(){deleteItem(title, which, true); return false;}
        myConfirm(msg, okFun);
        return false;
    }
    //var reply = confirm('Are you sure you want to delete '+title+'?');
    if (reply) {
        var result = fileDownloadMgr.deleteContent(title);       
        var index = $(which).closest('tr')[0].sectionRowIndex;
        var numRows = $(which).closest('tr').parent().children().length;
        swapTRClass(which);
        $(which).closest('td').parent().remove();
        myAlert("content deleted");
    }
    return false;
}

/***
 * Success callback for install function
 * result: 
 * title: content pack title
 * link: link associated with this table row entry
 */
function installSucceeded(result, which, title, link, isUpdate) {
	inDownload = false;	
    which.html("Installed");
    which.removeClass("installButton").addClass("installedButton");
    if (isUpdate != null && isUpdate)
        myAlert("update complete");
    else
        myAlert("installation complete");
    link.unbind('click');
    link.click(function(e) {
               createContentSelection(result,title);
               return false;
               });
    
}

/***
 * Show delete buttons
 */
function showDeleteButtons(which){
    if (which.innerText == "Done"){
        $('.delLeft').hide();
        $('.delLeft2').hide();
        $('.delRight').hide();
        which.innerText = "Edit";
    } else {
        $('.delLeft').fadeIn('slow');
        which.innerText = "Done";
    }
    return false;
}

/***
 * This function adjusts header and footer for < 5.0 iOS versions
 * which - unfortunately - do not know about position:fixed
 * setZero: if set, reset to original position
 */
function adjustHeaderAndFooter(setZero){
    var devVersion = device.version; 
    if (devVersion < "5.0") {  
        var offset = $("#head").offset();
        var headYOffset = window.pageYOffset;
        var footerPos =  $(window).height() + window.pageYOffset - 25;
        if (setZero != null) {
            headYOffset = 0;
            footerPos = $(window).height() - 25;
        }
        $("#head").offset({ 'left': offset.left, 'top': headYOffset});
        $("#footer").offset({ 'top': footerPos});
    }
    return false;
}

