var mkmk = mkmk || {};

mkmk.frameByFrameSyncManager = function() {
    var frameCnt = 0;
    var sentCnt  = -1;
    var frameInfo = [];
    var enemyInfo = [];
    var delay = 3;
    var isHost = false;
    
    var filterOldData = function(synCnt){
        return this.filter(function(v){
            return v.frameCnt >= synCnt;
        });
    };
    
    var getData = function(synCnt){
        
        var data = this.filter(function(v){ 
            return v.frameCnt == synCnt; 
        });
                    
        if( data[0] === undefined && this.verboseData ){
            // todo : verbose mode
        }
        
        return data[0];
    };
    
    var getFrameData = function(target, synCnt ){
      
        target = filterOldData.call(target, synCnt);
        
        if( target.length == 0 ){
            return undefined;
        }
        
        // get current my data.
        var currInfo = getData.call(target, synCnt);
        
        if(currInfo===undefined){
            return undefined;
        }
        
        return currInfo.userData; 
    };
    
    return {
    
        get isHost  ()      { return isHost;  },
        set isHost  (b)     { isHost = b;     },
        
        set delay   (delay) { delay = delay;  },
        
        /**
         * increment frame count.
         * This should be called every frame that any process is finished in success.
         */
        incrementFrameCnt : function(){
            frameCnt++;
        },
        
        /**
         * start lintening RTC data stream.
         */
        startReceiveFrame :function(){
            rtc_manager.setReceiveAction( function(peerID, data){
                // decode JSON and add to info array.
                enemyInfo.push(JSON.parse(data));
            });
        },
        
        /**
         * return Frame Data of Mine.
         * @param {number}
         * @returns {object}
         */
        getMyFrameData : function(synCnt){
            return getFrameData(frameInfo, synCnt);
        },
        
        /**
         * return Frame Data of Enemy.
         * @param {number}
         * @returns {object}
         */
        getEnemyFrameData : function(synCnt){
            return getFrameData(enemyInfo, synCnt);
        },
        
        /**
         * Push frame data into local FIFO & send over RTC connection.
         * This function should be called every frame.
         * @param {Objct}
         * @returns {boolean}
         */
        pushFrameData : function(frameData){
            
            if( frameCnt != sentCnt + 1 ){
                return false;
            }
            
            var currFrameInfo = {
                frameCnt : frameCnt,
                userData : frameData
            };
            
            frameInfo.push(currFrameInfo);
            rtc_manager.send(JSON.stringify(currFrameInfo));
            sentCnt = frameCnt;
            
            return true;
        },
        
        /**
         * return frame count of sync target.
         * @returns {number}
         */
        getSyncCnt : function(){
            return  frameCnt - delay;
        }
    };
}();