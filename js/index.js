(function () {


    //模拟数据
    //页面刚加载读取本地存储的歌曲列表
    let data=localStorage.getItem('mList')?
    JSON.parse(localStorage.getItem('mList')):[];


    let searchData=[];
    //获取元素
    let start=document.querySelector('.start');//播放
    let prev=document.querySelector('.prev');//上一曲
    let next=document.querySelector('.next');//下一曲
    let audio=document.querySelector('audio');
    let  nowTimespan=document.querySelector('.nowTime');
    let  totalTimespan=document.querySelector('.totalTime');
   let songSinger=document.querySelector('.ctrl-bars-box span');
    let  logoImg= document.querySelector('.logo img');
    let   ctrlBars= document.querySelector('.ctrl-bars');
    let  nowBars= document.querySelector('.nowBars');
    let  ctrlBtn= document.querySelector('.ctrl-btn');
    let  modeBtn= document.querySelector('.mode');
    let  infoEl= document.querySelector('.info');
    let   listBox=document.querySelector('.play-list-box ul');




    //变量
    let index=0;//控制当前播放第几首歌
    let  rotateDeg=0;//记录专辑封面旋转角度
    let timer=null;//保存定时器
    let modeNum = 0;//0顺序播放 1 单曲循环 2 随机播放

    //加载播放列表
   function loadPlayList(){
       if(data.length){
           let str='';//用来累计播放项
           //加载播放列表
           for (let i=0;i<data.length;i++){
               str +='<li>';
               str +='<i>x</i>';
               str +='<span>'+data[i].name+'</span>';
               str +='<span>';
               for(let j=0;j<data[i].ar.length;j++){
                   str+=data[i].ar[j].name+' ';
               }
               str +='</span>';
               str +='</li>';
           }
           listBox.innerHTML=str;//ul传歌曲信息
       }
   }
   loadPlayList();
    //请求服务器
    $('.search').on('keydown',function (e) {
        if(e.keyCode===13){
            //按下回车键
            $.ajax({
                //服务器地址
                url:'https://api.imjad.cn/cloudmusic/',
                //参数
                data:{
                  type:'search',
                  s:this.value
                },
                success:function (data) {
                    searchData=data.result.songs;
                    var str='';
                    for(var i=0;i<searchData.length;i++){
                        str+='<li>';
                        str+='<span class="left song">'+searchData[i].name+'</span>';
                        str+='<span class="right singer">';
                        for(var j=0;j<searchData[i].ar.length;j++){
                            str += searchData[i].ar[j].name+'  ';
                        }
                        str+='</span>';
                        str+='</li>';
                    }
                    $('.searchUl').html(str);
                },
                error:function (err) {

                }
            });
            this.value='';
        }
    });

    //点击搜索列表
    $('.searchUl').on('click','li',function () {
       data.push( searchData[$(this).index()]);//推送到播放列表
        localStorage.setItem('mList',JSON.stringify(data));//本地存储
        loadPlayList();
        index=data.length -1;
        init();
        play();
    });


    //切换播放选择列表
    function checkPlayList() {//检查播放列表
        let playList=document.querySelectorAll('.play-list-box li');//选中当前播放歌曲
       for(let i=0;i<playList.length;i++){
           playList[i].className='';
       }
        playList[index].className='active';
    }

    //加载播放歌曲得数量
    function loadNum() {
        $('.play-list').html(data.length);
    }
    loadNum();

    //
    //格式化时间
    function formatTime(time) {
        return time>9 ? time : '0' + time;
    }

    //提示框提示
    function info(str) {
        infoEl.innerHTML=str;
        infoEl.style.display='block';
        setTimeout(function () {
            infoEl.style.display='none';
        },1000)
    }

   //点击播放列表
    $(listBox).on('click','li',function () {
        index=$(this).index();
        init();
        play();
    });
    $(listBox).on('click','i',function (e) {
        data.splice($(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        e.stopPropagation();//阻止冒泡
    })

    //初始化播放
     function init(){
         rotateDeg = 0;//初始化角度，下首歌便0
         checkPlayList();
         //设置播放歌曲背景
         $('.mask').css({
             background:'url("'+data[index].al.picUrl+'")',
             backgroundSize:'100%',
         })
         audio.src='http://music.163.com/song/media/outer/url?id='+data[index].id+'.mp3';//给audio设置播放路径
         //歌曲名和歌手名
         let str='';
         str+=data[index].name+'----';
         for(let i=0;i<data[index].ar.length;i++){
             str+=data[index].ar[i].name+' ';
         }
         songSinger.innerHTML=str;

         logoImg.src=data[index].al.picUrl;
          }

    init();

    //取不重复的随机数
    function getRandomNum() {
        let randomNum=Math.floor(Math.random() * data.length);
        if(randomNum==index){
           randomNum=getRandomNum();
        }
        return randomNum;
    }




    //播放音乐
    function play(){
        audio.play();//当前true为 暂停让播放
        clearInterval(timer);//清除定时器
        timer=setInterval(function () {
            rotateDeg++;//角度变量自加
            logoImg.style.transform='rotate('+rotateDeg+'deg)';
        },30);
        start.style.backgroundPositionY='-159px';//显示播放图标
    }

     //播放和暂停
    //当歌曲播放时间让暂停，歌曲暂停让播放即可实现其功能
    start.addEventListener('click',function () {
       // 检测歌曲是播放状态还是暂停
      //  audio.play();//调用piay()可以播放
       // audio.pause();//调用pause（）方法可以暂停
        if(audio.paused){//paused属性值检测true和false
            play();
/*            audio.play();//当前true为 暂停让播放
            timer=setInterval(function () {
                rotateDeg++;//角度变量自加
                logoImg.style.transform='rotate('+rotateDeg+'deg)';
            },30);
            start.style.backgroundPositionY='-159px';//显示播放图标*/
        }else{
            audio.pause();//当前false为 播放让暂停
            clearInterval(timer);//清除定时器
           start.style.backgroundPositionY='-198px';//还原当前图标
        }
    });
    //下一曲
    next.addEventListener('click',function () {
        index++;
        index= index > data.length - 1 ? 0 : index;
        init();//初始化播放
        play();//这是播放的自己写的play（）方法
    });
    //上一曲
    prev.addEventListener('click',function () {
        index--;
        index= index <0  ? data.length-1 : index;
        init();//初始化播放
        play();//这是播放的自己写的play（）方法
    });

    //切换播放模式
    modeBtn.addEventListener('click',function () {
        modeNum++;
        modeNum=modeNum>2 ? 0 : modeNum;
        switch (modeNum) {
            case 0:
                info('顺序播放');
                modeBtn.style.backgroundPositionX='0px';
                modeBtn.style.backgroundPositionY='-336px';
                break;
            case 1:
                info('单曲播放');
                modeBtn.style.backgroundPositionX='-64px';
                modeBtn.style.backgroundPositionY='-336px';
                break;
            case 2:
                info('循环播放');
                modeBtn.style.backgroundPositionX='-64px';
                modeBtn.style.backgroundPositionY='-241px';
                break;
        }
    })

    //音乐准备完成
    audio.addEventListener('canplay',function () {
        let totalTime=audio.duration;//音乐总时长
        let totalM=parseInt(totalTime/60);//分钟
        let totalS=parseInt(totalTime % 60);//取余
        totalTimespan.innerHTML=formatTime(totalM)+':'+formatTime(totalS);

        audio.addEventListener('timeupdate',function () {
            let currentTime=audio.currentTime;//当前时长
            let currentM=parseInt(currentTime / 60);
            let currentS=parseInt(currentTime % 60);
            nowTimespan.innerHTML=formatTime(currentM)+':'+formatTime(currentS);

            //进度条
            let barWidth=ctrlBars.clientWidth;//进度条宽度
            let position=currentTime / totalTime * barWidth;//位置
            nowBars.style.width=position + 'px';//
            ctrlBtn.style.left=position -5 + 'px';

         if(audio.ended){
             switch(modeNum){
                 //顺铂播放
                 case 0:
                     next.click;
                     break;
                     //单曲播放
                 case 1:
                     init();
                     play();
                     break;
                     //随机播放
                 case 2:
                     index=getRandomNum();
                     init();
                     play();
                     break;
             }
         }
        });

        ctrlBars.addEventListener('click',function (e) {
            audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;
        });

        function IsPC() {
            var userAgentInfo=navigator.userAgent;//获取当前浏览器的信息
            var Agents=["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
            var flag = true;
            for (var i = 0; i < Agents.length; i++) {
                if (userAgentInfo.indexOf(Agents[i]) > 0) {//判断是否是移动端
                    flag = false;
                    break;
                }
            }
            return flag;
        }
    });
})();