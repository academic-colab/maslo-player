/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */
package org.academiccolab.masloPlayer;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.json.JSONArray;
import org.json.JSONException;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;

@SuppressLint("WorldReadableFiles")
public class VideoPlayer extends Plugin {
    private static final String YOU_TUBE = "youtube.com";
    private static final String ASSETS = "file:///android_asset/";

    @Override
    public PluginResult execute(String action, JSONArray args, String callbackId) {
        PluginResult.Status status = PluginResult.Status.OK;
        String result = "";

        try {
            if (action.equals("playVideo")) {
                playVideo(args.getString(0));
            }
            else {
                status = PluginResult.Status.INVALID_ACTION;
            }
            return new PluginResult(status, result);
        } catch (JSONException e) {
            return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
        } catch (IOException e) {
        	Log.d("VideoPlayerEx", e.getMessage()+" "+e.toString());
            return new PluginResult(PluginResult.Status.IO_EXCEPTION);
        }
    }
    

    @SuppressWarnings("deprecation")
	private void playVideo(String url) throws IOException {
        // Create URI
        Uri uri = Uri.parse(url);
        
        Intent intent = null;
        // Check to see if someone is trying to play a YouTube page.
        if (url.contains(YOU_TUBE)) {
            // If we don't do it this way you don't have the option for youtube
            uri = Uri.parse("vnd.youtube:" + uri.getQueryParameter("v"));
            intent = new Intent(Intent.ACTION_VIEW, uri);
        } else if(url.contains(ASSETS)) {
            // get file path in assets folder
            String filepath = url.replace(ASSETS, "");
            // get actual filename from path as command to write to internal storage doesn't like folders
            String filename = filepath.substring(filepath.lastIndexOf("/")+1, filepath.length());

            // Don't copy the file if it already exists 
            File fp = new File(this.cordova.getContext().getFilesDir() + "/" + filename);
            if (!fp.exists()) {
                this.copy(filepath, filename, true);
            }            
            // change uri to be to the new file in internal storage
            uri = Uri.parse("file://" + this.cordova.getContext().getFilesDir() + "/" + filename);
            
            // Display video player
            intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "video/*");
        }else {     
        	 uri = Uri.parse("file://" + url);
            // Display video player
            intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "video/*");
        }
        
        this.cordova.getActivity().startActivity(intent);
    }
    
	private void copy(String fileFrom, String fileTo, boolean isFullPath) throws IOException {
        // get file to be copied from assets
    	
        InputStream in;
    	if (!isFullPath)
    		in = this.cordova.getActivity().getAssets().open(fileFrom);
    	else 
    		in = new FileInputStream(new File(fileFrom));
        // get file where copied too, in internal storage. 
        // must be MODE_WORLD_READABLE or Android can't play it
        FileOutputStream out = this.cordova.getActivity().openFileOutput(fileTo, Context.MODE_WORLD_READABLE);

        // Transfer bytes from in to out
        byte[] buf = new byte[1024];
        int len;
        while ((len = in.read(buf)) > 0)
            out.write(buf, 0, len);
        in.close();
        out.close();
    }
}
