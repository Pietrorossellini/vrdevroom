import SpatialAudio from './SpatialAudio'

export default function Panner(srcStream) {
  // The passive audio object is for conteracting bugs in chromium
  // (see https://bugs.chromium.org/p/chromium/issues/detail?id=121673).
  // However, even this solution is buggy in mobile Chrome / Samsung Internet / Oculus browser:
  // sometimes the audio is not properly routed through the graph, resulting in loss of panoration.
  this.audioObj = new Audio()
  this.audioObj.srcObject = srcStream
  this.audioObj.muted = true

  this.srcNode = SpatialAudio.getContext().createMediaStreamSource(srcStream)
  this.panNode = createPanner()
  this.destNode = SpatialAudio.getContext().destination

  function createPanner() {
    const panner = SpatialAudio.getContext().createPanner()
    panner.setPosition(-5, 0, 0)

    return panner
  }

  this.srcNode
    .connect(this.panNode)
    .connect(this.destNode)
}

Panner.prototype = {
  disconnect: function() {
    this.panNode.disconnect()
    this.srcNode.disconnect()
    this.audioObj.srcObject = null
  },

  setPosition: function(x, y, z) {
    this.panNode.setPosition(x, y, z)
  }
}
