(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var containers = document.querySelectorAll("[data-player]");

    containers.forEach(function (container) {
      var video = container.querySelector("video[data-src]");
      var playButton = container.querySelector("[data-play]");
      var status = container.querySelector("[data-player-status]");
      var hlsInstance = null;
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function startPlayer() {
        if (!video || initialized) {
          if (video) {
            video.play().catch(function () {});
          }
          return;
        }

        initialized = true;
        var source = video.getAttribute("data-src");
        if (playButton) {
          playButton.classList.add("is-hidden");
        }
        setStatus("正在加载播放源...");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
            video.play().catch(function () {
              setStatus("播放源已就绪，请点击视频播放");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("网络波动，正在重试...");
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("媒体错误，正在恢复...");
              hlsInstance.recoverMediaError();
            } else {
              setStatus("播放源暂时无法加载");
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("播放源已就绪");
            video.play().catch(function () {
              setStatus("播放源已就绪，请点击视频播放");
            });
          }, { once: true });
        } else {
          setStatus("当前浏览器需要支持 HLS 才能播放 m3u8 视频");
        }
      }

      if (playButton) {
        playButton.addEventListener("click", startPlayer);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!initialized) {
            startPlayer();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
