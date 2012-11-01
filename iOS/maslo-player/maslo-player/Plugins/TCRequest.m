/******************************************************************************
 * TCRequest.m
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

#import "TCRequest.h"

@implementation TCRequest

@synthesize _delegate;

- (id)init
{
    self = [super init];
    return self;
}

- (void)reachabilityChanged:(NSNotification*)notification {
    RKReachabilityObserver* observer = (RKReachabilityObserver*)[notification object];
    if ([observer isNetworkReachable]) {
        NSLog(@"We're online!");
    } else {
        NSLog(@"We've gone offline!");
    }
}

- (id)initWithEndPoint:(NSString*)endpoint withUsername:(NSString*)username withPassword:(NSString*)password {
    self = [super init];
    if (self) {
        // Initialization code here.
        _endpoint = endpoint;
        NSURL *url = [NSURL URLWithString:_endpoint];
        _client = [RKClient clientWithBaseURL:url ];
        [_client setUsername:username];
        [_client setPassword:password];
        [_client setTimeoutInterval:10.0];
        
    }
    
    return self;
}

- (void)putStatement:(NSString*)json withDelegate:(id)delegate
{
    _delegate = delegate;
    RKParams *params = [RKRequestSerialization serializationWithData:[json dataUsingEncoding:NSUTF8StringEncoding]MIMEType:RKMIMETypeJSON];
    
    [_client  post:@"/statements" params:params delegate:self];
}


- (void)getStatementsWithDelegate:(id)delegate {
    _delegate = delegate;
    [_client get:@"/statements/" delegate:self];
}

- (void)objectLoader:(RKObjectLoader *)objectLoader didFailWithError:(NSError *)error
{
    NSLog(@"an error happend %@", [error description]);
}
- (void)objectLoaderDidFinishLoading:(RKObjectLoader *)objectLoader
{
    NSLog(@"finished loading objects");
}

- (void)objectLoader:(RKObjectLoader*)objectLoader didLoadObjects:(NSArray*)objects {
    
}

//RestKit response delegate
- (void)request:(RKRequest*)request didLoadResponse:(RKResponse *)response {
    
   [_delegate requestCompleted:response];
    
}

- (void)requestDidTimeout:(RKRequest *)request  {
    NSLog(@"request did timeout", nil );
    
    [_delegate didTimeout:request];
    
}

- (void)requestDidCancelLoad:(RKRequest *)request
{
    NSLog(@"Request canceled");
    [_delegate didTimeout:request];
}

- (void)request:(RKRequest *)request didFailLoadWithError:(NSError *)error {
    NSLog(@"Request failed");
    [_delegate didTimeout:request];
}

- (void)dealloc {
    [_client release];
    [super dealloc];
}


@end

