## Bugs in spatial audio

The audio spatialization (using WebAudio) still seems buggy in Chromium, leading to unreliable behavior in mobile Chrome, Samsung Internet, and Oculus Browser.
This manifests itself in audio _sometimes_ not being routed properly through the audio graph, causing the loss of panoration (spatialization).
The audio by itself, however, does continue playing. This problem does not happen in desktop browsers.

In general, Chromium (desktop and otherwise) also still requires a remote audio stream (WebRTC) to be attached to a dummy `Audio`-element (can be muted) in order to make the stream audible when creating a WebAudio source node with `context.createMediaStreamSource`. Also, `createMediaElementSource` does not work in Chromium. Firefox does not suffer from these problems.

### Read more (e.g.):

https://bugs.chromium.org/p/chromium/issues/detail?id=121673
https://bugs.chromium.org/p/chromium/issues/detail?id=477364
https://stackoverflow.com/questions/36581380/audio-level-meter-for-web-rtc-stream/36620646#36620646