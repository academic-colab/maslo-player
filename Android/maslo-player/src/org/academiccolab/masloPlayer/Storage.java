/******************************************************************************
 * Storage.java
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

import java.io.File;
import org.json.JSONArray;
import android.database.Cursor;
import android.database.sqlite.*;
import java.io.*;
import java.net.ConnectException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;

import java.util.zip.*;
 


/**
 * @author Cathrin Weiss (cathrin.weiss@uwex.edu)
 */

public class Storage {

// Data Definition Language
private static final String ALTER = "alter";
private static final String CREATE = "create";
private static final String DROP = "drop";
private static final String TRUNCATE = "truncate";

private String errorMessage = "";

SQLiteDatabase myDb = null; // Database object

String path = null; // Database path
String dbName = null; // Database name
String dataPath = "";
PGContentManagement cMgr;
public boolean isInitialized = false; 

String currentTitle;
String currentPath;

/**
* Default constructor.
*/
public Storage() {
}

/**
* Constructor initialized with corresponding PGContentManagement object
*/
public Storage(PGContentManagement pgm){
	cMgr = pgm;	
}


/**
* Clean up and close database.
*/
public void onDestroy() {
	if (this.myDb != null) {
		this.myDb.close();
		this.myDb = null;
	}
}

/**
* Generate database path and open database.
* 
* @param db The name of the database
*
*/
public void openDatabase(String db) {
	//Log.d("Storage", "open database called");
	// If database is open, then close it
	if (this.myDb != null) {
		this.myDb.close();
	}
	this.dbName = this.path + File.separator + db + ".db";
	//Log.d("Storage", "opening: "+this.dbName);
	this.myDb = SQLiteDatabase.openOrCreateDatabase(this.dbName, null);
}

/**
* Open database
* @param dbPath Path to database
*/
public SQLiteDatabase openDB(String dbPath){
	SQLiteDatabase db = SQLiteDatabase.openOrCreateDatabase(dbPath, null);
	return db;
}


/**
* Initialize database - if exists just open, if not, open and create tables.
*/
public void initDB(){ 
	if (this.path == null) {	
		this.path = cMgr.cordova.getActivity().getFilesDir().getAbsolutePath();//ctx.getApplicationContext().getDir("Content", Context.MODE_PRIVATE).getPath();
	}
	String dbName =  this.path+File.separator +"content.db";
	boolean exists = (new File(dbName)).exists();
	if (exists) {
		this.openDatabase("content");
	} else {
		this.openDatabase("content");		
		String query = "CREATE VIRTUAL TABLE content_search using FTS3(pack,section,content,tokenize=porter)";
		executeSql(query, null, "");
		query = "CREATE TABLE content (title text, path text, created text, partOfProgram text, version text)";
		executeSql(query, null, "");
	}
	isInitialized = true;
}

public  void copyInputStream(InputStream in, OutputStream out) throws IOException {
	byte[] buffer = new byte[1024];
	int len;
	while((len = in.read(buffer)) >= 0)
		out.write(buffer, 0, len);
	in.close();
	out.close();
}

public String unzip(String zipFileName) throws IOException {
	@SuppressWarnings("rawtypes")
	Enumeration entries;
	ZipFile zipFile;
	String headDir = "";
	//Log.d("Storage.unzip","Unzipping: "+zipFileName);
		zipFile = new ZipFile(zipFileName);
		entries = zipFile.entries();
		while(entries.hasMoreElements()) {
			ZipEntry entry = (ZipEntry)entries.nextElement();
			String entryPath = this.path+File.separator + entry.getName();
			if(entry.isDirectory()) {
				if (headDir.equals(""))
					headDir = entryPath;
				// Assume directories are stored parents first then children.
				//Log.d("Storage.Unzip","Extracting directory: " + entryPath);				
				File newDir = new File(entryPath);
				newDir.mkdir();
				newDir.setExecutable(true, false);
				
			} else {
				//Log.d("Storage.Unzip","Extracting file: " + entry.getName());			
				FileOutputStream oStream;		
				oStream =  new FileOutputStream(entryPath);
				copyInputStream(zipFile.getInputStream(entry),
					new BufferedOutputStream(oStream));
				if (entry.getName().toLowerCase().contains(".mp4")|| entry.getName().toLowerCase().contains(".mp3")){				
					File newMedia = new File(entryPath);				
					newMedia.setReadable(true, false);
				}
			}
			
		}
		zipFile.close();
		return headDir;
}

public void importSearchDb(String searchDbPath) {
	SQLiteDatabase searchDB = openDB(searchDbPath);
	String query = "SELECT pack, section, content from content_search";
    String insert =  "INSERT INTO content_search(pack, section, content) VALUES (?,?,?)";
    List<List<String> > results = selectSQL(query, null, searchDB);
    for (Iterator<List<String>> it = results.iterator(); it.hasNext(); ){
    	List<String> row = it.next();
    	String []r = new String[row.size()];
    	row.toArray(r);
    	this.executeSql(insert, r, "2");

    }
    searchDB.close();
    searchDB = null;
}

public void deletePath(File f){
	if (f.isDirectory()) {
	    for (File c : f.listFiles())
	      deletePath(c);
	  }
	  //if (!f.delete())
		//  Log.d("Storage.deletePath","Failed to delete file: " + f);

}

public void deleteContent(String packName){
	String select = "SELECT path FROM content WHERE title = ?";
	String delete1 = "DELETE FROM content WHERE title = ?";
	String delete2 = "DELETE FROM content_search WHERE pack = ?";
	List<List<String> > results = selectSQL(select, new String[]{packName}, this.myDb);
	String path = results.get(0).get(0);
	File f = new File(path);
	if (f.exists()){
		//Log.d("Storage.deleteContent", "We will delete "+path);
	} else {
		//Log.d("Storage.deleteContent", "Path did not exist in the first place: "+path);
	}
	deletePath(f);
	this.executeSql(delete1, new String[]{packName}, "1");
	this.executeSql(delete2, new String[]{packName}, "2");
	f = new File(path);
	if (f.exists()){
		//Log.d("Storage.deleteContent", "Deletion was NOT successful.");
	} 
	
}

public String getErrorMessage(){
	return errorMessage;
}



public String doUnzip(String path, String title, String version) {
	String headDir = null;	
	try {
		File f = new File(path);
		headDir = unzip(path); 
		//headDir = path + File.separator + headDir + File.separator;
		//Log.d("Storage.unzip", "Success!");
		String searchDbPath = headDir + "search.db";
		f.delete();
		//Log.d("Storage.unzip", "Search db path:"+searchDbPath);
		String query = "INSERT INTO content VALUES (?, ?, '', '', ?)";				
		this.executeSql(query, new String[]{title, headDir, version}, "1");
		importSearchDb(searchDbPath);		
		//String data = this.executeSql("SELECT * from content", null,"0");
		this.executeSql("SELECT * from content", null,"0");
		//Log.d("Storage.downloadFile", "Now in database: "+data);
	} catch (IOException e) {		
		errorMessage = "Installation of content pack failed ("+e.getMessage()+")";
	}
	return headDir;
}


public String downloadFile(String url, String title, String fname, String version, String wantUZip){
	String path = this.path + File.separator + fname;
	currentPath = path;
	currentTitle = title;
	boolean wantUnzip = wantUZip.toLowerCase().startsWith("t");
	BufferedInputStream in;
	try {
		URL u = new URL(url);
		URLConnection con = u.openConnection();
		con.setConnectTimeout(5000);
		in = new BufferedInputStream(con.getInputStream());
		File f = new File(path);
		if (!f.exists())
			f.createNewFile();
		FileOutputStream out = new FileOutputStream(f);
		copyInputStream(in, out);
		out.close();
		//Log.d("Storage.downloadFile", "Success!");
		if (!wantUnzip){
			return path;
		}		
		return doUnzip(path,title,version);		
	} catch (MalformedURLException e) {
		errorMessage = "URL to download server is malformed.";
	} catch(ConnectException e){
		errorMessage = "Connection to download server failed.";
	} catch (IOException e) {
		errorMessage = "Installation of content pack failed ("+e.getMessage()+")";
	} 
	//Log.d("Storage.downloadFile", "Something went wrong ... ");
   return null;
}

public String performSearchLocally(String query, String title){
	String result = "";

	try {
		
		InputStream istr = cMgr.cordova.getActivity().getAssets().open("stopwords.txt");
		
		String content = "";		
		try {
			content =  new java.util.Scanner(istr).useDelimiter("\\A").next();
		} catch (java.util.NoSuchElementException e) {
			
		}

		String []stopwords = content.split(",");
		
		String q = query.replaceAll(" AND ", " ");
		for (int i = 0 ; i < stopwords.length; i++){
			String regex = "(?i)(^"+stopwords[i]+" | "+stopwords[i]+" |"+stopwords[i]+"$)"; 
			q = q.replaceAll(regex, " ");
		}
		
		String dbQuery = "SELECT pack, section, path FROM content_search, content WHERE content " +
				"MATCH ? and content.title = content_search.pack ORDER BY pack";
		if (title != null) {
			dbQuery = "SELECT pack, section, path FROM content_search, content WHERE content " +
					"MATCH ? and content.title = content_search.pack and content.title = ? ORDER BY pack";
		}
		String queryData[];
		if (title == null) {
			queryData = new String[]{q};			
		} else {			
			queryData = new String[]{q, title};
		}
		List<List<String> > results = this.selectSQL(dbQuery, queryData, this.myDb);		
		String pack = "";
		JSONArray resultRow = new JSONArray();
		JSONArray allResult = new JSONArray();
		JSONArray sections = new JSONArray();
		String path = "";
		for (Iterator<List<String> > it = results.iterator(); it.hasNext(); ){
			List<String> row = it.next();
			String innerPack = row.get(0);
			if (pack.equals(""))
				pack = innerPack;
			if (!innerPack.equals(pack)){
				resultRow.put(pack);
				resultRow.put(path);
				resultRow.put(sections);
				sections = new JSONArray();
				allResult.put(resultRow);
				resultRow = new JSONArray();
			}
			pack = innerPack;
			path = row.get(2);
			sections.put(row.get(1));
		}
		resultRow.put(pack);
		resultRow.put(path);
		resultRow.put(sections);		
		allResult.put(resultRow);
		String res = allResult.toString();
		if (pack.equals(""))
			res = "[]";
		result = "{\"rows\": "+res+"}";		
		
	} catch (FileNotFoundException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	} catch (IOException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	
	return result;
}


/**
* Execute SQL statement.
* 
* @param query
*            The SQL query
* @param params
*            Parameters for the query
* @param tx_id
*            Transaction id
*/
public String executeSql(String query, String[] params, String tx_id) {
	try {
		if (isDDL(query)) {
			this.myDb.execSQL(query);
			return "OK";
		} 
		else {
			Cursor myCursor = this.myDb.rawQuery(query, params);
			String results = this.processResults(myCursor, tx_id);			
			myCursor.close();
			return results;
		}
	} 
	catch (SQLiteException ex) {
		this.errorMessage = ex.getMessage();
	}
	return "";
}

public List< List<String> > selectSQL(String query, String[] params, SQLiteDatabase db){
	List<List <String> > result = new LinkedList<List<String> >();
	Cursor myCursor = db.rawQuery(query, params);
	if (myCursor.moveToFirst()) {		
		String value = "";
		int colCount = myCursor.getColumnCount();		
		// Build up JSON result object for each row
		do {
			List<String> row = new LinkedList<String>();
			for (int i = 0; i < colCount; ++i) {
				value = myCursor.getString(i);
				row.add(value);
			}
			result.add(row);
		} while (myCursor.moveToNext());
	}
	myCursor.close();
	return result;
}

/**
* Checks to see the the query is a Data Definintion command
* 
* @param query to be executed
* @return true if it is a DDL command, false otherwise
*/
private boolean isDDL(String query) {
	String cmd = query.toLowerCase();
	if (cmd.startsWith(DROP) || cmd.startsWith(CREATE) || cmd.startsWith(ALTER) || cmd.startsWith(TRUNCATE)) {
		return true;
	}
	return false;
}

/**
* Process query results.
* 
* @param cur
*            Cursor into query results
* @param tx_id
*            Transaction id
*/

public String processResults(Cursor cur, String tx_id) {

	String result = "[]";
	// If query result has rows
	if (cur.moveToFirst()) {
		JSONArray fullresult = new JSONArray();
		String value = "";
		int colCount = cur.getColumnCount();

		// Build up JSON result object for each row
		do {
			JSONArray row = new JSONArray();
				for (int i = 0; i < colCount; ++i) {
					value = cur.getString(i);					
					row.put(value);
				}
				fullresult.put(row);

		} while (cur.moveToNext());
		result = fullresult.toString();
	}
	
	
	return result;	
}



}
