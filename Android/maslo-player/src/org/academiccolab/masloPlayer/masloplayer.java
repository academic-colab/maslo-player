/******************************************************************************
 * MasloActivity.java
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

import android.os.Bundle;
import android.webkit.WebSettings;

import org.academiccolab.uwexlp.R;
import org.apache.cordova.*;

/**
 * @author Cathrin Weiss (cathrin.weiss@uwex.edu)
 */
public class masloplayer extends DroidGap {
    @Override
    public void onCreate(Bundle savedInstanceState) {   
        super.onCreate(savedInstanceState);        
        super.setIntegerProperty("splashscreen", R.drawable.ic_launcher);        
        super.loadUrl(Config.getStartUrl(), 10000);
        WebSettings ws = super.appView.getSettings();
        ws.setSupportZoom(true);
        ws.setBuiltInZoomControls(true);
    }
}
