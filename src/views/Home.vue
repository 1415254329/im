<template>
  <div style="height: 100%;">
    <div class="header fixed center backfff" v-if="Mobile">
      <div class="iconfont icon-arrowl absolute" @click="back" v-if="Mobile"></div>
      <div class="ft18">{{youAccid}}</div>
    </div>
    <div class="header fixed center backfff lheight50" v-else>
      <div class="iconfont icon-arrowl absolute" @click="back" v-if="Mobile"></div>
      <div class="ft18">{{youAccid}}</div>
    </div>
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh" :class="!disabled ? 'vanpull' : 'a12'"
      :disabled="disabled">
      <div class="Con col94 auto" ref="element">
        <div class="time center ft12 colorbbb lheight50">{{time}}</div>
        <div class="status_bar"></div>
        <div v-for="(item,index) in list">
          <div class="you clearfix conbox" v-if="item.flow == 'in'">
            <img src="@/assets/img/photo2.jpg" class="photo left col10" />
            <div class="right col85 ">
              <div style="display: inline-block;">
                <img class="conImg" v-if="item.type == 'image'" :src="item.file.url" alt="" @click="ImgClick(index)"
                  ref="audio">
                <div class="conText backfff" v-else-if="item.type == 'text'" ref="audio"> {{item.text}}</div>
                <div class="conText backfff" v-else-if="item.type == 'custom'" ref="audio"> {{item.content}}</div>
                <audio v-else-if="item.type == 'audio' || item.type == 'file'" :src="item.file.url" controls="controls"
                  @canplay="AudioTime(index)" ref="audio"></audio>
                <div class="audiobox" v-if="item.type == 'audio' || item.type == 'file'" @click="AudioPlay(index)">
                  <span class="iconfont icon-chat_sound"></span>{{(item.file.size/100000).toFixed(0)}}
                </div>

              </div>
            </div>
          </div>
          <div class="i clearfix conbox" v-else>
            <div class="left col85 ">
              <div class=" clearfix right" style="display: inline-block;">
                <div class="right">
                  <img class="conImg right col100" v-if="item.type == 'image'" :src="item.file.url" alt=""
                    @click="ImgClick(index)" ref="audio">
                  <div class="conText back98e165" v-else-if="item.type == 'text'" ref="audio"> {{item.text}}</div>
                  <div class="conText back98e165" v-else-if="item.type == 'custom'" ref="audio"> {{item.content}}</div>
                  <audio v-else-if="item.type == 'audio' || item.type == 'file'" :src="item.file.url"
                    controls="controls" @canplay="AudioTime(index)" ref="audio"></audio>
                  <div class="audiobox back98e165" v-if="item.type == 'audio' || item.type == 'file'"
                    @click="AudioPlay(index)">
                    <span class="iconfont icon-chat_sound"></span>{{(item.file.size/100000).toFixed(0)}}
                  </div>

                </div>
              </div>
            </div>
            <img src="@/assets/img/photo1.jpg" class="photo right col10" />
          </div>
        </div>
      </div>
    </van-pull-refresh>
    <div class="fixed fixedbot clearfix bcakfff">
      <div class="col96 auto ">
        <div class="clearfix">
          <div class="left col8 center mar ">
            <div class="iconfont icon-iconmyexpression_ ft22 pointer" @click="Emoji"></div>
          </div>
          <div class="left col5 center mar relative left10">
            <div class="iconfont icon-Image ft22 pointer"></div>
            <input type="file" @change="ImageSend" id="imageSend" class="absInput pointer">
          </div>
          <div class="left col5 center mar relative left15">
            <div class="iconfont icon-phone  phoneIcon" @click="Phone"></div>
          </div>
          <div class="right col10 center mar relative clearfix">

            <div>
              <div class="iconfont icon-sound ft22" @touchstart="AudioSendStart" @touchend="AudioSendEnd">
              </div>
            </div>
          </div>
        </div>
        <div>
          <textarea class="col100 inputContent border0" v-model="content" name="emoji" @input="InputContent">
        </textarea>
        </div>
        <div class="right col13 center mar leftcol3 relative pointer" @click="Send">
          <div class="absolute saveButton ft16">发送</div>
        </div>
      </div>
    </div>
    <!-- 图片点击放大定位 -->
    <div class="fixed bigImgCssBox" v-if="bigImg.imgScreen" v-bind:style="{height: bigImg.window}"
      @click="BigImgCssBox">
      <img :src="bigImg.imgUrl" alt="" class="col100">
    </div>
    <!-- 表情包定位 -->
    <picker :include="['people']" :showSearch="false" :showPreview="false" :showCategories="false" @select="addEmoji"
      v-if="emoji.emojiStatus" />
    <!-- 确认聊天定位 -->
    <van-popup v-model="calling" position="bottom" :style="{ height: '100%' }">
      <div class="callingback">
        <div class="calling80 relative">
          <div class="center "><img src="@/assets/img/photo1.jpg" class="callingImg  col30 " /></div>
          <div class="center absolute iconhangupbox">
            <span class="iconfont icon-phone-hang-up iconhangup" @click="HangHp"></span>
          </div>
        </div>


      </div>
    </van-popup>
  </div>
</template>

<script>
  import NIM from "@/assets/js/NIM_Web_NIM_v7.8.1.js"
  import WebRTC from "@/assets/js/NIM_Web_WebRTC_v7.8.1.js"
  import { Picker } from "emoji-mart-vue";
  import Recorder from 'js-audio-recorder'
  export default {
    components: {
      Picker
    },
    data() {
      return {
        Mobile: true,//是否为手机
        calling: false,//是否为通话中
        callingStatus: {
          beCalling: false,
          type: null,
          beCalledInfo: null,
          busy: false
        },
        myAccid: null,
        myToken: null,
        youAccid: null,
        netcall: null,
        time: '下拉加载历史记录',
        nim: null,
        list: [],//聊天对话
        isLoading: false,
        disabled: false,//禁止加载更多
        content: '',//input中的内容
        bigImg: {
          imgScreen: false,//图片放大遮幕
          imgUrl: null,//图片放大路径
          window: null,
        },
        emoji: {
          emojiStatus: false
        },
        textarea: {
          height: '28px',
        },
        audioSend: {//录音按钮合集合集
          fun: null,
          starttime: 0,
          plug: null,
        },
        audioTime: [],
      }
    },
    methods: {
      HangHp() {//音视频通话挂断
        this.netcall.hangup();
        this.calling = false;
        this.callingStatus.beCalling = false;
        // 呼叫类型
        this.callingStatus.type = null;
        // 被叫信息
        this.callingStatus.beCalledInfo = null;
        // 是否正忙
        this.callingStatus.busy = false;
      },
      AudioPlay(e) {//录音播放暂停
        console.log(this.list);
        if (this.list[e].audioObj.currentTime == 0 || this.list[e].audioObj.currentTime == this.list[e].audioObj.duration) {
          this.list[e].audioObj.play();
        } else {
          if (this.list[e].audioObj.paused) {
            this.list[e].audioObj.play();
          } else {
            this.list[e].audioObj.pause();
          }
        }
      },
      AudioTime(e) {//audio对象赋予list
        console.log(e);
        this.list[e]['audioObj'] = this.$refs.audio[e];
      },
      Phone: function () {//CAll
        
        var that = this;
        const netcall = this.netcall;
        const pushConfig = {
          enable: false,
          needBadge: false,
          needPushNick: false,
          pushContent: '2020年9月22日15:29:15',
          custom: '测试自定义数据',
          pushPayload: '',
          sound: '',
          forceKeepCalling: 0
        };
        const sessionConfig = {
          videoQuality: WebRTC.CHAT_VIDEO_QUALITY_HIGH,
          videoFrameRate: WebRTC.CHAT_VIDEO_FRAME_RATE_15,
          videoBitrate: 0,
          recordVideo: false,
          recordAudio: false,
          highAudio: false,
          bypassRtmp: false,
          rtmpUrl: '',
          rtmpRecord: false,
          splitMode: WebRTC.LAYOUT_SPLITLATTICETILE
        };
        this.$dialog.confirm({
          title: '确定要拨打么',
        })
          .then(() => {
            that.netcall.call({//发起呼叫请求
              type: WebRTC.NETCALL_TYPE_AUDIO,
              webrtcEnable: true,
              account: that.youAccid,
              pushConfig: pushConfig,
              sessionConfig: sessionConfig
            }).then(function (obj) {//成功发起呼叫
              console.log('成功发起呼叫,111111111111111111111111111111111111111111', obj);
              that.netcall.on('callAccepted', function (obj) {
                // 缓存呼叫类型，后面开启音视频连接需要用到
                console.log('主叫收到被叫响应通知-接受，44444444444444444444444444444444444444444444444444444444444444444444444', obj);
                const netcall = that.netcall;
                const audioSource = new MediaStream();
                console.log(audioSource);
                console.log(WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT);

                netcall.startDevice({
                  type: WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT
                }).catch(function () {
                  console.log('播放对方的声音失败')
                }).then(function () {
                  console.log('播放对方的声音成功');
                  that.calling = true;

                })
              });
            }).catch(function (err) {//失败呼叫回调
              console.log(err)
            })
          })
          .catch(() => {
            // on cancel
          });
      },
      PassivePhone: function () {//被Call
        var that = this;
        // 是否被叫中
        this.callingStatus.beCalling = false;
        // 呼叫类型
        this.callingStatus.type = null;
        // 被叫信息
        this.callingStatus.beCalledInfo = null;
        // 是否正忙
        this.callingStatus.busy = false;
        const sessionConfig = {
          videoQuality: WebRTC.CHAT_VIDEO_QUALITY_HIGH,
          videoFrameRate: WebRTC.CHAT_VIDEO_FRAME_RATE_15,
          videoBitrate: 0,
          recordVideo: false,
          recordAudio: false,
          highAudio: false,
          bypassRtmp: false,
          rtmpUrl: '',
          rtmpRecord: false,
          splitMode: WebRTC.LAYOUT_SPLITLATTICETILE
        };
        const netcall = this.netcall;
        // 开启监听
        netcall.on('beCalling', function (obj) {
          /*  that.Push(); */
          console.log('on beCalling', obj);
          const channelId = obj.channelId;
          // 被叫回应主叫自己已经收到了通话请求
          netcall.control({
            channelId: channelId,
            command: WebRTC.NETCALL_CONTROL_COMMAND_START_NOTIFY_RECEIVED
          });
          // 只有在没有通话并且没有被叫的时候才记录被叫信息, 否则通知对方忙并拒绝通话
          if (!netcall.calling && !that.callingStatus.beCalling) {
            that.callingStatus.type = obj.type;
            that.callingStatus.beCalling = true;
            that.callingStatus.beCalledInfo = obj;
            //alert("收到" + obj.account + "的呼叫");
          } else {
            if (netcall.calling) {
              that.callingStatus.busy = netcall.notCurrentChannelId(obj);
            } else if (that.callingStatus.beCalling) {
              that.callingStatus.busy = that.callingStatus.beCalledInfo.channelId !== channelId;
            }
            if (that.callingStatus.busy) {
              netcall.control({
                channelId: channelId,
                command: WebRTC.NETCALL_CONTROL_COMMAND_BUSY
              });
              // 拒绝通话
              console.log(that.callingStatus.busy, '正忙')
              netcall.response({
                accepted: false,
              });
            }
          }

          that.$dialog.confirm({
            title: '收到' + that.youAccid + '的呼叫',
          }).then(function (res) {
            netcall.response({
              accepted: true,
              beCalledInfo: that.callingStatus.beCalledInfo,
              sessionConfig: sessionConfig
            }).catch(function (err) {
              reject();
              console.log('接听失败', err);
            });
          }).catch(function () {
            netcall.response({
              accepted: false,
              beCalledInfo: obj
            });
          })

        });

        netcall.on('callAccepted', function (obj) {
          that.callingStatus.type = obj.type;
          console.log('on callAccepted', obj);
          netcall.startRtc().then(function () {
            // 开启麦克风
            netcall.startDevice({
              type: WebRTC.DEVICE_TYPE_AUDIO_IN,
              //device: device
            }).then(function () {
              console.log('启动麦克风成功')
              //通知麦克风打开
              var param = {
                channelId: netcall.channelId,
                command: WebRTC.NETCALL_CONTROL_COMMAND_NOTIFY_AUDIO_ON
              }
              netcall.control(param)
              // 设置采集音量
              netcall.setCaptureVolume(255);
              that.calling = true;
            }).catch(function (err) {
              console.log('启动麦克风失败', err)
            })

          })
            .catch(function (err) {
              console.log('发生错误')
              console.log(err)
              netcall.hangup()
            })
        });
        netcall.on('remoteTrack', function (obj) {
          console.log('user join', obj)
          // 播放对方声音
          netcall.startDevice({
            type: WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT
          }).catch(function (err) {
            console.log('播放对方的声音失败')
            console.error(err)
          })
        });

        netcall.on('hangup', function (obj) {
          console.log('on hangup', obj);
          // 判断需要挂断的通话是否是当前正在进行中的通话
          console.log(!that.callingStatus.beCalledInfo)
          //console.log(beCalledInfo.channelId)
          console.log(obj.channelId);
          if (!that.callingStatus.beCalledInfo || that.callingStatus.beCalledInfo.channelId === obj.channelId) {
            console.log('进来了')
            // 清理工作
            that.calling = false;

            that.callingStatus.beCalling = false;
            // 呼叫类型
            that.callingStatus.type = null;
            // 是否正忙
            that.callingStatus.busy = false;
            // 被叫信息
            that.callingStatus.beCalledInfo = null;
          }
        });
      },
      Push() {//消息推送
        var that = this;
        this.$axios({
          url: "http://60.190.98.133:7026/app/push/message/pushone",
          method: "POST",
          data: {
            yunxinAccid: that.myAccid,
            youAccid: that.youAccid,
          },
        }).then(function (res) {
          console.log(res);
        })
      },
      AudioSendStart() {//手指按下时
        var that = this;
        setTimeout(function () {
          console.log(that.audioSend.plug)
        }, 200)

        that.audioSend.plug.start();
        this.audioSend.fun = setTimeout(function () {
          that.audioSend.starttime = 1;
        }, 1000)
      },
      AudioSendEnd() {//手指松开时
        var that = this;
        clearTimeout(that.audioSend.fun);
        if (that.audioSend.starttime != 1) {
          that.$toast('按住时间不超过一秒');
          that.audioSend.plug.stop();
        } else {
          that.audioSend.plug.stop();
          console.log(that.audioSend.plug.getWAVBlob());
          if (that.audioSend.plug.getWAVBlob().size > 100) {
            that.nim.sendFile({
              scene: 'p2p',
              to: that.youAccid,
              blob: that.audioSend.plug.getWAVBlob(),
              uploadprogress: function (obj) {
                console.log('文件总大小: ' + obj.total + 'bytes');
                console.log('已经上传的大小: ' + obj.loaded + 'bytes');
                console.log('上传进度: ' + obj.percentage);
                console.log('上传进度文本: ' + obj.percentageText);
              },
              uploaddone: function (error, file) {
                console.log('上传' + (!error ? '成功' : '失败'), error, file);
              },
              beforesend: function (msg) {
                that.list.push(msg);
                that.Push();
              },
              done: function (error, msg) {
                console.log(error, msg);
              }
            });
          } else {
            that.$toast('请重新录音');
          }


          that.audioSend.plug.destroy();
        }
        that.audioSend.starttime = 0;
      },
      InputContent(e) {//输入框input的高度
        this.textarea.height = e.target.scrollHeight + 'px';
      },
      Emoji() {//表情
        this.emoji.emojiStatus = !this.emoji.emojiStatus;
      },
      addEmoji(e) {//添加表情
        this.content += e.native;
      },
      BigImgCssBox: function () {//点击图片是否为放大
        this.bigImg.imgScreen = false;
      },
      ImgClick: function (e) {//点击图片放大
        this.bigImg.imgUrl = this.list[e].file.url;
        this.bigImg.imgScreen = true;
      },
      ImageSend: function () {//发送图片
        var that = this;
        this.nim.sendFile({
          scene: 'p2p',
          to: that.youAccid,
          type: 'image',
          fileInput: imageSend,
          uploadprogress: function (obj) {
            console.log('文件总大小: ' + obj.total + 'bytes');
            console.log('已经上传的大小: ' + obj.loaded + 'bytes');
            console.log('上传进度: ' + obj.percentage);
            console.log('上传进度文本: ' + obj.percentageText);
          },
          uploaddone: function (error, file) {
            console.log('上传' + (!error ? '成功' : '失败'), error, file);
          },
          beforesend: function (msg) {
            console.log('正在发送p2p image消息, id=' + msg.idClient);
            that.list.push(msg);
            that.pushMsg(msg);
            that.Push();
          },
          done: function (error, res) {

            //that.list.push(res);
          }
        });
      },
      pushMsg(msgs) {
        if (!Array.isArray(msgs)) { msgs = [msgs]; }
        var sessionId = msgs[0].sessionId;
        data.msgs = data.msgs || {};
        data.msgs[sessionId] = nim.mergeMsgs(data.msgs[sessionId], msgs);
      },
      Send: function () {//点击发送
        this.emoji.emojiStatus = false;
        var that = this;
        var msg = this.nim.sendCustomMsg({
          scene: 'p2p',
          to: that.youAccid,
          content: that.content,
          done: that.sendMsgDone
        });

      },
      sendMsgDone(error, msg) {//点击发送回调
        //console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient, error, msg);
        console.log(msg);
        if (!error) {
          this.list.push(msg);
          this.content = '';
          this.Push();
        }
      },
      onRefresh() {//下拉加载历史记录
        console.log(123)
        var that = this;
        var initialHeight = that.$refs.element.clientHeight;
        setTimeout(() => {
          that.nim.getHistoryMsgs({
            scene: 'p2p',
            to: that.youAccid,
            done: getHistoryMsgsDone
          });
          function getHistoryMsgsDone(error, obj) {
            console.log('获取云端历史记录' + (!error ? '成功' : '失败'), error, obj);
            that.isLoading = false;
            if (!error) {

              that.list = obj.msgs.reverse();
              that.time = '到顶了';
              that.disabled = true;//禁止加载更多
              setTimeout(function () {
                that.$toast('加载成功');

                window.scrollTo(0, that.$refs.element.clientHeight - initialHeight);
              }, 1000)
            }
          }
        }, 1000);
      },
      back() {//返回上一页
        this.$router.go(-1)
      },
      Text() {//IM初始化
        var data = {};
        var that = this;
        this.nim = NIM.getInstance({
          debug: true,
          appKey: '3934c180238ac0fff98c048ec385cf7f',
          account: that.myAccid, //帐号, 应用内唯一
          token: that.myToken,
          onconnect: onConnect,
          onwillreconnect: onWillReconnect,
          ondisconnect: onDisconnect,
          onerror: onError,
          onsessions: onSessions,
          onupdatesession: onUpdateSession,
        });
        function onConnect(res) {
          console.log('连接成功');
          that.ReadyNum();//一开始的聊天数量
          that.AudioAndVideo();//音视频SDK
          that.PassivePhone();
        };
        function onWillReconnect(res) {
          console.log('即将重连');
        };
        function onDisconnect(error) {
          // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
          console.log('丢失连接');
          console.log(error);
          if (error) {
            switch (error.code) {
              // 账号或者密码错误, 请跳转到登录页面并提示错误
              case 302:
                break;
              // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
              case 417:
                break;
              // 被踢, 请提示错误后跳转到登录页面
              case 'kicked':
                break;
              default:
                break;
            }
          }
        };
        function onError(error) {
          console.log(error);
        };
        function onSessions(sessions) {
          console.log('收到会话列表', sessions);
          updateSessionsUI();
        };
        function onUpdateSession(session) {
          console.log('会话更新了', session);
          if (session.lastMsg.flow == "in") {
            that.list.push(session.lastMsg);
          }
          data.sessions = that.nim.mergeSessions(data.sessions, session);
          that.ScrollToFun();

          updateSessionsUI();

        };
        function updateSessionsUI() {
          // 刷新界面
        };
      },
      IsPc() {//判断是否为PC端
        var that = this;
        function IsPC() {
          var userAgentInfo = navigator.userAgent;
          var Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"];
          var flag = true;
          for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
              flag = false;
              break;
            }
          }
          return flag;
        };
        that.Mobile = !IsPC()
      },
      handleScroll() {//下拉加载
        var that = this;
        document.onmousewheel = function (e) {
          var e = e || window.event;
          if (e.wheelDelta > 0) {
            setTimeout(() => {
              if (!that.disabled) {
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                if (scrollTop == 0) {
                  that.$toast.loading({
                    message: '加载中...',
                    forbidClick: true,
                  });
                  var initialHeight = that.$refs.element.clientHeight;
                  that.nim.getHistoryMsgs({
                    scene: 'p2p',
                    to: that.youAccid,
                    done: getHistoryMsgsDone
                  });
                  function getHistoryMsgsDone(error, obj) {
                    console.log('获取云端历史记录' + (!error ? '成功' : '失败'), error, obj);
                    if (!error) {
                      that.list = obj.msgs.reverse();
                      that.time = '到顶了';
                      that.disabled = true;//禁止加载更多
                      setTimeout(function () {
                        that.$toast('加载成功');
                        that.isLoading = false;
                        window.scrollTo(0, that.$refs.element.clientHeight - initialHeight);
                      }, 1000);
                    }
                  }
                }
              }
            }, 1000);
          }
        };

      },
      ReadyNum: function () {//5条刚加载时
        var that = this;
        setTimeout(function () {
          that.nim.getHistoryMsgs({
            scene: 'p2p',
            to: that.youAccid,
            done: getHistoryMsgsDone
          });
          function getHistoryMsgsDone(error, obj) {
            if (!error) {
              obj.msgs.splice(5, obj.msgs.length);
              that.list = obj.msgs.reverse();
              that.$toast.clear();
            }
          }
        }, 400);
      },
      AudioAndVideo: function () {//音视频集成
        var that = this;
        NIM.use(WebRTC);

        this.netcall = WebRTC.getInstance({
          nim: that.nim,
          debug: false
        });
      },
      ScrollToFun() {//滑倒最底部
        setTimeout(function () {
          window.scrollTo(0, 99999);
        }, 300)
      },
      MyFun() {
        window.addEventListener('mousewheel', this.handleScroll, true);
        /* this.$toast.loading({
          message: '加载中...',
          overlay: true,
          forbidClick: true,
          duration: 0
        }); */
        var that = this;
        this.IsPc();
        this.bigImg.window = document.body.clientHeight + 'px';//点击图片放大fixed高度
        this.myAccid = this.$route.query.yunxinAccid;
        this.myToken = this.$route.query.yunxinToken;
        this.youAccid = this.$route.query.youAccid;
        this.audioSend.plug = new Recorder({
          compiling: true,       // 是否边录边转换
        });
        if (!this.Mobile) {//回车键触发发送按钮
          document.addEventListener("keydown", function () {
            if (event.keyCode == 13) {
              that.Send();
            }
          })
        }
      },
    },
    created: function () {
      this.MyFun();
      this.Text();

     
    }
  }
</script>
<style>
  .calling80 {
    height: 60%;
    padding-top: 20%;
  }

  .iconhangupbox {
    width: 100%;
    bottom: 0;
  }

  .iconhangup {
    color: #fff;
    font-size: 30px !important;
    background-color: #e46568;
    padding: 5px 50px;
    border-radius: 20px;
  }

  .callingback {
    height: 100%;
    background-image: linear-gradient(#e66465, #9198e5);
  }

  .callingImg {
    border-radius: 100px;
  }

  .inputContent {
    text-indent: 5px;
    resize: none;
    height: 100px;
  }

  .emoji-mart {
    width: 100% !important;
    position: fixed;
    bottom: 67px;
  }

  .bigImgCssBox {
    z-index: 2;
    background-color: rgb(0, 0, 0);
    top: 0px;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .absInput {
    width: 100%;
    top: 0;
    left: 0;
    position: absolute;
    opacity: 0;
  }

  html {
    height: 100%;
  }

  body {
    height: 100%;
  }

  #app {
    height: 100%;
  }

  .fixedbot {
    bottom: 0px;
    width: 100%;
    padding: 5px 0 30px 0;
    border-top: #ececec 1px solid;
    line-height: 26px;
    height: 150px;
  }

  .fixedbot .mar {
    margin-top: 2px;
  }

  .conImg {
    max-width: 100%;
    border-radius: 5px;
  }

  body {
    background-color: #f2f2f2;
  }

  .vanpull {
    height: 100%;
  }

  .Con {
    margin-bottom: 180px;
    overflow-y: hidden;
  }

  .header {
    line-height: 36px;
    width: 100%;
    z-index: 9;
  }

  .time {
    line-height: 28px;
    margin-top: 36px;
  }

  .photo {
    border-radius: 6px;

  }

  .conText {
    padding: 8px 12px;
    word-break: break-all;
    border-radius: 5px;
  }

  .conbox audio {
    display: none;
  }

  .conbox {
    margin-bottom: 15px;
  }

  .audiobox {
    background-color: #fff;
    padding: 0px 20px;
    border-radius: 5px;
    line-height: 35px;
  }

  .audiobox span {
    margin-right: 10px;
  }

  .phoneIcon {
    right: 15px;
    top: 1px;
    font-size: 22px !important;
  }

  .saveButton {
    font-size: 14px;
    line-height: 20px;
    border: 1px solid #ccc;
    padding: 1px 8px;
  }

  .saveButton:hover {
    background: #129611;
    color: #fff;
  }

  .emoji-mart {
    bottom: 185px;
    height: 170px;
  }
</style>