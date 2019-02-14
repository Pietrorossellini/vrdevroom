# VR deVRoom

<img src="https://github.com/Pietrorossellini/vrdevroom/raw/master/docs/logo.png" align="right" />

VR deVRoom is a networked WebVR prototype application for supporting remote collaboration within agile software development.
It presents a virtual room with a Kanban-style board that the users can manipulate together.

The prototype uses [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) for communication
and the VR environment is built on top of [A-Frame](https://aframe.io/).

**NB**: the prototype is designed for Samsung Gear VR with the Gear VR Controller and works best with the Oculus Browser.
There are currently no input mappings for other VR controllers.
However, the application can also be used with a modern desktop browser. 

## Features

### Avatars for remote users

![avatar](https://github.com/Pietrorossellini/vrdevroom/raw/master/docs/avatar.gif)

Each user is represented with an **avatar** that mirrors the orientation of the user's head.

### Pointing

![pointing](https://github.com/Pietrorossellini/vrdevroom/raw/master/docs/pointing.gif)

Users can **point** objects in the environment (with the Gear VR controller), and the cards on the board respond to the pointing.
Press and hold the top button on the Gear VR Controller (or Space bar on a regular computer) to point.

### Board manipulation

![board](https://github.com/Pietrorossellini/vrdevroom/raw/master/docs/board.gif)

The cards on the board can be **dragged and dropped**.
Drag the cards with the trigger on the Gear VR Controller (or with the `c` key on a regular computer).

### Zooming

![zooming](https://github.com/Pietrorossellini/vrdevroom/raw/master/docs/zoom.gif)

To compensate the inadequate resolution of the current VR displays, the cards can be **zoomed** to make them more legible.
Zoom the cards by touching the touchpad on the Gear VR Controller (or by pressing and holding the `v` key on a regular computer).

### Audio

The prototype offers **spatialized audio**: the audio stream from each user is connected to the corresponding avatar,
and hence the sound appears to be coming from the direction where that user is in the virtual environment.

## Getting started

Interested in forking the prototype? Get up-and-running with these steps:

1. Set up the associated [signaling server](https://github.com/Pietrorossellini/vrdevroom-signaling-server).

1. Configure the signalling server address (and optionally a fixed room):

   Copy the `client/example-config.json` to `client/config.json` and dial in the appropriate values.

   Deleting the `roomName` will make the application prompt a room name for each user,
which essentially enables the support for multiple rooms.

1. Type:

    ```
    npm install
    ```
    and then just:
    ```
    npm start
    ```
    *or for live-reloaded dev serving*:
    ```
    npm run dev
    ```

Note that the WebRTC communication requires a secure connection (using either `localhost` or `HTTPS`).

### Notes

The demo version at [vrdevroom.com](https://www.vrdevroom.com) has logging enabled.
Take at peek at the browser's console log to see what's going on when peers come and go.

#### Bugs in spatial audio

The audio spatialization (using WebAudio) still seems buggy in Chromium, leading to unreliable behavior in mobile Chrome, Samsung Internet, and Oculus Browser.
This manifests itself in audio _sometimes_ not being routed properly through the audio graph, causing the loss of panoration (spatialization).
The audio by itself, however, does continue playing. This problem does not happen in desktop browsers.

In general, Chromium (desktop and otherwise) also still requires a remote audio stream (WebRTC) to be attached to a dummy `Audio`-element (can be muted) in order to make the stream audible when creating a WebAudio source node with `context.createMediaStreamSource`. Also, `createMediaElementSource` does not work in Chromium. Firefox does not suffer from these problems.

##### Read more (e.g.):

https://bugs.chromium.org/p/chromium/issues/detail?id=121673
https://bugs.chromium.org/p/chromium/issues/detail?id=477364
https://stackoverflow.com/questions/36581380/audio-level-meter-for-web-rtc-stream/36620646#36620646

### License

Copyright (c) 2017 Petri Myllys / Reaktor.
This software is licensed according to the used modules, i.e.,
the license used is BSD-3-Clause. Please see `LICENSE` and the modules in `package.json` for details.
