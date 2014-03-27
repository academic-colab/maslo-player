/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */
package org.academiccolab.masloPlayer;

import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;

@SuppressLint("WorldReadableFiles")
public class VideoPlayer extends CordovaPlugin {
    private static final String YOU_TUBE = "youtube.com";
    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callback) {
        try {
            if (action.equals("playVideo")) {
                playVideo(args.getString(0));
                callback.success();
            }
            else {
                return false;
            }
        } catch (JSONException e) {
        	callback.error(e.getMessage());
        } catch (IOException e) {
        	callback.error(e.getMessage());
        }
        return true;
    }
    
    
	private void playVideo(String url) throws IOException {
        // Create URI
        Uri uri = Uri.parse(url);
        
        Intent intent = null;
        // Check to see if someone is trying to play a YouTube page.
        if (url.contains(YOU_TUBE)) {
            // If we don't do it this way you don't have the option for youtube
            uri = Uri.parse("vnd.youtube:" + uri.getQueryParameter("v"));
            intent = new Intent(Intent.ACTION_VIEW, uri);
        } else {     
        	 uri = Uri.parse("file://" + url);
            // Display video player
            intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "video/*");
        }
        
        this.cordova.getActivity().startActivity(intent);
    }
    
}
