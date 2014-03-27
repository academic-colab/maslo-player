/******************************************************************************
 * pgcontentmgr_plugin.js
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

function PGContentManagement() {
}

PGContentManagement.prototype.init = function(success, failure){
    cordova.exec(null, null, "PGContentManagement" , "initializeDatabase", []);
    cordova.exec(success, failure,
                  "PGContentManagement", "getContentPath",[]);
    return false;
}

PGContentManagement.prototype.updateContent = 
function(success, failure, url,destFileName,title, version) {
    var data = "None yet";
    var processedURL = url.replace(/\\ /g, "%20");
    var downloadSuccess = function(data){
         cordova.exec(null, null, "PGContentManagement","removeContent", [title]);
         cordova.exec(success, failure,
                     "PGContentManagement", "unzipContent", 
                     [data,title, version]);
    }

    var doDownload = function(fs){
        var ft = new FileTransfer();
        var dlPath = androidDirPrefix+destFileName;
        ft.onprogress = function(pe){
            var loadText = "Downloading... ";
            if (pe.lengthComputable) {
                var perc = Math.floor(pe.loaded / pe.total * 100);
                loadText =  loadText += perc + "% loaded." ;
            }
            
            $(".ui-loader").find("h1").text(loadText );
        };
        
        var succFun = function(e){
            $(".ui-loader").find("h1").text("Download complete. Updating...");
            downloadSuccess(dlPath);
        };
        ft.download(processedURL, dlPath, succFun, failure);
        
    };
    
    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, doDownload, function(e){alert(e);});

    /*cordova.exec(downloadSuccess, failure,
                 "PGContentManagement", "downloadContent", 
                 [processedURL,destFileName,title, version, false]);*/
    return data;
}

PGContentManagement.prototype.downloadContent = 
  function(success, failure, url,destFileName,title, version, wantUnzip) {
    var wantUZip = "false";
    if (wantUnzip != null) {
        if (wantUnzip)
            wantUZip = "true";
    }
    var data = "None yet";
    var processedURL = url.replace(/\\ /g, "%20");
	var doDownload = function(fs){
	          var ft = new FileTransfer();
	          var dlPath = androidDirPrefix+destFileName;
	          ft.onprogress = function(pe){
	              var loadText = "Downloading... ";
	              if (pe.lengthComputable) {
	                  var perc = Math.floor(pe.loaded / pe.total * 100.0);
					  if (perc > 100) {
						loadText = "Download complete. Installing...";
					   } else {
	                  	loadText =  loadText += perc + "% loaded." ;
					   }
	              }

	              $(".ui-loader").find("h1").text(loadText );
	          };

	          var succFun = function(e){
	              $(".ui-loader").find("h1").text("Download complete. Installing...");
	              cordova.exec(success, failure,
	                           "PGContentManagement", "unzipContent",
	                           [dlPath,title, version]);
	          };
	          ft.download(processedURL, dlPath, succFun, failure);

	      };

	      var doCheck = function(fs){alert(fs.root.fullPath);};
	      window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, doDownload, function(e){alert(e);});
    /*cordova.exec(success, failure,
                              "PGContentManagement", "downloadContent", 
                              [processedURL,destFileName,title, version, wantUZip]);*/
    return data;
}

PGContentManagement.prototype.deleteContent = function(path) {
    cordova.exec(null, null, "PGContentManagement", "removeContent", [path]);
}

PGContentManagement.prototype.getContentList = function(success, fail) {
   return cordova.exec(success, fail, "PGContentManagement", 
                        "getCurrentContentList", []);
}

PGContentManagement.prototype.searchLocally = 
    function(success, failure, query, packTitle) {
        lst = [query];
        if (packTitle != null)
            lst.push(packTitle);
        cordova.exec(success, failure, "PGContentManagement", "searchLocally",
                      lst);
    
    }

PGContentManagement.prototype.PGContentManagementComplete = function(data) {
    alert(data);
}

window.plugins = window.plugins || {};
window.fileDownloadMgr = new PGContentManagement();
window.plugins.fileDownloadMgr = window.fileDownloadMgr;

