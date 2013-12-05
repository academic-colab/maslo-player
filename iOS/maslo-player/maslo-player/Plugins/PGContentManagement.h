/******************************************************************************
 * PGContentManagement.h
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

#import <Foundation/Foundation.h>

#import <Cordova/CDVPlugin.h>
//#import <Cordova/JSONKit.h>
#import <Cordova/CDVCommandDelegate.h>
#import <Cordova/CDVFile.h>
#import <Cordova/CDV.h>



@interface PGContentManagement : CDVPlugin {
	NSMutableArray* params;
    NSString *callbackId;
    BOOL downloadLocked;
}

@property (nonatomic, copy) NSString* callbackId;
@property (nonatomic ) BOOL downloadLocked;

-(void) getContentPath:(CDVInvokedUrlCommand*)command;
-(void) initializeDatabase:(CDVInvokedUrlCommand*)command;
-(void) downloadContent:(CDVInvokedUrlCommand*)command;
-(void) unzipContent:(CDVInvokedUrlCommand*)command;
-(void) removeContent:(CDVInvokedUrlCommand*)command;
-(void) sendCallbackData:(NSString*)callbackId withData:(NSString*)data isSuccess:(BOOL)success;
-(void) getCurrentContentList:(CDVInvokedUrlCommand*)command;
-(void) downloadComplete:(id)object;
-(void) downloadCompleteWithError:(NSString*)errorString; 
-(void) unzipInBackground:(NSArray*)paramArray;
-(void) downloadInBackground:(CDVInvokedUrlCommand*)command;
-(void) downloadFile:(CDVInvokedUrlCommand*)command;
-(void) unzipDownload:(NSArray*)paramArray;
-(NSString*) unzipFile:(NSString*)fileName withTitle:(NSString*)title withVersion:(NSString*)version;
-(BOOL) deleteFile:(NSString*)fileName;
-(BOOL) deleteDirectory:(NSString*)path;
-(BOOL) initDB;
-(BOOL) executeDBStatement: (NSString*)databasePath withQuery: (NSString*)query withArgs:(NSArray*)args;
-(void) importSearchIndex: (NSString*)databasePath withOrigin:(NSString*)path;
-(NSMutableArray*) readFromDatabase: (NSString*)databasePath withQuery:(NSString*)query withArguments:(NSArray*)args;

@end