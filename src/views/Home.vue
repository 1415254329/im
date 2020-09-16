<template>
  <div style="height: 100%;">
    <div class="header fixed center backfff ">
      <div class="iconfont icon-arrowl absolute" @click="back" v-if="Mobile"></div>
      <div class="ft18">{{youAccid}}</div>
    </div>
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh" :class="!disabled ? 'vanpull' : 'a12'"
      :disabled="disabled">
      <div class="Con col94 auto" ref="element">
        <div class="time center ft12 colorbbb">{{time}}</div>
        <div v-for="(item,index) in list">
          <div class="you clearfix conbox" v-if="item.flow == 'in'">
            <img src="https://dss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=251289958,1860898046&fm=26&gp=0.jpg"
              class="photo left col10" />
            <div class="right col85 ">
              <div style="display: inline-block;">
                <img class="conImg" v-if="item.type == 'image'" :src="item.file.url" alt="" @click="ImgClick(index)">
                <div class="conText backfff" v-else-if="item.type == 'text'"> {{item.text}}</div>
                <div class="conText backfff" v-else-if="item.type == 'custom'"> {{item.content}}</div>
                <audio v-else-if="item.type == 'audio' || item.type == 'file'" :src="item.file.url"
                  controls="controls"></audio>
              </div>

            </div>
          </div>
          <div class="i clearfix conbox" v-else>
            <div class="left col85 ">
              <div class=" clearfix right" style="display: inline-block;">
                <div class="right">
                  <img class="conImg right col100" v-if="item.type == 'image'" :src="item.file.url" alt=""
                    @click="ImgClick(index)">
                  <div class="conText back98e165" v-else-if="item.type == 'text'"> {{item.text}}</div>
                  <div class="conText back98e165" v-else-if="item.type == 'custom'"> {{item.content}}</div>
                  <audio v-else-if="item.type == 'audio' || item.type == 'file'" :src="item.file.url"
                    controls="controls"></audio>
                </div>

              </div>

            </div>
            <img src="https://dss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3582194852,1481557220&fm=26&gp=0.jpg"
              class="photo right col10" />
          </div>
        </div>
      </div>
    </van-pull-refresh>
    <div class="fixed fixedbot clearfix">
      <div class="left col10 center mar relative">
        <div v-if="Mobile">
          <div class="iconfont icon-sound ft22" @touchstart="AudioSendStart" @touchend="AudioSendEnd"></div>
          <input type="file" accept="audio/*" capture="microphone" @change="AudioSend" id="audioSend" class="absInput">
        </div>

      </div>
      <div class="left col60">
        <!-- <input type="text" class="col100" v-model="content" name="emoji"> -->
        <textarea class="col100 inputContent" v-model="content" name="emoji" @input="InputContent"
          :style="{height: textarea.height}">


        </textarea>
      </div>
      <div class="left col8 center mar ">
        <div class="iconfont icon-iconmyexpression_ ft22" @click="Emoji"></div>
      </div>
      <div class="left col5 center mar relative">
        <div class="iconfont icon-Image ft22"></div>
        <input type="file" @change="ImageSend" id="imageSend" class="absInput">
      </div>
      <div class="left col13 center mar leftcol3 relative" @click="Send">
        <div class="absolute">发送</div>
      </div>
    </div>
    <div class="fixed bigImgCssBox" v-if="bigImg.imgScreen" v-bind:style="{height: bigImg.window}"
      @click="BigImgCssBox">
      <img :src="bigImg.imgUrl" alt="" class="col100">
    </div>
    <picker :include="['people']" :showSearch="false" :showPreview="false" :showCategories="false" @select="addEmoji"
      v-if="emoji.emojiStatus" />
  </div>
</template>

<script>
  import NIM from "@/assets/js/NIM_Web_NIM_v7.8.1.js"
  import { Picker } from "emoji-mart-vue";
  import Recorder from 'js-audio-recorder'
  export default {
    components: {
      Picker
    },
    data() {
      return {
        Mobile: true,
        myAccid: null,
        myToken: null,
        youAccid: null,
        time: '下拉加载历史记录',
        nim: null,
        list: [],//聊天对话
        isLoading: false,
        disabled: false,//禁止加载更多
        content: ' ',//input中的内容
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
        audioSend: {//录音合集
          fun: null,
          starttime: 0,
          plug: null,
        }
      }
    },
    methods: {

      Push() {//消息推送
        var that = this;
        this.$axios({
          url: "http://192.168.1.88:9999/app/push/message/pushone",
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
        this.audioSend.fun = setTimeout(function () {
          that.audioSend.starttime = 1;
          that.audioSend.plug.start();
        }, 1000)
      },
      AudioSendEnd() {//手指松开时
        var that = this;
        clearTimeout(that.audioSend.fun);
        if (that.audioSend.starttime != 1) {
          that.$toast('按住时间不超过一秒');
        } else {
          that.audioSend.plug.stop();
          that.nim.sendFile({
            scene: 'p2p',
            to: that.youAccid,
            fileInput: that.audioSend.plug.getWAVBlob(),
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
              pushMsg(msg);
            },
            done: function (res) {
              console.log(res);
            }
          });
          console.log(that.audioSend.plug.getWAVBlob())
          that.audioSend.plug.destroy();
        }
        that.audioSend.starttime = 0;
      },
      InputContent(e) {//输入框input的高度
        this.textarea.height = e.target.scrollHeight + 'px';
      },
      Emoji() {
        this.emoji.emojiStatus = !this.emoji.emojiStatus;
      },
      addEmoji(e) {
        this.content += e.native;
      },
      BigImgCssBox: function () {//点击图片是否为放大
        this.bigImg.imgScreen = false;
      },
      ImgClick: function (e) {//点击图片放大
        this.bigImg.imgUrl = this.list[e].file.url;
        this.bigImg.imgScreen = true;
      },
      AudioSend: function (e) {//语音录制
        console.log(audioSend);
        var that = this;
        that.nim.previewFile({
          type: '',
          fileInput: audioSend,
          uploadprogress: function (obj) {
            console.log('文件总大小: ' + obj.total + 'bytes');
            console.log('已经上传的大小: ' + obj.loaded + 'bytes');
            console.log('上传进度: ' + obj.percentage);
            console.log('上传进度文本: ' + obj.percentageText);
          },
          done: function (error, file) {
            console.log('上传Audio' + (!error ? '成功' : '失败'));
            // show file to the user
            if (!error) {
              that.nim.sendFile({
                scene: 'p2p',
                to: that.youAccid,
                file: file,
                done: function (error, msg) {
                  var mp3 = that.nim.audioToMp3({
                    url: msg.file.url
                  });
                  msg.file.url = mp3;
                  that.list.push(msg);
                  setTimeout(function () {
                    window.scrollTo(0, 999999);
                  }, 100)
                }
              });
            }
          }
        });
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
            setTimeout(function () {
              window.scrollTo(0, 999999);
            }, 100)
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
      sendMsgDone(error, msg) {
        //console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient, error, msg);
        console.log(msg);
        if (!error) {
          this.list.push(msg);
          this.content = null;
          setTimeout(function () {
            window.scrollTo(0, 999999);
          }, 100)
          this.Push();
        }
      },
      onRefresh() {//下拉加载历史记录
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
            if (!error) {
              for (let i = 0; i < obj.msgs.length; i++) {
                if (obj.msgs[i].type == "audio" || obj.msgs[i].type == "file") {
                  var mp3 = that.nim.audioToMp3({
                    url: obj.msgs[i].file.url
                  });
                  obj.msgs[i].file.url = mp3
                }
              }
              that.list = obj.msgs.reverse();
              that.time = '到顶了';
              that.disabled = true;//禁止加载更多
              setTimeout(function () {
                that.$toast('加载成功');
                that.isLoading = false;
                window.scrollTo(0, that.$refs.element.clientHeight - initialHeight);
              }, 1000)
            }
          }
        }, 1000);
      },

      back() {
        this.$router.go(-1)
      },

      Text() {//IM初始化
        var data = {};
        var that = this;
        this.nim = NIM.getInstance({
          //debug: true,
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

      handleScroll() {
        var that = this;
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
                  for (let i = 0; i < obj.msgs.length; i++) {
                    if (obj.msgs[i].type == "audio" || obj.msgs[i].type == "file") {
                      var mp3 = that.nim.audioToMp3({
                        url: obj.msgs[i].file.url
                      });
                      obj.msgs[i].file.url = mp3
                    }
                  }
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
      },
      MyFun() {
        var that = this;
        this.IsPc();
        this.bigImg.window = document.body.clientHeight + 'px';//点击图片放大fixed高度
        console.log(this.$route.query);
        this.myAccid = this.$route.query.yunxinAccid;
        this.myToken = this.$route.query.yunxinToken;
        this.youAccid = this.$route.query.youAccid;
        let recorder = new Recorder();
        this.audioSend.plug = new Recorder();
        if (!this.Mobile) {
          document.addEventListener("keydown", function () {
            if (event.keyCode == 13) {
              that.Send();
            }
          })
        }
        setTimeout(function () {
          that.nim.getHistoryMsgs({
            scene: 'p2p',
            to: that.youAccid,
            done: getHistoryMsgsDone
          });
          function getHistoryMsgsDone(error, obj) {
            console.log(obj,error)
            if (!error) {
              for (let i = 0; i < 4; i++) {
                if (obj.msgs[i].type == "audio" || obj.msgs[i].type == "file") {
                  var mp3 = that.nim.audioToMp3({
                    url: obj.msgs[i].file.url
                  });
                  obj.msgs[i].file.url = mp3
                }
              }
              console.log(obj.msgs.splice(5, obj.msgs.length));
              that.list = obj.msgs.reverse();
            }
          }
        }, 300)

      },
    },

    created: function () {
      var that = this;
      this.MyFun();
      this.Text();
      window.addEventListener('mousewheel', this.handleScroll, true);



    }
  }
</script>
<style>
  .inputContent {
    text-indent: 5px;
    resize: none;
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
    background-color: #f5f5f5;
    line-height: 26px;
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
    margin-bottom: 80px;
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

  .conbox {
    margin-bottom: 15px;
  }
</style>