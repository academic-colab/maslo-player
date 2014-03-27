/******************************************************************************
 * maslo-globals.js
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

var fileDownloadMgr = null;
var videoPlayer = null;


// Global variables for maintaining state
var globalPack = "";        // the current content pack
var globalDescLen = 0;      // length of current content description
var globalQuizId = 0;       // the current quiz question id
var globalQuizCount = 0;    // total number of current quiz questions
var globalNumAnswers = 0;   // current total number of possible answers
var globalQuizAnswers = {}; // map containing all given answers for a question
var globalAudio = null;     // the current audio content
var globalWantFeedback = false; /* user wants individual feedback after 
                                 every question */

var settingsFeedback = null; // want feedback as indicated by settings

var globalPackLinks = null;

var footerIsAlt = false;

var globalQuiz = null;  // the current quiz json object
var globalCurrId = 0;

var trClass = "light";

var footerTimeout = null;

var showEdit = true;

var documentsDirPrefix = "../../Library/Caches/Content/";

var inDownload = false;  // currently downloading?

//****
var inBrowser = false;

//if project name changes, the following entry must be changed too
var androidDirPrefix = "/data/data/org.academiccolab.masloPlayer/files/";

// Remark: This value needs to be replaced by your actual MASLO store URL
var remoteStartUrl = "your_MASLO_store_URL_here";
var remoteStartName = "Default";
var remoteHost = remoteStartUrl;

