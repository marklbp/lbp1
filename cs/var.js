  var LoginUser = {


                    employerShops             :[]
                    ,isMerchant               :true
                    ,isWaiter                 :false
                    ,myShop                   :{
                                                  shopName: "mc"
                                                  , merchantType: 1
                                                  , merUserId: 106001680
                                               }

                    /*isMerchant              : false

                    ,isWaiter                 : false
                    ,myShop                   : {
                                                shopName : ''
                                                ,merchantType: 1
                                                ,merUserId: ''
                                              }*/
                    
                    ,imRole                   :  0
                    //当前登录用户id
                    ,myUserId                 : ''

                    //当前登录用户id编码后一串id
                    ,myTicket                 : ''

                    //当前会话用户id
                    ,currentTalkUserId        : ''   

                    //当前会话用户昵称
                    ,currentTalkUserNickName  : ''  

                    //会话类型
                    ,talkType                 : ''  

                    //当前会话店铺id
                    ,currentShopId            : ''   

                    //当前会话消息
                    ,curDialogue              : {
                                                  pageSum:1
                                                }     
                    
                    //历史消息
                    ,recDialogue              : {
                                                  pageSum:1
                                                  ,recordpageIndex:1
                                                }
                    //粉丝列表(供商家账号使用)
                    ,fans                     : {
                                                  pageSum:1
                                                }

                    //对话模式  个人/商家
                    ,talkModel                : {
                                                  businessModel: 3
                                                  ,personModel: 4
                                                }    

                  }

      ,IM_VAR = {

                  urlAddress : "http://enterprise.qbao.com/"
                  // var websocket_host : "192.168.7.42:12346";
                  ,websocket_host : "im.qbao.com:12346"
                  // 测试环境
                  ,swf_path : 'http://enterprise.qbao.com/webChat/business-center/scripts/im/jplayer' 

                  

                  ,smile_url : 'http://enterprise.qbao.com/webChat/business-center/images/'

                  //心跳周期
                  ,heartBeatSecond : 60

                  ,errorheadimg : "im-default-head-img.gif"

                  ,_version : "1.0"

                  //消息来往序列号 自增
                  ,_m_seq : 1 

                  ,_mt_delivery_report : 1

                  ,_mt_content_messages : 2

                  ,_mt_response : 3

                  ,_mt_heartbeat_req : 4

                  ,_mt_heartbeat_resp : 5

                  ,_mt_auth_req : 6

                  ,_mt_sys_cmd : 7

                  //socket心跳超时时长1分钟
                  ,heartbeatTimeOut : 1000 * 60

                  //转换流式文件
                  ,bufferpack : new BufferPack() 

                  ,oriCollapse : 0

                  ,_auth_seq : 2

                  ,isGetLastMsg : false


                  ,totalMsgCount : 0

                  ,newMsgTitInterval : 0

                  ,oriTitle : "钱宝网-看广告，做任务，赚外快"

                  //新消息存储字符串
                  ,newTitle : "你有新消息  "
                  
                  //0无角色 1个人 2商家 3小二
                  ,imRole : 0

                  ,heartbeatInterval : {}

                }


