/******************************************************************************
 * PGContentManagement.java
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
package org.academiccolab.masloPlayer;


import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

/**
 * @author Cathrin Weiss (cathrin.weiss@uwex.edu)
 */

public class PGContentManagement extends Plugin { 
	public static final String ACTION = "list";
	private String myCallbackId = null;
	private Storage myStorage;// = new Storage();
	
	public PGContentManagement(){
		myStorage = new Storage(this);
	}

	/* (non-Javadoc)
	 * @see org.apache.cordova.api.Plugin#execute(java.lang.String, org.json.JSONArray, java.lang.String)
	 */
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		Log.d("PGContentManagement", "Plugin Called");
		myCallbackId = callbackId;
		PluginResult result = null;
		if (action.equals("initializeDatabase")){
			myStorage.initDB();
			Log.d("PGContentManagement", "InitializeDatabase called");
			result = new PluginResult(Status.OK, new JSONObject());			
		} else if (action.equals("getContentPath")){
			JSONObject obj = getContentPath();
			Log.d("PGContentManagement", "getContentPath called");
			result = new PluginResult(Status.OK, obj);
		} else if (action.equals("getCurrentContentList")){
			String res = "{\"rows\": []}";
			if (myStorage.isInitialized){
							
			String query = "SELECT * from content";
			res = myStorage.executeSql(query, null, "1");			
			if (!res.equals(""))
				res = "{\"rows\": "+res+"}";  
			else 
				res = "{\"rows\": []}";
			}
			Log.d("getContentPath", res);
			result = new PluginResult(Status.OK, res);
			
		} else if (action.equals("downloadContent")){
			try {
			String url = data.getString(0);
			String destFile = data.getString(1);
			String title = data.getString(2);
			String version = data.getString(3);
			String wantUzip = data.getString(4);
			
			String resultStr = myStorage.downloadFile(url, title, destFile, version, wantUzip);
			//result = new PluginResult(Status.NO_RESULT);
			//result.setKeepCallback(true);
			if (resultStr == null){
				String errMsg = myStorage.getErrorMessage();
				result = new PluginResult(Status.ERROR, errMsg);
			} else {
				result = new PluginResult(Status.OK, resultStr);
			}
			} catch (JSONException e){
				Log.d("PGContentManagement.downloadContent","JSON exception: "+e.getMessage());
			}
			
		} else if (action.equals("removeContent")){
			try {
				String packName = data.getString(0);
				myStorage.deleteContent(packName);
				result = new PluginResult(Status.OK, "");
			} catch(JSONException e){
				Log.d("PGContentManagement.removeContent","JSON exception: "+e.getMessage());
			}
			
			
		}  else if (action.equals("unzipContent")){
			try {
				String path = data.getString(0);
				String title = data.getString(1);
				String version = data.getString(2);
				String r = myStorage.doUnzip(path, title, version);
				if (r == null){
					String errMsg = myStorage.getErrorMessage();
					result = new PluginResult(Status.ERROR, errMsg);
				} else {
					result = new PluginResult(Status.OK, r);
				}
			} catch (JSONException e) {
				Log.d("PGContentManagement.unzipContent","JSON exception: "+e.getMessage());
			}
			
		} else if (action.equals("searchLocally")){
			try {
				String searchString = data.getString(0);
				String title = data.getString(1);				
				if (title.equals(""))
					title = null;
				String searchResult = myStorage.performSearchLocally(searchString, title);
				result = new PluginResult(Status.OK, searchResult);
			} catch (JSONException e) {
				Log.d("PGContentManagement.searchLocally","JSON exception: "+e.getMessage());
			}
			
		} else if (action.equals("getUniqueId")){
			// @TODO: Do something more useful here
			String res = "{\"uniqueId\": \"_ID:12345\"}";
			result = new PluginResult(Status.OK, res);
		} else if (action.equals("addTinCanEvent")){
			// @TODO: Do something more useful here
			result = new PluginResult(Status.OK, "");
		} else if (action.equals("pushTinCanEvents")){
			// @TODO: Do something more useful here
			result = new PluginResult(Status.OK, "");
		} else if (action.equals("pushTinCanEvents")){
			// @TODO: Do something more useful here
			result = new PluginResult(Status.OK, "");
		 } else {
			result = new PluginResult(Status.INVALID_ACTION);
			Log.d("PGContentManagement", "Invalid action : "+action+" passed"); 

		}
		return result;
	}
	
	public JSONObject getContentPath(){
		JSONObject js = new JSONObject();
		return js;
	}
	
	public PluginResult replyCallback(){
		PluginResult result = new PluginResult(Status.OK, "");
		result.setKeepCallback(false);
		this.success(result, myCallbackId);
		return result;
	}
	

	@Override
	public void onDestroy(){
		myStorage.onDestroy();
	}
	
}
