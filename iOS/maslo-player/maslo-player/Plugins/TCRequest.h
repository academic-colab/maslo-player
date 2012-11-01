/******************************************************************************
 * TCRequest.h
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
#import <RestKit/RestKit.h>
#import <RestKit/RKRequestSerialization.h>
#import "RestKit/RKObjectMapping.h"
#import "RestKit/RKObjectLoader.h"
#import "RestKit/RKObjectManager.h"
#import "RestKit/RKClient.h"
#import "RestKit/RKResponse.h"


@protocol TCRequestDelegate <NSObject>
@required
- (void) requestCompleted: (RKResponse*)response;
- (void) didTimeout: (RKRequest*)request;
@end


@interface TCRequest : NSObject <RKRequestDelegate, RKObjectLoaderDelegate>
{
    id <TCRequestDelegate> _delegate;
    
    NSString *_endpoint;
    RKClient *_client;
}

@property (retain) id _delegate;

- (id)initWithEndPoint:(NSString*)endpoint withUsername:(NSString*)username withPassword:(NSString*)password;
- (void)putStatement:(NSString*)json withDelegate:(id)delegate;

//- (void)getStatementsWithDelegate:(id)delegate;

//- (void)objectLoader:(RKObjectLoader*)objectLoader didLoadObjects:(NSArray*)objects;

@end
