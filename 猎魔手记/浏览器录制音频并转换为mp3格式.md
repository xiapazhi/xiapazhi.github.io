# 浏览器录制音频并转换为mp3格式
```js
import React, { useState, useEffect, useRef } from 'react'
import { connect, } from 'umi';
import lamejs from 'lamejs'
import Recorder from "js-audio-recorder";
import { Button } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

const Index = (props) => {
   // 录音并转为 MP3 的工具

   /** 用 Recorder 实现 */
   const recorder = useRef(
      new Recorder({
         sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
         sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
         numChannels: 1,
      })
   )

   //开始录音
   const start = () => {
      Recorder.getPermission().then(
         () => {
            console.log("获取录音权限成功");
         },
         (error) => {
            console.log(`${error.name} : ${error.message}`);
         }
      );
      recorder.current.start().then(
         () => {
            // 开始录音
         },
         (error) => {
            // 出错了
            console.log(`${error.name} : ${error.message}`);
         }
      );
   };

   // 停止录音
   const stop = () => {
      recorder.current.stop();
   };

   // 播放录音
   const play = () => {
      recorder.current.play();
   };

   // 销毁录音实例，置为null释放资源，fn为回调函数，
   const destroy = () => {
      if (recorder.current) {
         recorder.current.destroy().then(function () {
            recorder.current = null;
         });
      }
   };
   // 下载mp3文件
   const download = () => {
      const WavBlob = recorder.current.getWAV();
      const mp3Blob = convertToMp3(WavBlob); //转换成功的mp3Blob
      //  recorder.current.download(mp3Blob, "recorder", "mp3");

      // 发送网络请求到服务器
      // 注意这里的api接口
      //  headers: { 'Content-Type': 'multipart/form-data' },
      // data传入mp3Blol
      let audioFile = new File([mp3Blob], Date.now() + ".mp3", {
         type: mp3Blob.type,
      });
      let fd = new FormData();
      fd.append("filename", audioFile);
      // axios({
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   },
      //   method: 'post',
      //   url: '/file/upload',
      //   data: fd
      // })
      // let result = await apiUpload(fd)

      // 下载到本地
      let downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(mp3Blob);
      downloadLink.download = 'audio.mp3';
      document.body.appendChild(downloadLink);
      downloadLink.click();
   };
   // 通过lamejs把wav转换成mp3Blol
   const convertToMp3 = (wavDataView) => {
      // 获取wav头信息
      const wav = lamejs.WavHeader.readHeader(wavDataView); // 此处其实可以不用去读wav头信息，毕竟有对应的config配置
      const { channels, sampleRate } = wav;
      const mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      // 获取左右通道数据
      const result = recorder.current.getChannelData();
      const buffer = [];
      const leftData =
         result.left &&
         new Int16Array(result.left.buffer, 0, result.left.byteLength / 2);
      const rightData =
         result.right &&
         new Int16Array(result.right.buffer, 0, result.right.byteLength / 2);
      const remaining = leftData.length + (rightData ? rightData.length : 0);
      const maxSamples = 1152;
      for (let i = 0; i < remaining; i += maxSamples) {
         const left = leftData.subarray(i, i + maxSamples);
         let right = null;
         let mp3buf = null;
         if (channels === 2) {
            right = rightData.subarray(i, i + maxSamples);
            mp3buf = mp3enc.encodeBuffer(left, right);
         } else {
            mp3buf = mp3enc.encodeBuffer(left);
         }
         if (mp3buf.length > 0) {
            buffer.push(mp3buf);
         }
      }
      const enc = mp3enc.flush();
      if (enc.length > 0) {
         buffer.push(enc);
      }
      return new Blob(buffer, { type: "audio/mp3" });
   };
   /** 用 Recorder 实现 END */

   return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
         <AudioOutlined style={{ fontSize: 128, cursor: 'pointer' }} onClick={() => {
            /** 调用 Recorder 实现 */
            start()
            setTimeout(() => {
               stop()
               play()
               download()
               destroy()
            }, 5000)
            /** 调用 Recorder 实现 END */
         }} />
      </div>
   )
}

export default connect((state) => {
   const { } = state
   return {

   }
})(Index);
```

注意：

_lamejs 的最新版本有若干bug，严重影响使用，所以需指定安装版本 @1.2.0_