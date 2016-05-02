(function() {
	var $msgBox = $('#messages'); // 消息容器
	var	$input = $('#inputText'); // 消息输入框
	var $btnEmoji=$('#btnEmoji');//表情按钮
	var	username;//用户名
	var	userid;//用户id
	var	connected = false;//记录 连接状态
	var	linked = false;//记录 是否已经有 客服 与当前用户连接
	var	socket = io();
	var	relink=false; //用户重新匹配客服标志 true状态匹配ok，false未匹配
	var	isKF = !!window.kefu;//判断当前处于哪种模式
	var typing=false;
	var faceLib={
			'[微笑]':'1.png',
			'[不]':'2.png',
			'[亲亲]':'3.png' ,
			'[无聊]':'4.png' ,
			'[鼓掌]':'5.png' ,
			'[伤心]':'6.png' ,
			'[害羞]':'7.png' ,
			'[闭嘴]':'8.png' ,
			'[耍酷]':'9.png' ,
			'[无语]':'10.png' ,
			'[发怒]':'11.png' ,
			'[惊讶]':'12.png' ,
			'[委屈]':'13.png' ,
			'[酷]':'14.png' ,
			'[汗]':'15.png' ,
			'[闪]':'16.png' ,
			'[放屁]':'17.png' ,
			'[洗澡]':'18.png' ,
			'[偶耶]':'19.png' ,
			'[困]':'20.png' ,
			'[咒骂]':'21.png' ,
			'[疑问]':'22.png' ,
			'[晕]':'23.png' ,
			'[衰]':'24.png' ,
			'[装鬼]':'25.png' ,
			'[受伤]':'26.png' ,
			'[再见]':'27.png' ,
			'[抠鼻]':'28.png' ,
			'[心寒]':'29.png' ,
			'[怒]':'30.png' ,
			'[凄凉]':'31.png' ,
			'[悄悄]':'32.png' ,
			'[奋斗]':'33.png' ,
			'[哭]':'34.png',
			'[赞]':'35.png' ,
			'[开心]':'36.png'
		};
	var faceText = (function(arr){
						var temp=[];
						for (var att in faceLib) {
							temp.push(att);
						}
						return temp;
					})(faceLib);

	if(window.name){
		var t = (window.name + '').split('|');
		username = t.shift();
		userid = t.shift();
	}else{
		userid = Math.random().toString().substr(3, isKF ? 5 : 8) * 10000
		//生成昵称
		username = (isKF ? 'w' : 'v') + '(' + userid + ')';
		userid = new Date().getTime() + '.' + userid.toString(32);
		//将生成的昵称和id保存至 window.name 中, 这样在不关闭窗口的情况下, 保证一直是同一个昵称和id
		window.name = [username, userid].join('|');
	}
	initialize();

	function initialize(){
		//初始化函数
		socketListener();
		bindFormSend();
		bindInputEnter();
		bindEmojiClick();
		log('正在连接服务器...');
	}
	function socketListener(){
		//连接服务器成功
		socket.on('connect', function(){
			connected = true;
			//连接成功后, 向服务器发送 登陆请求, 传递用户名和userid
			socket.emit('login', {name:username, id:userid, type: isKF ? 1 : 0});
		});
		//服务器找到 有可用的客服的时候, 向客户端推送的 消息
		socket.on('linked', function(name){
			linked = true;
			relink = false;
			log(isKF ? '与用户'+name+'连线成功!' : '您好，客服编号'+name+'为您服务');
		});
		//连接出现错误时
		socket.on('error', function(){
			linked = connected = false;
			log('连接已断开...');
		});
		//收到服务器发来的 log 事件时
		socket.on('log', function(msg){
			if(msg.status){
				linked=msg.status===2?false:true;
				msg=msg.msg
			}
			if(msg.type==0){
				if(isKF)return;
				msg=msg.msg;
			}
			log(msg);
		});
		//收到消息时
		socket.on('new message', function (data) {
			createMsgHtml(data);
		});

		socket.on('typing',function(data){
			if(username!=data.username)return;
			if(!typing){
				if($("#typing").length<=0){
					$("<div class='typing' id='typing' />").text("对方正在输入....").fadeIn().appendTo($(document.body))
				}else{
					$("#typing").fadeIn();
				}
			}
			typing=!typing;
		});

		socket.on('stop typing',function(data){
			if(username!=data.username)return;
			if(typing){
				$("#typing").fadeOut()
			}
			typing=!typing;
			
		});
		
	}
	function bindInputEnter(){
		//表单中按回车发送消息
		$input.on("keyup",function(e){
			if(!typing){
				typing=!typing;
				socket.emit("typing",{uid:userid,evt:"typing"});
			}
			if(13==e.which&&$.trim(this.value)){
				$(this.form).submit();
				typing=!typing;
				socket.emit("stop typing",{uid:userid,evt:"stop typing"})
			}
			return false;
		})
	}
	function bindEmojiClick(){
		//表情按钮点击框显示隐藏
		$btnEmoji.on("click",function(){
			var that=this;
			var $emojibox=$(this).siblings(".emoji-box");
			if($(this).siblings(".emoji-box").children().length<=0){
				//初次加载标签
				$(this).siblings(".emoji-box").load("/emoji.html",function(){
					$(this).fadeIn(function(){
						that.bShow=true;
						that=null;
					}).find("a").on("click",function(){
						insertText(this.title,$input[0]);
						$(this).closest(".emoji-box").fadeOut();
						$btnEmoji[0].bShow=!$btnEmoji.bShow;
						return false;
					});
				})
			}else{
				$emojibox[!that.bShow?"fadeIn":"fadeOut"](function(){
					that.bShow=!that.bShow;
					that=null;
				})
			}
		})
	}
	function bindFormSend(){		
		$('form').on('submit', function(){
			sendMessage();
			return false;
		});
	}
	function sendMessage () {
		//发送消息到服务器
		var message = $input.val();
		message = cleanInput(message);
		//如果过滤后的内容为空
		if(!message)return;
		// 有输入内容, 且已经连接成功, 且当前有客服和他匹配
		if (connected && linked) {
			$input.val('');
			createMsgHtml({
				color: '#008040',
				username: username,
				message: message
			});
			socket.emit('new message', {id:userid, message:message});
		}else{
			var txt;
			if(connected){
				if (isKF) {
					txt="暂无访客连接，不能发送消息..."
				}else{
					txt="客服忙，请稍等..."
				}
				if(!linked){
					//连接成功, 但还没有 匹配成功
					//txt="正在给您重新分配客服，请稍后...";
					if(!relink&&!isKF){
						//游客自动重新匹配客服，客服不能自主匹配游客
						relink=true;
						socket.emit('relink', {name:username, id:userid, type: isKF ? 1 : 0,relink:true});
					}
				}
			}else{
				//未连接成功时的提示文字
				txt="正在连接服务器..."
			}
			log(txt);
		}
	}
	function cleanInput(text){
		//过滤html标签
		return $('<div/>').html(text).text();
	}
	function log (message) {
		//日志提示
		insertMsgHtml($('<li>').addClass('log').text(message));
	}
	function createMsgHtml (data) {
		//消息html拼接
		var cls,name,color=data.color;
		if(data.username==username){
			name="您";
			cls="me"
		}else{
			if(isKF){
				name="用户";
			}else{
				name="客服";
			}
			cls=""
		}
		var msg=filterFace(data.message);
		var $username = $('<div class="username" title="'+username+'" />').text(name).css('color', color || '#00f');
		var $detail = $('<div class="detail"/>').html(msg);
		var $time=$('<div class="time"/>').text(formatDate(new Date()));
		var $message = $('<li class="message"/>')
			.addClass(cls)
			.data('username', username)
			.append($username,$detail,$time);

		insertMsgHtml($message);
	}
	function filterFace(text) {
		//转译表情 [...]=><img .. />
		var url="http://www.imooc.com/static/img/smiley/64/";
		for(var i=0,arr;i<=faceText.length;i++){
			if(arr=text.match(faceText[i])){
				var text = text.replace(faceText[i],'<img class="emoji-icon" src="'+url+ faceLib[faceText[i]] +'" title="'+arr[0]+'" alt="'+arr[0]+'" />');
			}
		}
		//var urlreg = /((www|https?:\/\/)[-\w.\/?%(&amp;)=]+)(\s|$|[u4e00-u9fa5])/gi;//url正则
		//var reg = /(www|(https|http):\/\/)[a-zA-Z0-9\-\.]+(\/\w+)*\.*(\w)*/g;

		//url正则
		//以空格或者逗号或者制表符或者中文字符作为终止符号；
		//以http(s)://或者www开头，后面至少一个字符（最后一个符号不能是.）
		var urlreg = /((www|https?:\/\/)[-\w.\/?%(&amp;)=]+)((^.\s)$|[u4e00-u9fa5])/gi;
		var nntext=text.replace(urlreg, function(url){
			if (url.indexOf('http')!=-1){
				if(text.indexOf('<img')!=-1){
					return url;
				}else{
					return '<a href="'+url+'" target="_blank" >'+url+'</a>'
				}

			}else{

				 return '<a href="http://'+url+'" target="_blank" >'+url+'</a>'
			}
         });

		 return nntext
	}
	function formatDate(t){
		//时间格式化
		var M = t.getMonth() + 1,
			D = t.getDate(),
			H = t.getHours(),
			m = t.getMinutes(),
			s = t.getSeconds();
		H=H<10?("0"+H):H;
		m=m<10?("0"+m):m;
		s=s<10?("0"+s):s;
		return [H, ':', m, ':', s].join('');
	}
	function insertText(text,$textInput) {
		//输入框焦点位置插入文本
		if (document.selection) {
			$textInput.focus();
			var cr = document.selection.createRange();
			cr.text = text;
			cr.collapse();
			cr.select();
		} else if ($textInput.selectionStart || $textInput.selectionStart == '0') {
			var start = $textInput.selectionStart,
			end = $textInput.selectionEnd;
			$textInput.value = $textInput.value.substring(0, start) + text + $textInput.value.substring(end, $textInput.value.length);
			$textInput.selectionStart = $textInput.selectionEnd = start + text.length;
		} else {
			$textInput.value += text;
		}
	}
	function insertMsgHtml (el) {
		//消息插入页面淡入显示
		$msgBox.append($(el).hide().fadeIn(200));
		scrollToPos();
	}
	function scrollToPos(pos){
		//纵向滚动条偏移函数 pos => top|bottom|left|right|100|first|last|[id]|[class]
		if(!pos||typeof pos=='string'||typeof pos=='number'){
			pos=pos||"bottom";
			$("#contentScroll").mCustomScrollbar("scrollTo",pos)
		}
	}

})();